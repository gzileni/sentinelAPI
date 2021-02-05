var express = require('express');
var router = express.Router();
const path = require('path');

const fs = require('fs');

var log = require('logbootstrap');

/* GET home page. */
router.get('/:data', (req, res, next) => {
  
  const data = req.params.data;
  let script;

  switch (data) {
    case "NO2":
      script = 'NO2.js';
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
