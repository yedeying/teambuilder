define(function(require, exports, module) {
  "use strict";
  module.exports = {
    getFormData: function(form, filler) {
      var data = {};
      for (var i = 0; i < form.length; ++i) {
        var name = form[i].name;
        var value = form[i].value;
        if (name.length === 0)
          continue;
        if (value.length === 0) {
          if ((typeof filler != 'string') || (filler.length === 0))
            continue;
          else
            value = filler;
        }
        data[name] = value;
      }
      return data;
    },
    checkMailFormat: function(email) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    },
    checkPasswordFormat: function(pwd) {
      return /^[0-9a-zA-Z]+$/.test(pwd);
    },
    checkTidFormat: function(tid) {
      return /[0-9a-f]{40}/.test(tid);
    },
    checkDateFormat: function(str) {
      if(typeof str !== 'string') {
        return {
          code: 1,
          info: '并非一个字符串'
        };
      }
      str = str.replace('：', ':');
      if(!/\d\d\d\d\/\d\d\/\d\d \d\d\:\d\d/.test(str)) {
        return {
          code: 1,
          info: '格式不满足1990/01/01 00:00'
        };
      }
      var now = new Date();
      var year = parseInt(str.split(' ')[0].split('/')[0], 10);
      var month = parseInt(str.split(' ')[0].split('/')[1], 10);
      var day = parseInt(str.split(' ')[0].split('/')[2], 10);
      var hour = parseInt(str.split(' ')[1].split(':')[0], 10);
      var minute = parseInt(str.split(' ')[1].split(':')[1], 10);
      var leap = year % 400 === 0 || year % 100 !== 0 && year % 4 === 0;
      var dayFormMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if(hour === 24) {
        hour = 0;
      }
      if(minute === 60) {
        minute = 0;
      }
      if(year < 1900 || month < 1 || month > 12 || day < 1 || day > dayFormMonth[month - 1] || hour < 0 || hour >= 24 || minute < 0 || minute >= 60) {
        return {
          code: 1,
          info: '时间不合法'
        };
      }
      var date = new Date();
      date.setFullYear(year);
      date.setMonth(month - 1);
      date.setDate(day);
      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);
      if(date.getTime() < now.getTime()) {
        return {
          code: 2,
          info: '时间不能早于当前',
          time: date
        };
      }
      return {
        code: 0,
        info: '成功',
        time: date
      }
    },
    getDate: function(date) {
      if(!(date instanceof Date)) {
        date = new Date(date);
      }
      var resDate = _fillDigit(date.getFullYear(), 4) + '/' + _fillDigit(date.getMonth() + 1, 2) + '/' + _fillDigit(date.getDate(), 2);
      var resTime = _fillDigit(date.getHours(), 2) + ':'+ _fillDigit(date.getMinutes(), 2);
      return {
        date: resDate,
        time: resTime
      }
      function _fillDigit(str, digit) {
        if(typeof str !== 'string') str = str.toString();
        if(digit < str.length) return str;
        var cnt = digit - str.length;
        while(cnt--) {
          str = '0' + str;
        }
        return str;
      }
    },
    cloneDate: function(date) {
      return new Date(date.getTime());
    },
    getMonthLength: function(date) {
      var tmpDate = this.cloneDate(date);
      tmpDate.setMonth(tmpDate.getMonth() + 1);
      tmpDate.setDate(0);
      return tmpDate.getDate();
    },
    toDateFormat: function(date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
    },
    merge: function(objA, objB) {
      for(var i in objB) {
        objA[i] = objB[i];
      }
    },
    tid: undefined,
    showing: false,
    showInfo: function(str, time) {
      var $ = require('jquery');
      var that = this;
      var $body = $('body');
      var $alert = $('.alert-box');
      var $info = $('.alert-box .info');
      var hide = function() {
        $alert.css({ top: '-55px' });
        that.showing = false;
        if(that.tid) clearTimeout(that.tid);
      };
      time = time || 3000;
      if(this.showing) {
        hide();
        setTimeout(function() {
          that.showing = false;
          show();
        }, 500);
      } else {
        show();
      }
      function show() {
        $info.text(str);
        $alert.css({ top: '70px' });
        $body.on('click', '.alert-box .close', hide);
        that.showing = true;
        that.tid = setTimeout(hide, time);
      }
    },
    getModel: function(url, type, data, callback, callback2) {
      var $ = require('jquery');
      var that = this;
      if(!type) {
        type = url;
      }
      var $body = $('body');
      var $cover = $('.cover');
      if(typeof data !== 'object') {
        callback = data;
        data = {};
      }
      $.get('/model/' + url, data, function(data) {
        if(data && data.code === 0) {
          $body.append(data.html);
          $cover.css({
            visibility: 'visible'
          });
          var $model = $('.model');
          $model.css({
            top: ($body.scrollTop() + 60) + 'px'
          });
          $model.data('type', type);
          if(typeof callback2 === 'function') {
            callback2(data);
          }
        } else if(data.code === 1) {
          that.showInfo(data.info);
        } else if(typeof callback === 'function') {
          callback(data);
        }
      });
    },
    slideActivityTriangle: function(ele) {
      var left = ele.offsetLeft + ele.offsetWidth / 2 - 6;
      var $black = $('.activity-triangle-black');
      var $white = $('.activity-triangle-white');
      $black.css({left: left + 'px'});
      $white.css({left: left + 'px'});
    },
    /**
     * @type binary digit
     *   1 - showSuccess
     *   2 - fresh
     *   3 - if fresh, delay
     */
    handleData: function(data, type, time) {
      time = time || 1000;
      if(type === undefined) type = 7; 
      if(typeof data.code === 'number') {
        if(data.code !== 0 || (type & 1)) {
          this.showInfo(data.info);
        }
        if(data.code === 0 && (type & 2)) {
          if(type & 4) {
            setTimeout(function() {
              location.reload(true);
            }, time);
          } else {
            location.reload(true);
          }
        }
      }
    },
    /**
     * if the event effected the element
     *   return true
     * else
     *   return false
     */
    isParentOf: function(ele, target) {
      while(ele) {
        if(target instanceof Array) {
          for(var i = 0, len = target.length; i < len; i++) {
            if(ele === target[i]) {
              return true;
            }
          }
        } else if(ele === target) {
          return true;
        }
        ele = ele.parentNode;
      }
      return false;
    }
  }
});