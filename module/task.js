module.exports = {
  getTaskDetail: function(tid, detail, callback) {
    var db = require('./db');
    var sql = 'select title, content, unix_timestamp(createtime) as time from detail where tid = ' + tid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      rows.forEach(function(row) {
        detail.push({
          title: row['title'],
          content: row['content'],
          time: row['time']
        });
      });
      callback();
    });
  },
  generatePage: function(sess, res) {
    var that = this;
    var db = require('./db');
    var tools = require('./tools');
    var emitter = require('events').EventEmitter;
    var event = new emitter();
    var email = sess.email;
    var pid = sess.pid;
    var data = {};
    data.task = [];
    data.title = sess.projectTitle;
    var sql = 'select tid, creater, title, content, status, unix_timestamp(createtime), unix_timestamp(expecttime), unix_timestamp(finishtime), participant from task where pid = ' + pid + ' order by expecttime';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      var cnt = {};
      cnt.cnt = 0;
      cnt.len = rows.length;
      rows.forEach(function(row, index) {
        var tid = row['tid'];
        var participant = tools.decodeNumberArray(row['participant']);
        data.task.push({
          tid: tid,
          creater: row['creater'],
          title: row['title'],
          content: row['content'],
          status: row['status'],
          createtime: row['createtime'],
          expecttime: row['expecttime'],
          finishtime: row['finishtime'],
          participant: participant,
          detail: []
        });
        that.getTaskDetail(tid, data.task[index].detail, function() {
          cnt.cnt++;
          if(cnt.cnt === cnt.len) {
            event.emit('finish');
          }
        });
      });
    });
    event.on('finish', function() {
      res.render('task', {page: 'task', title: 'teambuilder', data: data, func: {
        sha1: tools.getSha1,
        json: JSON.stringify,
        getTime: tools.getTime
      }});
    });
  }
};