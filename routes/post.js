var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var tools = require('../module/tools');
var global = require('../module/global');
var signup = require('../module/signup');
var index = require('../module/index');
var project = require('../module/project');
var people = require('../module/people');
var joingroup = require('../module/joingroup');
var task = require('../module/task');
var file = require('../module/file');
var comment = require('../module/comment');
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
router.post('/create_task_list', function(req, res) {
  var sess = req.session;
  var data = req.body.data;
  data = JSON.parse(data);
  if(data.name === '') {
    res.send({code: 1, info: '列表名不能为空'});
    return;
  }
  var time = tools.checkDateFormat(data.time);
  if(time.code !== 0) {
    res.send(time);
    return;
  }
  data.time = time.time;
  task.createTaskList(data, sess, res);
});
router.post('/edit_task_list', function(req, res) {
  var sess = req.session;
  var data = req.body.data;
  data = JSON.parse(data);
  if(data.name === '') {
    res.send({code: 1, info: '列表名不能为空'});
    return;
  }
  var time = tools.checkDateFormat(data.time);
  if(time.code !== 0) {
    res.send(time);
    return;
  }
  if(!/[0-9a-f]{40}/.test(data.tid)) {
    res.send({code: 1, info: '任务列表格式错误'});
    return;
  }
  data.time = time.time;
  task.editTaskList(data, sess, res);
});
router.post('/add_task', multipartMiddleware, function(req, res) {
  var upfile = req.files;
  var sess = req.session;
  var data = req.body;
  data.participant = JSON.parse(data.participant);
  if(data.title === '') {
    res.send({code: 1, info: '任务名称不能为空'});
    return;
  }
  if(data.participant.length === 0) {
    res.send({code: 1, info: '请至少选择一个以上的参与者'});
    return;
  }
  var bl = false;
  data.participant.forEach(function(value) {
    if(!/[0-9a-f]{40}/.test(value)) bl = true;
  });
  if(bl) {
    res.send({code: 1, info: '参与者格式错误'});
    return;
  }
  var files = [];
  for(var file in upfile) {
    if(upfile.hasOwnProperty(file)) {
      files.push(upfile[file]);
    }
  }
  data.files = files;
  task.addTask(data, sess, res);
});
router.post('/remove_task_list', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!/[0-9a-f{40}]/.test(data.tid)) {
    res.send({code: 1, info: 'tid格式错误'});
    return;
  }
  task.removeTaskList(data, sess, res);
});
router.post('/remove_task', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!/[0-9a-f{40}]/.test(data.did)) {
    res.send({code: 1, info: 'did格式错误'});
    return;
  }
  task.removeTask(data, sess, res);
});
router.post('/edit_task', multipartMiddleware, function(req, res) {
  var upfile = req.files;
  var sess = req.session;
  var data = req.body;
  data.participant = JSON.parse(data.participant);
  if(data.title === '') {
    res.send({code: 1, info: '任务名称不能为空'});
    return;
  }
  if(data.participant.length === 0) {
    res.send({code: 1, info: '请至少选择一个以上的参与者'});
    return;
  }
  var bl = false;
  data.participant.forEach(function(value) {
    if(!/[0-9a-f]{40}/.test(value)) bl = true;
  });
  if(bl) {
    res.send({code: 1, info: '参与者格式错误'});
    return;
  }
  var files = [];
  for(var file in upfile) {
    if(upfile.hasOwnProperty(file)) {
      files.push(upfile[file]);
    }
  }
  data.files = files;
  task.editTask(data, sess, res);
});
router.post('/delete_file', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!/[0-9a-f]{40}/.test(data.id) || !/[0-9a-f]{40}/.test(data.fid)) {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  file.deleteFile(data, 1, res);
});
router.post('/task/change_status', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.checked === 'true') data.checked = true;
  if(data.checked === 'false') data.checked = false;
  if(!/[0-9a-f]{40}/.test(data.did) || typeof data.checked !== 'boolean') {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  task.changeStatus(data, sess, res);
});
router.post('/add_comment_list', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.title === '') {
    res.send({code: 1, info: '讨论主题不能为空'});
    return;
  }
  comment.addCommentList(data, sess, res);
});
router.post('/comment/reply', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.reply === '') {
    res.send({code: 0, info: '你还没填东西呢'});
    return;
  }
  if(!/[0-9a-f]{40}/.test(data.cid)) {
    res.send({code: 0, info: '页面错误'});
    return;
  }
  comment.replyComment(data, sess, res);
});
module.exports = router;