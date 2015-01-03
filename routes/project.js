var router = module.exports = require('express').Router();
var project = require('../module/project');

router.post('/edit_project', function(req, res) {
  var sess = req.session;
  if(!sess.pid) {
    res.send({code: 1,binfo: '你尚未选择项目'});
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