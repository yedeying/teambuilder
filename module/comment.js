var comment = {};
exports = module.exports = comment;
var db = require('./db');
var tools = require('./tools');
var people = require('./people');
var emitter = require('events').EventEmitter;
comment.generatePage = function(sess, callback) {
  var email = sess.email;
  var pid = sess.pid;
  var title = sess.projectTitle;
  var event = new emitter();
  var that = this;
  var data = {};
  data.title = title;
  data.commentList = [];
  var sql = 'select comment.content as content, comment.description as description, comment.uid as uid, comment.cid as cid, unix_timestamp(comment.time) as time, comment.status as status, user.username as username from comment, user where user.uid = comment.uid and type = 0 and deep = 0 and id = ' + pid;
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length === 0) {
      event.emit('finish');
      return;
    }
    var obj = {
      cnt: 0,
      len: rows.length
    };
    rows.forEach(function(row, index) {
      data.commentList.push({
        title: row['content'],
        cid: row['cid'],
        uid: row['uid'],
        time: row['time'],
        description: row['description'],
        username: row['username'],
        comments: []
      });
      var curList = data.commentList[index];
      curList.username = row['username'];
      curList.comments.push({
        status: row['status'],
        content: row['content'],
        uid: row['uid'],
        time: row['time'],
        username: row['username']
      });
      that.generateComment(row['cid'], curList.comments, obj, event);
    });
  });
  event.on('finish', function() {
    that.sortByTime(data.commentList);
    callback(data);
  });
};

comment.generateComment = function(cid, comments, obj, event) {
  var that = this;
  var sql = 'select comment.content as content, comment.description as description, comment.uid as uid, comment.cid as cid, unix_timestamp(comment.time) as time, comment.status as status, user.username as username from comment, user where user.uid = comment.uid and type = 4 and id = ' + cid;
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length === 0) {
      that.checkCount(obj, event);
      return;
    }
    var cnt = 0;
    var len = rows.length;
    rows.forEach(function(row, index) {
      comments.push({
        status: row['status'],
        content: row['content'],
        description: row['description'],
        uid: row['uid'],
        time: row['time'],
        username: row['username']
      });
    });
    that.checkCount(obj, event);
  });
};

comment.checkCount = function(obj, event) {
  obj.cnt++;
  if(obj.cnt === obj.len) {
    event.emit('finish');
  }
};

comment.sortByTime = function(data) {
  function cmp(x, y) {
    if(x.time < y.time) return 1;
    if(x.time === y.time) return 0;
    if(x.time > y.time) return -1;
  }
  data.sort(cmp);
  data.forEach(function(tmp) {
    tmp.comments.sort(cmp);
  });
};

comment.addCommentList = function(data, sess, res) {
  var email = sess.email;
  var pid = sess.pid;
  var title = data.title;
  var description = data.description || '';
  people.getUid(sess, function(uid) {
    var sql = 'insert into comment (id, uid, type, deep, time, content, description, status) values (' + pid + ', ' + uid + ', 0, 0, current_timestamp(), "' + title + '", "' + description + '", "create")';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      res.send({code: 0, info: '创建成功'});
    });
  });
};

comment.editCommentList = function(data, sess, res) {
  var email = sess.email;
  var pid = sess.pid;
  var title = data.title;
  var description = data.description || '';
  var sql = 'update comment set content = "' + title + '", description = "' + description + '" where sha1(cid) = "' + data.cid + '"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    res.send({code: 0, info: '修改成功'});
  });
};

comment.getPidFromCidSha1 = function(cidSha1, callback) {
  var sql = 'select id from comment where type = 0 and sha1(cid) = "' + cidSha1 + '"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length === 1) {
      var pid = rows[0]['id'];
      var sql = 'select name from project where pid = ' + pid;
      db.query(sql, function(err, rows) {
        if(err) throw err;
        if(rows.length === 1) {
          callback(pid, rows[0]['name']);
        } else {
          throw new Error('unknown error');
        }
      });
    }
  });
};

comment.getCidFromCidSha1 = function(cidSha1, callback) {
  var sql = 'select cid from comment where sha1(cid) = "' + cidSha1 + '"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      var err = new Error('invalid cid code');
      callback(err);
    }
    callback(undefined, rows[0]['cid']);
  });
};

comment.replyComment = function(data, sess, res) {
  var email = sess.email;
  comment.getCidFromCidSha1(data.cid, function(err, cid) {
    if(err) {
      res.send({code: 1, info: '页面错误'});
      return;
    }
    people.getUid(sess, function(uid, username) {
      var sql = 'insert into comment (id, uid, type, deep, time, content, status) values (' + cid + ', ' + uid + ', 4, 1, current_timestamp(), "' + data.reply + '", "comment")';
      db.query(sql, function(err) {
        res.send({
          code: 0,
          info: '发布成功',
          html: '<div class="comment-block"><div class="content">' + data.reply + '</div><span class="title"><a href="/people?uid=' + tools.getSha1(uid.toString()) + '" class="name">' + username + '</a><span class="time">' + tools.getTime((new Date()).getTime() / 1000, 'hh:mm DD,C') + '</span></span></div>'
        });
      });
    });
  });
};

comment.renderEditModel = function(data, sess, res) {
  var sql = 'select content, description from comment where type = 0 and sha1(cid) = "' + data.cid + '"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      res.send({code: 1, info: '页面错误'});
      return;
    }
    var row = rows[0];
    res.render('models/edit_comment_list', {
      title: '编辑讨论',
      content: row['content'],
      description: row['description']
    }, function(err, html) {
      if(err) throw err;
      res.send({code: 0, html: html});
    });
  });
};

comment.delCommentList = function(data, sess, res) {
  var sql = 'delete from comment where type = 0 and sha1(cid) = "' + data.cid + '" or type = 4 and sha1(id) = "' + data.cid + '"';
  db.query(sql, function(err) {
    if(err) throw err;
    res.send({code: 0, info: '移除成功'});
  });
};