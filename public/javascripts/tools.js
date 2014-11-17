define(function(require, exports, module) {
  module.exports = {
    getFormData: function(form, filler) {
      var data = {};
      for (var i = 0; i < form.length; ++i) {
        var name = form[i].name;
        var value = form[i].value;
        if (name.length == 0)
          continue;
        if (value.length == 0) {
          if ((typeof filler != 'string') || (filler.length == 0))
            continue;
          else
            value = filler;
        }
        data[name] = value;
      }
      return data;
    },
    checkMailFormat: function(email) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    },
    checkPasswordFormat: function(pwd) {
      return /^[0-9a-zA-Z]+$/.test(pwd);
    }
  }
});