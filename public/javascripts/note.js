define(function(require, exports, module) {
  'use strict';
  require('jquery');
  exports = module.exports;
  var tools = require('./tools');
  var $body = $('body');
  var actionList = {
    create: function(e) {
      location.href = '/note/edit';
    },
    edit: function(e) {
      var nid = $(this).parents('.note-block').attr('data-nid');
      location.href = '/note/edit/' + nid;
    },
    modify: function(e) {
      var nid = $(this).parents('.note-block').attr('data-nid');
      tools.getModel('modify_note', null, {nid: nid});
    },
    remove: function(e) {
      tools.getModel('remove_note');
    }
  };
  function _initTagNav() {
    $body.on('click', '.tag-list .line', function(e) {
      var $this = $(this);
      if($(this).hasClass('on')) {
        return;
      }
      var tag = $this.find('.tag').text();
      $('.tag-list .line').removeClass('on');
      $this.addClass('on');
      if($this.hasClass('all')) {
        $('.note-block').show();
      } else {
        $('.note-block').hide();
        $('.note-block[data-tag=' + tag + ']').show();
      }
    });
  }
  function _initPageEvent() {
    $body.on('click', '[data-action]', function(e) {
      var action = $(this).attr('data-action');
      actionList[action].call(this, e);
    });
  };
  exports.modifyNote = function() {
    var nid = $('.modify-note-inner').attr('data-nid');
    var title = $('.model .name').val();
    var description = $('.model .description').val();
    var tag = $('.model .tag').val();
    if(title === '') {
      tools.showInfo('主题不能为空');
      return;
    }
    var $check = $('.model .check:checked');
    var participant = [];
    $check.each(function(index) {
      participant.push(this.getAttribute('data-uid'));
    });
    if(participant.length === 0) {
      tools.showInfo('请至少选择一个以上的参与者');
      return;
    }
    $.post('/note/modify_note', {
      nid: nid,
      title: title,
      description: description,
      tag: tag,
      visible: JSON.stringify(participant)
    }, function(data) {
      tools.handleData(data, 7);
    });
  };
  exports.init = function() {
    _initTagNav();
    _initPageEvent();
  };
});