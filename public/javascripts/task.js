define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  window.teambuilder = window.teambuilder || {};
  $body.on('click', '.create-task-list', function(e) {
    tools.getModel('create_task_list', 'create_task_list');
  });
  $body.on('click', '.task-title-block .edit', function(e) {
    var tid = $(this).parent().attr('data-tid');
    tools.getModel('edit_task_list', 'edit_task_list', {tid: tid});
  });
  $body.on('click', '.task-title-block .remove', function(e) {
    var that = this;
    tools.getModel('remove_task_list', 'remove_task_list', {}, undefined, function() {
      $('.model').attr('data-tid', $(that).parent().attr('data-tid'));
    });
  });
  $body.on('click', '.del-task', function(e) {
    var that = this;
    tools.getModel('remove_task', 'remove_task', {}, undefined, function() {
      $('.model').attr('data-did', $(that).parent().attr('data-did'));
    });
  });
  $body.on('click', '.edit-task', function(e) {
    var did = $(this).parent().attr('data-did');
    tools.getModel('edit_task', 'edit_task', {did: did}, undefined, function() {
      $('.model').attr('data-did', did);
    });
  });
  $body.on('click', '.view', function(e) {
    var that = this;
    var did = $(that).parent().parent().attr('data-did');
    tools.getModel('view_task', 'view_task', {did: did}, undefined, function() {
      $('.model').attr('data-did', did);
    });
  });
  $body.on('click', '.task-title-block .add', function(e) {
    var tid = $(this).parent().attr('data-tid');
    tools.getModel('add_task', 'add_task', {tid: tid});
  });
  $body.on('change', 'td.check input[type=checkbox]', function(e) {
    var that = this;
    var checked = that.checked;
    that.checked = !checked;
    if($(this).parent().hasClass('unself')) {
      tools.showInfo('不是指派给自己的任务, 无法标记其完成状态');
      return;
    }
    var did = $(this).attr('data-did');
    $.post('/task/change_status', {did: did, checked: checked}, function(data) {
      if(typeof data.code === 'number') {
        tools.showInfo(data.info);
        if(data.code === 0) {
          that.checked = checked;
          var $tr = $(that).parents('tr').eq(0);
          $tr.toggleClass('finish');
          $tr.toggleClass('unfinish');
          $('.activity-label.active').trigger('click');
        }
      }
    });
  });
  $body.on('click', '.activity-label', function(e) {
    var $this = $(this);
    tools.slideActivityTriangle(this);
    $('.activity-label').removeClass('active');
    $this.addClass('active');
    $('tr.unself').show();
    $('tr.unfinish').show();
    $('tr.finish').show();
    if(!$this.hasClass('all')) {
      $('tr.unself').hide();
    }
    if($this.hasClass('doing')) {
      $('tr.finish').hide();
    }
    if($this.hasClass('finish')) {
      $('tr.unfinish').hide();
    }
  });
  $body.on('click', '.exist-file-label .del-file', function() {
    var id = $(this).attr('data-id');
    var fid = $(this).attr('data-fid');
    var that = this;
    $.post('/task/delete_file', {id: id, fid: fid}, function(data) {
      if(typeof data.code === 'number') {
        tools.showInfo(data.info);
        if(data.code === 0) {
          $(that).parent().remove();
        }
      }
    });
  });
  module.exports = {
    createTaskList: function() {
      var $name = $('.model .name');
      var $time = $('.model .date');
      var content = $('.model .content').val();
      var name = $name.val();
      var time = $time.val();
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
      if(time !== '') time = time.getTime();
      var data = {
        name: name,
        content: content,
        time: time
      };
      data = JSON.stringify(data);
      $.post('/task/create_task_list', {data: data}, function(data) {
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
      if(time !== '') time = time.getTime();
      var data = {
        name: name,
        content: content,
        time: time,
        tid: tid
      };
      data = JSON.stringify(data);
      $.post('/task/edit_task_list', {data: data}, function(data) {
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
      var content = $('.add-task-inner .content').val();
      var fileLen = 0;
      var fileName = [];
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
            fileName.push(file.file.name);
          }
        });
      }
      var $check = $('.check:checked');
      var participant = [];
      $check.each(function(index) {
        participant.push(this.getAttribute('data-uid'));
      });
      if(participant.length === 0) {
        tools.showInfo('请至少选择一个以上的参与者');
        return;
      }
      data.append('participant', JSON.stringify(participant));
      data.append('tid', $('.add-task-inner').attr('data-tid'));
      data.append('fileLength', fileLen);
      data.append('name', name);
      data.append('content', content);
      data.append('fileName', JSON.stringify(fileName));
      var xhr = new XMLHttpRequest();
      xhr.open('post', '/task/add_task');
      xhr.send(data);
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          var data = JSON.parse(xhr.responseText);
          if(typeof data.code === 'number') {
            tools.showInfo(data.info);
          }
          if(data.code === 0) {
            setTimeout(function() {
              location.reload();
            }, 1000);
          }
        }
      };
    },
    removeTaskList: function() {
      var tid = $('.model').attr('data-tid');
      $.post('/task/remove_task_list', {tid: tid}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.reload(false);
            }, 1000);
          }
        }
      })
    },
    removeTask: function() {
      var did = $('.model').attr('data-did');
      $.post('/task/remove_task', {did: did}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.reload(false);
            }, 1000);
          }
        }
      })
    },
    editTask: function() {
      var fileList = window.teambuilder.fileList;
      var data = new FormData();
      var name = $('.name').val();
      var content = $('.edit-task-inner .content').val();
      var fileLen = 0;
      var fileName = [];
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
            fileName.push(file.file.name);
          }
        });
      }
      var $check = $('.check:checked');
      var participant = [];
      $check.each(function(index) {
        participant.push(this.getAttribute('data-uid'));
      });
      if(participant.length === 0) {
        tools.showInfo('请至少选择一个以上的参与者');
        return;
      }
      data.append('participant', JSON.stringify(participant));
      data.append('did', $('.model').attr('data-did'));
      data.append('fileLength', fileLen);
      data.append('name', name);
      data.append('content', content);
      data.append('fileName', JSON.stringify(fileName));
      var xhr = new XMLHttpRequest();
      xhr.open('post', '/task/edit_task');
      xhr.send(data);
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          var data = JSON.parse(xhr.responseText);
          if(typeof data.code === 'number') {
            tools.showInfo(data.info);
          }
          if(data.code === 0) {
            setTimeout(function() {
              location.reload();
            }, 1000);
          }
        }
      };
    }
  };
});