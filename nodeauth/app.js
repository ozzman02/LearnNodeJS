var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');

//var mongo = require('mongodb');
//var mongoose = require('mongoose');
//var db = mongoose.connection;
var createError = require('http-errors');


//const expressValidator = require('express-validator');
//const { ExpressValidator } = require('express-validator');
//const { default: mongoose } = require('mongoose');

var app = express();

/* View Engine Setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
/* Handle Sessions */
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

/* Passport */
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (!req.isAuthenticated() && req.path === '/') {
    return res.redirect('/users/login');
  }
  res.locals.user = req.user || null;
  next();
});



app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
