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
    var sql = 'select tid, creater, title, content, status, unix_timestamp(createtime), unix_timestamp(expecttime), unix_timestamp(finishtime), participant from task where pid = ' + pid + ' order by expecttime desc';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      var cnt = {};
      cnt.cnt = 0;
      cnt.len = rows.length;
      if(cnt.len === 0) {
        event.emit('finish');
      }
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
      console.log('ok');
    });
  },
  createTaskList: function(data, sess, res) {
    var db = require('./db');
    var people = require('./people');
    var emitter = require('events').EventEmitter;
    var event = new emitter();
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
      people.getUidFromMail(sess.email, function(uid) {
        var sql = 'insert into task(pid, creater, title, content, status, createtime, expecttime, finishtime, participant) values (' + sess.pid + ', ' + uid + ', "' + name + '", "' + content + '", 0, from_unixtime(' + ((new Date()).getTime() / 1000) + '), from_unixtime(' + (time.getTime() / 1000) + '), "0000-00-00 00:00:00", "' + JSON.stringify(participant) + '")';
        db.query(sql, function(err, rows) {
          if(err) throw err;
          res.send({code: 0, info: '创建成功'});
        });
      });
    });
  },
  editTaskList: function(data, sess, res) {
    var db = require('./db');
    var people = require('./people');
    var emitter = require('events').EventEmitter;
    var event = new emitter();
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
      people.getUidFromMail(sess.email, function(uid) {
        var sql = 'update task set pid = ' + sess.pid + ', creater = ' + uid + ', title = "' + name + '", content = "' + content + '", expecttime = from_unixtime(' + (time.getTime() / 1000) + '), participant = "' + JSON.stringify(participant) + '" where sha1(tid) = "' + data.tid + '"';
        db.query(sql, function(err, rows) {
          if(err) throw err;
          res.send({code: 0, info: '修改成功'});
        });
      });
    });
  },
  getTaskList: function(tid, sess, res) {
    var db = require('./db');
    var tools = require('./tools');
    var people = require('./people');
    var sql = 'select title as name, content, unix_timestamp(expecttime) as time, participant from task where sha1(tid) = "' + tid + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length !== 1) {
        res.send({code: 1, info: '任务列表不存在'});
        return;
      }
      var row = rows[0];
      var name = row['name'];
      var content = row['content'];
      var participant = tools.decodeNumberArray(row['participant']);
      var time = tools.getTime(row['time'], 'YY/MM/DD hh:mm');
      people.getMemberList(sess, function(memberList) {
        memberList.forEach(function(member) {
          member.on = false;
        });
        participant.forEach(function(uid) {
          memberList.forEach(function(member) {
            if(uid === member.uid) {
              member.on = true;
            }
          });
        });
        res.render('models/edit_task_list', {
          title: '编辑任务列表',
          name: name,
          content: content,
          time: time,
          tid: tid,
          memberList: memberList,
          sha1: tools.getSha1
        }, function(err, html) {
          if(err) throw err;
          res.send({code: 0, html: html});
        });
      });
    });
  }
};