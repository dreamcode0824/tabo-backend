const authy = require("authy")(process.env.AUTHY_TOKEN);
const express = require('express');
const routes = express();
const geoip = require('geoip-lite');
const http = require('http');
const bcrypt = require('bcrypt');
const customerHelper = require('../helpers/customer');
const authHelper = require('../helpers/auth');
const db = require('../db');
const QRCode = require('qrcode');
const cryptoRandomString = require('crypto-random-string');
const { uuid, isUuid } = require('uuidv4');
routes.get('/determineCountry', (req, res) => {
  console.log('determineCountry');
  const ipaddress = (req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress).split(",")[0];
  console.log(ipaddress, "----------------->")
  // console.log({ ipaddress });
  const info = geoip.lookup(ipaddress);
  console.log(info, "--------------------->info")
  // in case we can't get data from local DB
  if (!info) {
    http.get(`http://api.ipstack.com/${ipaddress}?access_key=${process.env.IPSTACK_TOKEN}`, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        data = JSON.parse(data);
        // console.log(data);
        authHelper.getCountryInfo(data.country_code)
          .then(country => {
            res.status(200).json({
              country_code: data.country_code,
              country: country.name,
              phone_code: country.phonecode,
              id: country.id,
            });
          });
      });

    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  } else {
    // console.log(info);
    authHelper.getCountryInfo(info.country)
      .then(country => {
        res.status(200).json({ country_code: info.country, country: country.name, phone_code: country.phonecode });
      });
  }
});

routes.post('/verifyPhoneNumber', async (req, res) => {
  try {
    const phone = `+${req.body.code}${req.body.number}`;
    console.log(phone, "((((((((((((((((((((((((")
    const customer = await db.models.customer.findOne({
      where: {
        phone: phone
      }
    })
    console.log(customer, "**********************")
    // const customer = await customerHelper.getByPhone(phone);
    if (customer) {
      return res.status(200).json({ already_registered: true });
    }

    if (process.env.NODE_ENV == 'development') {
      // console.log("IF")
      return res.status(200).json({});
    }
    authy
      .phones()
      .verification_start(req.body.number, req.body.code, 'sms', (err, result) => {
        if (err) {
          res.status(404).json(err);
          return;
        }
        if (result) {
          console.log(result, "------------->result")
          res.status(200).json(result);
        }
      });
  } catch (error) {
    console.log({
      name: 'PHONE_VERIFY_ERROR',
    });
    console.log(error);

    res.status(404).json({ message: 'PHONE_VERIFY_ERROR' });
  }
});

routes.post('/verifySmsPin', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({});
    }

    authy
      .phones()
      .verification_check(req.body.number, req.body.code, req.body.pin, async (err, result) => {
        if (err) {
          res.status(404).json(err);
          return;
        }

        if (result) {
          res.status(200).json(result);
        }
      });
  } catch (error) {
    console.log({
      name: 'PHONE_VERIFY_ERROR',
    });
    console.log(error);

    res.status(404).json({ message: 'PHONE_VERIFY_ERROR' });
  }
});

routes.post('/login', async (req, res) => {
  const phone = `+${req.body.code}${req.body.number}`;
  // let customer = await customerHelper.getByPassword(phone, req.body.password);
  let customer = await db.models.customer.findOne({ where: { phone: phone } })
  if (customer) {
    customer = customer.toJSON();
    customer.type = 'customer';
    const token = authHelper.createToken(customer);
    return res.status(200).json({ token, customer });
  }

  res.status(404).json({ message: 'WRONG_PASSWORD' });
});
routes.post('/receptionLogin', async (req, res) => {
  console.log(req.body)
  let user = await customerHelper.getReceptionLogin(req.body.name, req.body.password);
  if (user) {
    user = user.toJSON();
    user.type = 'reception';
    const token = authHelper.createToken(user);
    const currencyData = await db.models.business.findOne({
      where: {
        id: user.business_id,
      }
    });
    const workingHourdata = await db.models.business_week.findOne({
      where: {
        business_id: user.business_id
      }
    })
    const businessSettingsData = await db.models.business_settings.findOne({
      where: {
        business_id: user.business_id
      }
    })
    const timeLine = await db.models.time_line.findAll({
      where: {
        business_id: user.business_id
      }
    })
    const closedDay = await db.models.business_year.findOne({
      where: {
        business_id: user.business_id
      }
    })
    return res.status(200).json({
      token, user,
      currency: currencyData.currency,
      timezone: currencyData.timezone,
      workingHour: workingHourdata,
      businessData: currencyData,
      timeLineData: timeLine,
      settingData: businessSettingsData,
      businessYear: closedDay
    });
  }
  res.status(404).json({ message: 'WRONG_PASSWORD' });
});
routes.post('/reception/verify', async (req, res) => {
  console.log(req.body)
  let user = await db.models.business_user.findOne({
    where: {
      business_id: req.body.businessId,
      name: req.body.userName
    }
  });
  if (user) {
    console.log(user.verified)
    // if (!user.verified) {
    if (user.name == req.body.userName) {
      if (user.unlock_code == req.body.pinCode) {
        await db.models.business_user.update({
          verified: true
        }, {
          where: {
            name: req.body.userName
          }
        });
        return res.status(200).json({ data: user.id });
      } else {
        res.status(404).json({ message: 'INVAILD' });
      }
    } else {
      res.status(404).json({ message: 'INVAILD' });
    }
    // } else {
    //   res.status(404).json({ message: 'INVAILD' });
    // }
  }
  res.status(404).json({ message: 'INVAILD' });
});
routes.post('/reception/signUp', async (req, res) => {
  await db.models.business_user.update({
    password: await bcrypt.hash(req.body.password, 10),
  }, {
    where: {
      id: req.body.userId,
    }
  });
  res.status(200).json({ data: "OK" });
});
routes.post('/customer/generate/qrcode', async (req, res) => {
  let reservationId = req.body.reservation_id;
  let status = req.body.status;
  let businessType = req.body.businessType;
  let uniqueString = cryptoRandomString({ length: 100, type: 'base64' });
  if (businessType == "beach") {
    await db.models.reservation_beach.update({
      qr_code: uniqueString,
      reservation_status: status
    }, {
      where: {
        id: reservationId,
      }
    });
  } else {
    await db.models.reservation_restaurant.update({
      qr_code: uniqueString,
      reservation_status: status
    }, {
      where: {
        id: reservationId,
      }
    });
  }
  console.log(uniqueString, status, "-------------------->")
  QRCode.toString(uniqueString, function (err, url) {
    console.log(url)
  })
  res.status(200).json({ data: "success" });
})
routes.get('/customer/getQrcode', async (req, res) => {
  let reservationId = req.query.id;
  console.log(reservationId, "----------------------------reservagtioinIdsf")
  let reservationData = await db.models.reservation_beach.findOne({
    where: {
      id: reservationId,
    }
  });
  if (reservationData.reservation_status == "paid_online" || reservationData.reservation_status == "occupied") {
    if (reservationData.qr_code) {
      let qrCode = reservationData.qr_code;
      let data = async () => {
        return QRCode.toDataURL(qrCode)
          .then(url => {
            return url;
          })
      }
      data()
        .then(result => {
          return result
        })
        .catch(err => {
          console.log(err);
        });
      let codeData = await data();
      console.log(codeData, "iiiiiiiiiiiiiiiiiiiiiiiii")
      res.status(200).json({ data: codeData });
    }
  }
  res.status(200).json({ data: "" });
})

module.exports = routes;
