define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  $body.on('click', '.add-to-project', function(e) {
    tools.getModel('add_to_project', 'add_to_project');
  });
  $body.on('click', '.edit-project', function(e) {
    tools.getModel('edit_project', 'edit_project');
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
            location.reload(true);
          }
        }
      });
    }
  };
});