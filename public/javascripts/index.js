define(function(require, exports, module) {
  "use strict";
  require('jquery');
  require('./publish');
  var tools = require('./tools');
  var $body = $('body');
  $body.on('click', '.add-project', function(e) {
    tools.getModel('add_project', 'add_project');
  });
  module.exports = {
    addProject: function() {
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
      $.post('/add_project', data, function(data) {
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