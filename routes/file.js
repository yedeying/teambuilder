var router = module.exports = require('express').Router();
var multipart = require('connect-multiparty')();
var tools = require('../module/tools');
var file = require('../module/file');

router.post('/change_folder', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.fid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  file.changeFolder(data, sess, res);
});

router.post('/manage_folder', function(req, res) {
  var sess = req.session;
  var data = req.body;
  data.deleteList = JSON.parse(data.deleteList);
  data.createList = JSON.parse(data.createList);
  if(!(data.deleteList instanceof Array) || !(data.createList instanceof Array)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  if(data.deleteList.length === 0 && data.createList.length === 0) {
    res.send({code: 0, info: '修改成功'});
    return;
  }
  file.manageFolder(data, sess, res);
});

router.post('/add_file', multipart, function(req, res) {
  var sess = req.session;
  var data = req.body;
  var upfile = req.files;
  var files = [];
  if(tools.testId(data.fid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  for(var fileName in upfile) {
    if(upfile.hasOwnProperty(fileName)) {
      files.push(upfile[fileName]);
    }
  }
  if(files.length === 0) {
    res.send({code: 1, info: '请选择文件'});
    return;
  }
  data.files = files;
  file.addFile(data, sess, res);
});

router.post('/move_file', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId([data.fid, data.folder])) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  file.moveFile(data, sess, res);
});

router.post('/delete_file', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(tools.testId(data.fid)) {
    res.send({code: 1, info: '页面错误'});
    return;
  }
  if(data.id !== tools.getSha1(sess.gid.toString()) || tools.testId(data.fid)) {
    res.send({code: 1, info: '身份不符, 操作失败'});
    return;
  }
  file.deleteFile(data, 3, res);
});