var fs = require('fs');
var crypto = require('crypto');
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
module.exports.saveFile = function(files, createFile, finish) {
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