module.exports = function(req, res, next) {
  var route = require('../settings/route_config');
  var url = req.originalUrl;
  var method = req.method.toLowerCase();
  url = url.split('?')[0].split('/')[1].split('/')[0];
  var type = route[method][url];
  var sess = req.session;
  if(!sess) {
    sess = {};
  }
  if(method === 'post' || url === 'model') {
    if(type === 0 && sess.login) {
      res.send({code: 1, info: '你已经登录'});
      return;
    }
    if(type === 1 && !sess.login) {
      res.send({code: 1, info: '你尚未登录'});
      return;
    }
    if(type === 2) {
      if(!sess.login) {
        res.send({code: 1, info: '你尚未登录'});
        return;
      }
      if(!sess.pid) {
        res.send({code: 2, info: '你还没选择项目'});
        return;
      }
    }
  } else if(method === 'get') {
    if(type === 0 && sess.login) {
      res.redirect('/');
      return;
    }
    if(type === 1 && !sess.login) {
      res.redirect('/login');
      return;
    }
    if(type === 2) {
      if(!sess.login) {
        res.redirect('/login');
        return;
      }
      if(!sess.gid) {
        res.redirect('/joingroup');
        return;
      }
    }
    if(type === 3) {
      if(!sess.login) {
        res.redirect('/login');
        return;
      }
      if(!sess.gid) {
        res.redirect('/joingroup');
        return;
      }
      if(!sess.pid) {
        res.redirect('/');
        return;
      }
    }
    if(type === 5) {
      if(!sess.login) {
        res.redirect('/login');
        return;
      }
      if(sess.gid) {
        res.redirect('/');
        return;
      }
    }
  }
  next();
};