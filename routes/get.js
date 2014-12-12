"use strict";
var express = require('express');
var router = express.Router();
var moduleArray = {};
var tools = require('../module/tools');
var index = require('../module/index');
var task = require('../module/task');
moduleArray.signup = require('../module/signup');
moduleArray.index = require('../module/index');
moduleArray.people = require('../module/people');
// get mothod
router.get('/', function(req, res) {
  var sess = req.session;
  if(sess.login) {
    index.checkGroup(sess, res);
  } else {
    res.redirect('/login');
  }
});
['index', 'comment', 'calendar', 'people'].forEach(function(page) {
  router.get('/' + page, function(req, res) {
    var sess = req.session;
    moduleArray[page].generatePage(sess, function(data) {
      res.render(page, { title: 'teambuilder', page: page, data: data, func: {
        json: JSON.stringify,
        sha1: tools.getSha1,
        getTime: tools.getTime
      }});
    });
  });
});
var titles = ['登录teambuilder', '注册teambuilder', '找回密码'];
['login', 'signup', 'forget'].forEach(function(page, i) {
  router.get('/' + page, function(req, res) {
    var sess = req.session;
    console.log(page);
    res.render(page, { title: titles[i]});
  });
});
router.get('/vertify', function(req, res) {
  var sess = req.session;
  var tid = req.query.tid;
  if(moduleArray.signup.checkTidFormat(tid)) {
    res.render('vertify', {title: '完成注册', tid: tid});
  } else {
    res.redirect('/404');
  }
});
router.get('/invite', function(req, res) {
  var code = req.query.code;
  var people = require('../module/people');
  if(/[0-9a-f]{40}/.test(code)) {
    people.finishInvite(code, req.session, res);
  } else {
    res.redirect('/404');
  }
});
router.get('/project', function(req, res) {
  var sess = req.session;
  var project = require('../module/project');
  var tools = require('../module/tools');
  if(!tools.checkSha1(req.query.pid)) {
    if(sess.pid) {
      req.query.pid = tools.getSha1(sess.pid.toString());
    } else {
      res.redirect('/404');
      return;
    }
  }
  project.generatePage(req.query.pid, res, sess, function(data) {
    res.render('project', { title: 'teambuilder', page: 'project', data: data, func: {
      JSON: JSON,
      sha1: tools.getSha1,
      getTime: tools.getTime
    }});
  });
});
router.get('/task', function(req, res) {
  var sess = req.session;
  var tid = req.query.tid;
  if(tid && !/[0-9a-f]{40}/.test(tid)) {
    res.redirect('/404');
    return;
  }
  if(!tid && !sess.gid) {
    res.redirect('/index');
  }
  task.generatePage(sess, res, tid);
});
router.get('/joingroup', function(req, res) {
  res.render('joingroup', {});
})
module.exports = router;