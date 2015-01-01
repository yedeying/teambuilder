exports = module.exports;
var db = require('./db');
var tools = require('./tools');
var people = require('./people');
exports.addSchedule = function(data, sess, res) {
  people.getUid(sess, function(uid) {
    var sql = 'insert into schedule (uid, timestamp, title, detail) values (?, ?, ?, ?)';
    db.query(sql, [uid, data.time, data.title, data.detail], function(err, result) {
      if(err) throw err;
      res.send({code: 0, info: '添加成功'});
    });
  });
};
exports.modifySchedule = function(data, sess, res) {
  var sql = 'update schedule set ? where sha1(sid) = ?';
  db.query(sql, [{
    timestamp: data.time,
    title: data.title,
    detail: data.detail
  }, data.sid], function(err, result) {
    if(err) throw err;
    if(result.changedRows !== 1) {
      res.send({code: 1, info: '修改失败'});
      return;
    }
    res.send({code: 0, info: '修改成功'});
  });
};
exports.removeSchedule = function(data, sess, res) {
  var sql = 'delete from schedule where sha1(sid) = ?';
  db.query(sql, data.sid, function(err, result) {
    if(err) throw err;
    if(result.affectedRows !== 1) {
      res.send({code: 1, info: '删除失败'});
      return;
    }
    res.send({code: 0, info: '删除成功'});
  });
};
exports.getSchedule = function(data, sess, res) {
  var start = parseInt(data.start, 10);
  var end = parseInt(data.end, 10);
  var schedules = [];
  people.getUid(sess, function(uid) {
    var sql = 'select sid, timestamp, title, detail from schedule where timestamp >= ? and timestamp <= ?';
    db.query(sql, [start, end], function(err, rows) {
      if(err) throw err;
      rows.forEach(function(row, index) {
        schedules.push({
          sid: tools.getSha1(row['sid']),
          timestamp: row['timestamp'],
          title: row['title'],
          detail: row['detail']
        });
      });
      schedules.sort(function(objA, objB) {
        if(objA.timestamp < objB.timestamp) return -1;
        if(objA.timestamp === objB.timestamp) return 0;
        if(objA.timestamp > objB.timestamp) return 1;
      });
      res.send({code: 0, schedules: schedules})
    });
  });
};
exports.getScheduleFromSid = function(data, sess, res) {
  var sql = 'select timestamp, title, detail from schedule where sha1(sid) = ?';
  db.query(sql, data.sid, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      res.send({code: 1, info: '页面错误'});
      return;
    }
    var row = rows[0];
    data.timestamp = row['timestamp'];
    data.title = row['title'];
    data.detail = row['detail'];
    var time = tools.getDate(data.timestamp);
    data.date = time.date;
    data.time = time.time;
    res.render('models/modify_schedule', {
      title: '查看日程',
      data: data
    }, function(err, html) {
      if(err) throw err;
      res.send({code: 0, html: html});
    });
  });
};