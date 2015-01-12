var db = require('./db');
var file = require('./file');
var tools = require('./tools');
var people = require('./people');
var project = require('./project');
var publish = require('./publish');
var emitter = require('events').EventEmitter;
module.exports = {
  getTaskDetail: function(tid, detail, sess, callback) {
    var that = this;
    people.getMemberList(sess, function(memberList) {
      people.getUid(sess, function(uid) {
        var sql = 'select did, title, content, unix_timestamp(createtime) as time, participant, (not (select count(*) from detail tmp where tmp.did = detail.did and (participant like "%,' + uid + ',%" || participant like "%[' + uid + ',%" || participant like "%,' + uid + ']%" || participant like "%[' + uid + ']%")) = 0) as mine, (select count(*) from file where file.type = 1 and file.id = detail.did) as num, finish from detail where tid = ' + tid;
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
              finish: row['finish'],
              self: row['mine'],
              status: (row['finish'] ? 'finish' : 'unfinish') + ' ' + (row['mine'] ? 'self' : 'unself'),
              participant: names
            });
          });
          callback();
        });
      });
    });
  },
  generateTaskList: function(tidSha1, data, sess, event) {
    var that = this;
    var pid = sess.pid;
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
        var show = true;
        var participant = tools.decodeNumberArray(row['participant']);
        if(tidSha1 && tidSha1 !== tools.getSha1(tid.toString())) {
          show = false;
        }
        data.task.push({
          tid: tid,
          show: show,
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
  },
  generatePage: function(sess, res, tidSha1) {
    var that = this;
    var event = new emitter();
    var email = sess.email;
    var data = {};
    data.task = [];
    data.title = sess.projectTitle;
    event.on('finish', function() {
      publish.addPublishBar(data, sess, function() {
        res.render('task', {
          page: 'task',
          title: 'teambuilder',
          data: data,
          func: {
            sha1: tools.getSha1,
            json: JSON.stringify,
            getTime: tools.getTime
          }
        });
      });
    });
    if(tidSha1) {
      project.getPidFromTidSha1(tidSha1, function(pid, name) {
        sess.pid = pid;
        sess.projectTitle = name;
        that.generateTaskList(tidSha1, data, sess, event);
      });
    } else {
      that.generateTaskList(undefined, data, sess, event);
    }
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
      people.getMemberList(sess, participant, function(memberList) {
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
                saveFile(data.files, function(sha1, fileName, fileSize, callback) {
                  var time = (new Date()).getTime();
                  var sql = 'insert into file (id, uploader, type, filename, size, fsha1, timestamp, uploadtime) values (' + did + ', ' + uid + ', 1, "' + fileName + '", "' + fileSize + '", "' + sha1 + '", ' + time + ', current_timestamp())';
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
  getTaskInfo: function(data, sess, res, callback) {
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
      people.getMemberList(sess, participant, function(memberList) {
        file.getFile(did, 1, function(files) {
          callback({
            did: did,
            taskTitle: title,
            content: content,
            memberList: memberList,
            fileList: files,
            sha1: tools.getSha1
          });
        });
      });
    });
  },
  editTask: function(data, sess, res) {
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
      var sql = 'update detail set title = "' + data.name + '", content = "' + data.content + '", participant = "' + JSON.stringify(participant) + '" where sha1(did) = "' + data.did + '"';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        if(data.files.length === 0) {
          res.send({code: 0, info: '编辑成功'});
        } else {
          var sql = 'select did from detail where sha1(did) = "' + data.did +'"';
          db.query(sql, function(err, rows) {
            if(err) throw err;
            if(rows.length === 1) {
              var did = rows[0]['did'];
              saveFile(data.files, function(sha1, fileName, fileSize, callback) {
                var time = (new Date()).getTime();
                people.getUid(sess, function(uid) {
                  var sql = 'insert into file (id, uploader, type, filename, size, fsha1, timestamp, uploadtime) values (' + did + ', ' + uid + ', 1, "' + fileName + '", ' + fileSize + ', "' + sha1 + '", ' + time + ', current_timestamp())';
                  db.query(sql, function(err, rows) {
                    if(err) throw err;
                    callback(sha1 + time);
                  });
                });
              }, function() {
                cnt++;
                if(cnt === len) {
                  res.send({code: 0, info: '编辑成功'});
                }
              });
            }
          });
        }
      });
    });
  },
  changeStatus: function(data, sess, res) {
    var sql = 'update detail set finish = ' + (data.checked ? '1' : '0') + ' where sha1(did) = "' + data.did + '"';
    db.query(sql, function(err) {
      if(err) throw err;
      res.send({code: 0, info: '已标记为' + (data.checked ? '完成' : '未完成') + '状态'});
    });
  }
};