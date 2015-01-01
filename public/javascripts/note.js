define(function(require, exports, module) {
  'use strict';
  var $ = require('jquery');
  exports = module.exports;
  var tools = require('./tools');
  var $body = $('body');
  var globalData = {};
  var actionList = {
    selectTag: function(e) {
      var $this = $(this);
      if($(this).hasClass('on')) {
        return;
      }
      var tag = $this.find('.tag').attr('data-tag');
      $('.tag-list .line').removeClass('on');
      $this.addClass('on');
      if($this.hasClass('all')) {
        $('.note-block').show();
      } else {
        $('.note-block').hide();
        $('.note-block[data-tag="' + tag + '"]').show();
      }
    },
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
      var title = $('.input-block .title').val();
      var description = $('.input-block .description').val();
      var tag = $(".input-block .tag").val();
      var html = $('#editor').html();
      var nid = $('#editor').attr('data-nid');
      if(title === '') {
        tools.showInfo('标题不能为空');
        return;
      }
      var $check = $('.visible-block .check:checked');
      var participant = [];
      $check.each(function(index) {
        participant.push(this.getAttribute('data-uid'));
      });
      if(participant.length === 0) {
        tools.showInfo('请至少选择一个以上的参与者');
        return;
      }
      $.post('/note/save_note', {html: html, title: title, description: description, tag: tag, participant: JSON.stringify(participant), nid: nid}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            location.href = '/note/show/' + data.nid;
          }
        }
      });
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
    },
    show: function(e) {
      location.href = '/note/show/' + $(this).parents('.note-block').attr('data-nid');
    },
    link: function(e) {
      location.href = $(this).attr('href');
    }
  };
  function _initPageEvent() {
    $body.on('click', '[data-action]', function(e) {
      var action = $(this).attr('data-action');
      actionList[action] && actionList[action].call(this, e);
    });
  };
  function _loadContent() {
    var nid = $('#editor').attr('data-nid');
    if(!/[0-9a-f]{40}/.test(nid)) {
      return;
    }
    $.get('/note/edit/get_content', {nid: nid}, function(data) {
      if(typeof data.code === 'number') {
        if(data.code === 0) {
          $('#editor').html(data.html);
        }
      }
    });
  }
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
    _initPageEvent();
  };
  exports.initEdit = function() {
    require('hotkeys');
    require('editor');
    $('#editor').initEditor();
    _initPageEvent();
    _loadContent();
    document.execCommand('justifyleft');
  };
  exports.initShow = function() {
    _initPageEvent();
  };
});