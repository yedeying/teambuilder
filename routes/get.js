var express = require('express');
var router = express.Router();
var signup = require('../module/signup');
// get mothod
router.get('/', function(req, res) {
  var sess = req.session;
  if(sess.login) {
    res.redirect('/index');
  } else {
    res.redirect('/login');
  }
});
['index', 'task', 'comment', 'review', 'calendar', 'people'].forEach(function(page) {
  router.get('/' + page, function(req, res) {
    var sess = req.session;
    if(!sess.login) {
      res.redirect('/login');
      return;
    }
    res.render(page, { title: 'teambuilder', page: page });
  });
});
var titles = ['登录teambuilder', '注册teambuilder', '找回密码'];
['login', 'signup', 'forget', 'vertify'].forEach(function(page, i) {
  router.get('/' + page, function(req, res) {
    var sess = req.session;
    if(sess.login) {
      res.redirect('/index');
      return;
    }
    if(page !== 'vertify') {
      res.render(page, { title: titles[i]});
    } else {
      var tid = req.query.tid;
      if(signup.checkTidFormat(tid)) { 
        res.render('vertify', { title: '完成注册', tid: tid });
      } else {
        res.redirect('/404');
      }
    }
  });
});
module.exports = router;