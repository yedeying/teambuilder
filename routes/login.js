var router = module.exports = require('express').Router();
var login = require('../module/login');

router.post('/login', function(req, res) {
  var sess = req.session;
  var email = req.body.email;
  var password = req.body.password;
  if(login.validateEmail(email, res)) {
    login.login(email, password, sess, res);
  }
});

router.post('/logout', function(req, res) {
  var sess = req.session;
  delete sess.login;
  delete sess.email;
  delete sess.pid;
  delete sess.projectTitle;
  delete sess.description;
  delete sess.gid;
  delete sess.groupName;
  res.send({code: 6, info: '退出登录'});
});

router.post('/signup', function(req, res) {
  var email = req.body.email;
  var name = req.body.username;
  var password = req.body.password;
  var time = new Date().getTime();
  if(login.validate(email, name, password, res)) {
    password = login.encodePassword(password, time);
    login.checkMailRepeat(email, res, function() {
      login.saveTempInfo(email, name, time, password, res, function(tid) {
        login.sendMail(email, name, tid, res);
      });
    });
  }
});

router.post('/sendagain', function(req, res) {
  var email = req.body.email;
  if(login.validateEmail(email, res)) {
    login.checkMailRepeatBeta(email, res, function() {
      login.sendAgain(email, res);
    });
  }
});

router.post('/vertify', function(req, res) {
  var sess = req.session;
  var email = req.body.email;
  var tid = req.body.tid;
  if(login.validateEmail(email, res) && login.checkTidFormat(tid)) {
    login.vertifyRegister(email, tid, sess, res);
  }
});