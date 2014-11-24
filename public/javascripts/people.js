define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  $body.on('click', '.add-people', function(e) {
    tools.getModel('add_people', 'add_people', function() {
      $('.model .email').focus();
    });
  });
  $body.on('click', '.remove-people', function(e) {
    tools.getModel('remove_people', 'remove_people');
  });
  $body.on('click', '.exit-group', function(e) {
    tools.getModel('exit_group', 'exit_group');
  });
  $body.on('click', '.edit-profile', function(e) {
    return false;
  });
  module.exports = {
    addPeople: function() {
      var $email = $('.add-people-inner .email');
      var email = $email.val();
      if(email === '') {
        tools.showInfo('邮箱名不能为空');
        $email.focus();
        return;
      }
      if(!tools.checkMailFormat(email)) {
        tools.showInfo('邮箱名格式错误');
        $email.focus();
        return; 
      }
      $.post('/add_people', {email: email}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            $('.model .close').trigger('click');
          } else if(data.code === 2) {
            $('.model .email').val('').focus();
          }
        }
      });
    }
  };
});