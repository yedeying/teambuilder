define(function(require, exports, module) {
  require('jquery');
  var $body = $('body');
  var $cover = $('.cover');
  var startX = 0;
  var startY = 0;
  var left = 0;
  var top = 0;
  $body.on('click', '.link-logout', function(e) {
    $.post('/logout', {}, function(data) {
      if(data && data.code === 6) {
        location.href = '/';
      }
    });
    return false;
  });
  $body.on('click', '.add-project', function(e) {
    $.get('/model/add_project', {}, function(data) {
      if(data && data.code === 0) {
        $body.append(data.html);
        var $model = $('.model');
        var width = $body.width();
        $cover.css({
          visibility: 'visible'
        });
        $model.css({
          top: ($body.scrollTop() + 60) + 'px'
        });
        
      }
    });
  });
  $body.on('mousedown', '.model-wrapper .title-block', function(e) {
    console.log('in');
    startX = e.pageX;
    startY = e.pageY;
    var $wrapper = $('.model-wrapper');
    left = parseInt($wrapper.css('left').split('px')[0], 10);
    top = parseInt($wrapper.css('top').split('px')[0], 10);
  });
  $body.on('mousemove', '.model-wrapper .title-block', function(e) {
    if(e.which === 1) {
      var x = e.pageX - startX;
      var y = e.pageY - startY;
      var $wrapper = $('.model-wrapper');
      $wrapper.css({
        left: (left + x) + 'px',
        top: (top + y) + 'px'
      });
    }
  })
  $body.on('click', '.model .close, .cover, .model .cancel', function(e) {
    $('.model').remove();
    $cover.css({
      visibility: 'hidden'
    });
  });
});