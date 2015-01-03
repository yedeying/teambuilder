var router = module.exports = require('express').Router();
var tools = require('../module/tools');
var people = require('../module/people');

router.post('/edit_profile', function(req, res) {
  var sess = req.session;
  var data = req.body;
  people.editProfile(data, sess, res);
});

router.post('/add_people', function(req, res) {
  var sess = req.session;
  if(!sess.login) {
    res.send({
      code: 2,
      info: '你尚未登录'
    });
    return;
  }
  var data = req.body;
  people.addPeople(data, sess, res);
});

router.post('/remove_people', function(req, res) {
  var sess = req.session;
  var data = req.body;
  data.uids = JSON.parse(data.uid);
  if(data.uids.length === 0) {
    res.send({
      code: 1,
      info: '你还没有选择任何人'
    });
    return;
  }
  people.removePeople(data, sess, res);
});

router.post('/exit_group', function(req, res) {
  var sess = req.session;
  people.exitGroup(sess, res);
});

router.post('/remove_group', function(req, res) {
  var sess = req.session;
  people.removeGroup(sess, res);
});