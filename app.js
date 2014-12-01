var fs = require('fs');
var util = require('util');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var get = require('./routes/get');
var post = require('./routes/post');
var model = require('./routes/model');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'yedeying',
  cookie: {
    maxAge: null
  },
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  var route = require('./settings/route_config');
  var url = req.originalUrl;
  var method = req.method.toLowerCase();
  url = url.split('?')[0].split('/')[1].split('/')[0];
  var type = route[method][url];
  var sess = req.session;
  if(!sess) {
    sess = {};
  }
  if(method === 'post' || url === 'model') {
    if(type === 0 && sess.login) {
      res.send({code: 1, info: '你已经登录'});
      return;
    }
    if(type === 1 && !sess.login) {
      res.send({code: 1, info: '你尚未登录'});
      return;
    }
    if(type === 2) {
      if(!sess.login) {
        res.send({code: 1, info: '你尚未登录'});
        return;
      }
      if(!sess.pid) {
        res.send({code: 2, info: '你还没选择项目'});
        return;
      }
    }
  } else if(method === 'get') {
    if(type === 0 && sess.login) {
      res.redirect('/');
      return;
    }
    if(type === 1 && !sess.login) {
      res.redirect('/login');
      return;
    }
    if(type === 2) {
      if(!sess.login) {
        res.redirect('/login');
        return;
      }
      if(!sess.gid) {
        res.redirect('/joingroup');
        return;
      }
    }
    if(type === 3) {
      if(!sess.login) {
        res.redirect('/login');
        return;
      }
      if(!sess.gid) {
        res.redirect('/joingroup');
        return;
      }
      if(!sess.pid) {
        res.redirect('/');
        return;
      }
    }
    if(type === 5) {
      if(!sess.login) {
        res.redirect('/login');
        return;
      }
      if(sess.gid) {
        res.redirect('/');
        return;
      }
    }
  }
  next();
});
app.use('/', get);
app.use('/', post);
app.use('/model', model);

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
