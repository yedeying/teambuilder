var db = require('./db');
module.exports = {
  renderSwitchProject: function(sess, res, callback) {
    var email = sess.email;
    var sql = 'select project.name as name, project.pid as pid from user, project where user.gid = project.gid and user.email = "' + email + '"';
    var data = {};
    data.project = [];
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length >= 1) {
        rows.forEach(function(row, index) {
          data.project.push({
            name: row['name'],
            pid: row['pid']
          });
        });
        callback(data);
      } else {
        res.send({code: 1, info: '目前没有任何项目'});
      }
    });
  },
  switchProject: function(sess, pid, res) {
    var sql = 'select name, pid, description from project where sha1(pid) = "' + pid + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        sess.projectTitle = rows[0]['name'];
        sess.description = rows[0]['description'];
        sess.pid = rows[0]['pid'];
        res.send({code: 0, info: '切换成功'});
      } else {
        res.send({code: 1, info: '没这个项目, 你是hacker吧'})
      }
    });
  },
  checkGroupAdmin: function(uid, callback) {
    var sql = 'select (groups.admin = uid) as admin from groups, user where groups.gid = user.gid and user.uid = ' + uid;
    db.query(sql, function(err, rows) {
      if(rows.length !== 1) {
        callback(new Error('incorrect uid'));
        return;
      }
      callback(err, rows[0]['admin']);
    });
  },
  getIdFromSha1: function(sha1, id, table, callback) {
    var sql = 'select ' + id + ' from ' + table + ' where sha1(' + id + ') = "' + sha1 + '"';
    db.query(sql, function(err, rows) {
      if(rows.length === 1) {
        var res = rows[0][id];
        callback(err, res);
      }
    });
  }
};