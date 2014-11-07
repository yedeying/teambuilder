var express = require('express');
var setting = require('../settings/global');
var signup = require('../module/signup');
var router = express.Router();
router.get('/', function(req, res) {
  // TO DO
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
  var password = signup.encodePassword(password, time);
  if(signup.checkMail(email)) {
    var tid = signup.saveTempInfo(email, name, time, password);
    signup.sendMail(email, tid, res);
  } else {
    signup.postErr(res);
  }
});
router.post('/checkemail', function(req, res) {

})
module.exports = router;