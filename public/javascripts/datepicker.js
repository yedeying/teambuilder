define(function(require, exports, module) {
  "use strict";
  var $ = require('jquery');
  module.exports = {
    width: 226,
    height: 226,
    carelHeight: 11,
    create: function(ele) {
      this.generateBlock(ele);
    },
    getPos: function(ele, type) {
      var pos = 0;
      type = type.charAt(0).toUpperCase() + type.substring(1);
      while(ele.offsetParent !== null) {
        pos += ele['offset' + type];
        ele = ele.offsetParent;
      }
      return pos;
    },
    generateBlock: function(ele) {
      var x = ele.offsetWidth / 2 + this.getPos(ele, 'left');
      var y = this.getPos(ele, 'top') + ele.offsetHeight + this.carelHeight;
      var html = 
      '<div class="datepicker" style="left: ' + (x - this.width / 2) + 'px; top: ' + y + 'px">' +
        '<span class="black"></span>' +
        '<span class="white"></span>' +
        '<div class="title">' +
          '<span class="title-text">December 2014</span>' +
          '<span class="left fa fa-arrow-circle-left"></span>' +
          '<span class="right fa fa-arrow-circle-right"></span>' +
          '<div class="head">' +
            '<table>' +
              '<tr>' +
                '<td>日</td>' +
                '<td>一</td>' +
                '<td>二</td>' +
                '<td>三</td>' +
                '<td>四</td>' +
                '<td>五</td>' +
                '<td>六</td>' +
              '</tr>' +
            '</table>' +
          '</div>' +
        '</div>' +
        '<div class="inner">' +
        '</div>' +
      '</div>';
      document.body.innerHTML += html;
    }
  };
});