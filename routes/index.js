var express = require('express');
var router = express.Router();
const path = require('path');

var dotenv = require('dotenv');
dotenv.config();

var log = require('logbootstrap');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { 
        title: process.env.TITLE || 'sentinel5P API'
    })
});

module.exports = router;