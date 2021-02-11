const express = require('express');
const router = express.Router();
const log = require('logbootstrap');
// const stream = require('stream');
const moment = require('moment');
const fetch = require('node-fetch');
const sentinelhub = require('sentinelhub');

var dotenv = require('dotenv');
dotenv.config();

let url;

router.use((req, res, next) => {
  url = req.protocol + '://' + req.get('host') // + req.originalUrl;
  log('info', 'Base URL: ' + url);
  next();
});

router.get('/wakeup', (req, res, next) => {
  res.status(200).send("I'm awake!")
});

router.get('/wms', (req, res, next) => {
  const instance = req.query.instanceID || process.env.INSTANCE_ID;
  const layer_url = 'https://services.sentinel-hub.com/ogc/wms/' + instance;
  res.status(200).send(layer_url);
});

router.post('/auth', (req, res, next) => {

  sentinelhub.getToken(req.body.clientID || process.env.CLIENT_ID , req.body.clientSecret || process.env.CLIENT_SECRET, (err, token) => {
    if (err != null) {
      res.status(400).send(err);
    } else {
      res.status(200).send(token);
    }
  });

});

// Get Process Image
router.post('/process', (req, res, next) => {
  
  const base64 = req.body.base64 == 'true' || req.body.base64 == 'True';
  const evalscript = req.body.evalscript || 'CO';

  // controllare valore dei parametri nel body
  // --------------------------------
  // clientID (required)
  // clientSecret (required)
  // evalscript (not required) default value 'CO'
  // lng1, lat1, lng2, lat2 (required)
  // fromUTC (not required) default value yesterday
  // toUTC (not required) default value yesterday

  _getScript(url, evalscript, (err, script) => {
    if (err == null) {
      fetch(url + "/api/v1/sentinel/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "clientID": req.body.clientID || process.env.CLIENT_ID, 
            "clientSecret": req.body.clientSecret || process.env.CLIENT_SECRET
        })
      }).then(_getResponseText).then(token => {

        const options = {
          token: token, 
          evalscript: script,
          bbox: [req.body.lng1, req.body.lat1, req.body.lng2, req.body.lat2] || [13,45,15,47],
          fromUTC: req.body.fromUTC || moment.utc(),
          toUTC: req.body.toUTC || moment.utc(),
          width: req.body.width || 512,
          height: req.body.height || 512
        };

        log('info', 'OPTIONS \n' + JSON.stringify(options));

        sentinelhub.runProcess(options, (err, image) => {
          if (err != null) {
            log('error', 'ERROR /process \n' + JSON.stringify(err))
            res.status(400).send(err);
          } else {
            log('info', 'IMAGE BLOB \n' + image);
            res.type(image.type);
            image.arrayBuffer().then((buf) => {
              if (base64) {
                res.status(200).send(Buffer.from(buf).toString('base64'))
              } else {
                res.status(200).send(Buffer.from(buf))
              }
            });
          }
        });

      }).catch(error => {
        log('error', 'ERROR GET TOKEN ... ' + JSON.stringify(error))
        res.status(400).send(err);
      });
    } else {
      res.status(400).send(err);
    }
  })
});

let _getResponseText = (res) => {
    
  if (res.ok) { // res.status >= 200 && res.status < 300
      return res.text();
  } else {
      return res.statusText;
  }

};

let _getScript = (url, evalscript, callback) => {

  fetch(url + "/api/v1/process?evalscript=" + evalscript).then(_getResponseText).then(script => { 
      log('success', 'OK Script.');
      callback(null, script)
  }).catch(error => {
      log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
      callback(error, null);
  });
  
};

module.exports = router;