var db = require('./db');
module.exports = {
  getUid: function(email, callback) {
    var sql = 'select uid from user where email = "' + email + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        callback(rows[0]['uid']);
      }
    });
  },
  checkName: function(name, res, callback) {
    var sql = 'select * from groups where name = "' + name + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length >= 1) {
        res.send({code: 1, info: '该小组名已存在'});
      } else {
        callback();
      }
    });
  },
  checkGroup: function(sess, res, callback) {
    var sql = 'select gid from user where email = ?';
    db.query(sql, sess.email, function(err, rows) {
      if(err) throw err;
      if(rows.length !== 1) {
        res.redirect('/404');
      } else if (rows[0]['gid'] !== 0) {
        res.redirect('/');
      } else {
        callback();
      }
    });
  },
  joinGroup: function(data, sess, res) {
    var email = sess.email;
    var that = this;
    that.getUid(email, function(uid) {
      that.checkName(data.groupName, res, function() {
        var sql = 'insert into groups (admin, name) values (' + uid + ', "' + data.groupName + '")';
        db.query(sql, function(err, rows) {
          if(err) throw err;
          var sql = 'select gid, name from groups where admin = ' + uid;
          db.query(sql, function(err, rows) {
            if(err) throw err;
            var gid = rows[0]['gid'];
            var groupName = rows['0']['name'];
            var sql = 'update user set gid = ' + gid + ' where uid = ' + uid;
            db.query(sql, function(err, rows) {
              if(err) throw err;
              sess.gid = gid;
              sess.groupName = groupName;
              res.send({code: 0, info: '创建成功'});
            });
          });
        });
      });
    });
  }
};