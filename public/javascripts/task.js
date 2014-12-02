define(function(require, exports, module) {
  "use strict";
  require('jquery');
  var tools = require('./tools');
  var datepicker = require('./datepicker');
  var $body = $('body');
  $body.on('click', '.create-task-list', function(e) {
    tools.getModel('create_task_list', 'create_task_list');
  });
  $body.on('click', '.model .date', function(e) {
    datepicker.create(this);
  });
  module.exports = {
  };
});