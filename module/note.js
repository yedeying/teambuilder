var db = require('./db');
var tools = require('./tools');
var people = require('./people');
var publish = require('./publish');
exports = module.exports;
function _generateTags(data) {
  var tags = {};
  data.notes.forEach(function(note) {
    tags[note.tag] = tags[note.tag] || {
      name: note.tag,
      length: 0
    };
    tags[note.tag].length++;
  });
  data.tags = [];
  for(var i in tags) {
    data.tags.push(tags[i]);
  }
}
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
  data.groupName = sess.groupName;
  people.getUid(sess, function(uid) {
    exports.getNotes(gid, uid, function(err, notes) {
      if(err) throw err;
      data.notes = notes;
      _generateTags(data);
      _send();
    });
  });
  function _send() {
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
    if(err) throw err;
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
};
exports.modifyNote = function(data, sess, res) {
  var sql = 'update note set title = "' + data.title + '", description = "' + data.description + '", tag = "' + data.tag + '", visible = "' + JSON.stringify(data.visible) + '" where sha1(nid) = "' + data.nid + '"';
  db.query(sql, function(err) {
    res.send({code: 0, info: '修改成功'});
  });
};
exports.deleteNote = function(data, sess, res) {
  var sql = 'delete from note where sha1(nid) = "' + data.nid + '"';
  db.query(sql, function(err) {
    if(err) throw err;
    res.send({code: 0, info: '删除成功'});
  });
};
exports.generateEditPage = function(data, sess, res) {
  tools.merge(data, {
    title: '',
    description: '',
    tag: '',
    content: '',
    visible: []
  });
  data.groupName = sess.groupName;
  if(data.nid) {
    var sql = 'select title, description, tag, content, visible from note where sha1(nid) = "' + data.nid + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length !== 1) {
        res.redirect('/404');
        return;
      }
      var row = rows[0];
      data.title = row['title'],
      data.description = row['description'];
      data.tag = row['tag'];
      data.content = row['content'];
      data.visible = tools.decodeNumberArray(row['visible']);
      _continue();
    });
  } else {
    _continue();
  }
  function _continue() {
    people.getMemberList(sess, data.visible, function(memberList) {
      data.memberList = memberList;
      res.render('note_edit', {data: data, sha1: tools.getSha1, json: JSON.stringify, title: 'teambilder', page: 'note'});
    });
  }
};
exports.saveNote = function(data, sess, res) {
  var bl = tools.testId(data.nid);
  people.decodeUidArray(data.participant, function(err, visible) {
    if(err) throw err;
    if(!bl) {
      var sql = 'update note set ? where sha1(nid) = ?';
      var params = [{
        title: data.title,
        description: data.description,
        tag: data.tag,
        content: data.html,
        visible: JSON.stringify(visible)
      }, data.nid];
      _continue(sql, params);
    } else {
      people.getUid(sess, function(uid) {
        var sql = 'insert into note (gid, uid, title, content, description, tag, visible) values (?, ?, ?, ?, ?, ?, ?)';
        var params = [sess.gid, uid, data.title, data.html, data.description, data.tag, JSON.stringify(visible)];
        _continue(sql, params);
      });
    }
  });
  function _continue(sql, params) {
    var query = db.query(sql, params, function(err, result) {
      if(err) throw err;
      if(bl) {
        res.send({code: 0, info: '笔记已保存', nid: tools.getSha1(result.insertId.toString())});
      } else {
        res.send({code: 0, info: '笔记已保存', nid: data.nid});
      }
    });
  }
};
exports.getContent = function(data, sess, res) {
  var sql = 'select content from note where sha1(nid) = ?';
  db.query(sql, data.nid, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      res.send({code: 1, info: '页面错误'});
      return;
    }
    res.send({code: 0, info: 'success', html: rows[0]['content']});
  });
};
exports.generateShowPage = function(data, sess, res) {
  var sql = 'select nid, uid, (select username from user where user.uid = note.uid) as name, title, content, description, unix_timestamp(time) as time, tag, visible from note where sha1(nid) = ?';
  db.query(sql, data.nid, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      res.redirect('/404');
      return;
    }
    var row = rows[0];
    data.nid = row['nid'];
    data.uid = row['uid'];
    data.name = row['name'];
    data.title = row['title'];
    data.content = row['content'];
    data.description = row['description'];
    data.time = row['time'];
    data.tag = row['tag'];
    data.visible = tools.decodeNumberArray(row['visible']);
    people.getMemberList(sess, data.visible, function(memberList) {
      data.memberList = memberList;
      res.render('note_show', {
        title: 'teambuilder',
        page: 'note',
        data: data,
        sha1: tools.getSha1,
        json: JSON.stringify,
        getTime: tools.getTime
      });
    });
  });
};