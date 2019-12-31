//引入fs模块
const fs = require('fs');
function rename(req) {
  let oldPath = req.file.destination + '/' + req.file.filename;
  let newPath =
    req.file.destination + '/' + req.file.filename + req.file.originalname;
  fs.rename(oldPath, newPath, err => {
    // if (err) {
    //   console.log('改名失败');
    // } else {
    //   console.log(
    //     '改名成功,名字为：' + req.file.filename + req.file.originalname
    //   );
    // }
  });
  return {
    state: 'ok',
    imgUrl: '/upLoad/' + req.file.filename + req.file.originalname
  };
}
module.exports = rename;
