var router = module.exports = require('express').Router();
var tools = require('../module/tools');
var calendar = require('../module/calendar');

router.post('/add_schedule', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.title === '') {
    res.send({code: 1, info: '标题不能为空'});
    return;
  }
  data.detail = data.detail || '';
  data.time = parseInt(data.time, 10);
  if(isNaN(data.time)) {
    res.send({code: 1, info: '时间格式不正确, 请确认时间格式符合xxxx/xx/xx及xx:xx'});
    return;
  }
  calendar.addSchedule(data, sess, res);
});

router.post('/get_schedule', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!data.start || !data.end) {
    res.send({code: 1, info: '不合法参数'});
    return;
  }
  calendar.getSchedule(data, sess, res);
});

router.post('/modify_schedule', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.title === '') {
    res.send({code: 1, info: '标题不能为空'});
    return;
  }
  data.detail = data.detail || '';
  data.time = parseInt(data.time, 10);
  if(isNaN(data.time)) {
    res.send({code: 1, info: '时间格式不正确, 请确认时间格式符合xxxx/xx/xx及xx:xx'});
    return;
  }
  calendar.modifySchedule(data, sess, res);
});

router.post('/remove_schedule', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.sid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  calendar.removeSchedule(data, sess, res);
});