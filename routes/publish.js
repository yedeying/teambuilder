var router = module.exports = require('express').Router();
var tools = require('../module/tools');
var publish = require('../module/publish');

router.post('/new_publish', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!data.content || data.content === '') {
    res.send({code: 1, info: '公告不能为空'});
    return;
  }
  if(!data.type || data.type === '') {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  if(data.type === 'modify' && !/[0-9a-f]{40}/.test(data.pid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  publish.newPublish(data, sess, res);
});

router.post('/del_publish', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.pid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  publish.delPublish(data, sess, res);
});