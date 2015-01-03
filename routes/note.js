var router = module.exports = require('express').Router();
var tools = require('../module/tools');
var note = require('../module/note');

router.post('/note/modify_note', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.nid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  if(data.title === '') {
    res.send({code: 1, info: '主题不能为空'});
    return;
  }
  note.modifyNote(data, sess, res);
});

router.post('/note/delete_note', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.nid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  note.deleteNote(data, sess, res);
});

router.post('/note/save_note', function(req, res) {
  var sess = req.session;
  var data = req.body;
  console.log('aaaaaaa');
  if(data.title === '') {
    res.send({code: 1, info: '标题不能为空'});
    return;
  }
  data.description = data.description || '';
  data.content = data.content || '';
  data.tag = data.tag || '';
  data.participant = JSON.parse(data.participant) || [];
  note.saveNote(data, sess, res);
});