var express = require('express');
var router = express.Router();
var moduleArray = {};
var tools = require('../module/tools');
moduleArray.signup = require('../module/signup');
moduleArray.index = require('../module/index');
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
    sess.email = 'kanwode918@qq.com'
    // to be change up
    // if(!sess.login) {
    //   res.redirect('/login');
    //   return;
    // }
    moduleArray[page].generatePage(sess.email, function(data) {
      res.render(page, { title: 'teambuilder', page: page, data: data, func: {
        JSON: JSON,
        sha1: tools.getSha1,
        getTime: tools.getTime
      }});
    });
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
      if(moduleArray.signup.checkTidFormat(tid)) { 
        res.render('vertify', { title: '完成注册', tid: tid });
      } else {
        res.redirect('/404');
      }
    }
  });
});
module.exports = router;