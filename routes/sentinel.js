const express = require('express');
const router = express.Router();
const log = require('logbootstrap');
// const stream = require('stream');
const moment = require('moment');

var sentinelAPI = require('../sentinelAPI');

var dotenv = require('dotenv');
dotenv.config();

let url;

router.use((req, res, next) => {
  url = req.protocol + '://' + req.get('host') // + req.originalUrl;
  log('info', 'Base URL: ' + url);
  next();
});

router.post('/auth', (req, res, next) => {

  sentinelAPI.getToken(req.body.clientID, req.body.clientSecret, (err, token) => {
    if (err != null) {
      res.status(400).send(err);
    } else {
      res.status(200).send(token);
    }
  });

});

router.post('/process', (req, res, next) => {

  const options = {
    url: url,
    clientID: req.body.clientID || process.env.CLIENT_ID, 
    clientSecret: req.body.clientSecret || process.env.CLIENT_SECRET,
    evalscript: req.body.evalscript,
    bbox: req.body.bbox || [13,45,15,47],
    fromUTC: req.body.fromUTC || moment.utc(),
    toUTC: req.body.toUTC || moment.utc(),
    width: req.body.width || 512,
    height: req.body.height || 512
  };
  
  // const base64 = req.body.base64 == 'true' || req.body.base64 == 'True';

  log('info', 'OPTIONS \n' + JSON.stringify(options));

  sentinelAPI.runProcess(options, (err, image) => {
    if (err != null) {
      log('error', 'ERROR /process \n' + JSON.stringify(err))
      res.status(400).send(err);
    } else {
      log('info', 'IMAGE BLOB \n' + image);
      res.type(image.type);
      image.arrayBuffer().then((buf) => {
        // if (base64) {
          res.status(200).send(Buffer.from(buf).toString('base64'))
        // } else {
        //  res.status(200).send(Buffer.from(buf))
        //}
      });
    }
  });

});

module.exports = router;
