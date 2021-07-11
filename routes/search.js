const express = require('express');
const routes = express();

const db = require('../db');

routes.get('/businessCities', async (req, res) => {
  console.log("/businessCitiesy-------------------------->")
  const cities = await db.models.business.findAll({
    where: {
      status: 'active',
    },
    attributes: ['city_id'],
    group: ['city_id'],
    include: [{
      model: db.models.city,
      attributes: ['name'],
      include: [
        {
          model: db.models.country,
          attributes: ['name'],
        },
        {
          model: db.models.state,
          attributes: ['name']
        }
      ]
    }],
    limit: 5,
  });

  res.status(200).json(cities);
});

routes.get('/general', async (req, res) => {
  console.log("/general")
  const { query, limit = 5, offset = 0 } = req.query;
  if (query.length < 3) {
    return res.status(200).json([]);
  }

  const business = await db.models.business.findAll({
    where: {
      $or: [
        {
          name: {
            $like: `%${query}%`
          }
        },
        {
          type: {
            $like: `${query}%`
          }
        },
      ]
    },
    attributes: ['id', 'name', 'type', 'avg_rate'],
    // include: [{
    //     model: db.models.city,
    //     attributes: ['name'],
    //     include: [
    //         {
    //             model: db.models.country,
    //             attributes: ['name'],
    //         },
    //         {
    //             model: db.models.state,
    //             attributes: ['name']
    //         }
    //     ]
    // }],
    limit,
    offset,
  });

  const country = await db.models.country.findAll({
    where: {
      name: {
        $like: `${query}%`
      }
    },
    attributes: ['id', 'name'],
    limit,
    offset,
  });

  const city = await db.models.city.findAll({
    where: {
      name: {
        $like: `${query}%`
      }
    },
    attributes: ['id', 'name'],
    include: [
      {
        model: db.models.country,
        attributes: ['name'],
      },
      {
        model: db.models.state,
        attributes: ['name']
      }
    ],
    limit,
    offset,
  });

  res.status(200).json({
    business,
    country,
    city
  });
});


routes.get('/location', async (req, res) => {
  let locations;
  let businessData;
  let businessImage = [];
  let arr = [];
  if (req.query.type == "country") {
    locations = await db.models.business_settings.findAll({
      where: {
        beach_location_country: {
          $like: `%${req.query.query}%`
        }
      },
    });
    if (locations.length > 0) {
      for (let i = 0; i < locations.length; i++) {
        businessData = await db.models.business.findOne({
          where: {
            id: locations[i].business_id
          },
        });
        businessImage = await db.models.business_gallery.findAll({
          where: {
            business_id: locations[i].business_id
          },
        });
        if (businessImage.length > 0) {
          let arrs = [];
          for (let i = 0; i < businessImage.length; i++) {
            console.log(businessImage[i].url)
            arrs.push(businessImage[i].url)
          }
          var pair = { images: arrs };
          businessData.dataValues = { ...businessData.dataValues, ...pair };
          // businessData.dataValues[i].images = [arrs];
        }
        arr.push(businessData.dataValues)
      }
    }
    res.status(200).json({ arr });
  }
});
routes.get('/getDate', async (req, res) => {
  var today = new Date();
  let weeksArr = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  var dd = String(today.getDate());
  var mm = String(today.getMonth() + 1); //January is 0!
  var yyyy = today.getFullYear();
  var weeks = String(today.getDay());
  res.status(200).json({ today: today, year: yyyy, month: mm, day: dd, week: weeksArr[weeks] });
});
routes.post('/reservationSearch', async (req, res) => {
  let searchValue = req.body.searchValue;
  let searchType = req.body.type;
  console.log(searchValue, searchType, "------------>")
  if (searchType == "Phone_Number") {
    const reservation_data = await db.models.reservation_beach.findAll({
      where: {
        phone_number: {
          $like: `%${searchValue}%`
        },
      },
      order: [
        ['updated_at', 'DESC'],
      ],
    });
    res.status(200).json({ data: reservation_data });
  }
  if (searchType == "Name") {
    const reservation_data = await db.models.reservation_beach.findAll({
      where: {
        name: {
          $like: `${searchValue}%`
        },
      },
      order: [
        ['updated_at', 'DESC'],
      ],
    });
    res.status(200).json({ data: reservation_data });
  }
  if (searchType == "Reservation_Number") {
    const reservation_data = await db.models.reservation_beach.findAll({
      where: {
        id: {
          $like: `${searchValue}`
        },
      },
      order: [
        ['updated_at', 'DESC'],
      ],
    });
    res.status(200).json({ data: reservation_data });
  }
  res.status(200).json({ data: [] });
});
routes.post('/reservationRestaurantSearch', async (req, res) => {
  let searchValue = req.body.searchValue;
  let searchType = req.body.type;
  console.log(searchValue, searchType, "------------>")
  if (searchType == "Phone_Number") {
    const reservation_data = await db.models.reservation_restaurant.findAll({
      where: {
        phone_number: {
          $like: `%${searchValue}%`
        },
      },
      order: [
        ['updated_at', 'DESC'],
      ],
    });
    res.status(200).json({ data: reservation_data });
  }
  if (searchType == "Name") {
    const reservation_data = await db.models.reservation_restaurant.findAll({
      where: {
        name: {
          $like: `${searchValue}%`
        },
      },
      order: [
        ['updated_at', 'DESC'],
      ],
    });
    res.status(200).json({ data: reservation_data });
  }
  if (searchType == "Reservation_Number") {
    const reservation_data = await db.models.reservation_restaurant.findAll({
      where: {
        id: {
          $like: `${searchValue}`
        },
      },
      order: [
        ['updated_at', 'DESC'],
      ],
    });
    res.status(200).json({ data: reservation_data });
  }
  res.status(200).json({ data: [] });
});
routes.post('/searchLocations', async (req, res) => {
  let search = req.body.searchValue;
  const searchData = await db.models.business.findAll({
    where: {
      location_name: {
        $like: `${req.body.searchValue}%`
      },
    },
    order: [
      ['updated_at', 'DESC'],
    ],
  });
  res.status(200).json({ data: searchData });
});
routes.get('/customer/getActiveReservation', async (req, res) => {
  let search = req.body.searchValue;
  const searchData = await db.models.business.findAll({
    where: {
      location_name: {
        $like: `${req.body.searchValue}%`
      },
    },
    order: [
      ['updated_at', 'DESC'],
    ],
  });
  res.status(200).json({ data: searchData });
});
module.exports = routes;