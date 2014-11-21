var signup = {
  getVerifyHtml: function (str, name, callback) {
    var jade = require('jade');
    var fs = require('fs');
    var tools = require('./tools');
    var setting = require('../settings/global');
    jade.renderFile('./views/vertify_mail.jade', {
      url: tools.getCommonUrl() + 'vertify?tid=' + str,
      name: name
    }, function(err, html) {
      if(err) { throw err; }
      callback(html);
    });
    return '<a href="http://' + setting.url + '/vertify?' + str + '">点击验证</a>';
  },
  encodePassword: function(ori, time) {
    return require('./tools').getSha1(ori + time);
  },
  checkMailFormat: function(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  },
  checkPasswordFormat: function(pwd) {
    return /^[0-9a-zA-Z]+$/.test(pwd);
  },
  checkMailRepeat: function(email, res, callback) {
    var db = require('./db');
    var sql = 'select * from user where email = "' + email + '"';
    db.query(sql, function(err, rows, fields) {
      if(err) {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
        throw err;
      } 
      if(rows && rows.length >= 1) {
        res.send({code: 1, info: '该邮箱已注册，可以尝试进行密码找回'});
        return;
      }
      sql = 'select * from tmpuser where email = "' + email + '"';
      db.query(sql, function(err, rows, fileds) {
        if(err) {
          res.send({code: 1, info: '数据库错误，请联系管理员'});
        }
        if(rows && rows.length >= 1) {
          res.send({code: 2, info: '邮件已经发送，请前往邮箱验证'});
          return;
        }
        callback();
      });
    });
  },
  checkMailRepeatBeta: function(email, res, callback) {
    var db = require('./db');
    var sql = 'select * from user where email = "' + email + '"';
    db.query(sql, function(err, rows, fields) {
      if(err) {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
        throw err;
      }
      if(rows && rows.length >= 1) {
        res.send({code: 1, info: '该邮箱已注册，可以尝试进行密码找回'});
        return;
      }
      callback();
    });
  },
  checkTidFormat: function(tid) {
    return /[0-9a-f]{40}/.test(tid);
  },
  validate: function(email, name, password, res) {
    if(!this.validateEmail(email, res)) {
      return false;
    }
    if(!name || name.length < 1) {
      res.send({code: 1, info: '姓名不能为空'});
      return false;
    }
    if(name.length > 20) {
      res.send({code: 1, info: '姓名长度不宜多于20'});
      return false;
    }
    if(!password || password.length < 1) {
      res.send({code: 1, info: '密码不能为空'});
      return false;
    }
    if(password.length < 6 || password.length > 50) {
      res.send({code: 1, info: '密码长度宜在6~50之间'});
      return false;
    }
    if(!this.checkPasswordFormat(password)) {
      res.send({code: 1, info: '密码只能包含数字和字母'});
      return false;
    }
    return true;
  },
  validateEmail: function(email, res) {
    if(!email || email.length < 1) {
      res.send({code: 1, info: '邮箱不能为空'});
      return false;
    }
    if(!this.checkMailFormat(email)) {
      res.send({code: 1, info: '邮箱格式错误'});
      return false;
    }
    return true;
  },
  saveTempInfo: function(email, name, time, password, res, callback) {
    var db = require('./db');
    var tid = this.encodePassword(email, time);
    var sql = 'insert into tmpuser (uid, email, username, password, timestamp, createtime, tid) values (null, "' + email + '", "' + name + '", "' + password + '", current_timestamp, "' + time + '", "' + tid + '")';
    db.query(sql, function(err, rows, fields) {
      if(err) {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
        throw err;
      }
      callback(tid);
    });
  },
  sendMail: function(email, name, tid, res) {
    var mailSetting = require('../settings/mail');
    var mailTransporter = require('./mail');
    this.getVerifyHtml(tid, name, function(html) {
      var mailOptions = {
        from: 'teambuilder<' + mailSetting.auth.user + '>',
        subject: 'TeamBuilder 验证邮件',
        html: html,
        to: email
      };
      mailTransporter.sendMail(mailOptions, function(err, info) {
        if(err) {
          res.send({code: 1, info: '发送邮件失败，请联系管理员'});
        } else {
          res.send({code: 0, info: '注册成功，请前往邮箱验证'});
        }
      });
    });
  },
  sendAgain: function(email, res) {
    var that = this;
    var db = require('./db');
    var sql = 'select tid, username from tmpuser where email = "' + email + '"';
    db.query(sql, function(err, rows, fields) {
      if(err) {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
        throw err;
      } else if(rows && rows.length >= 1) {
        var tid = rows[0]['tid'];
        var name = rows[0]['username'];
        that.sendMail(email, name, tid, res);
      } else {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
      }
    });
  },
  vertifyRegister: function(email, tid, sess, res) {
    var that = this;
    var db = require('./db');
    var sql = 'select email, username, password, createtime from tmpuser where email = "' + email + '" and tid = "' + tid + '"';
    db.query(sql, function(err, rows, fields) {
      if(err) {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
        throw err;
      } else if(rows && rows.length >= 1) {
        if(rows.length > 1) {
          throw new Error('vertify: tid及email匹配的数据不止一组');
        } else {
          var row = rows[0];
          var name = row['username'];
          var password = row['password'];
          var time = row['createtime'];
          var sql = 'insert into user (email, username, password, createtime, contact, gender) values ("' + email + '", "' + name + '", "' + password + '", "' + time + '", "", "未知")';
          db.query(sql, function(err, rows, fields) {
            if(err) {
              res.send({code: 1, info: err.toString()});
              throw err;
            }
            var sql = 'delete from tmpuser where email = "' + email + '" and tid = "' + tid + '"';
            db.query(sql, function(err) {
              if(err) {
                res.send({code: 1, info: '数据库错误，请联系管理员'});
                throw err;
              }
              sess.login = true;
              sess.email = email;
              res.send({code: 3, info: '验证成功'});
            });
          });
        }
      } else {
        sql = 'select email from user where email = "' + email + '"';
        db.query(sql, function(err, rows, fields) {
          if(err) {
            res.send({code: 1, info: err.toString()});
            throw err;
          }
          if(rows && rows.length >= 1) {
            res.send({code: 1, info: '您已成功注册，请直接登录'});
          } else {
            res.send({code: 1, info: '邮箱不匹配，请重试'}); 
          }
        });
      }
    });
  },
  login: function(email, password, sess, res) {
    var that = this;
    var db = require('./db');
    var sql = 'select createtime from user where email = "' + email + '"';
    db.query(sql, function(err, rows, fields) {
      if(err) {
        res.send({code: 1, info: '数据库错误，请联系管理员'});
        throw err;
      }
      if(rows && rows.length >= 1) {
        var time = rows[0]['createtime'];
        password = that.encodePassword(password, time);
        var sql = 'select * from user where email = "' + email + '" and password = "' + password + '"';
        db.query(sql, function(err, rows, fields) {
          if(err) {
            res.send({code: 1, info: '数据库错误，请联系管理员'});
            throw err;
          }
          if(rows && rows.length >= 1) {
            sess.login = true;
            sess.email = email;
            res.send({code: 5, info: '登录成功'});
          } else {
            res.send({code: 1, info: '用户名或密码错误'});
          }
        })
      } else {
        res.send({code: 4, info: '该邮箱未注册'});
      }
    });
  }
};
module.exports = signup;