var express = require('express');
var router = express.Router();
var signup = require('../module/signup');
var index = require('../module/index');
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
  sess.email = null;
  res.send({ code: 6, info: '退出登录' });
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
  sess.login = true;
  sess.email = 'kanwode918@qq.com';
  if(!sess.login) {
    res.send({
      code: 1,
      info: '你尚未登录'
    });
    return;
  }
  var email = sess.email;
  var data = req.body;
  index.addProject(email, data, res);
});
module.exports = router;
