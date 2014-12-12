var db = require('./db');
var file = require('./file');
var tools = require('./tools');
var people = require('./people');
var emitter = require('events').EventEmitter;
module.exports = {
  getTaskDetail: function(tid, detail, sess, callback) {
    var that = this;
    people.getMemberList(sess, function(memberList) {
      var sql = 'select did, title, content, unix_timestamp(createtime) as time, participant, (select count(*) from file where file.type = 1 and file.id = detail.did) as num from detail where tid = ' + tid;
      db.query(sql, function(err, rows) {
        if(err) throw err;
        rows.forEach(function(row) {
          var names = [];
          var participant = tools.decodeNumberArray(row['participant']);
          for(var i = 0; i < participant.length; i++) {
            for(var j = 0; j < memberList.length; j++) {
              if(participant[i] === memberList[j].uid) {
                names.push(memberList[j].name);
              }
            }
          }
          detail.push({
            did: row['did'],
            title: row['title'],
            content: row['content'],
            time: row['time'],
            num: row['num'],
            participant: names
          });
        });
        callback();
      });
    });
  },
  generatePage: function(sess, res, tidSha1) {
    var that = this;
    var event = new emitter();
    var email = sess.email;
    var pid = sess.pid;
    var data = {};
    data.task = [];
    data.title = sess.projectTitle;
    if(tidSha1) {
      var sql = 'select tid, creater, title, content, status, unix_timestamp(createtime), unix_timestamp(expecttime), unix_timestamp(finishtime), participant from task where sha1(tid) = "' + tidSha1 + '" order by expecttime desc';
    } else {
      var sql = 'select tid, creater, title, content, status, unix_timestamp(createtime), unix_timestamp(expecttime), unix_timestamp(finishtime), participant from task where pid = ' + pid + ' order by expecttime desc';
    }    
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
        that.getTaskDetail(tid, data.task[index].detail, sess, function() {
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
  editTaskList: function(data, sess, res) {
    var event = new emitter();
    var name = data.name;
    var content = data.content;
    var time = data.time;
    people.getUidFromMail(sess.email, function(uid) {
      var sql = 'update task set pid = ' + sess.pid + ', creater = ' + uid + ', title = "' + name + '", content = "' + content + '", expecttime = from_unixtime(' + (time.getTime() / 1000) + ') where sha1(tid) = "' + data.tid + '"';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        res.send({code: 0, info: '修改成功'});
      });
    });
  },
  getTaskList: function(tid, sess, res) {
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
  },
  createTaskList: function(data, sess, res) {
    var name = data.name;
    var content = data.content;
    var time = data.time;
    people.getUidFromMail(sess.email, function(uid) {
      var sql = 'insert into task(pid, creater, title, content, status, createtime, expecttime, finishtime) values (' + sess.pid + ', ' + uid + ', "' + name + '", "' + content + '", 0, from_unixtime(' + ((new Date()).getTime() / 1000) + '), from_unixtime(' + (time.getTime() / 1000) + '), "0000-00-00 00:00:00")';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        res.send({code: 0, info: '创建成功'});
      });
    });
  },
  addTask: function(data, sess, res) {
    var saveFile = require('./file').saveFile;
    var event = new emitter();
    var cnt = 0;
    var len = data.files.length;
    var participant = [];
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
      cnt = 0;
      var sql = 'select task.tid as tid, user.uid as uid from task, user where sha1(task.tid) = "' + data.tid + '" and user.email = "' + sess.email + '"';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        if(rows.length !== 1) {
          res.send({code: 1, info: 'tid格式错误'});
          return;
        }
        var tid = rows[0]['tid'];
        var uid = rows[0]['uid'];
        var sql = 'insert into detail (tid, title, content, createtime, participant) values (' + tid + ', "' + data.name + '", "' + data.content + '", current_timestamp(), "' + JSON.stringify(participant) +'")';
        db.query(sql, function(err, rows) {
          if(err) throw err;
          if(data.files.length === 0) {
            res.send({code: 0, info: '添加成功'});
          } else {
            var sql = 'select max(did) as did from detail';
            db.query(sql, function(err, rows) {
              if(err) throw err;
              if(rows.length === 1) {
                var did = rows[0]['did'];
                saveFile(data.files, function(sha1, fileName, callback) {
                  var time = (new Date()).getTime();
                  var sql = 'insert into file (id, uploader, type, filename, fsha1, timestamp, uploadtime) values (' + did + ', ' + uid + ', 1, "' + fileName + '", "' + sha1 + '", ' + time + ', current_timestamp())';
                  db.query(sql, function(err, rows) {
                    if(err) throw err;
                    callback(sha1 + time);
                  });
                }, function() {
                  cnt++;
                  if(cnt === len) {
                    res.send({code: 0, info: '添加成功'});
                  }
                });
              }
            });
          }
        });
      });
    });
  },
  removeTaskList: function(data, sess, res) {
    var cnt = 0;
    var sql = 'delete from detail where sha1(tid) = "' + data.tid + '"';
    db.query(sql, function(err) {
      if(err) throw err;
      cnt++;
      if(cnt === 2) {
        finish();
      }
    });
    sql = 'delete from task where sha1(tid) = "' + data.tid + '"';
    db.query(sql, function(err) {
      if(err) throw err;
      cnt++;
      if(cnt === 2) {
        finish();
      }
    });
    function finish() {
      res.send({code: 0, info: '删除成功'});
    }
  },
  removeTask: function(data, sess, res) {
    var sql = 'delete from detail where sha1(did) = "' + data.did + '"';
    db.query(sql, function(err) {
      if(err) throw err;
      res.send({code: 0, info: '删除成功'});
    });
  },
  viewTask: function(data, sess, res) {
    var sql = 'select did, title, content, participant from detail where sha1(did) = "' + data.did + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length !== 1) {
        res.send({code: 1, info: '错误格式'});
        return;
      }
      var row = rows[0];
      var did = row['did'];
      var title = row['title'];
      var content = row['content'];
      var participant = tools.decodeNumberArray(row['participant']);
      var names = [];
      people.getMemberList(sess, function(memberList) {
        for(var i = 0; i < memberList.length; i++) {
          for(var j = 0; j < participant.length; j++) {
            if(memberList[i].uid == participant[j]) {
              names.push(memberList[i]);
            }
          }
        }
        file.getFile(did, 1, function(files) {
          res.render('models/view_task', {
            did: did,
            title: title,
            content: content,
            memberList: names,
            fileList: files,
            sha1: tools.getSha1
          }, function(err, html) {
            if(err) {
              res.send({code: 1, info: 'render error'});
              throw err;
            }
            res.send({code: 0, html: html});
          });
        });
      });
    });
  }
};