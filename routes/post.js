var express = require('express');
var router = express.Router();
var global = require('../module/global');
var signup = require('../module/signup');
var index = require('../module/index');
var project = require('../module/project');
var people = require('../module/people');
var joingroup = require('../module/joingroup');
// post mothod
router.post('/login', function(req, res) {
  var sess = req.session;
  var email = req.body.email;
  var password = req.body.password;
  if(signup.validateEmail(email, res)) {
    signup.login(email, password, sess, res);
  }
});
router.post('/logout', function(req, res) {
  var sess = req.session;
  sess.login = false;
  sess.email = undefined;
  sess.pid = undefined;
  sess.projectTitle = undefined;
  sess.description = undefined;
  sess.gid = undefined;
  sess.groupName = undefined;
  res.send({code: 6, info: '退出登录'});
});
router.post('/signup', function(req, res) {
  var email = req.body.email;
  var name = req.body.username;
  var password = req.body.password;
  var time = new Date().getTime();
  if(signup.validate(email, name, password, res)) {
    password = signup.encodePassword(password, time);
    signup.checkMailRepeat(email, res, function() {
      signup.saveTempInfo(email, name, time, password, res, function(tid) {
        signup.sendMail(email, name, tid, res);
      });
    });
  }
});
router.post('/sendagain', function(req, res) {
  var email = req.body.email;
  if(signup.validateEmail(email, res)) {
    signup.checkMailRepeatBeta(email, res, function() {
      signup.sendAgain(email, res);
    });
  }
});
router.post('/vertify', function(req, res) {
  var sess = req.session;
  var email = req.body.email;
  var tid = req.body.tid;
  if(signup.validateEmail(email, res) && signup.checkTidFormat(tid)) {
    signup.vertifyRegister(email, tid, sess, res);
  }
});
router.post('/add_project', function(req, res) {
  var sess = req.session;
  var email = sess.email;
  var data = req.body;
  index.addProject(email, data, sess, res);
});
router.post('/edit_project', function(req, res) {
  var sess = req.session;
  if(!sess.pid) {
    res.send({
      code: 1,
      info: '你尚未选择项目'
    });
    return;
  }
  var pid = sess.pid;
  var data = req.body;
  project.editProject(pid, data, sess, res);
});
router.post('/remove_project', function(req, res) {
  var sess = req.session;
  if(!sess.pid) {
    res.send({
      code: 1,
      info: '你尚未选择项目'
    });
    return;
  }
  var pid = sess.pid;
  project.removeProject(pid, sess, res);
});
router.post('/add_people', function(req, res) {
  var sess = req.session;
  if(!sess.login) {
    res.send({
      code: 2,
      info: '你尚未登录'
    });
    return;
  }
  var data = req.body;
  people.addPeople(data, sess, res);
});
router.post('/remove_people', function(req, res) {
  var sess = req.session;
  var data = req.body;
  data.uids = JSON.parse(data.uid);
  if(data.uids.length === 0) {
    res.send({
      code: 1,
      info: '你还没有选择任何人'
    });
    return;
  }
  people.removePeople(data, sess, res);
});
router.post('/exit_group', function(req, res) {
  var sess = req.session;
  people.exitGroup(sess, res);
});
router.post('/remove_group', function(req, res) {
  var sess = req.session;
  people.removeGroup(sess, res);
});
router.post('/joingroup', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!data.groupName) {
    res.send({
      code: 1,
      info: '小组名不能为空'
    });
    return;
  }
  joingroup.joinGroup(data, sess, res);
});
router.post('/switch_project', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!data.pid) {
    res.send({code: 1, info: '你尚未选择任何项目'});
    return;
  } else if(!/[0-9a-f]{40}/.test(data.pid)) {
    res.send({code: 1, info: '你是hacker吧'});
    return;
  }
  global.switchProject(sess, data.pid, res);
});
router.post('/get_project_status', function(req, res) {
  var sess = req.session;
  if(!sess.pid) {
    res.send({code: 2, info: '请先选择项目'});
  } else {
    res.send({code: 0, info: '跳转成功'});
  }
});
router.post('/edit_profile', function(req, res) {
  var sess = req.session;
  var data = req.body;
  people.editProfile(data, sess, res);
});
module.exports = router;