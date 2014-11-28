define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var tools = require('./tools');
  var index = require('./index');
  var project = require('./project');
  var people = require('./people');
  var $body = $('body');
  var $cover = $('.cover');
  var startX = 0;
  var startY = 0;
  var left = 0;
  var top = 0;
  var href = undefined;
  $body.on('click', '.link-logout', function(e) {
    $.post('/logout', {}, function(data) {
      if(data && data.code === 6) {
        location.href = '/';
      }
    });
    return false;
  });
  $body.on('click', '.link-switch', function(e) {
    tools.getModel('switch_project', 'switch_project', function(data) {
      if(typeof data.code === 'number' && data.code === 1) {
        tools.showInfo(data.info);
      }
    });
    return false;
  });
  $body.on('click', '.link-project', function(e) {
    $.post('/get_project_status', function(data) {
      if(typeof data.code === 'number') {
        if(data.code === 1) {
          tools.showInfo(data.info);
        } else if(data.code === 0) {
          location.href = '/project';
        } else {
          href = '/project';
          tools.getModel('switch_project', 'switch_project_beta', function(data) {
            if(typeof data.code === 'number' && data.code === 1) {
              tools.showInfo(data.info);
            }
          });
        }
      }
    });
    return false;
  });
  $body.on('mousedown', '.model-wrapper .title-block', function(e) {
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
  $body.on('click', 'a', function(e) {
    var url = $(this).attr('href');
    if(/^\/project\?pid\=[0-9a-f]{40}$/.test(url)) {
      var pid = url.split('=')[1];
      $.post('/switch_project', {pid: pid}, function(data) {
        if(typeof data.code === 'number') {
          if(data.code === 0) {
            location.href = '/project';
          } else {
            tools.showInfo(data.info);
          }
        }
      });
      return false;
    }
  });
  $body.on('click', '.model .confirm', function(e) {
    var $model = $('.model');
    var type = $model.data('type');
    if(type === 'add_project') {
      index.addProject();
    } else if(type === 'edit_project') {
      project.editProject();
    } else if(type === 'remove_project') {
      project.removeProject();
    } else if(type === 'add_people') {
      people.addPeople();
    } else if(type === 'remove_people') {
      people.removePeople();
    } else if(type === 'exit_group') {
      people.exitGroup();
    } else if(type === 'remove_group') {
      people.removeGroup();
    } else if(type === 'switch_project') {
      switchProject();
    } else if(type === 'switch_project_beta') {
      switchProject(true);
    } else if(type === 'edit_profile') {
      people.editProfile();
    }
  });
  function switchProject(option) {
    var $project = $('.radio-box input[type="radio"]:checked');
    var pid = $project.attr('data-pid');
    $.post('/switch_project', {pid: pid}, function(data) {
      if(typeof data.code === 'number') {
        if(data.code === 0) {
          if(option) {
            location.href = href;
          } else {
            location.reload();
          }
        } else {
          tools.showInfo(data.info);
        }
      }
    });
  }
});