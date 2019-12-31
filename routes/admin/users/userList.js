const express = require('express');
const router = express.Router();
const queryFn = require('../../../public/js/common/mysql');
//引入上传模块
const multer = require('multer');
//配置上传目录对象
const upLoad = multer({ dest: './public/upLoad' });
//引入改名模块
const rename = require('../../../public/js/common/rename');
//引入加密模块
const Md5 = require('../../../public/js/common/encryptMD5');

router.get('/', async function(req, res) {
  let searchName = req.query.searchName;
  let page = parseInt(
    req.query.page && req.query.page > 0 ? req.query.page : 1
  );
  let sqlStr;
  let result;
  if (searchName) {
    sqlStr =
      'select user.id,username,name,password,phone_number,imgheader,email,rolename from `user` left join role on user.roleid = role.id where username in (?) or rolename in (?) limit ?,5';
    result = await queryFn(sqlStr, [searchName, searchName, (page - 1) * 5]);
  } else {
    sqlStr =
      'select user.id,username,name,password,phone_number,imgheader,email,rolename from `user` left join role on user.roleid = role.id limit ?,5';
    result = await queryFn(sqlStr, [(page - 1) * 5]);
  }

  let sqlStr1 = 'SELECT COUNT(id) as count FROM `user`';
  let count = await queryFn(sqlStr1);
  let countNumber = count[0].count;
  count = Math.ceil(count[0].count / 5);
  result = Array.from(result);
  res.render('admin/users/userList.ejs', { result, page, count, countNumber });
});

//修改用户信息
router.get('/reviseInfo', async (req, res) => {
  //获取用户名
  let username = req.query.username;
  req.session.username2 = username;
  let sqlStr = 'select * from user where username = ?';
  let result = await queryFn(sqlStr, [username]);
  result = result[0];
  let roles = await getRoles();
  res.render('admin/users/reviseInfo.ejs', { result, roles });
});

//处理用户信息表单--------------------------------------------
router.post('/reviseInfo', async (req, res) => {
  let phone_number = req.body.phone_number;
  let email = req.body.email;
  let roleid = req.body.roleid;
  let username = req.body.username;
  let arr;
  if (req.body.password) {
    let password = Md5(req.body.password);
    arr = [{ phone_number }, { email }, { roleid }, { password }];
  } else {
    arr = [{ phone_number }, { email }, { roleid }];
  }
  arr.forEach((item, index) => {
    let sqlStr = `update user set ${Object.keys(item)[0]}=? where username = ?`;
    queryFn(sqlStr, [item[Object.keys(item)[0]], username]);
  });

  //更改患者表
  let patientArr = [{ phone_number }, { email }];
  patientArr.forEach((item, index) => {
    let sqlStr = `update patient set ${Object.keys(item)[0]}=? where patientname = ?`;
    queryFn(sqlStr, [item[Object.keys(item)[0]], username]);
  });
});

//处理上传图片路由--------------------------------------------
router.post('/selfimgupload/', upLoad.single('imgfile'), async (req, res) => {
  let username = req.session.username2;
  let result = rename(req);
  //将改名后的结果上传到数据库
  let strSql = 'update user set imgheader =? where username = ?';
  await queryFn(strSql, [result.imgUrl, username]);
  res.json(result);
});

//删除路由
router.post('/delUser', (req, res) => {
  let delId = req.body['data[]'];
  let type = typeof delId;
  if (type == 'string') {
    delId = [delId];
  }
  delId.forEach(item => {
    let sqlStr = 'delete from user where id = ?';
    let arr = [item];
    queryFn(sqlStr, arr);
  });
});

//获取角色信息--------------------------------------------
async function getRoles() {
  let sqlStr = 'select * from role';
  let result = await queryFn(sqlStr);
  return Array.from(result);
}
module.exports = router;
