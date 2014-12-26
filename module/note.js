var db = require('./db');
var tools = require('./tools');
var people = require('./people');
var publish = require('./publish');
exports = module.exports;
exports.getTags = function(gid, callback) {
  var sql = 'select distinct tag, (select count(*) from note tmp where tmp.tag = note.tag) as length from note where gid = ' + gid;
  var tags = [];
  db.query(sql, function(err, rows) {
    if(err) {
      callback(err);
      return;
    }
    rows.forEach(function(row) {
      tags.push({
        name: row['tag'],
        length: row['length']
      });
    });
    tags.sort(function(a, b) {
      if(a < b) return -1;
      if(a === b) return 0;
      if(a > b) return 1;
    });
    callback(null, tags);
  });
};
exports.getNotes = function(gid, uid, callback) {
  var notes = [];
  var sql = 'select nid, uid, (select username from user where user.uid = note.uid) as name, title, description, unix_timestamp(time) as time, tag from note where gid = ' + gid + ' and (visible like "%,' + uid + ',%" or visible like "%[' + uid + ',%" or visible like "%,' + uid + ']%" or visible like "%[' + uid + ']%")';
  db.query(sql, function(err, rows) {
    if(err) {
      callback(err);
      return;
    }
    rows.forEach(function(row) {
      notes.push({
        nid: row['nid'],
        uid: row['uid'],
        name: row['name'],
        title: row['title'],
        description: row['description'],
        tag: row['tag'],
        time: row['time']
      });
    });
    callback(null, notes);
  });
};
exports.generatePage = function(sess, res) {
  var gid = sess.gid;
  var data = {};
  var actionCnt = 0;
  var actionLen = 2;
  data.groupName = sess.groupName;
  exports.getTags(gid, function(err, tags) {
    // if(err) throw err;
    data.tags = tags;
    actionCnt++;
    if(actionCnt === actionLen) {
      send();
    }
  });
  people.getUid(sess, function(uid) {
    exports.getNotes(gid, uid, function(err, notes) {
      // if(err) throw err;
      data.notes = notes;
      actionCnt++;
      if(actionCnt === actionLen) {
        send();
      }
    });
  });
  function send() {
    publish.addPublishBar(data, sess, function() {
      res.render('note', {
        page: 'note',
        title: 'teambuilder',
        data: data,
        func: {
          json: JSON.stringify,
          getTime: tools.getTime,
          sha1: tools.getSha1
        }
      });
    });
  }
};
exports.getDescription = function(data, sess, res) {
  var nid = data.nid;
  var gid = sess.gid;
  var sql = 'select title, description, tag, visible from note where sha1(nid) = "' + nid + '"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      res.send({code: 1, info: '页面错误'});
      return;
    }
    var row = rows[0];
    data.title = row['title'];
    data.description = row['description'];
    data.tag = row['tag'];
    data.visible = tools.decodeNumberArray(row['visible']);
    exports.getTags(gid, function(err, tags) {
      if(err) throw err;
      data.tags = tags;
      people.getMemberList(sess, data.visible, function(memberList) {
        data.memberList = memberList;
        res.render('models/modify_note', {data: data, sha1: tools.getSha1, title: '修改笔记详情'}, function(err, html) {
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