define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
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
  $body.on('click', '.remove-group', function(e) {
    tools.getModel('remove_group', 'remove_group');
  });
  $body.on('click', '.edit-profile', function(e) {
    var uid = $(this).parent().attr('data-uid');
    tools.getModel('edit_profile', 'edit_profile', {uid: uid});
  });
  function validateProfileData(data) {
    if(data.name === '') {
      tools.showInfo('姓名不能为空');
      $('.edit-profile-inner .name').focus();
      return false;
    } else if(data.name.length > 20) {
      tools.showInfo('姓名长度不宜多于20');
      $('.edit-profile-inner .name').focus();
    } else if(!/1|2|0/.test(data.gender)) {
      tools.showInfo('性别格式错误');
      $('.edit-profile-inner .gender').focus();
      return false;
    } else if(data.contact && data.contact.length !== 0 && !/[0-9]{5,11}/.test(data.contact)) {
      tools.showInfo('联系方式不合理');
      $('.edit-profile-inner .contact').focus();
      return false;
    } else if(!/0|[0-9a-f]{40}/.test(data.class.toString())) {
      tools.showInfo('班级格式错误');
      $('.edit-profile-inner .class').focus();
      return false;
    } else if(typeof data.oripass === 'string' && data.oripass !== '' || typeof data.newpass === 'string' && data.newpass !== '' || typeof data.conpass === 'string' && data.conpass !== '') {
      if(typeof data.oripass !== 'string' || data.oripass === '') {
        tools.showInfo('原密码不能为空');
        $('.edit-profile-inner .oripass').focus();
        return false;
      }
      if(typeof data.newpass !== 'string' || data.newpass === '') {
        tools.showInfo('新密码不能为空');
        $('.edit-profile-inner .newpass').focus();
        return false;
      }
      if(typeof data.conpass !== 'string' || data.conpass === '') {
        tools.showInfo('请确认密码');
        $('.edit-profile-inner .conpass').focus();
        return false;
      }
      if(data.newpass !== data.conpass) {
        tools.showInfo('密码不一致');
        $('.edit-profile-inner .conpass').val('');
        $('.edit-profile-inner .newpass').val('').focus();
        return false;
      }
    }
    return true;
  }
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
    },
    removePeople: function() {
      var $checkbox = $('.model input[type="checkbox"]:checked');
      var uid = [];
      $checkbox.each(function(index, element) {
        uid.push(element.getAttribute('data-uid'));
      });
      if(uid.length === 0) {
        tools.showInfo('你还没有选择任何人');
        return;
      }
      uid = JSON.stringify(uid);
      $.post('/remove_people', {uid: uid}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.reload(true);
            }, 1000);
          }
        }
      });
    },
    exitGroup: function() {
      $.post('/exit_group', {}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.href = "/";
            }, 1000);
          }
        }
      });
    },
    removeGroup: function() {
      $.post('/remove_group', {}, function(data) {
        if(typeof data.code === 'number') {
          tools.showInfo(data.info);
          if(data.code === 0) {
            setTimeout(function() {
              location.href = '/joingroup';
            }, 1000);
          }
        }
      });
    },
    editProfile: function() {
      var $form = $('.edit-profile-inner form');
      var data = tools.getFormData($form.get(0));
      if(data.contact === undefined) data.contact = '';
      if(validateProfileData(data)) {
        data.uid = $form.attr('data-uid');
        $.post('/edit_profile', data, function(data) {
          if(typeof data.code === 'number') {
            tools.showInfo(data.info);
            if(data.code === 0) {
              setTimeout(function() {
                location.reload();
              }, 1000);
            }
          }
        });
      }
    }
  };
});