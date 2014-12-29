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
  function _generateCalendar(date) {
    globalData.date = date = date || globalData.date || (new Date());
    $('.calendar-table .num').text('');
    $('.calendar-table td').removeClass('effect');
    $('.calendar-table td').removeClass('today');
    $('.calendar-container .cur-month').text(date.getFullYear() + ' - ' + (date.getMonth() + 1));
    var start = tools.cloneDate(date);
    start.setDate(1);
    var startPoint = {
      row: 0,
      col: start.getDay() - 1
    }, monthLength = tools.getMonthLength(start);
    _showCalendar(tools.cloneDate(start), startPoint, monthLength);
  }
  function _initPageEvent() {
    $body.on('click', '[data-action]', function(e) {
      var action = $(this).attr('data-action');
      actionList[action].call(this, e);
    });
  };
  function _showMonthSelector() {
    var selector = globalData.monthSelector;
    $('.month-selector .month').removeClass('active');
    for(var i = 0; i < 2; i++) {
      var $line = $('.month-selector .month-line').eq(i);
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
  }
  exports.init = function() {
    globalData.table = _getTable();
    globalData.date = new Date();
    _generateCalendar();
    _initPageEvent();
  }
});