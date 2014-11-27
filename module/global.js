module.exports = {
  renderSwitchProject: function(sess, res, callback) {
    var db = require('./db');
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
    var db = require('./db');
    var sql = 'select name, pid from project where sha1(pid) = "' + pid + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        sess.name = rows[0]['name'];
        sess.pid = rows[0]['pid'];
        res.send({code: 0, info: '切换成功'});
      } else {
        res.send({code: 1, info: '没这个项目, 你是hacker吧'})
      }
    });
  }
};