define(function(require, exports, module) {
  'use strict';
  require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  $body.on('click', '.folder-list .line', function(e) {
    if($(this).hasClass('on')) {
      return;
    }
    var fid = $(this).attr('data-fid');
    $.post('/file/change_folder', {fid: fid}, function(data) {
      if(typeof data.code === 'number') {
        if(data.code === 0) {
          location.reload(true);
        } else {
          tools.showInfo(data.info);
        }
      }
    });
  });
  $body.on('click', '.file-download', function(e) {
    var $block = $(this).parent();
    var fid = $block.attr('data-fid');
    var gid = $block.attr('data-gid');
    var a = document.createElement('a');
    a.href = '/download/group?fid=' + fid + '&id=' + gid;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
  $body.on('click', '.add-file', function(e) {
    tools.getModel('add_file', 'add_file');
  });
  $body.on('click', '.file-move', function(e) {
    var $block = $(this).parent();
    var folder = $('.file-list').attr('data-fid');
    var fid = $block.attr('data-fid');
    var gid = $block.attr('data-gid');
    tools.getModel('move_file', 'move_file', {fid: folder}, undefined, function() {
      $('.model').attr('data-fid', fid);
      $('.model').attr('data-gid', gid);
    });
  });
  $body.on('click', '.manage-folder', function(e) {
    tools.getModel('manage_folder', 'manage_folder');
  });
  $body.on('click', '.file-delete', function(e) {
    var $block = $(this).parent();
    var fid = $block.attr('data-fid');
    var gid = $block.attr('data-gid');
    tools.getModel('delete_file', 'delete_file', {}, undefined, function() {
      $('.model').attr('data-fid', fid);
      $('.model').attr('data-gid', gid);
    });
  });
  $body.on('click', '.model .folder-remove', function(e) {
    $(this).parent().attr('data-hide', 'true');
    $(this).parent().hide();
  });
  $body.on('click', '.model .folder-create', function(e) {
    var $text = $('.model .add-folder');
    var $btn = $(this).parent();
    var folderName = $text.val();
    if(folderName === '') {
      tools.showInfo('文件夹名称不能为空');
      $text.focus();
      return;
    }
    var html = '<div class="folder-block" data-hide="false" data-type="new"><span class="folder-name">' + folderName + '</span><span class="folder-size">(0)</span><button class="folder-remove"><i class="fa fa-close"></i><span>&nbsp;删除文件夹</span></button></div>';
    $(html).insertBefore($btn);
    $text.val('');
  });
  module.exports = {
    deleteFile: function() {
      var fid = $('.model').attr('data-fid');
      var gid = $('.model').attr('data-gid');
      $.post('/file/delete_file', {fid: fid, gid: gid}, function(data) {
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
    addFile: function() {
      var fileList = window.teambuilder.fileList;
      if(!fileList || fileList.length === 0) {
        tools.showInfo('请选择文件');
        return;
      }
      var data = new FormData();
      var fid = $('.file-list').attr('data-fid');
      var fileLen = 0;
      var fileName = [];
      if(fileList && fileList.length !== 0) {
        fileList.forEach(function(file, index) {
          if(file.upload) {
            fileLen++;
            data.append('file' + index, file.file);
            fileName.push(file.file.name);
          }
        });
      }
      data.append('fid', fid);
      data.append('fileLength', fileLen);
      data.append('fileName', JSON.stringify(fileName));
      var xhr = new XMLHttpRequest();
      xhr.open('post', '/file/add_file');
      xhr.send(data);
      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          var data = JSON.parse(xhr.responseText);
          if(typeof data.code === 'number') {
            tools.showInfo(data.info);
          }
          if(data.code === 0) {
            setTimeout(function() {
              location.reload(true);
            }, 1000);
          }
        }
      };
    },
    moveFile: function() {
      var folder = $('.model input[type=radio]:checked').val();
      var fid = $('.model').attr('data-fid');
      $.post('/file/move_file', {folder: folder, fid: fid}, function(data) {
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
    manageFolder: function() {
      var deleteList = [];
      var createList = [];
      $('.model .folder-block[data-type=origin][data-hide=true]').each(function() {
        deleteList.push($(this).attr('data-fid'));
      });
      $('.model .folder-block[data-type=new][data-hide=false]').each(function() {
        createList.push($(this).find('.folder-name').text());
      });
      if(deleteList.length === 0 && createList.length === 0) {
        tools.showInfo('修改成功');
        setTimeout(function() {
          location.reload(true);
        }, 1000);
        return;
      }
      $.post('/file/manage_folder', {deleteList: JSON.stringify(deleteList), createList: JSON.stringify(createList)}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          data.code === 0 && setTimeout(function() {
            location.reload(true);
          }, 1000);
        }
      });
    }
  };
});