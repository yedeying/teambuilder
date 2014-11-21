module.exports = {
  sortActivity: function(project) {
    project.forEach(function(pro) {
      var activity = pro.activity;
      activity.sort(function(x, y) {
        if(x.time < y.time) return 1;
        if(x.time > y.time) return -1;
        return 0;
      });
    });
  },
  generateTask: function(pid, activity, obj, event) {
    var db = require('./db');
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
        event.emit('add');
      }
    });
  },
  generateFile: function(pid, activity, obj, event) {
    var db = require('./db');
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
        event.emit('add');
      }
    })
  },
  generateComment: function(pid, activity, obj, event) {
    var db = require('./db');
    var tools = require('./tools');
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
        event.emit('add');
      }
    })
  },
  generatePage: function(email, callback) {
    var that = this;
    var emitter = require('events').EventEmitter;
    var event = new emitter();
    var db = require('./db');
    var data = {};
    data.email = email;
    var sql = 'select project.pid as pid, project.name as name, groups.name as groupname from project, user, groups where groups.gid = project.gid && project.gid = user.gid && user.email = "' + email + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length > 0) {
        data.groupname = rows[0]['groupname'];
      }
      var cnt = 0;
      var len = rows.length;
      rows.forEach(function(row, index) {
        var obj = { cnt: 0, len: 3 };
        data.project = data.project || [];
        data.project.push({
          name: row['name'],
          pid: row['pid'],
          activity: []
        });
        var activity = data.project[index].activity;
        that.generateComment(row['pid'], activity, obj, event);
        that.generateFile(row['pid'], activity, obj, event);
        that.generateTask(row['pid'], activity, obj, event);
      });
      event.on('add', function() {
        cnt++;
        if(cnt === len) {
          event.emit('finish');
        }
      });
    });
    event.on('finish', function() {
      that.sortActivity(data.project);
      callback(data);
    });
  }
};