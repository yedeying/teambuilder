exports = module.exports;
var fs = require('fs');
var crypto = require('crypto');
var db = require('./db');
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
    getSha1(path, function(sha1) {
      createFile(sha1, fileName, function(name) {
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