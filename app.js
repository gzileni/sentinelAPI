const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
let cors = require('cors');

const indexRouter = require('./routes/index');
const sentinelRouter_v1 = require('./routes/sentinel');
const dataprocessRouter_v1 = require('./routes/process');

const dotenv = require('dotenv');
dotenv.config();

var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/sentinel', sentinelRouter_v1);
app.use('/api/v1/process', dataprocessRouter_v1);

module.exports = app;
