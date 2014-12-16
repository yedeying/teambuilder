var publish = {};
exports = module.exports = publish;
var db = require('./db');
var people = require('./people');
var global = require('./global');
publish.addPublishBar = function(data, sess, callback) {
  data.publish = {};
  var email = sess.email;
  var gid = sess.gid;
  people.getUid(sess, function(uid) {
    global.checkGroupAdmin(uid, function(err, bl) {
      if(err) throw err;
      data.publish.admin = bl;
      data.publish.publishList = [];
      var list = data.publish.publishList;
      var sql = 'select pid, content, unix_timestamp(time) as time from publish where gid = ' + gid;
      db.query(sql, function(err, rows) {
        if(err) throw err;
        rows.forEach(function(row, index) {
          list.push({
            pid: row['pid'],
            content: row['content'],
            time: row['time']
          });
        });
        callback();
      });
    });
  });
};

publish.newPublish = function(data, sess, res) {
  var pid = sess.pid;
  var content = data.content;
  if(data.type === 'modify') {
    var cid = data.cid;
    var sql = 'update publish set content = "' + content + '" where sha1(pid) = "' + data.pid + '"';
    cont(sql, '修改成功');
  } else if(data.type === 'publish') {
    people.getUid(sess, function(uid) {
      var sql = 'insert into publish (uid, gid, content) values (' + uid + ', ' + gid + ', "' + content + '")';
      cont(sql, '插入成功');
    });
  } else {
    res.send({code: 1, info: '页面错误'});
  }
  function cont(sql, info) {
    db.query(sql, function(err, rows) {
      if(err) throw err;
      res.send({code: 0, info: info});
    });
  }
};

publish.delPublish = function(data, sess, res) {
  var pid = data.pid;
  var sql = 'delete from publish where sha1(pid) = "' + pid + '"';
  db.query(sql, function(err) {
    if(err) throw err;
    res.send({code: 0, info: '移除成功'});
  });
};