var jade = require('jade');
var fs = require('fs');
var emitter = require('events').EventEmitter;
var db = require('./db');
var tools = require('./tools');
var signup = require('./signup');
var mailTransporter = require('./mail');
var setting = require('../settings/global');
var mailSetting = require('../settings/mail');
module.exports = {
  getVerifyHtml: function (str, callback) {
    jade.renderFile('./views/invite_mail.jade', {
      url: tools.getCommonUrl() + 'invite?code=' + str
    }, function(err, html) {
      if(err) { throw err; }
      callback(html);
    });
  },
  getUid: function(sess, callback) {
    if(sess.uid) {
      callback(sess.uid);
      return;
    }
    var sql = 'select uid, username from user where email = "' + sess.email + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        callback(rows[0]['uid'], rows[0]['username']);
      } else {
        throw new Error('unknown error');
      }
    });
  },
  getUser: function(uid, callback) {
    var sql = 'select username from user where uid = ' + uid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        callback(rows[0]['username'], uid);
      } else {
        throw new Error('unknown error');
      }
    });
  },
  getUsersFromUidMap: function(uidMap, callback) {
    var cnt = 0;
    var len = 0;
    for(var i in uidMap) len++;
    for(var i in uidMap) {
      this.getUser(i, function(name, uid) {
        uidMap[uid].uid = uid;
        uidMap[uid].username = name;
        cnt++;
        if(cnt === len) {
          callback();
        }
      });
    }
  },
  sendMail: function(email, code, res, callback) {
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
              data.groupName = sess.groupName;
              callback(data);
            }
          });
        })(people);
      }
    });
  },
  invitePeople: function(email, self, res, callback) {
    var that = this;
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
    var sql = 'select user, admin from invite where sha1code = "' + code + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows[0]) {
        var sql = 'select gid from user where email = "' + rows[0]['admin'] + '"';
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
    var email = sess.email;
    var sql = 'select user.username as username, user.uid as uid from user, user as self where user.gid = self.gid and user.uid != self.uid and self.email = "' + email + '"';
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
    var email = sess.email;
    var event = new emitter();
    var sql = 'select (groups.admin = user.uid) as admin from groups, user where groups.gid = user.gid and user.email = "' + email+ '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      var cnt = 0;
      var len = data.uids.length;
      if(rows.length >= 1 && rows[0]['admin'] === 1) {
        for(var i = 0; i < data.uids.length; i++) {
          var sql = 'select * from user where sha1(uid) = "' + data.uids[i] + '" and user.email != "' + email + '"';
          db.query(sql, function(err, rows) {
            if(err) throw err;
            if(rows.length === 1) {
              cnt++;
              if(cnt === len) {
                event.emit('valid');
              }
            } else {
              event.emit('invalid');
            }
          });
        }
      } else {
        res.send({code: 1, info: '你不是组长, 无权限'});
      }
    });
    event.on('valid', function() {
      var sql = 'update user set gid = 0 where ';
      for(var i = 0; i < data.uids.length; i++) {
        if(i !== 0) {
          sql += ' or ';
        }
        sql += 'sha1(uid) = "' + data.uids[i] + '"';
      }
      db.query(sql, function(err, rows) {
        if(err) throw err;
        res.send({code: 0, info: '移除成功'});
      });
    });
    event.on('invalid', function() {
      res.send({code: 1, info: '数据源有误, 你不会是hacker吧'});
    })
  },
  exitGroup: function(sess, res) {
    var sql = 'update user set gid = 0 where email = "' + sess.email + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      res.send({code: 0, info: '退出成功'});
    });
  },
  removeGroup: function(sess, res) {
    var email = sess.email;
    var gid = sess.gid;
    var sql = 'select (groups.admin = user.uid) as admin from groups, user where groups.gid = user.gid and user.email = "' + email+ '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows[0]['admin'] !== 1) {
        res.send({code: 1, info: '你不是组长, 无权限'});
        return;
      }
      var sql = 'update user set gid = 0 where gid = ' + gid;
      db.query(sql, function(err, rows) {
        if(err) throw err;
        var sql = 'delete from groups where gid = ' + gid;
        db.query(sql, function(err, rows) {
          sess.groupname = undefined;
          sess.gid = undefined;
          res.send({code: 0, info: '解散成功'});
        });
      });
    });
  },
  renderEditProfile: function(uid, sess, res, callback) {
    var data = {};
    if(!/[0-9a-f]{40}/.test(uid)) {
      res.send({code: 1, info: '用户id格式错误'});
      return;
    }
    var sql = 'select user.uid as uid, user.username as username, user.gender as gender, user.email as email, user.contact as contact, user.cid as cid, (groups.admin = self.uid) as admin, (user.email = "' + sess.email + '") as self from user as user, user as self, groups where groups.gid = self.gid and user.gid = self.gid and self.email = "' + sess.email + '" and sha1(user.uid) = "' + uid + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 1) {
        var row = rows[0];
        var self = row['self'];
        var admin = row['admin'];
        var cid = row['cid'];
        data.uid = row['uid'];
        data.username = row['username'];
        data.gender = row['gender'];
        data.email = row['email'];
        data.contact = row['contact'];
        if(self === 0 && admin === 0) {
          res.send({code: 1, info: '你无权查看此用户信息'});
          return;
        }
        var sql = 'select cid, concat(grade, major, class) as classname from class order by grade desc, major, class';
        db.query(sql, function(err, rows) {
          if(err) throw err;
          data.classList = [];
          rows.forEach(function(row, index) {
            if(row['cid'] === cid) {
              data.className = row['classname'];
            }
            data.classList.push({
              name: row['classname'],
              cid: row['cid']
            });
          });
          if(!data.className) {
            data.className = '';
          }
          callback(data);
        });
      }
    });
  },
  validateProfileData: function(data, res) {
    data.changePassword = false;
    if(data.name === '') {
      res.send({code: 1, info: '姓名不能为空'});
      return false;
    } else if(data.name.length > 20) {
      res.send({code: 1, info: '姓名长度不宜多于20'});
    } else if(!/1|2|0/.test(data.gender)) {
      res.send({code: 1, info: '性别格式错误'});
      return false;
    } else if(data.contact.length !== 0 && !/[0-9]{5,11}/.test(data.contact)) {
      res.send({code: 1, info: '联系方式不合理'});
      return false;
    } else if(!/0|[0-9a-f]{40}/.test(data.class.toString())) {
      res.send({code: 1, info: '班级格式错误'});
      return false;
    } else if(typeof data.oripass === 'string' && data.oripass !== '' || typeof data.newpass === 'string' && data.newpass !== '' || typeof data.conpass === 'string' && data.conpass !== '') {
      data.changePassword = true;
      if(typeof data.oripass !== 'string' || data.oripass === '') {
        res.send({code: 1, info: '原密码不能为空'});
        return false;
      }
      if(typeof data.newpass !== 'string' || data.newpass === '') {
        res.send({code: 1, info: '新密码不能为空'});
        return false;
      }
      if(typeof data.conpass !== 'string' || data.conpass === '') {
        res.send({code: 1, info: '请确认密码'});
        return false;
      }
      if(data.newpass !== data.conpass) {
        res.send({code: 1, info: '密码不一致'});
        return false;
      }
    } else if(!/[0-9a-f]{40}/.test(data.uid.toString())) {
      res.send({code: 1, info: '用户id格式错误'});
      return false;
    }
    return true;
  },
  editProfile: function(data, sess, res) {
    var email = sess.email;
    if(this.validateProfileData(data, res)) {
      var sql = 'select (user.email = "' + email + '") as self, (groups.admin = self.uid) as admin from user user, groups, user self where user.gid = groups.gid and sha1(user.uid) = "' + data.uid + '" and self.email = "' + email + '"';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        if(rows.length === 1) {
          var row = rows[0];
          if(row['self'] !== 1 && row['admin'] !== 1) {
            res.send({code: 1, info: '你没有权限'});
            return;
          }
          if(data.gender === '0') data.gender = '';
          if(data.gender === '1') data.gender = '男';
          if(data.gender === '2') data.gender = '女';
          if(data.changePassword) {
            var sql = 'select 1 as correct from user where sha1(concat("' + data.oripass + '", createtime)) = password and sha1(uid) = "' + data.uid + '"';
            db.query(sql, function(err, rows) {
              if(err) throw err;
              if(rows.length === 1 && rows[0]['correct'] === 1) {
                update(true);
              } else {
                res.send({code: 1, info: '密码错误, 请重新输入'});
              }
            });
          } else {
            update(false);
          }
        } else {
          res.send({code: 1, info: '用户不存在'});
        }
      });
    }
    function update(bl) {
      var sql = 'select cid from class where sha1(cid) = "' + data.class + '"';
      db.query(sql, function(err, rows) {
        if(err) throw err;
        var sql = 'update user set username = "' + data.name + '", gender = "' + data.gender + '", contact = "' + data.contact + '"';
        if(rows.length === 1) {
          var cid = rows[0]['cid'];
          sql += ', cid = ' + cid;
        }
        if(bl) {
          sql += ', password = sha1(concat("' + data.newpass + '", createtime))';
        }
        sql += ' where sha1(uid) = "' + data.uid + '"';
        console.log(sql);
        db.query(sql, function(err, rows) {
          if(err) throw err;
          res.send({code: 0, info: '修改成功'});
        });
      });
    }
  },
  getMemberList: function(sess, callback) {
    var sql = 'select user.username as username, user.uid as uid from user user, user self where user.gid = self.gid and self.email = "' + sess.email + '"';
    var memberList = [];
    db.query(sql, function(err, rows) {
      if(err) throw err;
      for(var i = 0; i < rows.length; i++) {
        memberList.push({
          name: rows[i]['username'],
          uid: rows[i]['uid']
        });
      }
      callback(memberList);
    });
  },
  getUidFromMail: function(email, callback) {
    var sql = 'select uid from user where email = "' + email + '"';
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length !== 1) {
        throw new Error('uncorrect email');
      }
      callback(rows[0]['uid']);
    });
  }
};