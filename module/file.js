exports = module.exports;
var fs = require('fs');
var crypto = require('crypto');
var emitter = require('events').EventEmitter;
var db = require('./db');
var tools = require('./tools');
var people = require('./people');
var global = require('./global');
var icons = require('../settings/icon_config');
var fileRoot = require('../settings/global').fileRoot;
function _getSha1(path, callback) {
  var sha1 = crypto.createHash('sha1');
  fs.readFile(path, {encoding: 'utf-8'}, function(err, str) {
    if(err) throw err;
    sha1.update(str);
    callback(sha1.digest('hex'));
  });
}
function _moveFile(oriPath, desPath, callback) {
  var is = fs.createReadStream(oriPath);
  var os = fs.createWriteStream(desPath);
  is.pipe(os);
  is.on('end', function() {
    fs.unlink(oriPath, function(err) {
      if(err) throw err;
      callback();
    });
  });
}
exports.saveFile = function(files, createFile, finish) {
  files.forEach(function(file, index) {
    var path = file.path;
    var fileName = file.name;
    var size = file.size;
    _getSha1(path, function(sha1) {
      createFile(sha1, fileName, size, function(name) {
        _moveFile(path, fileRoot + name, finish);
      });
    });
  });
};
exports.getFile = function(id, type, callback) {
  var sql = 'select fid, concat(fsha1, timestamp) as path, filename as name from file where type = ' + type + ' and id = ' + id;
  db.query(sql, function(err, rows) {
    if(err) throw err;
    var files = [];
    rows.forEach(function(row) {
      files.push({
        path: fileRoot + row['path'],
        name: row['name'],
        fid: row['fid']
      });
    });
    callback(files);
  });
};
exports.downloadFile = function(data, type, res) {
  var sql = 'select concat(fsha1, timestamp) as path, filename as name from file where type = ' + type + ' and sha1(id) = "' + data.id + '" and  sha1(fid) = "' + data.fid + '"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length !== 1) {
      res.send({code: 1, info: '代码错误或权限不足'});
      return;
    }
    var path = fileRoot + rows[0]['path'];
    var name = rows[0]['name'];
    res.download(path, name);
  });
};
exports.deleteFile = function(data, type, res) {
  var sql = 'delete from file where type = ' + type + ' and sha1(id) = "' + data.id +'" and sha1(fid) = "' + data.fid + '"';
  db.query(sql, function(err) {
    if(err) throw err;
    res.send({code: 0, info: '删除成功'});
  });
};
exports.generatePage = function(sess, res) {
  var gid = sess.gid;
  var email = sess.email;
  var event = new emitter();
  var cnt = 0;
  var fileList = [];
  var folderList = [];
  var uidMap = {};
  var data = {};
  data.groupName = sess.groupName;
  data.gid = sess.gid;
  people.getUid(sess, function(uid, name) {
    var sql = 'select fid, folder, uploader as uid, filename as name, size, unix_timestamp(uploadtime) as time from file where type = 3 and folder != 0 and id = ' + gid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 0) {
        cnt++;
        if(cnt === 2) {
          event.emit('listed files');
        }
        return;
      }
      rows.forEach(function(row, index) {
        fileList.push({
          fid: row['fid'],
          uid: row['uid'],
          folder: row['folder'],
          name: row['name'],
          size: row['size'],
          time: row['time']
        });
        uidMap[row['uid']] = {};
      });
      people.getUsersFromUidMap(uidMap, function() {
        cnt++;
        if(cnt === 2) {
          event.emit('listed files');
        }
      });
    });
    var sql = 'select fid, name from folder where gid = ' + gid;
    db.query(sql, function(err, rows) {
      if(err) throw err;
      if(rows.length === 0) {
        data.hasFolder = false;
        cnt++;
        if(cnt === 2) {
          event.emit('listed files');
        }
      }
      data.hasFolder = true;
      rows.forEach(function(row, index) {
        folderList.push({
          fid: row['fid'],
          name: row['name'],
          fileList: []
        });
      });
      cnt++;
      if(cnt === 2) {
        event.emit('listed files');
      }
    });
  });
  event.on('listed files', function() {
    var folderMap = {};
    var uidList = [];
    folderList.forEach(function(folder) {
      folderMap[folder.fid] = folder;
    });
    fileList.forEach(function(file) {
      if(file.size === '') {
        file.size = '0';
      }
      file.size = tools.convertFileSize(parseInt(file.size, 10));
      file.username = uidMap[file.uid].username;
      if(file.name.indexOf('.') !== -1) {
        file.suffix = '.' + file.name.split('.')[1];
        file.name = file.name.split('.')[0];
      } else {
        file.suffix = '';
      }
      file.icon = (icons[file.suffix] === undefined ? icons['unknown'] : icons[file.suffix]);
      folderMap[file.folder].fileList.push(file);
    });
    if(sess.folderId === undefined) {
      sess.folderId = folderList[0].fid;
    }
    var bl = true;
    folderList.forEach(function(folder) {
      if(folder.fid === sess.folderId) {
        bl = false;
      }
    });
    if(bl) {
      sess.folderId = folderList[0].fid;
    }
    data.defaultFolder = sess.folderId;
    data.folderList = folderList;
    folderList.forEach(function(folder) {
      if(folder.fid === data.defaultFolder) {
        data.folder = folder;
      }
    });
    res.render('file', {
      page: 'file',
      title: 'teambuilder',
      data: data,
      func: {
        json: JSON.stringify,
        getTime: tools.getTime,
        sha1: tools.getSha1
      }
    });
  });
};
exports.changeFolder = function(data, sess, res) {
  var sql = 'select fid from folder where sha1(fid) = "' + data.fid +'"';
  db.query(sql, function(err, rows) {
    if(err) throw err;
    if(rows.length === 1) {
      sess.folderId = rows[0]['fid'];
      res.send({code: 0, info: '成功'});
    } else {
      res.send({code: 1, info: '页面错误'});
    }
  });
};
exports.addFile = function(data, sess, res) {
  var saveFile = exports.saveFile;
  var cnt = 0;
  var len = data.files.length;
  global.getIdFromSha1(data.fid, 'fid', 'folder', function(err, fid) {
    if(err) throw err;
    people.getUid(sess, function(uid) {
      saveFile(data.files, function(sha1, fileName, fileSize, callback) {
        var time = (new Date()).getTime();
        var sql = 'insert into file (id, folder, uploader, type, filename, size, fsha1, timestamp, uploadtime) values (' + sess.gid + ', ' + fid + ', ' + uid + ', 3, "' + fileName + '", "' + fileSize + '", "' + sha1 + '", "' + time + '", current_timestamp())';
        db.query(sql, function(err) {
          if(err) throw err;
          callback(sha1 + time);
        });
      }, function() {
        cnt++;
        if(cnt === len) {
          res.send({code: 0, info: '上传成功'});
        }
      });
    });
  });
};
exports.deleteFile = function(data, sess, res) {
  var sql = 'delete from file where sha1(id) = "' + data.gid + '" and type = 3 and sha1(fid) = "' + data.fid + '"';
  db.query(sql, function(err) {
    if(err) throw err;
    res.send({code: 0, info: '删除成功'});
  })
};
exports.getFolderList = function(gid, callback) {
  var sql = 'select fid, gid, name, (select count(*) from file where file.folder = folder.fid) as length from folder where gid = ' + gid;
  db.query(sql, function(err, rows) {
    if(err) throw err;
    var res = [];
    rows.forEach(function(row) {
      res.push({
        fid: row['fid'],
        gid: row['gid'],
        name: row['name'],
        length: row['length']
      });
    });
    callback(res);
  });
};
exports.moveFile = function(data, sess, res) {
  global.getIdFromSha1(data.folder, 'fid', 'folder', function(err, fid) {
    if(err) throw err;
    var sql = 'update file set folder = ' + fid + ' where sha1(fid) = "' + data.fid + '"';
    db.query(sql, function(err) {
      if(err) throw err;
      res.send({code: 0, info: '修改成功'});
    });
  });
};
exports.manageFolder = function(data, sess, res) {
  var gid = sess.gid;
  var actionCnt = 0;
  function finish() {
    res.send({code: 0, info: '修改成功'});
  }
  function deleteFolderList(list) {
    var sqlArr = [];
    data.deleteList.forEach(function(fid, index) {
      sqlArr.push('sha1(fid) = "' + fid + '"');
    });
    var sql = 'delete from folder where gid = ' + gid + ' and (' + sqlArr.join(' or ') + ')';
    db.query(sql, function(err) {
      if(err) throw err;
      actionCnt++;
      if(actionCnt === 2) {
        finish();
      }
    });
  }
  function createFolderList(list) {
    var insertCnt = 0;
    list.forEach(function(fname) {
      var sql = 'insert into folder (gid, name) values (' + gid + ', "' + fname + '")';
      db.query(sql, function(err) {
        if(err) throw err;
        insertCnt++;
        if(insertCnt === list.length) {
          actionCnt++;
          if(actionCnt === 2) {
            finish();
          }
        }
      });
    });
  }
  if(data.deleteList.length === 0) {
    actionCnt++;
  } else {
    deleteFolderList(data.deleteList);
  }
  if(data.createList.length === 0) {
    actionCnt++;
  } else {
    createFolderList(data.createList);
  }
};