const AWS = require('aws-sdk');
const request = require('request');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
});


const uploadToS3 = async (fileData, key) => {
  const fileContent = Buffer.from(fileData, 'binary');
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: fileContent
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};

const uploadFromUrl = (url, key) => {
  request.defaults({ encoding: null });

  return new Promise((resolve, reject) => {
    request.get(url, function (err, res, body) {
      return uploadToS3(body, key)
        .then(resolve)
        .catch(reject);
    });
  });
};

module.exports = {
  s3,
  uploadToS3,
  uploadFromUrl,
};
















// var AWS = require('aws-sdk');
// var uuid = require('uuid');
// var bucketName = 'node-sdk-sample-' + uuid.v4();
// // Create name for uploaded object key
// var keyName = 'hello_world.txt';

// // Create a promise on S3 service object
// var bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();

// // Handle promise fulfilled/rejected states
// bucketPromise.then(
//   function (data) {
//     // Create params for putObject call
//     var objectParams = { Bucket: bucketName, Key: keyName, Body: 'Hello World!' };
//     // Create object upload promise
//     var uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
//     uploadPromise.then(
//       function (data) {
//         console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
//       });
//   }).catch(
//     function (err) {
//       console.error(err, err.stack);
//     });





// module.exports = function (app, models) {

//   var fs = require('fs');
//   var AWS = require('aws-sdk');
//   var accessKeyId = process.env.ACCESSKEYID;
//   var secretAccessKey = process.env.SECRETACCESSKEY;

//   AWS.config.update({
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey
//   });

//   var s3 = new AWS.S3();

//   app.post('/upload', function (req, res) {

//     var params = {
//       Bucket: 'tabo-dev-photo',
//       Key: 'myKey1234.png',
//       Body: "Hello"
//     };

//     s3.putObject(params, function (perr, pres) {
//       if (perr) {
//         console.log("Error uploading data: ", perr);
//       } else {
//         console.log("Successfully uploaded data to myBucket/myKey");
//       }
//     });
//   });

// }

