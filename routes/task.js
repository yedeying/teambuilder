var router = module.exports = require('express').Router();
var multipart = (require('connect-multiparty'))();
var tools = require('../module/tools');
var task = require('../module/task');
var file = require('../module/file');

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
  var rec = req.body.data;
  data = JSON.parse(rec);
  if(data.name === '') {
    res.send({code: 1, info: '列表名不能为空'});
    return;
  }
  var time = tools.checkDateFormat(data.time);
  if(time.code !== 0) {
    res.send(time);
    return;
  }
  if(tools.testId(data.tid)) {
    res.send({code: 1, info: '任务列表格式错误'});
    return;
  }
  data.time = time.time;
  task.editTaskList(data, sess, res);
});

router.post('/add_task', multipart, function(req, res) {
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
  if(tools.testId(data.participant)) {
    res.send({code: 1, info: '参与者格式错误'});
    return;
  }
  var files = [];
  for(var fileName in upfile) {
    if(upfile.hasOwnProperty(fileName)) {
      files.push(upfile[fileName]);
    }
  }
  console.log(files);
  data.files = files;
  task.addTask(data, sess, res);
});

router.post('/remove_task_list', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.tid)) {
    res.send({code: 1, info: 'tid格式错误'});
    return;
  }
  task.removeTaskList(data, sess, res);
});

router.post('/remove_task', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.did)) {
    res.send({code: 1, info: 'did格式错误'});
    return;
  }
  task.removeTask(data, sess, res);
});

router.post('/edit_task', multipart, function(req, res) {
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
  if(tools.testId(data.participant)) {
    res.send({code: 1, info: '参与者格式错误'});
    return;
  }
  var files = [];
  for(var fileName in upfile) {
    if(upfile.hasOwnProperty(fileName)) {
      files.push(upfile[fileName]);
    }
  }
  data.files = files;
  task.editTask(data, sess, res);
});

router.post('/change_status', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.checked === 'true') {
    data.checked = true;
  } else if(data.checked === 'false') {
    data.checked = false;
  } else {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  if(tools.testId(data.did) || !tools.isBoolean(data.checked)) {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  task.changeStatus(data, sess, res);
});

router.post('/delete_file', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId([data.id, data.fid])) {
    res.send({code: 1, info: '格式错误'});
    return;
  }
  file.deleteFile(data, 1, res);
});