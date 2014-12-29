define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  $body.on('click', '.edit-project', function(e) {
    tools.getModel('edit_project', 'edit_project');
  });
  $body.on('click', '.remove-project', function(e) {
    tools.getModel('remove_project', 'remove_project');
  });
  module.exports = {
    editProject: function() {
      var $title = $('.model #title');
      var $description = $('.model #description');
      if($title.val().replace(' ', '').length === 0) {
        tools.showInfo('项目名称不能为空');
        $title.focus();
        return;
      }
      var data = {
        title: $title.val(),
        description: $description.val()
      };
      $.post('/edit_project', data, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function(){
              location.reload(true);
            }, 1000);
          }
        }
      });
    },
    removeProject: function() {
      $.post('/remove_project', {}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.href = "/";
            }, 1000);
          }
        }
      })
    }
  };
});