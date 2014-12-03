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
  },
  createTaskList: function(data, sess, res) {
    var db = require('./db');
    var people = require('./peopel');
    var name = data.name;
    var content = data.content;
    var time = data.time;
    var participant = [];
    var cnt = 0;
    var bl = false;
    data.participant.forEach(function(member, index) {
      var sql = 'select uid from user where sha1(uid) = "' + member + '"';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        if(rows.length !== 1) {
          bl = true;
        } else {
          participant.push(rows[0]['uid']);
        }
        cnt++;
        if(cnt === data.participant.length) {
          event.emit('counted');
        }
      });
    });
    event.on('counted', function() {
      if(bl) {
        res.send({code: 1, info: '参与者不存在'});
        return;
      }
      people.getUidFromMail(email, function(uid) {
        var sql = 'insert into task(pid, creater, title, content, status, createtime, expectedtime, finishtime) values (' + sess.pid + ', ' + uid + ', "' + name + '", "' + content + '", 0, from_unixtime(' + ((new Date()).getTime() / 1000) + '), from_unixtime(' + (time.getTime() / 1000) + '), "0000-00-00 00:00:00"';
        console.log(sql);
      });
    });
  }
};