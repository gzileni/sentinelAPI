var express = require('express');
var router = express.Router();
const path = require('path');

var dotenv = require('dotenv');
dotenv.config();

// const fs = require('fs');

const log = require('logbootstrap');

/* GET home page. */
router.get('/', (req, res, next) => {
  
  const data = req.query.evalscript;
  let script;

  switch (data) {
    case "NO2":
      script = 'NO2.js';
      break;
    case "SO2":
      script = 'SO2.js';
      break;
    case "HCHO":
      script = 'HCHO.js';
      break;
    case "O3":
      script = 'O3.js';
      break;
    case "CH4":
      script = 'CH4.js';
      break;
    case "AS1":
      script = 'AS_340_380.js';
      break;
    case "AS2":
      script = 'AS_354_388.js';
      break;
    case "CLOUD1":
      script = 'CLOUD_BASE_H.js';
      break;
    case "CLOUD2":
      script = 'CLOUD_BASE_P.js';
      break;
    case "CLOUD3":
      script = 'CLOUD_OPT_T.js';
      break;
    case "CLOUD4":
      script = 'CLOUD_TOP_H.js';
      break;
    case "CLOUD5":
      script = 'CLOUD_TOP_P.js';
      break;
    case "CLOUD6":
      script = 'RADIO_CLOUD.js';
      break;
    default:
      script = 'CO.js';
  };

  const options = {
    root: path.join(__dirname, '../evalscripts'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(script, options, err => {
    if (err) {
      log('error', 'script ' + script + ' error.')
      next(err)
    } else {
      log('success', 'script ' + script + ' sended.')
    }
  });
  

});

module.exports = router;
