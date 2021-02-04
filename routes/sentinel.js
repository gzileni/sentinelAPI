const express = require('express');
const router = express.Router();
const log = require('logbootstrap');

var sentinelAPI = require('../sentinelAPI');

var dotenv = require('dotenv');
dotenv.config();

router.post('/auth', (req, res, next) => {

  sentinelAPI.getToken(req.body.clientID, req.body.clientSecret, (err, token) => {
    if (err != null) {
      res.status(400).send(err);
    } else {
      res.status(200).send(token);
    }
  });

});

router.get('/ratelimit/:instance_id', (req, res, next) => {

  const instance_id = req.params.instance_id;
  
  sentinelAPI.getRateLimit(instance_id, (err, response) => {
    if (err != null) {
      res.status(400).send(err);
    } else {
      res.status(200).jsonp(response);
    }
  });

});

router.post('/process', (req, res, next) => {

  const data = req.body.data;

  sentinelAPI.runProcess(req.body.clientID, req.body.clientSecret, data, (err, image) => {
    if (err != null) {
      log('error', 'ERROR /process \n' + JSON.stringify(err))
      res.status(400).send(err);
    } else {
      //res.writeHead(200, { 'Content-Type': 'image/png' });
      //res.status(200).send(image);
      res.contentType('image/png');
      res.end(image);
    }
  });

});

module.exports = router;
