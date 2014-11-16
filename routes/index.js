var express = require('express');
var setting = require('../settings/global');
var signup = require('../module/signup');
var router = express.Router();
function log(str) {
  console.log(str);
}
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
  var password = signup.encodePassword(password, time);
  if(!signup.checkMailFormat(email)) {
    res.send({code: 1, info: '邮箱格式错误'});
  } else {
    signup.checkMailReapet(email, res, function() {
      var tid = signup.saveTempInfo(email, name, time, password, res);
      signup.sendMail(email, tid, res);
    });
  }
});
module.exports = router;