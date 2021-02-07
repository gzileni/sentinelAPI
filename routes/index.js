var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');
dotenv.config();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: process.env.TITLE 
  });
});

module.exports = router;
