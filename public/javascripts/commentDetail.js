define(function(require, exports, module) {
  'use strict';
  require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  var $reply = $('.reply-area');
  var cid = $('.comment-content').attr('data-cid');
  $body.on('click', '.reply-comment', function(e) {
    location.href = '#reply';
  });
  $body.on('keydown', '.reply-area', function(e) {
    if(e.ctrlKey && e.which === 13) {
      $('.reply').trigger('click');
    }
  });
  $body.on('click', '.edit-comment-list', function(e) {
    tools.getModel('edit_comment_list', 'edit_comment_list', {cid: cid});
  });
  $body.on('click', '.del-comment-list', function(e) {
    tools.getModel('del_comment_list', 'del_comment_list');
  });
  $body.on('click', '.reply', function(e) {
    var reply = $reply.val();
    if(reply === '') {
      tools.showInfo('你还没填东西呢');
      return;
    }
    $.post('/comment/reply', {reply: reply, cid: cid}, function(data) {
      if(typeof data.code === 'number') {
        tools.showInfo(data.info);
        if(data.code === 0) {
          setTimeout(function() {
            location.reload(true);
          }, 1000);
        }
      }
    });
  });
  module.exports = {
    editCommentList: function() {
      var $title = $('.model .name');
      var $description = $('.model .description');
      if($title.val() === '') {
        tools.showInfo('讨论主题不能为空');
        $title.focus();
        return;
      }
      var data = {
        title: $title.val(),
        description: $description.val(),
        cid: cid
      };
      $.post('/edit_comment_list', data, function(data) {
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
    delCommentList: function() {
      $.post('/del_comment_list', {cid: cid}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.href = '/comment';
            }, 1000);
          }
        }
      });
    }
  };
});