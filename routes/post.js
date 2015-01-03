var router = module.exports = require('express').Router();
var index = require('../module/index');
var global = require('../module/global');

router.post('/add_project', function(req, res) {
  var sess = req.session;
  var email = sess.email;
  var data = req.body;
  index.addProject(email, data, sess, res);
});

router.post('/joingroup', function(req, res) {
  var sess = req.session;
  var data = req.body;
  if(!data.groupName) {
    res.send({code: 1, info: '小组名不能为空'});
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
module.exports = router;