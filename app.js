'use strict';

require('dotenv').config();

const cors = require('cors');

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const index = require('./routes/index');
const auth = require('./routes/auth');
const user = require('./routes/users');
const trip = require('./routes/trips');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();

// -- database

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

// -- middlewares
// app.use(cors({
//   credentials: true,
//   origin: ['http://localhost:4200']
// }));

app.use(cors({
  credentials: true,
  origin: [process.env.CLIENT_URL]
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// -- session

app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// -- routes

app.use('/', index);
app.use('/auth', auth);
app.use('/trips', trip);
app.use('/users', user);

// -- error handlers

// catch 404
app.use((req, res, next) => {
  res.status(404).json({error: 'not found'});
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).json({error: 'unexpected'});
  }
});

module.exports = app;
