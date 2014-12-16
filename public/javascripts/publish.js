define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var $body = $('body');
  var tools = require('./tools');
  function turnBack($publish, txt) {
    $publish
      .removeClass('active')
      .html(txt)
      .attr('contenteditable', 'false')
      .parent()
      .find('.edit-publish')
      .removeClass('fa-check')
      .addClass('fa-edit');
  }
  $body.on('click', '.new-post', function(e) {
    var html = '<div data-pid="none" class="publish-block"><div data-origin="" data-type="publish" class="publish active" contenteditable="true"></div><i title="此次隐藏" class="fa fa-close close-publish"></i><i title="编辑" class="fa fa-check edit-publish"></i><i title="移除" class="fa fa-trash del-publish"></i></div>';
    $('.publish-container').prepend(html);
    $('.publish-block .publish').eq(0).focus();
  });
  $body.on('click', '.close-publish', function(e) {
    var $publish = $(this).parent().find('.publish');
    if($publish.attr('contenteditable') === 'true') {
      turnBack($publish, $publish.attr('data-origin'));
    } else {
      $(this).parent().remove();
      tools.showInfo('该公告已隐藏, 刷新会重新出现');
    }
  });
  $body.on('click', '.del-publish', function(e) {
    var pid = $(this).parent().attr('data-pid');
    var that = this;
    $.post('/del_publish', {pid: pid}, function(data) {
      if(typeof data.code === 'number') {
        tools.showInfo(data.info);
        if(data.code === 0) {
          $(that).parent().remove();
        }
      }
    });
  });
  $body.on('click', '.edit-publish', function(e) {
    if($(this).hasClass('fa-edit')) {
      $(this)
        .removeClass('fa-edit')
        .addClass('fa-check')
        .parent()
        .find('.publish')
        .attr('contenteditable', 'true')
        .addClass('active')
        .focus();
    } else {
      var $publish = $(this).parent().find('.publish');
      var content = $publish.text();
      var pid = $(this).parent().attr('data-pid');
      var type = $publish.attr('data-type');
      if(content === '') {
        tools.showInfo('公告不能为空');
        return;
      }
      $.post('/new_publish', {content: content, pid: pid, type: type}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            turnBack($publish, content);
          }
        }
      });
    }
  });
});