const express = require('express');
const routes = express();
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const stripe = require('stripe')(process.env.stripeSecretKey);
const cryptoRandomString = require('crypto-random-string');
const searchRoutes = require('./search');
const uploadRoutes = require('./upload');
const db = require('../db');
const paymentHelper = require('../helpers/payment');
const reservationHelper = require('../helpers/reservation');
const formidable = require('formidable');
const { map } = require('./search');
const sendGridMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
sendGridMail.setApiKey(`${process.env.SEND_EMAIL_API_KEY}`);
const app = express();
routes.get('/getBusinessSeats', async (req, res) => {
  const business_id = req.query.id;

  const businessElements = await db.models.business_element.findAll({
    where: {
      business_id,
    },
    raw: true,
    attributes: ['id', 'element_id', 'zone_id', 'is_vip']
  });
  const zones = await db.models.zone.findAll({
    where: {
      business_id,
    },
    raw: true,
    attributes: ['id', 'name'],
  });

  const zonesById = {};
  zones.forEach(zone => {
    zonesById[zone.id] = {
      id: zone.id,
      name: zone.name,
    };
  });

  const zonesGroupedByElements = {};
  const elementIds = [];
  const vipElementIds = [];
  businessElements.forEach(businessElement => {
    if (!zonesGroupedByElements[businessElement.element_id]) {
      zonesGroupedByElements[businessElement.element_id] = [];
    }
    if (!zonesGroupedByElements['a' + businessElement.element_id]) {
      zonesGroupedByElements['a' + businessElement.element_id] = [];
    }
    zonesGroupedByElements['a' + businessElement.element_id].push(businessElement.id)
    if (zonesGroupedByElements[businessElement.element_id].indexOf(businessElement.zone_id) < 0) {
      zonesGroupedByElements[businessElement.element_id].push(businessElement.zone_id);
    }
    if (elementIds.indexOf(businessElement.element_id) < 0) {
      elementIds.push(businessElement.element_id);
    }
    if (businessElement.is_vip && vipElementIds.indexOf(businessElement.element_id) < 0) {
      vipElementIds.push(businessElement.element_id);
    }
  });
  // console.log(zonesGroupedByElements);

  const elements = await db.models.element.findAll({
    where: {
      id: elementIds,
      type: ['sunbed', 'cabana', 'bed', 'baldaquin']
    },
    raw: true,
    attributes: ['id', 'type', 'structure'],
  });

  const elementsGrouped = {};
  elements.forEach(element => {
    if (!elementsGrouped[element.type]) {
      elementsGrouped[element.type] = {
        structure: [],
        isVip: false
      };
    }
    if (!elementsGrouped[element.type].isVip) {
      elementsGrouped[element.type].isVip = vipElementIds.indexOf(element.id) >= 0
    }
    if (!element.structure) {
      element.structure = {};
    }
    // if (!elementsGrouped[element.type].isVip) {
    //
    // }
    element.structure.__zones = zonesGroupedByElements[element.id].map(zoneId => {
      return zonesById[zoneId];
    });
    element.structure.element_id = element.id;
    element.structure.isVip = vipElementIds.indexOf(element.id) >= 0;
    elementsGrouped[element.type].structure.push(element.structure);
  });
  console.log(elementsGrouped, "--------------------------------->elements Grouped")
  return res.status(200).json(elementsGrouped);
});

routes.get('/calculatePrice', async (req, res) => {
  // console.log(req.query);
  const {
    is_vip,
    zone_id,
    element_id,
    business_id,
    additional_umbrella_count,
    quantity,
    start_date,
    end_date,
  } = req.query;
  let {
    reservation_id,
  } = req.query;

  if (
    (!is_vip && !zone_id) ||
    !business_id ||
    !quantity ||
    !start_date ||
    !end_date
  ) {
    return res.status(400).json({ error: 'WRONG_PARAMS' });
  }

  let business_settings = await db.models.business_settings.findOne({
    where: {
      business_id: business_id * 1,
    },
  });
  if (!business_settings) {
    throw new Error('Business id is wrong');
  }
  business_settings = business_settings.toJSON();

  const { priceSum, avgPrice } = await reservationHelper.calculatePrice({
    is_vip,
    zone_id,
    element_id,
    business_id,
    additional_umbrella_count,
    quantity,
    start_date: moment(start_date).format('YYYY-MM-DD'),
    end_date: moment(end_date).format('YYYY-MM-DD'),
    business_settings,
  });

  const reservationData = {
    status: 'pending',
    payment_status: 'awaiting',
    payment_method: 'online',
    created_by: 'customer',
    start_date,
    end_date,
    timezone: business_settings.timezone || 'Europe/Bucharest',
    time_limit: business_settings.booking_time_limit || 1,
    cancel_limit: business_settings.cancel_daily_limit || 1,
    amount: priceSum,
    currency: business_settings.currency || 'USD',
    avg_price: avgPrice,
    updated_by_user_at: new Date(),
    type: 'form',
    business_id,
    customer_id: req.user.id,
    element_quantity: quantity,
    element_id,
    zone_id,
    is_vip
  };
  // console.log(reservationData);

  if (reservation_id) {
    await db.models.reservation.update(reservationData, {
      where: {
        id: reservation_id * 1
      }
    });
  } else {
    const reservation = await db.models.reservation.create(reservationData);
    reservation_id = reservation.id;
  }

  // console.log({ priceSum });

  res.status(200).json({
    price: priceSum,
    reservation_id,
  });
});

routes.post('/createPaymentMethod', async (req, res) => {
  const {
    reservation_id,
    card_id,
    number,
    exp_month,
    exp_year,
    cvc,
  } = req.body;

  try {
    const customer = await db.models.customer.findOne({
      where: {
        id: req.user.id,
      }
    });

    const { publishable_key, client_secret } = await paymentHelper.reservationPaymentStripe(
      reservation_id,
      customer,
    );

    let card;

    if (card_id) {
      card = await db.models.stripe_card.findOne({
        where: {
          customer_id: req.user.id,
        }
      })
    } else {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: number.trim(),
          exp_month: exp_month.trim() * 1,
          exp_year: exp_year.trim() * 1,
          cvc: cvc.trim(),
        },
      });

      await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: customer.stripe_customer_id }
      );

      card = await db.models.stripe_card.create({
        customer_id: req.user.id,
        payment_method_id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        country_code: paymentMethod.card.country,
        cvc_check: paymentMethod.card.checks.cvc_check,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        fingerprint: paymentMethod.card.fingerprint,
        funding: paymentMethod.card.funding,
        last4: paymentMethod.card.last4,
      });
    }

    res.status(200).json({
      publishable_key,
      client_secret,
      payment_token: card.payment_method_id,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

routes.post('/payEvent', async (req, res) => {
  const {
    event_id,
    card_id,
    number,
    exp_month,
    exp_year,
    cvc,
  } = req.body;


  try {
    const customer = await db.models.customer.findOne({
      where: {
        id: req.user.id,
      }
    });

    const { publishable_key, client_secret } = await paymentHelper.eventPaymentStripe(
      event_id,
      customer,
    );

    let card;

    if (card_id) {
      card = await db.models.stripe_card.findOne({
        where: {
          customer_id: req.user.id,
        }
      })
    } else {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: number.trim(),
          exp_month: exp_month.trim() * 1,
          exp_year: exp_year.trim() * 1,
          cvc: cvc.trim(),
        },
      });

      await stripe.paymentMethods.attach(
        paymentMethod.id,
        { customer: customer.stripe_customer_id }
      );

      card = await db.models.stripe_card.create({
        customer_id: req.user.id,
        payment_method_id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        country_code: paymentMethod.card.country,
        cvc_check: paymentMethod.card.checks.cvc_check,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
        fingerprint: paymentMethod.card.fingerprint,
        funding: paymentMethod.card.funding,
        last4: paymentMethod.card.last4,
      });
    }

    res.status(200).json({
      publishable_key,
      client_secret,
      payment_token: card.payment_method_id,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

routes.post('/webhook/stripe', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    // Verify webhook signature and extract the event.
    // See https://stripe.com/docs/webhooks/signatures for more information.
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.stripeWebhookSecret);
      console.log(JSON.stringify(event));
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const success = event.type === 'payment_intent.succeeded';
    console.log('webhookStripe');
    const paymentIntent = event.data.object.metadata;
    console.log('----- webhook paymentIntent');
    console.log(paymentIntent);

    if (paymentIntent.reservation_number) {
      await paymentHelper.webhookReservation({
        success,
        notificationAdditionalData: {
          type: event.type,
          paymentIntent,
        },
        business_number: paymentIntent.business_number,
        reservation_number: paymentIntent.reservation_number,
        customer_id: paymentIntent.customer_id,
      });
    } else
      if (paymentIntent.event_id) {
        await paymentHelper.webhookEvent({
          success,
          notificationAdditionalData: {
            type: event.type,
            paymentIntent,
          },
          business_number: paymentIntent.business_number,
          event_id: paymentIntent.event_id,
          customer_id: paymentIntent.customer_id,
        });
      }

    res.json({ received: true });
  } catch (e) {
    // Display error on client
    return res.send({ error: e.message });
  }
});

routes.post('/deleteCard', async (req, res) => {
  const { id } = req.body;

  try {
    const card = await db.models.stripe_card.findOne({
      where: {
        id
      },
      include: [
        {
          model: db.models.customer,
          attributes: ['id', 'stripe_customer_id']
        }
      ]
    });

    try {
      await stripe.customers.deleteSource(
        card.payment_method_id,
        card.customer.stripe_customer_id,
      );
    } catch (error) {
      console.error(error);
    }

    await card.destroy();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json(error);
  }
});

routes.post('/cancelReservation', async (req, res) => {
  const {
    reservation_id
  } = req.body;

  await db.models.reservation.update({
    status: 'canceled'
  }, {
    where: {
      id: reservation_id,
    }
  });

  await db.models.reservation_seat.destroy({
    where: {
      reservation_id,
    }
  })
});

routes.get('/searchReserved', async (req, res) => {
  console.log("searchReserved")
  const {
    status,
    text
  } = req.query;

  const statuses = status === 'active' ?
    ["pending", "booked", "accepted"] :
    ["canceled", "expired", "completed"];

  const reservations = await db.models.reservation.findAll({
    where: {
      status: statuses,
      payment_status: 'paid',
    },
    include: [
      {
        model: db.models.business
      }
    ]
  });

  res.status(200).json(reservations);
});

routes.post('/beach-photo/upload', async (req, res) => {
  var form = new formidable.IncomingForm();
  const fs = require('fs');
  form.parse(req, function (err, fields, files) {
    console.log(fields.business_id, "lllllllllllllllllllllll")
    const AWS = require('aws-sdk');
    const ID = 'AKIA6C4FSPSCJXIB535P';
    const SECRET = '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';
    const BUCKET_NAME = 'tabo-dev-photo';
    const s3 = new AWS.S3({
      accessKeyId: ID,
      secretAccessKey: SECRET
    });
    fs.readFile(files.myImage.path, (readErr, data) => {
      const fileName = new Date().getTime()
      const fileExtension = files.myImage.type.split('/')[1];
      if (readErr) { reject(readErr) } else {
        s3.upload({
          Bucket: BUCKET_NAME,
          Key: `${fileName}.${fileExtension}`, // File name you want to save as in S3
          Body: data
        }, async (err, data) => {
          if (err) {
            throw err;
          } else {
            if (data.Location)
              await db.models.business_gallery.create({
                url: data.Location,
                business_id: fields.business_id,
                is_main: 0
              });
            const business_galleries = await db.models.business_gallery.findAll({
              where: {
                business_id: fields.business_id,
              }
            })
            console.log(`File uploaded successfully. ${data.Location}`);
            res.status(200).json(business_galleries)
          }
        });
      }
    })
  });
});
routes.put('/beach-photo/upload', async (req, res) => {
  var form = new formidable.IncomingForm();
  const fs = require('fs');
  const AWS = require('aws-sdk');
  const ID = 'AKIA6C4FSPSCNCC2WEP5';
  const SECRET = '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';
  const BUCKET_NAME = 'tabo-dev-photo';
  const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
  });
  form.parse(req, async (err, fields, files) => {
    const businessGalleryId = await db.models.business_gallery.findOne({
      where: {
        id: fields.id
      }
    })
    const fileName = businessGalleryId.url.split('/')
    const params = {
      Bucket: BUCKET_NAME,
      Delete: { // required
        Objects: [ // required
          {
            Key: `${fileName[fileName.length - 1]}` // required
          },
        ],
      },
    };
    s3.deleteObjects(params, async (err, data) => {
      if (data) {
        fs.readFile(files.myImage.path, (readErr, data) => {
          const fileName = new Date().getTime()
          const fileExtension = files.myImage.type.split('/')[1];
          if (readErr) { reject(readErr) } else {
            s3.upload({
              Bucket: BUCKET_NAME,
              Key: `${fileName}.${fileExtension}`, // File name you want to save as in S3
              Body: data
            }, async (err, data) => {
              if (err) {
                throw err;
              } else {
                if (data.Location)
                  await db.models.business_gallery.update({
                    url: data.Location,
                    business_id: fields.business_id,
                    is_main: 0
                  }, {
                    where: {
                      id: fields.id,
                    }
                  });
                const business_galleries = await db.models.business_gallery.findAll({
                  where: {
                    business_id: fields.business_id,
                  }
                })
                console.log(`File uploaded successfully. ${data.Location}`);
                res.status(200).json(business_galleries)
              }
            });
          }
        })
      }
    });
  })
});
routes.delete('/beach-photo/upload', async (req, res) => {
  const AWS = require('aws-sdk');
  const ID = 'AKIA6C4FSPSCNCC2WEP5';
  const SECRET = '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';
  const BUCKET_NAME = 'tabo-dev-photo';
  const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
  });
  const businessGalleryId = await db.models.business_gallery.findOne({
    where: {
      id: req.body.deleteId
    }
  })
  const fileName = businessGalleryId.url.split('/')
  const params = {
    Bucket: BUCKET_NAME,
    Delete: { // required
      Objects: [ // required
        {
          Key: `${fileName[fileName.length - 1]}` // required
        },
      ],
    },
  };
  s3.deleteObjects(params, async (err, data) => {
    if (err) {
      return res.send({ error: err });
    }
    if (data) {
      await db.models.business_gallery.destroy({
        where: {
          id: req.body.deleteId,
        }
      })
      res.send({ success: "success" });
    }
  });
});
////////////////////////

routes.post('/file-docs/upload', async (req, res) => {
  var form = new formidable.IncomingForm();
  const fs = require('fs');
  form.parse(req, function (err, fields, files) {
    const AWS = require('aws-sdk');
    const ID = 'AKIA6C4FSPSCNCC2WEP5';
    const SECRET = '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';
    const BUCKET_NAME = 'tabo-dev-private';
    const s3 = new AWS.S3({
      accessKeyId: ID,
      secretAccessKey: SECRET
    });
    console.log(fields.type)
    let fileBody;
    let fileName;
    if (fields.type == "idCard") {
      fileBody = files.idCard.path;
      fileName = files.idCard.name;
    }
    if (fields.type == "additionalDocument") {
      fileBody = files.additionalDocument.path;
      fileName = files.additionalDocument.name;
    }
    if (fields.type == "companyIdentification") {
      fileBody = files.companyIdentification.path;
      fileName = files.companyIdentification.name;
    }
    fs.readFile(fileBody, (readErr, data) => {
      if (readErr) { reject(readErr) } else {
        s3.upload({
          Bucket: BUCKET_NAME,
          Key: fileName, // File name you want to save as in S3
          Body: data
        }, async (err, data) => {
          if (err) {
            console.log(err)
            throw err;
          } else {
            // var params = { Bucket: BUCKET_NAME, Key: files.myImage.name, Expires: 900 };

            // s3.getSignedUrl('getObject', params, function (err, url) {

            //   if (err) {
            //     console.log('Getting Signed URL', err);
            //     // res.send(err);
            //   } else {
            //     console.log('Getting Signed URL', url);
            //     // res.send(url);
            //     res.status(200).json({ url: url })
            //   }
            // });
            res.status(200).json({ url: data.Location })
            console.log(`File uploaded successfully. ${data.Location}`);
          }
        });
      }
    })
  });
});


////////////////////////////////////////
routes.post('/beach-element/upload', async (req, res) => {

  var form = new formidable.IncomingForm();
  const fs = require('fs');
  form.parse(req, function (err, fields, files) {
    const AWS = require('aws-sdk');
    const ID = 'AKIA6C4FSPSCNCC2WEP5';
    const SECRET = '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';
    const BUCKET_NAME = 'tabo-dev-photo';
    const s3 = new AWS.S3({
      accessKeyId: ID,
      secretAccessKey: SECRET
    });
    fs.readFile(files.myImage.path, (readErr, data) => {
      const fileName = new Date().getTime()
      const fileExtension = files.myImage.type.split('/')[1];
      if (readErr) { reject(readErr) } else {
        s3.upload({
          Bucket: BUCKET_NAME,
          Key: `${fileName}.${fileExtension}`, // File name you want to save as in S3
          Body: data
        }, async (err, data) => {
          if (err) {
            throw err;
          } else {
            if (data.Location)
              console.log(fields.element_type, "---------->")
            await db.models.business_element_gallery.create({
              image: data.Location,
              business_id: fields.business_id,
              element_type: fields.element_type
            });
            const business_galleries = await db.models.business_element_gallery.findAll({
              where: {
                business_id: fields.business_id,
              }
            })
            console.log(`File uploaded successfully. ${data.Location}`);
            res.status(200).json(business_galleries)
          }
        });
      }
    })
  });
});
routes.put('/beach-element/upload', async (req, res) => {
  var form = new formidable.IncomingForm();
  const fs = require('fs');
  const AWS = require('aws-sdk');
  const ID = 'AKIA6C4FSPSCNCC2WEP5';
  const SECRET = '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';
  const BUCKET_NAME = 'tabo-dev-photo';
  const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
  });
  form.parse(req, async (err, fields, files) => {
    const businessGalleryId = await db.models.business_element_gallery.findOne({
      where: {
        id: fields.id
      }
    })
    const fileName = businessGalleryId.image.split('/')
    const params = {
      Bucket: BUCKET_NAME,
      Delete: { // required
        Objects: [ // required
          {
            Key: `${fileName[fileName.length - 1]}` // required
          },
        ],
      },
    };
    s3.deleteObjects(params, async (err, data) => {
      if (data) {
        fs.readFile(files.myImage.path, (readErr, data) => {
          const fileName = new Date().getTime()
          const fileExtension = files.myImage.type.split('/')[1];
          if (readErr) { reject(readErr) } else {
            s3.upload({
              Bucket: BUCKET_NAME,
              Key: `${fileName}.${fileExtension}`, // File name you want to save as in S3
              Body: data
            }, async (err, data) => {
              if (err) {
                throw err;
              } else {
                if (data.Location)
                  await db.models.business_element_gallery.update({
                    image: data.Location,
                    business_id: fields.business_id,
                    element_type: fields.element_type
                  }, {
                    where: {
                      id: fields.id,
                    }
                  });
                const business_galleries = await db.models.business_element_gallery.findAll({
                  where: {
                    business_id: fields.business_id,
                  }
                })
                console.log(`File uploaded successfully. ${data.Location}`);
                res.status(200).json(business_galleries)
              }
            });
          }
        })
      }
    });
  })
});
routes.delete('/beach-element/upload', async (req, res) => {
  const AWS = require('aws-sdk');
  const ID = 'AKIA6C4FSPSCNCC2WEP5';
  const SECRET = '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';
  const BUCKET_NAME = 'tabo-dev-photo';
  const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
  });
  const businessGalleryId = await db.models.business_element_gallery.findOne({
    where: {
      id: req.body.deleteId
    }
  })
  const fileName = businessGalleryId.image.split('/')
  const params = {
    Bucket: BUCKET_NAME,
    Delete: { // required
      Objects: [ // required
        {
          Key: `${fileName[fileName.length - 1]}` // required
        },
      ],
    },
  };
  s3.deleteObjects(params, async (err, data) => {
    if (err) {
      return res.send({ error: err });
    }
    if (data) {
      await db.models.business_element_gallery.destroy({
        where: {
          id: req.body.deleteId,
        }
      })
      res.send({ success: "success" });
    }
  });
});
routes.get('/getPrices', async (req, res) => {
  console.log(req.query.days.split(','), typeof req.query.days, req.query.id, "getPrices--------------------------->")
  let dateAry = req.query.days.split(',');
  const price = await db.models.price.findAll({
    where: {
      business_id: req.query.id
    }
  });
  console.log(price.length, "*********")
  let arr = [];
  let arrId = [];
  for (let j = 0; j < dateAry.length; j++) {
    let current_date = new Date(dateAry[j]).getTime();
    for (let i = 0; i < price.length; i++) {
      let start_date_time = new Date(price[i].dataValues.start_date).getTime();
      let end_date_time = new Date(price[i].dataValues.end_date).getTime();
      if (start_date_time <= current_date && current_date <= end_date_time) {
        arrId.push(price[i].dataValues.id)
      }
    }
  }
  let unique = [...new Set(arrId)];
  for (let k = 0; k < unique.length; k++) {
    for (let i = 0; i < price.length; i++) {
      if (unique[k] === price[i].dataValues.id) {
        arr.push({ id: price[i].dataValues.id, price: price[i].dataValues.price, type: price[i].dataValues.type, zone_id: price[i].dataValues.zone_id })
      }
    }
  }

  res.status(200).json({ data: arr });
});


const getFreeDay = (totalAry, reqArr) => {
  let reqArrs = [];
  reqArr.map(item => {
    let li = item.replace('"', '');
    let li1 = li.replace(' ', '');
    reqArrs.push(li1)
  })
  function arr_diff(selected_days, reqArrs) {
    let a = [];
    let diff = [];
    selected_days.map((item, index) => {
      a.push(item)
    })
    if (a.length > 0) {
      for (let i = 0; i < reqArrs.length; i++) {
        let filterData = a.filter(ele => ele == reqArrs[i]);
        if (filterData.length == 0) {
          return false;
        }
      }
    }
    return true;
  }
  totalAry.map((item, index) => {
    let result = arr_diff(item.selected_days, reqArrs)
    console.log(result)
    if (!result) {
      item.color.push("white")
    }
  })
  return totalAry;
}
routes.get('/getReservations', async (req, res) => {
  let colorInformation = {
    "pending": "yellow",
    "reserved_paid": 'red',
    "reserved_not_paid": 'purple',
    "occupied": 'black',
    'paid_online': 'red',
    'free': 'white',
  };
  let dateAry = req.query.days.split(',');
  let filterDay = [];
  let seatDataAry = [];
  let totalData = [];
  let newArr1 = []
  const filterData1 = await db.models.reservation_beach.findAll({
    where: {
      business_id: req.query.id,
    }
  });
  const filterData2 = filterData1.filter(ele => ele.reservation_status != "completed")
  const filterData3 = filterData2.filter(ele => ele.reservation_status != "canceled")
  const getReservationData = filterData3.filter(ele => ele.reservation_status != "released")
  if (getReservationData.length > 0) {
    getReservationData.map((item, index) => {
      if (item.selected_days.length > 0) {
        item.selected_days.map((list, i) => {
          dateAry.map((lists, j) => {
            if (list.day == lists) {
              filterDay.push(item)
            }
          })
        })
      }
    })
    console.log(filterDay, dateAry, "((((((((((((((((((((")
    filterDay.map((item, index) => {
      console.log(item.reservation_status, "(((((((^^^^^^^^")
      item.seat_position.map((list, i) => {
        let arr = [];
        item.selected_days.map((lists, j) => {
          arr.push(lists.day)
        })
        seatDataAry.push({
          id: `${index}_${i}`,
          seats: list.seat_id,
          reservation_id: [item.id],
          selected_days: arr,
          protocol_status: [item.protocol_status],
          discount_amount: [item.discount_amount],
          reservation_status: [item.reservation_status],
          color: [colorInformation[`${item.reservation_status}`]]
        })
      })
    })
    seatDataAry.map((item, index) => {
      const filterResult = seatDataAry.filter(ele => ele.id != item.id);
      if (filterResult.length > 0) {
        filterResult.map((list, i) => {
          if (item.seats == list.seats) {
            if (totalData.length > 0) {
              const filtertotalData = totalData.filter(ele => ele.seats == list.seats);
              if (filtertotalData.length > 0) {
                filtertotalData.filter(ele => ele.seats == list.seats)[0].reservation_id = [...filtertotalData.filter(ele => ele.seats == list.seats)[0].reservation_id, ...list.reservation_id]
                filtertotalData.filter(ele => ele.seats == list.seats)[0].selected_days = [...filtertotalData.filter(ele => ele.seats == list.seats)[0].selected_days, ...list.selected_days]
                filtertotalData.filter(ele => ele.seats == list.seats)[0].protocol_status = [...filtertotalData.filter(ele => ele.seats == list.seats)[0].protocol_status, ...list.protocol_status]
                filtertotalData.filter(ele => ele.seats == list.seats)[0].discount_amount = [...filtertotalData.filter(ele => ele.seats == list.seats)[0].discount_amount, ...list.discount_amount]
                filtertotalData.filter(ele => ele.seats == list.seats)[0].reservation_status = [...filtertotalData.filter(ele => ele.seats == list.seats)[0].reservation_status, ...list.reservation_status]
                filtertotalData.filter(ele => ele.seats == list.seats)[0].color = [...filtertotalData.filter(ele => ele.seats == list.seats)[0].color, ...list.color]
              } else {
                totalData.push({
                  seats: list.seats,
                  reservation_id: list.reservation_id,
                  selected_days: list.selected_days,
                  protocol_status: list.protocol_status,
                  discount_amount: list.discount_amount,
                  reservation_status: list.reservation_status,
                  color: list.color
                })
              }
            } else {
              totalData.push({
                seats: list.seats,
                reservation_id: list.reservation_id,
                selected_days: list.selected_days,
                protocol_status: list.protocol_status,
                discount_amount: list.discount_amount,
                reservation_status: list.reservation_status,
                color: list.color
              })
            }
          }
        })
      }
    })
    var filteredArray = seatDataAry.filter(function (array_el) {
      return totalData.filter(function (anotherOne_el) {
        return anotherOne_el.seats == array_el.seats;
      }).length == 0
    });
    filteredArray.map((list) => {
      newArr1.push({
        seats: list.seats,
        reservation_id: list.reservation_id,
        selected_days: list.selected_days,
        protocol_status: list.protocol_status,
        discount_amount: list.discount_amount,
        reservation_status: list.reservation_status,
        color: list.color
      })
    })
    const totalAry = getFreeDay([...newArr1, ...totalData], dateAry);
    res.status(200).json({ data: totalAry });
  }
});
routes.get('/getTodayPrices', async (req, res) => {
  let dateStatus = req.query.date;
  console.log(dateStatus, "_----------------------.342423")
  let dateAry = [];
  let selectDate = "";
  let dayAry = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let days;
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  if (dateStatus == "today") {
    days = dayAry[new Date(today).getDay()];
    selectDate = yyyy + '-' + mm + '-' + dd;
    dateAry.push(today)
  }
  if (dateStatus == "tomorrow") {
    var day = new Date(today);
    var nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    var dd1 = String(nextDay.getDate()).padStart(2, '0');
    var mm1 = String(nextDay.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy1 = nextDay.getFullYear();
    selectDate = yyyy1 + '-' + mm1 + '-' + dd1;
    days = dayAry[new Date(nextDay).getDay()];
    dateAry.push(nextDay)
  }
  const price = await db.models.price.findAll({
    where: {
      business_id: req.query.id
    }
  });
  console.log(price.length, "*********")
  let arr = [];
  let arrId = [];
  for (let j = 0; j < dateAry.length; j++) {
    let current_date = new Date(dateAry[j]).getTime();
    for (let i = 0; i < price.length; i++) {
      let start_date_time = new Date(price[i].dataValues.start_date).getTime();
      let end_date_time = new Date(price[i].dataValues.end_date).getTime();
      if (start_date_time <= current_date && current_date <= end_date_time) {
        arrId.push(price[i].dataValues.id)
      }
    }
  }
  let unique = [...new Set(arrId)];
  for (let k = 0; k < unique.length; k++) {
    for (let i = 0; i < price.length; i++) {
      if (unique[k] === price[i].dataValues.id) {
        arr.push({ id: price[i].dataValues.id, price: price[i].dataValues.price, type: price[i].dataValues.type, zone_id: price[i].dataValues.zone_id })
      }
    }
  }
  res.status(200).json({ data: arr, day: days, selectDays: selectDate });
});
routes.post('/reception/getReservationByCode', async (req, res) => {
  let code = req.body.code;
  let businessId = req.body.businessId;
  if (code.length > 0) {
    const reservationData = await db.models.reservation_beach.findAll({
      where: {
        qr_code: req.body.code,
        business_id: businessId
      },
    });
    if (reservationData.length > 0) {
      res.status(200).json({ data: reservationData });
    } else {
      const reservationDataRestaurant = await db.models.reservation_restaurant.findAll({
        where: {
          qr_code: req.body.code,
          business_id: businessId
        },
      });
      console.log(reservationDataRestaurant, req.body.code, req.body.businessId, "ooooooooooooooooooooo")
      res.status(200).json({ data: reservationDataRestaurant });
    }
  } else {
    res.status(200).json({ data: [] });
  }
});
routes.get('/customer/fullReservation', async (req, res) => {
  let start = req.query.start;
  let end = req.query.end;
  let zoneId = req.query.zoneId;
  let arrDays = [];
  var startDay = new Date(`${start}`);
  var endDay = new Date(`${end}`);
  var newend = endDay.setDate(endDay.getDate() + 1);
  endDay = new Date(newend);
  while (startDay < endDay) {
    arrDays.push(moment(startDay).format("YYYY-MM-DD"));
    var newDate = startDay.setDate(startDay.getDate() + 1);
    startDay = new Date(newDate);
  }
  let defaultReservationLength = 0;
  let currentReservationLength = 0;
  let status = false;
  const data = await db.models.business_element.findAll({
    where: {
      zone_id: zoneId
    },
    include: [{
      model: db.models.element,
    }]
  })
  data.map((item, index) => {
    defaultReservationLength = defaultReservationLength + Number(item.element.structure.split('count')[1].split(':')[1].split('}')[0]);
  })
  const reservationDataByZone = await db.models.reservation_beach.findAll({
    where: {
      zone_id: zoneId
    }
  })
  reservationDataByZone.map((item, index) => {
    if (item.selected_days.length > 0) {
      item.selected_days.map((list, i) => {
        if (list.day == start) {
          currentReservationLength = currentReservationLength + item.seat_position.length
        }
      })
    }
  })
  for (let i = 0; i < reservationDataByZone.length; i++) {
    if (reservationDataByZone[i].selected_days.length > 0) {
      for (let j = 0; j < arrDays.length; j++) {
        let filterResult = reservationDataByZone[i].selected_days.filter(ele => ele.day == arrDays[j]);
        if (filterResult.length == 0) {
          return res.status(200).json({ status: false });
        }
      }
    }
  }
  if (currentReservationLength == defaultReservationLength) {
    status = true;
  } else {
    status = false;
  }
  res.status(200).json({ data: defaultReservationLength, data1: currentReservationLength, status: status });
});
routes.get('/multiDayPrice', async (req, res) => {
  let dateAry = req.query.days.split(',');
  const price = await db.models.price.findAll({
    where: {
      business_id: req.query.id
    }
  });
  console.log(price.length, "*********")
  let arr = [];
  let arrId = [];
  for (let j = 0; j < dateAry.length; j++) {
    let current_date = new Date(dateAry[j]).getTime();
    for (let i = 0; i < price.length; i++) {
      let start_date_time = new Date(price[i].dataValues.start_date).getTime();
      let end_date_time = new Date(price[i].dataValues.end_date).getTime();
      if (start_date_time <= current_date && current_date <= end_date_time) {
        arrId.push(price[i].dataValues.id)
      }
    }
  }
  let unique = [...new Set(arrId)];
  for (let k = 0; k < unique.length; k++) {
    for (let i = 0; i < price.length; i++) {
      if (unique[k] === price[i].dataValues.id) {
        arr.push({ id: price[i].dataValues.id, price: price[i].dataValues.price, type: price[i].dataValues.type, zone_id: price[i].dataValues.zone_id })
      }
    }
  }
  res.status(200).json({ data: arr });
});
routes.get('/getTimeZone', async (req, res) => {
  let businessId = req.query.id;
  const timeZone = await db.models.business.findOne({
    where: {
      id: businessId
    },
  });
  const currentDate = new Date();
  var a = moment.tz(`${currentDate}`, `${timeZone.timezone}`).format();
  var b = moment.utc(`${currentDate}`).tz(`${timeZone.timezone}`).format();
  const current = new Date(`${b}`);
  res.status(200).json({ data: b });
});
routes.post('/reception/getRestaurantReservation', async (req, res) => {
  let businessId = req.body.id;
  let currentDate = req.body.date;
  let intervalTime = 15;
  let reservationData = await db.models.reservation_restaurant.findAll({
    where: {
      business_id: businessId,
      selected_day: currentDate
    }
  });
  let filterData = [];
  if (reservationData.length > 0) {
    filterData = reservationData.filter(
      ele => ele.reservation_status != "released" &&
        ele.reservation_status != "rejected" &&
        ele.reservation_status != "completed" &&
        ele.reservation_status != "canceled" &&
        ele.reservation_status != "expired" &&
        ele.reservation_status != "pending"
    )
  }
  filterData.map((item, index) => {
    let counttimes = item.time_occupied / intervalTime;
    let timeArrs = [item.arrive_time];
    let time = moment(item.arrive_time, 'HH:mm');
    for (i = 0; i < counttimes; i++) {
      let updateTime = time.add(intervalTime, 'm').format('HH mm');
      timeArrs.push(`${updateTime.split(' ')[0]}:${updateTime.split(' ')[1]}`)
    }
    filterData[index].dataValues["times"] = timeArrs;
  })
  res.status(200).json({ data: filterData });
})
routes.post('/dashboard/checkPublish', async (req, res) => {
  let id = req.body.id;
  let businessZone = [];
  let businessProfileStatus = false;
  let businessLocationStatus = false;
  let businessZoneStatus = false;
  let status = false;
  let businessData = await db.models.business.findAll({ where: { id: id } });
  let businessPlan = await db.models.plan_changes.findAll({ where: { business_id: id, } });
  let businessSettings = await db.models.business_settings.findAll({ where: { business_id: id, } });
  let businessYear = await db.models.business_year.findAll({ where: { business_id: id, } });
  let businessWeek = await db.models.business_week.findAll({ where: { business_id: id, } });
  let businessRules = await db.models.business_rules.findAll({ where: { business_id: id, } });
  let price = await db.models.price.findAll({ where: { business_id: id, } });
  let businessElement = await db.models.business_element.findAll({ where: { business_id: id, } });
  let businessUser = await db.models.business_user.findAll({ where: { business_id: id, } });
  let businessPhotos = await db.models.business_gallery.findAll({ where: { business_id: id, } });
  let businessFacilities = await db.models.business_facilities.findAll({ where: { business_id: id, } });
  if (businessElement.length > 0) {
    businessElement.map((item, index) => {
      if (item.zone_id) {
        businessZone.push(item.zone_id)
      }
    })
  }
  if (businessData.length > 0) {
    if (businessData[0].representative_email) {
      businessProfileStatus = true;
    }
    if (businessSettings.length > 0) {
      if (businessSettings[0].longitude) {
        businessLocationStatus = true;
      }
    }
    if (businessData[0].type == "beach" || businessData[0].type == "pool") {
      if (businessZone.length > 0) {
        if (businessElement.length === businessZone.length) {
          businessZoneStatus = true;
        } else {
          businessZoneStatus = false;
        }
      }
      if (
        businessSettings.length > 0
        && businessProfileStatus
        && businessLocationStatus
        && businessYear.length > 0
        && businessPlan.length > 0
        && businessRules.length > 0
        && price.length > 0
        && businessElement.length > 0
        && businessUser.length > 0
        && businessZone.length > 0
        && businessPhotos.length > 0
        && businessWeek.length > 0
        && businessFacilities.length > 0
      ) {
        status = true;
      } else {
        status = false;
      }
    } else {
      if (
        businessSettings.length > 0
        && businessProfileStatus
        && businessPlan.length > 0
        && businessYear.length > 0
        && businessWeek.length > 0
        && businessElement.length > 0
        && businessLocationStatus
        && businessPhotos.length > 0
        && businessRules.length > 0
        && businessUser.length > 0
        && businessFacilities.length > 0
      ) {
        status = true;
      } else {
        status = false;
      }
    }
  }


  res.status(200).json({
    businessProfileStatus: businessProfileStatus,
    businessLocationStatus: businessLocationStatus,
    businessZoneStatus: businessZoneStatus,
    businessPlan: businessPlan.length,
    businessSettings: businessSettings.length,
    businessYear: businessYear.length,
    businessRules: businessRules.length,
    price: price.length,
    businessElement: businessElement.length,
    businessUser: businessUser.length,
    businessZone: businessZone.length,
    businessPhotos: businessPhotos.length,
    businessWeek: businessWeek.length,
    businessFacilities: businessFacilities.length,
    status: status,
  });
})
routes.post('/forgotPassword', async (req, res) => {
  let email = req.body.email;
  let uniqueString = ""
  const emailData = await db.models.client.findOne({
    where: {
      email,
    }
  });
  if (emailData) {
    uniqueString = cryptoRandomString({ length: 100, type: 'alphanumeric' });
    let date = new Date();
    console.log(date, "lllllllllllllllll")
    await db.models.client.update({
      reset_pass_link: `${process.env.LOCAL_URL}/confirm/${uniqueString}`,
      time_link: `${date}`
    }, {
      where: {
        id: emailData.id
      }
    });
    let data = await db.models.client.findOne({
      where: {
        email,
      }
    });
    function getMessage() {
      const body = 'To reset your password pls access this link. The link will expire in 30 min';
      return {
        to: emailData.email,
        from: `${process.env.FROM_EMAIL}`,
        subject: 'Tabo reset password',
        text: body,
        html: `<div>
                <strong>${body}</strong>
                <a href=${data.reset_pass_link}>reset password</a>
              </div>`,
      };
    }
    async function sendEmail() {
      try {
        await sendGridMail.send(getMessage());
        console.log('Test email sent successfully');
      } catch (error) {
        console.error('Error sending test email');
        console.error(error);
        if (error.response) {
          console.error(error.response.body)
        }
      }
    }
    (async () => {
      console.log('Sending test email');
      await sendEmail();
    })();
    res.status(200).json({ status: uniqueString })
  } else {
    res.status(200).json({ status: "fail" })
  }
})
routes.post('/confirmPassword', async (req, res) => {
  let password = req.body.password;
  let linkId = req.body.linkId;
  let passwordHash = await bcrypt.hash(password, 10);
  let data = await db.models.client.findOne({
    where: {
      reset_pass_link: `${process.env.LOCAL_URL}/confirm/${linkId}`,
    }
  });
  if (data) {
    await db.models.client.update({
      password: passwordHash,
      reset_pass_link: "",
      time_link: ""
    }, {
      where: {
        id: data.id
      }
    });
    res.status(200).json({ status: "success" })
  } else {
    res.status(200).json({ status: "fail" })
  }
})
routes.post('/setPosition', async (req, res) => {
  let selectedDay = req.body.selected_day;
  let arriveTime = req.body.arrive_time;
  let data = await db.models.reservation_restaurant.findAll({
    where: {
      selected_day: `${selectedDay}`,
    }
  });
  let arr = [];
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      arr.push({ arrive_time: data[i].arrive_time, time_occupied: data[i].time_occupied })
      console.log(data[i].arrive_time, data[i].time_occupied)
    }
  }
  console.log(data)
  res.status(200).json({ status: data })
})
////////////////////////////
routes.use('/search', searchRoutes);
module.exports = routes;





