exports = module.exports;
var fs = require('fs');
var crypto = require('crypto');
var db = require('./db');
var tools = require('./tools');
var people = require('./people');
var emitter = require('events').EventEmitter;
var fileRoot = require('../settings/global').fileRoot;
function getSha1(path, callback) {
  var sha1 = crypto.createHash('sha1');
  fs.readFile(path, {encoding: 'utf-8'}, function(err, str) {
    if(err) throw err;
    sha1.update(str);
    callback(sha1.digest('hex'));
  });
}
function moveFile(oriPath, desPath, callback) {
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
    getSha1(path, function(sha1) {
      createFile(sha1, fileName, size, function(name) {
        moveFile(path, fileRoot + name, finish);
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
        var obj = {
          name: file.name.split('.')[0],
          suffix: '.' + file.name.split('.')[1]
        };
        file.name = obj;
      }
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