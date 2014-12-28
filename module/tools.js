var setting = require('../settings/global');
var crypto = require('crypto');
module.exports = {
  getCommonUrl: function() {
    if(setting.port && setting.port != 80) {
      return 'http://' + setting.url + ':' + setting.port + '/';
    } else {
      return 'http://' + setting.url + '/';
    }
  },
  getSha1: function(str) {
    if(typeof str !== 'string') {
      str = str.toString();
    }
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
    // if(!format) format = 'hh:mm DD C';
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
  },
  decodeNumberArray: function(str) {
    var arr = [];
    if(str === '') return arr;
    arr = str.split('[')[1].split(']')[0].split(',');
    arr = arr.map(function(str) {
      return parseInt(str, 10);
    });
    return arr;
  },
  checkDateFormat: function(stamp) {
    if(typeof stamp === 'string') {
      stamp = parseInt(stamp, 10);
    }
    var time = new Date(stamp);
    var now = new Date();
    if(stamp < now.getTime()) {
      return {code: 2, info: '时间不能早于当前'};
    }
    return {code: 0, info: '成功', time: time};
  },
  cutFloat: function(num, dig) {
    function cutZero(str) {
      while(str.charAt(str.length - 1) === '0') {
        str = str.substring(0, str.length - 1);
      }
      if(str.charAt(str.length - 1) === '.') {
        str = str.substring(0, str.length - 1);
      }
      return str;
    }
    var fit = 5 * Math.pow(0.1, dig + 1);
    var str = (num + fit).toString();
    if(str.indexOf('.') === -1) {
      return cutZero(str);
    }
    var inte = str.split('.')[0];
    var floa = str.split('.')[1];
    if(floa.length <= dig) {
      return cutZero(str);
    }
    if(dig !== 0) {
      return cutZero(inte + '.' + floa.substring(0, dig));
    }
    return cutZero(inte);
  },
  convertFileSize: function(size) {
    if(typeof size !== 'number') {
      throw new Error('convertFileSize require a number params');
    }
    var unit = ['B', 'KB', 'MB', 'GB', 'TB'];
    var level = 0;
    while(size >= 1024 && level < 4) {
      size /= 1024;
      level += 1;
    }
    return {
      num: this.cutFloat(size, 2),
      unit: unit[level]
    };
  },
  testId: function(id) {
    if(typeof id === 'string') {
      return (!id || !/[0-9a-f]{40}/.test(id)) ? true : false;
    }
    if(id instanceof Array) {
      var bl = false;
      id.forEach(function(id) {
        if(!id || !/[0-9a-f]{40}/.test(id)) {
          bl = true;
        }
      });
      return bl;
    }
    throw new Error('tools.testId invalid params');
  },
  merge: function(objA, objB) {
    for(var i in objB) {
      objA[i] = objB[i];
    }
  }
};