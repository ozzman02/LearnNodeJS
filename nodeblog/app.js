var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');

var app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

/* 
  Express Session

    secret: 'secret'

      This sets the secret key used to sign the session ID cookie. 
      It's crucial for security to prevent tampering.
      In real applications, you should use an environment variable instead of 'secret'.
    
    saveUninitialized: true

      Controls whether a session should be saved even if it hasn’t been modified.
      When true, a session is created for every user, even if they do nothing.
      When false, sessions are only saved when something is stored in them.

    resave: true

      Ensures that sessions are saved back to the session store, even if they weren’t modified.
      When true, the session data is refreshed every request.
      When false, only modified sessions are saved.

*/
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));


// Connect Flash
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Log if a request was received
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// Make our DB accessible to our router
app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.use('/', indexRouter);
app.use('/posts', postsRouter);

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
