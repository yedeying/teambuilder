define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
  window.teambuilder = window.teambuilder || {};
  var tools = require('./tools');
  var index = require('./index');
  var project = require('./project');
  var people = require('./people');
  var task = require('./task');
  var note = require('./note');
  var comment = require('./comment');
  var commentDetail = require('./commentDetail');
  var file = require('./file');
  var $body = $('body');
  var $cover = $('.cover');
  var startX = 0;
  var startY = 0;
  var left = 0;
  var top = 0;
  var href = undefined;
  var mouseStatus = false;
  $body.on('click', '.link-logout', function(e) {
    $.post('/logout', {}, function(data) {
      if(data && data.code === 6) {
        location.href = '/';
      }
    });
    return false;
  });
  $body.on('click', '.link-switch', function(e) {
    tools.getModel('switch_project', 'switch_project', function(data) {
      if(typeof data.code === 'number' && data.code === 1) {
        tools.showInfo(data.info);
      }
    });
    return false;
  });
  ['project', 'task', 'comment'].forEach(function(type) {
    $body.on('click', '.link-' + type, function(e) {
      $.post('/get_project_status', function(data) {
        if(typeof data.code === 'number') {
          if(data.code === 1) {
            tools.showInfo(data.info);
          } else if(data.code === 0) {
            location.href = '/' + type;
          } else {
            href = '/' + type;
            tools.getModel('switch_project', 'switch_project_beta', function(data) {
              if(typeof data.code === 'number' && data.code === 1) {
                tools.showInfo(data.info);
              }
            });
          }
        }
      });
      return false;
    });
  });
  $body.on('mousedown', function(e) {
    mouseStatus = true;
  });
  $body.on('mouseup', function(e) {
    mouseStatus = false;
  });
  $body.on('mousedown', '.model-wrapper .title-block', function(e) {
    startX = e.pageX;
    startY = e.pageY;
    var $wrapper = $('.model-wrapper');
    left = parseInt($wrapper.css('left').split('px')[0], 10);
    top = parseInt($wrapper.css('top').split('px')[0], 10);
  });
  $body.on('mousemove', '.model-wrapper .title-block', function(e) {
    if(mouseStatus) {
      var x = e.pageX - startX;
      var y = e.pageY - startY;
      var $wrapper = $('.model-wrapper');
      $wrapper.css({
        left: (left + x) + 'px',
        top: (top + y) + 'px'
      });
    }
  });
  $body.on('keypress', '.model' ,function(e) {
    if(e.which === 13) {
      $('.model .confirm').trigger('click');
    }
  });
  $body.on('click', '.model .close, .cover, .model .cancel', function(e) {
    window.teambuilder.fileList = [];
    $('.model').remove();
    $cover.css({
      visibility: 'hidden'
    });
  });
  $body.on('click', 'a', function(e) {
    var url = $(this).attr('href');
    if(/^\/project\?pid\=[0-9a-f]{40}$/.test(url)) {
      var pid = url.split('=')[1];
      $.post('/switch_project', {pid: pid}, function(data) {
        if(typeof data.code === 'number') {
          if(data.code === 0) {
            location.href = '/project';
          } else {
            tools.showInfo(data.info);
          }
        }
      });
      return false;
    }
  });
  $body.on('click', '.model .confirm', function(e) {
    var $model = $('.model');
    var type = $model.data('type');
    var actionList = {
      'add_project': index.addProject,
      'edit_project': project.editProject,
      'remove_project': project.removeProject,
      'add_people': people.addPeople,
      'remove_people': people.removePeople,
      'switch_project': switchProject,
      'exit_group': people.exitGroup,
      'remove_group': people.removeGroup,
      'edit_profile': people.editProfile,
      'create_task_list': task.createTaskList,
      'edit_task_list': task.editTaskList,
      'add_task': task.addTask,
      'remove_task_list': task.removeTaskList,
      'remove_task': task.removeTask,
      'edit_task': task.editTask,
      'add_comment_list': comment.addCommentList,
      'edit_comment_list': commentDetail.editCommentList,
      'del_comment_list': commentDetail.delCommentList,
      'add_file': file.addFile,
      'delete_file': file.deleteFile,
      'move_file': file.moveFile,
      'manage_folder': file.manageFolder,
      'modify_note': note.modifyNote,
      'delete_note': note.deleteNote
    };
    if(actionList.hasOwnProperty(type)) {
      actionList[type]();
    } else if(type === 'switch_project_beta') {
      switchProject(true);
    }
  });
  /*
   * file block
   */
  var fileList = [];
  window.teambuilder.fileList = fileList;
  function appendFile(file) {
    var html = '<span data-no="' + fileList.length + '" class="file-label"><span>' + file.name + '</span><span class="close-label">×</span></span>';
    $('.file-label-box').append(html);
  }
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
  function switchProject(option) {
    var $project = $('.radio-box input[type="radio"]:checked');
    var pid = $project.attr('data-pid');
    $.post('/switch_project', {pid: pid}, function(data) {
      if(typeof data.code === 'number') {
        if(data.code === 0) {
          if(option) {
            location.href = href;
          } else {
            if(location.href.indexOf('task') !== -1) {
              location.href = '/task';
            } else if(location.href.indexOf('comment') !== -1) {
              location.href = '/comment';
            } else {
              location.reload();
            }
          }
        } else {
          tools.showInfo(data.info);
        }
      }
    });
  }
});