module.exports = {
  getCommonUrl: function() {
    var setting = require('../settings/global');
    if(setting.port && setting.port != 80) {
      return 'http://' + setting.url + ':' + setting.port + '/';
    } else {
      return 'http://' + setting.url + '/';
    }
  }
};