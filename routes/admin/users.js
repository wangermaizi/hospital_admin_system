//模块导入--------------------------------------------
const express = require('express');
const router = express.Router();
const queryFn = require('../../public/js/common/mysql');
const userListRoute = require('./users/userList');
const authListRoute = require('./users/authList');
const roleListRoute = require('./users/roleList');
//引入上传模块
const multer = require('multer');
//配置上传目录对象
const upLoad = multer({ dest: './public/upLoad' });
//引入改名模块
const rename = require('../../public/js/common/rename');
//引入加密模块
const Md5 = require('../../public/js/common/encryptMD5');

//用户管理首页--------------------------------------------
router.get('/', function(req, res, next) {
  res.send('用户管理');
});

//个人信息路由
router.get('/selfInfo', async (req, res) => {
  //传个值
  req.session.username1 = undefined;
  //获取用户名
  let username = req.session.username;
  //通过用户名查找所有的信息
  //判断是否是编辑页面的
  if (req.query.username) {
    req.session.username1 = req.query.username;
    username = req.query.username;
  }
  let sqlStr = 'select * from user where username = ?';
  let result = await queryFn(sqlStr, [username]);
  result = result[0];
  let roles = await getRoles(result.roleid);
  res.render('admin/users/selfinfo.ejs', { result, roles });
});

//处理上传图片路由--------------------------------------------
router.post('/selfimgupload/', upLoad.single('imgfile'), async (req, res) => {
  let username = req.session.username;
  if (req.session.username1 != undefined) {
    username = req.session.username1;
  }
  let result = rename(req);
  //将改名后的结果上传到数据库
  let strSql = 'update user set imgheader =? where username = ?';
  await queryFn(strSql, [result.imgUrl, username]);
  res.json(result);
});

//获取角色信息--------------------------------------------
async function getRoles(roleid) {
  let sqlStr = 'select * from role where id = ?';
  let result = await queryFn(sqlStr, [roleid]);
  return Array.from(result);
}

//处理个人信息表单提交--------------------------------------------
router.post('/selfInfo', async (req, res) => {
  let username = req.session.username;
  if (req.session.username1 != undefined) {
    username = req.session.username1;
  }
  let phone_number = req.body.phone_number;
  let email = req.body.email;
  let roleid = req.body.roleid;
  let arr;
  if (req.body.password) {
    let password = Md5(req.body.password);
    arr = [{ phone_number }, { email }, { roleid }, { password }];
  } else {
    arr = [{ phone_number }, { email }, { roleid }];
  }
  //更改用户表
  arr.forEach((item, index) => {
    let sqlStr = `update user set ${Object.keys(item)[0]}=? where username = ?`;
    queryFn(sqlStr, [item[Object.keys(item)[0]], username]);
  });
});

//用户中间件路由--------------------------------------------
router.use('/userList', userListRoute);

//权限中间件路由--------------------------------------------
router.use('/authList', authListRoute);
router.use('/roleList', roleListRoute);

module.exports = router;
