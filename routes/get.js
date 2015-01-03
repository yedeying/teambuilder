"use strict";
var express = require('express');
var router = express.Router();
var moduleArray = {};
var tools = require('../module/tools');
var index = require('../module/index');
var task = require('../module/task');
var file = require('../module/file');
var note = require('../module/note');
var people = require('../module/people');
var project = require('../module/project');
var comment = require('../module/comment');
var publish = require('../module/publish');
moduleArray.signup = require('../module/login');
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
['index', 'people'].forEach(function(page) {
  router.get('/' + page, function(req, res) {
    var sess = req.session;
    moduleArray[page].generatePage(sess, function(data) {
      publish.addPublishBar(data, sess, function() {
        res.render(page, { title: 'teambuilder', page: page, data: data, func: {
          json: JSON.stringify,
          sha1: tools.getSha1,
          getTime: tools.getTime
        }});
      });
    });
  });
});
var titles = ['登录teambuilder', '注册teambuilder', '找回密码'];
['login', 'signup', 'forget'].forEach(function(page, i) {
  router.get('/' + page, function(req, res) {
    var sess = req.session;
    res.render(page, { title: titles[i], page: 'login' });
  });
});
router.get('/file', function(req, res) {
  var sess = req.session;
  file.generatePage(sess, res);
});
router.get('/note', function(req, res) {
  var sess = req.session;
  note.generatePage(sess, res);
});
router.get('/note/edit', function(req, res) {
  var sess = req.session;
  note.generateEditPage({}, sess, res);
});
router.get('/note/edit/get_content', function(req, res) {
  var sess = req.session;
  var data = req.query;
  if(tools.testId(data.nid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  note.getContent(data, sess, res);
});
router.get('/note/edit/:nid', function(req, res) {
  var sess = req.session;
  var data = req.params;
  if(tools.testId(data.nid)) {
    res.redirect('/404');
    return;
  }
  note.generateEditPage(data, sess, res);
});
router.get('/note/show/:nid', function(req, res) {
  var sess = req.session;
  var data = req.params;
  if(tools.testId(data.nid)) {
    res.redirect('/404');
    return;
  }
  note.generateShowPage(data, sess, res);
});
router.get('/calendar', function(req, res) {
  var sess = req.session;
  res.render('calendar', {page: 'calendar', title: 'teambuilder', groupName: sess.groupName});
});
router.get('/comment', function(req, res) {
  var sess = req.session;
  var data = req.query;
  if(data.cid && /[0-9a-f]{40}/.test(data.cid)) {
    comment.getPidFromCidSha1(data.cid, function(pid, name) {
      sess.pid = pid;
      sess.projectTitle = name;
      _continue();
    });
  } else if(sess.pid !== undefined) {
    _continue();
  } else {
    res.redirect('/index');
  }
  function _continue() {
    comment.generatePage(sess, function(data) {
      publish.addPublishBar(data, sess, function() {
        res.render('comment', {
          title: 'teambuilder',
          page: 'comment',
          data: data,
          func: {
            json: JSON.stringify,
            sha1: tools.getSha1,
            getTime: tools.getTime
          }
        });
      });
    });
  }
});
router.get('/comment/detail', function(req, res) {
  var sess = req.session;
  var data = req.query;
  if(!/[0-9a-f]{40}/.test(data.cid) || sess.pid === undefined) {
    res.redirect('/404');
    return;
  }
  var cid = data.cid;
  comment.generatePage(sess, function(data) {
    var bl = true;
    data.commentList.forEach(function(commentList, index) {
      if(tools.getSha1(commentList.cid) === cid) {
        data.target = commentList;
        bl = false;
      }
    });
    if(bl) {
      res.redirect('/404');
      return;
    }
    res.render('comment_detail', {
      title: 'teambuilder',
      page: 'commentDetail',
      data: data,
      func: {
        json: JSON.stringify,
        sha1: tools.getSha1,
        getTime: tools.getTime
      }
    });
  });
});
router.get('/vertify', function(req, res) {
  var sess = req.session;
  var tid = req.query.tid;
  if(moduleArray.signup.checkTidFormat(tid)) {
    res.render('vertify', {title: '完成注册', tid: tid, page: 'login'});
  } else {
    res.redirect('/404');
  }
});
router.get('/invite', function(req, res) {
  var code = req.query.code;
  if(/[0-9a-f]{40}/.test(code)) {
    people.finishInvite(code, req.session, res);
  } else {
    res.redirect('/404');
  }
});
router.get('/project', function(req, res) {
  var sess = req.session;
  if(!tools.checkSha1(req.query.pid)) {
    if(sess.pid) {
      req.query.pid = tools.getSha1(sess.pid.toString());
    } else {
      res.redirect('/404');
      return;
    }
  }
  project.generatePage(req.query.pid, res, sess, function(data) {
    publish.addPublishBar(data, sess, function() {
      res.render('project', { title: 'teambuilder', page: 'project', data: data, func: {
        JSON: JSON,
        sha1: tools.getSha1,
        getTime: tools.getTime
      }});
    });
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
  res.render('joingroup', {page: 'index'});
});
router.get('/download/task', function(req, res) {
  var sess = req.session;
  var data = req.query;
  if(!/[0-9a-f]{40}/.test(data.id) || !/[0-9a-f]{40}/.test(data.fid)) {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  file.downloadFile(data, 1, res);
});
router.get('/download/group', function(req, res) {
  var sess = req.session;
  var data = req.query;if(!/[0-9a-f]{40}/.test(data.id) || !/[0-9a-f]{40}/.test(data.fid)) {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  file.downloadFile(data, 3, res);
});
module.exports = router;