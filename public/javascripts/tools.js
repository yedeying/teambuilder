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
          info: '格式不满足1970/01/01 00:00'
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
    showInfo: function(str, time) {
      require('jquery');
      var $body = $('body');
      var $alert = $('.alert-box');
      var $info = $('.alert-box .info');
      var hide = function() {
        $alert.css({ top: '-55px' });
        if(tid) clearTimeout(tid);
      };
      time = time || 3000;
      $info.text(str);
      $alert.css({ top: '70px' });
      $body.on('click', '.alert-box .close', hide);
      var tid = setTimeout(hide, time);
    },
    getModel: function(url, type, callback) {
      require('jquery');
      var $body = $('body');
      var $cover = $('.cover');
      $.get('/model/' + url, {}, function(data) {
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
          if(typeof callback === 'function') callback();
        }
      });
    }
  }
});