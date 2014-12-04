var express = require('express');
var router = express.Router();
var urls = ['/add_project', '/add_to_project', '/edit_project', '/remove_project', '/add_people', '/exit_group', '/remove_group'];
var title = ['添加项目', '添加内容', '编辑项目', '移除项目', '邀请成员', '退出该组', '解散该组'];
urls.forEach(function(url, index) {
  router.get(url, function(req, res) {
    var sess = req.session;
    res.render('models' + url, {
      title: title[index],
      name: sess.projectTitle || '',
      description: sess.description || ''
    }, function(err, html) {
      if(err) {
        res.send({code: 1, info: 'render err'});
        throw err;
      }
      res.send({code: 0, html: html});
    });
  });
});
router.get('/remove_people', function(req, res) {
  var sess = req.session;
  var tools = require('../module/tools');
  var people = require('../module/people');
  people.renderRemovePeople(sess, function(data) {
    res.render('models/remove_people', {title: '移除成员', data: data, func: {
      sha1: tools.getSha1
    }}, function(err, html) {
      if(err) {
        res.send({code: 1, info: 'render err'});
        throw err;
      }
      res.send({code: 0, html: html});
    });
  });
});
router.get('/switch_project', function(req, res) {
  var sess = req.session;
  var tools = require('../module/tools');
  var global = require('../module/global');
  global.renderSwitchProject(sess, res, function(data) {
    res.render('models/switch_project', {title: '选择项目', data: data, func: {
      sha1: tools.getSha1
    }}, function(err, html) {
      if(err) {
        res.send({code: 1, info: 'render err'});
        throw err;
      }
      res.send({code: 0, html: html});
    });
  });
});
router.get('/edit_profile', function(req, res) {
  var sess = req.session;
  var tools = require('../module/tools');
  var people = require('../module/people');
  var data = req.query;
  people.renderEditProfile(data.uid, sess, res, function(data) {
    res.render('models/edit_profile', {title: '修改个人信息', data: data, func: {
      sha1: tools.getSha1,
      json: JSON.stringify
    }}, function(err, html) {
      if(err) {
        res.send({code: 1, info: 'render err'});
        throw err;
      }
      res.send({code: 0, html: html});
    });
  });
});
router.get('/create_task_list', function(req, res) {
  var sess = req.session;
  var tools = require('../module/tools');
  var people = require('../module/people');
  people.getMemberList(sess, function(data) {
    res.render('models/create_task_list', {
      title: '创建任务列表',
      sha1: tools.getSha1,
      now: tools.getTime(((new Date()).getTime() + 100000) / 1000, 'YY/MM/DD hh:mm'),
      memberList: data
    }, function(err, html) {
      if(err) {
        res.send({code: 1, info: 'render err'});
        throw err;
      }
      res.send({code: 0, html: html});
    });
  });
});
router.get('/edit_task_list', function(req, res) {
  var task = require('../module/task');
  var sess = req.session;
  var tid = req.query.tid;
  if(!/[0-9a-f]{40}/.test(tid)) {
    res.send({code: 1, info: '任务列表格式错误'});
    return;
  }
  task.getTaskList(tid, sess, res);
});
router.get('/add_task', function(req, res) {
  var tid = req.query.tid;
  if(!/[0-9a-f]{40}/.test(tid)) {
    res.send({code: 1, info: '任务列表格式错误'});
    return;
  }
  res.render('models/add_task.jade', {
    tid: tid,
    title: '添加任务'
  }, function(err, html) {
    if(err) throw err;
    res.send({code: 0, html: html});
  });
});
module.exports = router;