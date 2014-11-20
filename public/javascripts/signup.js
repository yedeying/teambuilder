define(function(require, exports, module) {
  require("jquery");
  var tools = require('./tools'),
    getFormData = tools.getFormData,
    checkMailFormat = tools.checkMailFormat,
    checkPasswordFormat = tools.checkPasswordFormat;
  var $submit = $('.submit'),
    $form = $('.form').get(0),
    $alert = $('.alert'),
    $close = $('.alert > .close'),
    $body = $('body'),
    $email = $('.email');
  function turnClass(str) {
    $submit.removeClass('register');
    $submit.removeClass('sendagain');
    $submit.removeClass('disabled');
    $submit.addClass(str);
  }
  function showInfo(code, info) {
    if(info.length < 1) return;
    if(code === 1 || code === 2) {
      $alert.html(info + '<span class="close">&times;</span>')
            .removeClass('success')
            .addClass('error')
            .slideDown('slow');
      if(code === 2) {
        $submit.val('重发');
        turnClass('sendagain');
      }
    } else if (code === 0) {
      $submit.val('邮件已发送，请前往验证');
      turnClass('disabled');
      var time = 30;
      var tid = setInterval(function() {
        $submit.val('邮件已发送，请前往验证(' + time + ')');
        time--;
        if(time <= 0) {
          $submit.val('重新发送');
          turnClass('sendagain');
          clearInterval(tid);
        }
      }, 1000);
    } else if(code === 3) {
      turnClass('disabled');
      var time = 3;
      var tid = setInterval(function() {
        $submit.val('验证成功，' + time + '秒后跳转');
        time--;
        if(time <= 0) {
          $submit.val('正在跳转');
          location.href = 'http://' + window.location.host + '/index';
          clearInterval(tid);
        }
      });
    } else if(code === 5) {
      $submit.val('登录成功');
      turnClass('disabled');
      location.href = 'http://' + window.location.host + '/index';
    } else {
      throw new Error('alert plugin error');
    }
  }
  function validateEmail(email) {
    if(!email || email.length < 1) {
      showInfo(1, '邮箱不能为空');
      $('.email').val('').focus();
      return false;
    }
    if(!checkMailFormat(email)) {
      showInfo(1, '邮箱格式错误');
      $('.email').val('').focus();
      return false;
    }
    return true;
  }
  function validatePassword(psd) {
    if(psd.length < 1) {
      showInfo(1, '密码不能为空');
      $('.password').val('').focus();
      return false;
    }
    return true;
  }
  function validate(data) {
    if(!validateEmail(data.email)) {
      return false;
    }
    if(!data.username || data.username.length < 1) {
      showInfo(1, '姓名不能为空');
      $('.username').val('').focus();
      return false;
    }
    if(data.username.length > 20) {
      showInfo(1, '姓名长度不宜多于20');
      $('.username').val('').focus();
      return false;
    }
    if(!data.password || data.password.length < 1) {
      showInfo(1, '密码不能为空');
      $('.password').val('').focus();
      return false;
    }
    if(data.password.length < 6 || data.password.length > 50) {
      showInfo(1, '密码长度宜在6~50之间');
      $('.password').val('').focus();
      return false;
    }
    if(!checkPasswordFormat(data.password)) {
      showInfo(1, '密码只能包含数字和字母');
      $('.password').val('').focus();
      return false;
    }
    return true;
  }
  $body.on('click', '.submit', function(e) {
    e.preventDefault();
    var data = getFormData($form);
    if($submit.hasClass('register')) {
      if(validate(data)) {
        var cnt = 0;
        var str = '...';
        var tid = setInterval(function() {
          cnt = (cnt + 1) % 3;
          $submit.val('邮件发送中' + str.substring(0, cnt + 1));
        }, 500);
        $.post('/signup', data, function(data) {
          clearInterval(tid);
          $submit.val('注册');
          if(typeof data.code === 'number') {
            showInfo(data.code, data.info);
          }
        });
      }
    } else if($submit.hasClass('sendagain')) {
      if(validateEmail(data.email)) {
        $.post('/sendagain', data, function(data) {
          if(typeof data.code === 'number') {
            showInfo(data.code, data.info);
          }
        });
      }
    } else if($submit.hasClass('vertify')) {
      if(validateEmail(data.email) && tools.checkTidFormat(data.tid)) {
        $.post('/vertify', data, function(data) {
          if(typeof data.code === 'number') {
            showInfo(data.code, data.info);
          }
        });
      }
    } else if($submit.hasClass('login')) {
      if(validateEmail(data.email) && validatePassword(data.password)) {
        $.post('/login', data, function(data) {
          if(typeof data.code === 'number') {
            showInfo(data.code, data.info);
          }
        })
      }
    } else if($submit.hasClass('disabled')) {
      // do nothing
    } else {
      throw new Error('submit class: no expected error');
    }
    return false;
  });
  $body.on('click', '.alert > .close', function() {
    $alert.hide();
  });
  $email.on('input propertychange', function() {
    if($submit.hasClass('sendagain')) {
      $submit.val('注册');
      turnClass('register'); 
    }
  });
});