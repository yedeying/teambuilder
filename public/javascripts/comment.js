define(function(require, exports, module) {
  'use strict';
  var $ = require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  $body.on('click', '.add-comment-list', function(e) {
    tools.getModel('add_comment_list', 'add_comment_list');
  });
  module.exports = {
    addCommentList: function() {
      var $title = $('.model .name');
      var $description = $('.model .description');
      if($title.val() === '') {
        tools.showInfo('讨论主题不能为空');
        $title.focus();
        return;
      }
      var data = {
        title: $title.val(),
        description: $description.val()
      };
      $.post('/comment/add_comment_list', data, function(data) {
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