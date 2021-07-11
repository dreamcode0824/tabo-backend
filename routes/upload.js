const express = require('express');
const routes = express();
const fileUpload = require('express-fileupload');

const fileUploadHelper = require('../helpers/fileUpload');
const db = require('../db');

routes.use(fileUpload());


routes.post('/customer-photo', async (req, res) => {
  if (!req.user) {
    return res.status(400).send('Unauthorized user');
  }
  try {
    const data = fileUploadHelper.uploadToS3(
      req.files.photo.data,
      `customers/profile_photo/${req.user.id}.${req.files.photo.name.split('.').pop()}`
    );
    db.models.customer.update({
      photo: data.Location
    }, {
      where: {
        id: req.user.id
      }
    });
    res.status(200).send({ data });
  } catch (e) {
    res.status(400).send(e.toString());
  }
});

module.exports = routes;
