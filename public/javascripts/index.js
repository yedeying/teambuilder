define(function(require, exports, module) {
  require('jquery');
  $body = $('body');
  $body.on('click', '.link-logout', function(e) {
    $.post('/logout', {}, function(data) {
      if(data && data.code === 6) {
        location.href = '/';
      }
    });
    return false;
  });
});