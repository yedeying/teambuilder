define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var tools = require('./tools');
  // var datepicker = require('./datepicker');
  var $body = $('body');
  $body.on('click', '.create-task-list', function(e) {
    tools.getModel('create_task_list', 'create_task_list');
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
      alert(participant);
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
      $.post('/create_task_list', {name: name, content: content, time: time, participant: participant}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.info === 0) {
            $('.model .close').trigger('click');
          }
        }
      });
    }
  };
});