var express = require('express');
var setting = require('../settings/global');
var signup = require('../module/signup');
var router = express.Router();
router.get('/', function(req, res) {
  res.redirect('/login');
});
// get mothod
router.get('/login', function(req, res) {
  res.render('login', { title: '登录teambuilder' });
});
router.get('/signup', function(req, res) {
  res.render('signup', { title: '注册teambuilder' });
});
router.get('/forget', function(req, res) {
  res.render('forget', { title: '找回密码' });
});
// post mothod
router.post('/signup', function(req, res) {
  var email = req.body.email;
  var name = req.body.username;
  var password = req.body.password;
  var time = new Date().getTime();
  if(signup.validate(email, name, password, res)) {
    password = signup.encodePassword(password, time);
    signup.checkMailRepeat(email, res, function() {
      signup.saveTempInfo(email, name, time, password, res, function(tid) {
        signup.sendMail(email, tid, res);
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
module.exports = router;