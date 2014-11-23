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
  checkSha1: function(sha1) {
    return /[0-9a-f]{40}/.test(sha1);
  },
  shortenString: function(str, num) {
    if(str.length <= num) return str;
    return str.substring(0, num) + '...';
  },
  formatNumber: function(num, deg) {
    var res = num.toString();
    while(res.length < deg) {
      res = '0' + res;
      deg--;
    }
    return res;
  },
  // format:
  // Y year
  // M month
  // D date
  // h hour
  // m minute
  // s second
  // C Month Name
  // c month name
  // double charactor to owning zeros
  // format as 'YY/MM/DD hh:mm:ss'
  // please promise that each sign will appear as most one time, or you will get wrong
  getTime: function(stamp, format) {
    var that = module.exports;
    var Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var date = new Date(stamp * 1000);
    return format.replace('YY', that.formatNumber(date.getYear() + 1900, 4))
                 .replace('MM', that.formatNumber(date.getMonth() + 1, 2))
                 .replace('DD', that.formatNumber(date.getDate(), 2))
                 .replace('hh', that.formatNumber(date.getHours(), 2))
                 .replace('mm', that.formatNumber(date.getMinutes(), 2))
                 .replace('ss', that.formatNumber(date.getSeconds(), 2))
                 .replace('Y', (date.getYear() + 1900).toString())
                 .replace('M', (date.getMonth() + 1).toString())
                 .replace('D', date.getDate().toString())
                 .replace('h', date.getHours().toString())
                 .replace('m', date.getMinutes().toString())
                 .replace('s', date.getSeconds().toString())
                 .replace('c', months[date.getMonth()])
                 .replace('C', Months[date.getMonth()]);
  }
};