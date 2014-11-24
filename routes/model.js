var express = require('express');
var router = express.Router();
var urls = ['/add_project', '/add_to_project', '/edit_project', '/remove_project', '/add_people'];
var title = ['添加项目', '添加内容', '编辑项目', '移除项目', '邀请成员'];
urls.forEach(function(url, index) {
  router.get(url, function(req, res) {
    var sess = req.session;
    res.render('models' + url, {
      title: title[index],
      name: sess.projectTitle || '',
      description: sess.description || ''
    }, function(err, html) {
      if(err) {
        res.send({code: 1, html: ''});
        throw err;
      }
      res.send({code: 0, html: html});
    });
  });
});
module.exports = router;