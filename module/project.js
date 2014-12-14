var db = require('./db');
var tools = require('./tools');
var emitter = require('events').EventEmitter;
module.exports = {
  sortActivity: function(activity) {
    activity.sort(function(x, y) {
      if(x.time < y.time) return 1;
      if(x.time > y.time) return -1;
      return 0;
    });
  },
  getPidFromTidSha1: function(tidSha1, callback) {
    var sql = 'select task.pid as pid, project.name as name from task, project where task.pid = project.pid and sha1(task.tid) = "' + tidSha1 +'"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        callback(rows[0]['pid'], rows[0]['name']);
      } else {
        throw new Error('invalid tidSha1');
      }
    });
  },
  generateTask: function(pid, activity, obj, event) {
    var sql = 'select task.tid as id, task.title as title, unix_timestamp(task.createtime) as time, user.username as username, user.uid as uid from task, user where user.uid = task.creater && task.pid = ' + pid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      for(var i = 0; i < rows.length; i++) {
        activity.push({
          type: 'task',
          id: rows[i]['id'],
          title: rows[i]['title'],
          time: rows[i]['time'],
          people: rows[i]['username'],
          uid: rows[i]['uid']
        });
      }
      obj.cnt++;
      if(obj.cnt == obj.len) {
        event.emit('finish');
      }
    });
  },
  generateFile: function(pid, activity, obj, event) {
    var sql = 'select file.fid as id, file.filename as filename, unix_timestamp(file.uploadtime) as time, user.username as username, user.uid as uid from file, user where user.uid = file.uploader && file.type = "0" && file.id = ' + pid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      for(var i = 0; i < rows.length; i++) {
        activity.push({
          type: 'file',
          id: rows[i]['id'],
          title: rows[i]['filename'],
          time: rows[i]['time'],
          people: rows[i]['username'],
          uid: rows[i]['uid']
        });
      }
      obj.cnt++;
      if(obj.cnt === obj.len) {
        event.emit('finish');
      }
    });
  },
  generateComment: function(pid, activity, obj, event) {
    var sql = 'select comment.cid as id, comment.content as content, unix_timestamp(comment.time) as time, user.username as username, user.uid as uid from comment, user where user.uid = comment.uid && comment.type = "0" && comment.id = ' + pid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      for(var i = 0; i < rows.length; i++) {
        activity.push({
          type: 'comment',
          id: rows[i]['id'],
          title: tools.shortenString(rows[i]['content'], 20),
          time: rows[i]['time'],
          people: rows[i]['username'],
          uid: rows[i]['uid']
        });
      }
      obj.cnt++;
      if(obj.cnt === obj.len) {
        event.emit('finish');
      }
    });
  },
  generateProject: function(pid, activity, obj, event) {
    var sql = 'select user.username as name, user.uid as uid, unix_timestamp(project.createtime) as time, project.name as title from user, project where user.uid = project.creater and project.pid = ' + pid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      var row = rows[0];
      activity.push({
        type: 'project',
        id: pid,
        title: row['title'],
        time: row['time'],
        people: row['name'],
        uid: row['uid']
      });
      obj.cnt++;
      if(obj.cnt === obj.len) {
        event.emit('finish');
      }
    });
  },
  generateGroupName: function(pid, data, obj, event) {
    var sql = 'select groups.name as name from groups, project where groups.gid = project.gid and project.pid = ' + pid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      data.groupName = rows[0]['name'];
      obj.cnt++;
      if(obj.cnt === obj.len) {
        event.emit('finish');
      }
    });
  },
  generatePage: function(pidSha1, res, sess, callback) {
    var that = this;
    var event = new emitter();
    var sql = 'select project.pid as pid, project.creater as uid, project.name as title, project.description as description, unix_timestamp(project.createtime) as createtime, project.status as status, user.username as creatername from project, user where user.uid = project.creater and sha1(pid) = "' + pidSha1 + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 0) {
        res.redirect('/404');
        return;
      }
      var row = rows[0];
      var pid = row['pid'];
      var title = row['title'];
      var description = row['description'];
      var data = {};
      var obj = { cnt: 0, len: 5 };
      sess.pid = data.pid = pid;
      sess.projectTitle = title;
      sess.description = description;
      data.activity = [];
      data.title = title;
      data.description = description;
      var activity = data.activity;
      that.generateComment(pid, activity, obj, event);
      that.generateFile(pid, activity, obj, event);
      that.generateTask(pid, activity, obj, event);
      that.generateProject(pid, activity, obj, event);
      that.generateGroupName(pid, data, obj, event);
      event.on('finish', function() {
        that.sortActivity(data.activity);
        callback(data);
      });
    });
  },
  editProject: function(pid, data, sess, res) {
    if(data.title.length === 0) {
      res.send({ code: 1, info: '项目名称不能为空'} );
      return;
    }
    data.description = data.description || '';
    var sql = 'update project set name = "' + data.title + '", description = "' + data.description + '" where pid = ' + pid;
    console.log(sql);
    db.query(sql, function(err, rows) {
      if(err) throw err;
      sess.projectTitle = data.title;
      sess.description = data.description;
      res.send({code: 0, info: '修改成功'});
    });
  },
  removeProject: function(pid, sess, res) {
    var event = new emitter();
    var sql = 'select task.tid as tid from task where task.pid = ' + pid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      var cnt = 0;
      var len = rows.length;
      if(rows.length === 0) {
        event.emit('finishfile');
      }
      for(var i = 0; i < rows.length; i++) {
        var id = rows[i]['tid'];
        var sql = 'delete from file where file.type = 1 and file.id = ' + id;
        db.query(sql, function(err, rows) {
          if(err) throw err;
          cnt++;
          if(cnt === len) {
            event.emit('finishfile');
          }
        });
      }
    });
    event.on('finishfile', function() {
      var cnt = 0;
      var sqls = [
        'delete from project where pid = ' + pid,
        'delete from task where pid = ' + pid,
        'delete from file where type = 0 and id = ' + pid,
        'delete from comment where type = 0 and id = ' + pid
      ];
      sqls.forEach(function(sql) {
        db.query(sql, function(err, rows) {
          if(err) throw err;
          cnt++;
          if(cnt === sqls.length) {
            event.emit('finish');
          }
        });
      });
    });
    event.on('finish', function() {
      sess.pid = undefined;
      sess.projectTitle = undefined;
      sess.description = undefined;
      res.send({code: 0, info: '移除成功'});
    })
  }
};