var express = require('express');
var router = express.Router();
router.get('/add_project', function(req, res) {
  res.render('models/add_project', {title: '添加项目'}, function(err, html) {
    if(err) {
      res.send({code: 1, html: ''});
      throw err;
    }
    res.send({code: 0, html: html});
  });
});
module.exports = router;