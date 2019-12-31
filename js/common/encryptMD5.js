const crypto = require('crypto');

function Md5(str) {
  let salt = '012#@^.051!#';
  let obj = crypto.createHash('md5');
  str = salt + str + salt;
  obj.update(str);
  return obj.digest('hex');
}

module.exports = Md5;
