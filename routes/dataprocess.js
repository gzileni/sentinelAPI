var express = require('express');
var router = express.Router();
const path = require('path');

var log = require('logbootstrap');

/* GET home page. */
router.get('/:dataprocess', (req, res, next) => {
  
  const dataprocess = req.params.dataprocess;
  let script_name;

  if (dataprocess == 'CO') {
    script_name = 'CO.js';
  } else if (dataprocess == 'NO22') {
    script_name = 'NO2_luongo.js';
  } else if (dataprocess == 'NO2') {
    script_name = 'NO2.js';
  };

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
