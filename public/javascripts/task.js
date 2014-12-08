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
    var tid = $(this).parent().attr('data-tid');
    tools.getModel('edit_task_list', 'edit_task_list', {tid: tid});
  });
  $body.on('click', '.add', function(e) {
    function appendFile(file) {
      var html = '<span data-no="' + fileList.length + '" class="file-label"><span>' + file.name + '</span><span class="close-label">×</span></span>';
      $('.file-label-box').append(html);
    }
    var tid = $(this).parent().attr('data-tid');
    var fileList = [];
    window.teambuilder.fileList = fileList;
    tools.getModel('add_task', 'add_task', {tid: tid});
    $body.on('click', '.file-label .close-label', function() {
      var no = parseInt($(this).parent().attr('data-no'), 10);
      $(this).parent().remove();
    });
    $body.on('change', '.model #file', function(e) {
      var files = $('.model #file').get(0).files;
      if(files.length > 0) {
        var file = files.item(0);
        if(file.size > 5 * 1024 * 1024) {
          tools.showInfo('文件大小超过5MB, 拒绝上传');
          return;
        }
        var bl = false;
        for(var i = 0; i < fileList.length; i++) {
          var tmpFile = fileList[i];
          if(tmpFile.name === file.name) {
            bl = true;
          }
        }
        if(bl === true) {
          tools.showInfo('不能上传同名文件');
          return;
        }
        fileList.push({
          file: file,
          upload: true
        });
        appendFile(file);
      }
    });
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
    },
    addTask: function() {
      var fileList = window.teambuilder.fileList;
      var data = new FormData();
      var name = $('.name').val();
      var content = $('.content').val();
      var fileLen = 0;
      if(name === '') {
        tools.showInfo('任务名称不能为空');
        $('.name').focus();
        return;
      }
      if(fileList && fileList.length !== 0) {
        fileList.forEach(function(file, index) {
          if(file.upload) {
            fileLen++;
            data.append('file' + index, file.file);
          }
        });
      }
      data.append('fileLength', fileLen);
      data.append('name', name);
      data.append('content', content);
      var xhr = new XMLHttpRequest();
      xhr.open('post', '/add_task');
      xhr.send(data);
    }
  };
});