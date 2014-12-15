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
});