define(function(require, exports, module) {
  'use strict';
  var $ = require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  var globalData = {};
  var actionList = {
    prev: function(e) {
      var date = globalData.date;
      date.setMonth(date.getMonth() - 1);
      _generateCalendar();
    },
    today: function(e) {
      globalData.date = new Date();
      _generateCalendar();
    },
    next: function(e) {
      var date = globalData.date;
      date.setMonth(date.getMonth() + 1);
      _generateCalendar();
    },
    dropdown: function(e) {
      var selector = $(this).attr('data-dropdown');
      $(this).toggleClass('checked');
      $('.month-selector').toggle();
      _initMonthSelector();
    },
    prevYear: function(e) {
      globalData.monthSelector.curYear--;
      _showMonthSelector();
    },
    nextYear: function(e) {
      globalData.monthSelector.curYear++;
      _showMonthSelector();
    },
    selectMonth: function(e) {
      var month = parseInt($(this).attr('data-month'), 10);
      var year = globalData.monthSelector.curYear - 1 + parseInt($(this).parent().attr('data-offset'), 10);
      globalData.date.setMonth(month);
      globalData.date.setFullYear(year);
      _generateCalendar();
      $('.dropdown').removeClass('checked');
      $('.month-selector').hide();
    },
    addSchedule: function(e) {
      var $this = $(this);
      if($this.hasClass('effect')) {
        var time = $this.attr('data-time');
      }
      tools.getModel('add_schedule', null, {}, null, function(data) {
        if(time) {
          $('.model .date').val(tools.getDate(parseInt(time, 10)).date);
          $('.model .time').val('00:00');
        }
      });
    },
    selectNow: function(e) {
      var date = tools.getDate(new Date());
      $('.model .date').val(date.date);
      $('.model .time').val(date.time);
    },
    modifySchedule: function(e) {
      e.stopPropagation();
      var sid = $(this).parent().attr('data-sid');
      tools.getModel('modify_schedule', null, {sid: sid});
    },
    removeSchedule: function(e) {
      var sid = $(this).parent().attr('data-sid');
      if(!/[0-9a-f]{40}/.test(sid)) {
        tools.showInfo('页面错误');
        return;
      }
      $.post('/calendar/remove_schedule', {sid: sid}, function(data) {
        tools.handleData(data);
      });
    }
  }
  exports = module.exports;
  function _getTable() {
    var table = [];
    $('.calendar-table .row').each(function() {
      var row = {
        context: this,
        cols: []
      };
      $(this).find('td').each(function() {
        var col = {
          context: this,
          content: $(this).find('.content').get(0),
          num: $(this).find('.num').get(0)
        };
        row.cols.push(col);
      });
      table.push(row);
    });
    return table;
  }
  function _showCalendar(date, start, len) {
    tools.toDateFormat(date);
    var row = [false, false, false, false, false, false];
    var now = (new Date()).toDateString();
    if(start.col < 0) {
      start.col += 7;
    }
    for(var i = 0; i < len; i++) {
      var curCell = globalData.table[start.row].cols[start.col];
      if(date.toDateString() === now) {
        $(curCell.context).addClass('today');
      }
      $(curCell.context).addClass('effect').attr('data-time', date.getTime());
      curCell.num.innerText = i + 1;
      row[start.row] = true;
      _add(date, start);
    }
    row.forEach(function(val, index) {
      if(!val) {
        $(globalData.table[index].context).addClass('hide');
      } else {
        $(globalData.table[index].context).removeClass('hide');
      }
    });
    function _add(date, obj) {
      obj.col++;
      if(obj.col === 7) {
        obj.col = 0;
        obj.row++;
      }
      date.setDate(date.getDate() + 1);
    }
  }
  function _showSchedule(data) {
    var $days = $('.effect');
    data.forEach(function(schedule) {
      var time = new Date(schedule.timestamp);
      var daytime = tools.getDate(time).time;
      var html = _getTemplate(daytime, schedule.title, schedule.sid);
      $days.eq(time.getDate() - 1).find('.content').append(html);
    });
    function _getTemplate(time, title, sid) {
      return (
        '<div data-sid="{sid}" class="schedule">' +
        '<span class="time">{time}</span>' +
        '<span class="title" data-action="modifySchedule">{title}</span>' +
        '</div>'
      ).replace('{time}', time).replace('{title}', title).replace('{sid}', sid);
    }
  }
  function _getSchedule(callback) {
    var date = globalData.date;
    var start = tools.cloneDate(date);
    start.setDate(1);
    tools.toDateFormat(start);
    var end = tools.cloneDate(start);
    end.setMonth(end.getMonth() + 1);
    end.setMilliseconds(-1);
    $.post('/calendar/get_schedule', {start: start.getTime(), end: end.getTime()}, function(data) {
      if(data && data.code === 0) {
        callback(data.schedules);
      }
    });
  }
  function _generateCalendar(date) {
    globalData.date = date = date || globalData.date || (new Date());
    $('.calendar-table .num').text('');
    $('.calendar-table td').removeClass('effect');
    $('.calendar-table td').removeClass('today');
    $('.calendar-table .schedule').remove();
    $('.calendar-container .cur-month').text(date.getFullYear() + ' - ' + (date.getMonth() + 1));
    var start = tools.cloneDate(date);
    start.setDate(1);
    var startPoint = {
      row: 0,
      col: start.getDay() - 1
    }, monthLength = tools.getMonthLength(start);
    _showCalendar(tools.cloneDate(start), startPoint, monthLength);
    _getSchedule(_showSchedule);
  }
  function _initPageEvent() {
    $body.on('click', '[data-action]', function(e) {
      var action = $(this).attr('data-action');
      actionList[action] && actionList[action].call(this, e);
    });
    $body.on('click', '.effect', function(e) {
      actionList.addSchedule.call(this, e);
    });
  };
  function _showMonthSelector() {
    var selector = globalData.monthSelector;
    var $selector = $('.month-selector');
    var $dropdown = $('.dropdown');
    $selector.find('.month').removeClass('active');
    for(var i = 0; i < 2; i++) {
      var $line = $selector.find('.month-line').eq(i);
      $line.find('.year').text(selector.curYear - 1 + i);
      if(selector.curYear - 1 + i === selector.year) {
        $line.find('.month').eq(selector.month).addClass('active');
      }
    }
  }
  function _initMonthSelector() {
    var selector = globalData.monthSelector = {};
    var date = globalData.date;
    selector.curYear = selector.year = date.getFullYear();
    selector.month = date.getMonth();
    _showMonthSelector();
    // when clicking other space, hide the dropdown box
    var $dropdown = $('.dropdown');
    var $selector = $('.month-selector');
    $body.on('click', function(e) {
      if(!tools.isParentOf(e.target, [$selector.get(0), $dropdown.get(0)])) {
        $dropdown.removeClass('checked');
        $selector.hide();
      }
    });
  }
  exports.init = function() {
    globalData.table = _getTable();
    globalData.date = new Date();
    _generateCalendar();
    _initPageEvent();
  };
  function _getModelData() {
    var $model = $('.model');
    var $title = $model.find('input.title');
    var $date = $model.find('.date');
    var $time = $model.find('.time');
    var time = $date.val() + ' ' + $time.val();
    if($title.val() === '') {
      tools.showInfo('标题不能为空');
      $title.focus();
      return null;
    }
    var time = tools.checkDateFormat(time);
    if(time.code === 1) {
      tools.showInfo('时间格式不正确, 请确认时间格式符合xxxx/xx/xx及xx:xx');
      return null;
    }
    time = time.time;
    return {
      title: $title.val(),
      detail: $('.detail').val(),
      time: time.getTime()
    };
  }
  exports.addSchedule = function() {
    var data = _getModelData();
    if(!data) return;
    $.post('/calendar/add_schedule', data, function(data) {
      tools.handleData(data);
    });
  };
  exports.modifySchedule = function() {
    var data = _getModelData();
    if(!data) return;
    data.sid = $('.modify-schedule-inner').attr('data-sid');
    $.post('/calendar/modify_schedule', data, function(data) {
      tools.handleData(data);
    });
  };
});