module.exports = {
  getCommonUrl: function() {
    var setting = require('../settings/global');
    if(setting.port && setting.port != 80) {
      return 'http://' + setting.url + ':' + setting.port + '/';
    } else {
      return 'http://' + setting.url + '/';
    }
  },
  getSha1: function(str) {
    var crypto = require('crypto');
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  },
  shortenString: function(str, num) {
    if(str.length <= num) return str;
    return str.substring(0, num) + '...';
  }
};