var fs = require('fs');
var util = require('util');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'yedeying',
  cookie: {maxAge: null},
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./lib/session-validater'));
app.use('/', require('./routes/get'));
app.use('/', require('./routes/post'));
app.use('/', require('./routes/login'));
app.use('/model', require('./routes/model'));
app.use('/calendar', require('./routes/calendar'));
app.use('/comment', require('./routes/comment'));
app.use('/file', require('./routes/file'));
app.use('/note', require('./routes/note'));
app.use('/people', require('./routes/people'));
app.use('/project', require('./routes/project'));
app.use('/publish', require('./routes/publish'));
app.use('/task', require('./routes/task'));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
module.exports = app;
