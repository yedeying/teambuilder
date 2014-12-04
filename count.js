var sha1 = require('./module/tools').getSha1;
for(var i = 0; i < 1000; i++) {
  var res = sha1(i.toString());
  if(res === 'fe5dbbcea5ce7e2988b8c69bcfdfde8904aabc1f') {
    console.log(i);
  }
}