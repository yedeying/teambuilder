var fs = require('fs');
var crypto = require('crypto');
function getSha1(uri) {
  var str = fs.readFileSync(uri, 'utf-8');
  var sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex');
}
module.exports.saveFile = function(files) {
  
};