define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
  var tools = require('./tools');
  var $body = $('body');
  var $alert = $('.alert');
  function showInfo(info) {
    $alert.html(info + '<span class="close">&times;</span>')
          .removeClass('success')
          .addClass('error')
          .slideDown('slow');
  }
  $body.on('click', '.alert > .close', function() {
    $alert.hide();
  });
  $body.on('click', '.joingroup', function(e) {
    var groupName = $('.groupname').val();
    if(groupName === '') {
      showInfo('小组名不能为空');
    } else {
      $.post('/joingroup', {groupName: groupName}, function(data) {
        if(typeof data.code === 'number') {
          if(data.code !== 0) {
            showInfo(data.info);
          } else {
            location.href = '/';
          }
        }
      });
    }
    return false;
  });
});