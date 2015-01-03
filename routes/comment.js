var router = module.exports = require('express').Router();
var tools = require('../module/tools');
var comment = require('../module/comment');

router.post('/add_comment_list', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.title === '') {
    res.send({code: 1, info: '讨论主题不能为空'});
    return;
  }
  comment.addCommentList(data, sess, res);
});

router.post('/edit_comment_list', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.title === '') {
    res.send({code: 1, info: '讨论主题不能为空'});
    return;
  }
  if(tools.testId(data.cid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  comment.editCommentList(data, sess, res);
});

router.post('/reply', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(data.reply === '') {
    res.send({code: 0, info: '你还没填东西呢'});
    return;
  }
  if(tools.testId(data.cid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  comment.replyComment(data, sess, res);
});

router.post('/del_comment_list', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.cid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  comment.delCommentList(data, sess, res);
});