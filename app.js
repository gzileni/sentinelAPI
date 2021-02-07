const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
var createError = require('http-errors');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/api.json');

const sentinelRouter_v1 = require('./routes/sentinel');
const processRouter_v1 = require('./routes/process');
const indexRouter = require('./routes/index');

const dotenv = require('dotenv');
dotenv.config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'evalscripts')));

app.use('/', indexRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/sentinel', sentinelRouter_v1);
app.use('/api/v1/process', processRouter_v1);

module.exports = app;
