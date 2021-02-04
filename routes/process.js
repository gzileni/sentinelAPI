var express = require('express');
var router = express.Router();
const path = require('path');

var log = require('logbootstrap');

/* GET home page. */
router.get('/:data', (req, res, next) => {
  
  const data = req.params.data;
  let script_name;

  switch (data) {
    case "NO2":
      script_name = 'NO2.js';
      break;
    default:
      script_name = 'CO.js';
  }

  const options = {
    root: path.join(__dirname, 'scripts'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(script_name, options, err => {
    if (err) {
      log('error', 'script ' + script_name + ' error.')
      next(err)
    } else {
      log('info', 'script ' + script_name + ' sended.')
    }
  });

});

module.exports = router;
