define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var tools = require('./tools');
  // var datepicker = require('./datepicker');
  var $body = $('body');
  $body.on('click', '.create-task-list', function(e) {
    tools.getModel('create_task_list', 'create_task_list');
  });
  $body.on('click', '.edit', function(e) {
    var tid = this.parent().attr('tid');
    tools.getModel('edit_task_list', 'edit_task_list', {tid: tid});
  });
  $body.on('click', '.add', function(e) {
    var tid = $(this).parent().attr('data-tid');
    tools.getModel('add_task', 'add_task', {tid: tid});
  });
  $body.on('click', '.activity-label', function(e) {
    tools.slideActivityTriangle(this);
  });
  // $body.on('click', '.model .date', function(e) {
    // datepicker.create(this);
    // give up to use datepicker, for the busy time
  // });
  module.exports = {
    createTaskList: function() {
      var $name = $('.model .name');
      var $time = $('.model .date');
      var content = $('.model .content').val();
      var name = $name.val();
      var time = $time.val();
      var $check = $('.check:checked');
      var participant = [];
      $check.each(function(index) {
        participant.push(this.getAttribute('data-uid'));
      });
      if(name === '') {
        tools.showInfo('列表名不能为空');
        $name.focus();
        return;
      }
      if(time !== '') {
        var res = tools.checkDateFormat(time);
        if(res.code !== 0) {
          tools.showInfo(res.info);
          return;
        } else {
          time = res.time;
        }
      }
      if(participant.length === 0) {
        tools.showInfo('请至少选择一个以上的参与者');
        return;
      }
      if(time !== '') time = time.getTime();
      var data = {
        name: name,
        content: content,
        time: time,
        participant: participant
      };
      data = JSON.stringify(data);
      $.post('/create_task_list', {data: data}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.reload(true);
            }, 1000);
          }
        }
      });
    },
    editTaskList: function() {
      var $name = $('.model .name');
      var $time = $('.model .date');
      var content = $('.model .content').val();
      var name = $name.val();
      var time = $time.val();
      var tid = $('.create-task-list-inner').attr('data-tid');
      var $check = $('.check:checked');
      var participant = [];
      $check.each(function(index) {
        participant.push(this.getAttribute('data-uid'));
      });
      if(name === '') {
        tools.showInfo('列表名不能为空');
        $name.focus();
        return;
      }
      if(time !== '') {
        var res = tools.checkDateFormat(time);
        if(res.code !== 0) {
          tools.showInfo(res.info);
          return;
        } else {
          time = res.time;
        }
      }
      if(participant.length === 0) {
        tools.showInfo('请至少选择一个以上的参与者');
        return;
      }
      if(time !== '') time = time.getTime();
      var data = {
        name: name,
        content: content,
        time: time,
        participant: participant,
        tid: tid
      };
      data = JSON.stringify(data);
      $.post('/edit_task_list', {data: data}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.reload(true);
            }, 1000);
          }
        }
      });
    }
  };
});