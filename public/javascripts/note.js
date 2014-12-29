define(function(require, exports, module) {
  'use strict';
  require('jquery');
  exports = module.exports;
  var tools = require('./tools');
  var $body = $('body');
  var globalData = {};
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
      var nid = $(this).parents('.note-block').attr('data-nid');
      tools.getModel('delete_note', null, {nid: nid});
    },
    back: function(e) {
      history.go(-1);
    },
    save: function(e) {
      var html = $('#editor').html();
      console.log(html);
    },
    clear: function(e) {
      $('#editor').html('').focus();
    },
    increaseFontSize: function(e) {
      var fontSize = parseInt(document.queryCommandValue('fontsize'));
      document.execCommand('fontsize', 0, (fontSize + 1).toString());
    },
    decreaseFontSize: function(e) {
      var fontSize = parseInt(document.queryCommandValue('fontsize'));
      document.execCommand('fontsize', 0, (fontSize - 1).toString());
    },
    insertLink: function(e) {
      var url = $('.url').val();
      if(url === '') {
        tools.showInfo('请输入url');
        $('url').focus();
        return;
      }
      document.execCommand('createlink', 0, url);
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
        $('.note-block[data-tag="' + tag + '"]').show();
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
  exports.deleteNote = function() {
    var nid = $('.delete-note-inner').attr('data-nid');
    $.post('/note/delete_note', {nid: nid}, function(data) {
      tools.handleData(data, 7);
    });
  };
  exports.init = function() {
    _initTagNav();
    _initPageEvent();
  };
  exports.initEdit = function() {
    _initPageEvent();
    require('hotkeys');
    require('editor');
    $('#editor').initEditor();
    document.execCommand('justifyleft');
  };
});