module.exports = {
  getVerifyHtml: function (str, callback) {
    var jade = require('jade');
    var fs = require('fs');
    var tools = require('./tools');
    var setting = require('../settings/global');
    jade.renderFile('./views/invite_mail.jade', {
      url: tools.getCommonUrl() + 'invite?code=' + str
    }, function(err, html) {
      if(err) { throw err; }
      callback(html);
    });
  },
  sendMail: function(email, code, res, callback) {
    var mailSetting = require('../settings/mail');
    var mailTransporter = require('./mail');
    this.getVerifyHtml(code, function(html) {
      var mailOptions = {
        from: 'teambuilder<' + mailSetting.auth.user + '>',
        subject: 'TeamBuilder 小组邀请邮件',
        html: html,
        to: email
      };
      mailTransporter.sendMail(mailOptions, function(err, info) {
        if(err) {
          res.send({code: 1, info: '发送邮件失败，请联系管理员'});
        } else {
          callback();
        }
      });
    });
  },
  sortByName: function(data) {
    data.team.sort(function(a, b) {
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });
  },
  generatePage: function(sess, callback) {
    var that = this;
    var data = {};
    var db = require('./db');
    data.team = [];
    data.admin = false;
    var sql = 'select user.uid as uid, user.username as username, user.gender as gender, user.email as email, user.contact as contact, user.cid as cid, (groups.admin = user.uid) as admin, (user.email = "' + sess.email + '") as self from user as user, user as self, groups where groups.gid = self.gid and user.gid = self.gid and self.email = "' + sess.email + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      var cnt = 0;
      var len = rows.length;
      for(var i = 0; i < rows.length; i++) {
        var people = {};
        var row = rows[i];
        people.uid = row['uid'];
        people.name = row['username'];
        people.gender = row['gender'];
        people.email = row['email'];
        people.contact = row['contact'];
        people.self = row['self'] ? 'self' : 'others';
        people.admin = row['admin'] ? 'admin' : 'normal';
        if(people.self === 'self' && people.admin === 'admin') {
          data.admin = true;
        }
        (function(people){
          var sql = 'select concat(grade, major, class) as classname from class where cid = ' + row['cid'];
          db.query(sql, function(err, rows) {
            if(rows[0]) {
              people.className = rows[0]['classname'];
            } else {
              people.className = '';
            }
            data.team.push(people);
            cnt++;
            if(cnt === len) {
              that.sortByName(data);
              data.groupname = sess.groupname;
              callback(data);
            }
          });
        })(people);
      }
    });
  },
  invitePeople: function(email, self, res, callback) {
    var that = this;
    var db = require('./db');
    var tools = require('./tools');
    var emitter = require('events').EventEmitter;
    var event = new emitter();
    var time = (new Date()).getTime().toString();
    var code = tools.getSha1(email + time + self);
    var sql = 'insert into invite (user, admin, sha1code) values ("' + email + '", "' + self + '", "' + code + '")';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      that.sendMail(email, code, res, function() {
        callback();
      });
    });
  },
  finishInvite: function(code, sess, res) {
    var db = require('./db');
    var sql = 'select user, admin from invite where sha1code = "' + code + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows[0]) {
        var sql = 'select gid from user where email = "' + rows[0]['admin'] + '"';
        console.log(sql);
        var user = rows[0]['user'];
        db.query(sql, function(err, rows) {
          if(err) throw err;
          if(rows[0]) {
            var sql = 'update user set gid = ' + rows[0]['gid'] + ' where email = "' + user + '"';
            db.query(sql, function(err, rows) {
              if(err) throw err;
              sess.login = true;
              sess.email = user;
              res.redirect('/people');
            });
          }
        });
      } else {
        res.redirect('/404');
      }
    });
  },
  addPeople: function(data, sess, res) {
    var signup = require('./signup');
    var db = require('./db');
    var email = data.email;
    var self = sess.email;
    var that = this;
    if(email === '') {
      res.send({code: 2, info: '邮箱名不能为空'});
      return;
    }
    if(!signup.checkMailFormat(email)) {
      res.send({code: 1, info: '邮箱名格式错误'});
      return;
    }
    if(email === self) {
      res.send({code: 2, info: '少侠, 不要邀请自己'});
      return;
    }
    var sql = 'select (groups.admin = user.uid) as admin from groups, user where groups.gid = user.gid and user.email = "' + self + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows[0]['admin'] === 1) {
        var sql = 'select * from user where user.email = "' + email + '"';
        db.query(sql, function(err, rows) {
          if(err) throw err;
          if(rows.length === 1) {
            var sql = 'select * from user, user as self where user.email = "' + email + '" and self.email = "' + self + '" and user.gid != self.gid';
            db.query(sql, function(err, rows) {
              if(err) throw err;
              if(rows.length === 1) {
                that.invitePeople(email, self, res, function() {
                  res.send({code: 0, info: '邀请成功, 请通知该同学到邮箱确认'});
                });
              } else {
                res.send({code: 2, info: '该同学已是你的组员'});
              }
            });
          } else {
            res.send({code: 2, info: '该邮箱尚未注册, 请通知该同学用该邮箱注册后再邀请'});
          }
        });
      } else {
        res.send({code: 2, info: '你不是组长, 无权限'});
      }
    });
  },
  renderRemovePeople: function(sess, callback) {
    var db = require('./db');
    var email = sess.email;
    var sql = 'select user.username as username, user.uid as uid from user, user as self where user.gid = self.gid and self.email = "' + email + '"';
    var group = [];
    db.query(sql, function(err, rows) {
      if(err) throw err;
      for(var i = 0; i < rows.length; i++) {
        group.push({
          name: rows[i]['username'],
          uid: rows[i]['uid']
        });
      }
      callback(group);
    });
  },
  removePeople: function(data, sess, res) {
    var db = require('./db');
    var email = sess.email;
    var emitter = require('events').EventEmitter;
    var event = new emitter();
    var sql = 'select (groups.admin = user.uid) as admin from groups, user where groups.gid = user.gid and user.email = "' + email+ '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length >= 1 && rows[0]['admin'] === 1) {
        for(var i = 0; i < data.uids.length; i++) {
          var sql = 'select * from user where sha1(uid) = "' + data.uids[i] + '"';
          db.query(sql, function(err, rows) {
            if(err) throw err;
            
          });
        }
      } else {
        res.send({code: 1, info: '你不是组长, 无权限'});
      }
    });
  }
};