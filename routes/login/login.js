const express = require('express');
const router = express.Router();
//导入mysql查询模块
const conQuery = require('../../public/js/common/mysql');
//导入crypto加密模块
const Md5 = require('../../public/js/common/encryptMD5');

//页面--------------------------------------------
router.get('/', function(req, res, next) {
  res.redirect('/rl/login');
});

//登录页面--------------------------------------------
router.get('/login', (req, res) => {
  res.render('login/login.ejs');
});
let aa = '1';

//注册页面--------------------------------------------
router.get('/register', (req, res) => {
  res.render('login/register.ejs', { aa });
});

//监听登入表单数据--------------------------------------------
router.post('/login', async (req, res) => {
  let username = req.body.username;
  let password = Md5(req.body.password);
  let sqlStr = 'select * from user where username = ?  and password = ?';
  let arr = [username, password];
  let result = await conQuery(sqlStr, arr);
  if (result.length != 0) {
    //设置session
    req.session.username = username;
    //判断进入首页还是后台
    if (result[0].roleid == 45) {
      res.render('info/info.ejs', {
        title: '登录',
        content: '恭喜您登录成功',
        hrefText: '前台首页',
        href: '/index'
      });
    } else {
      res.render('info/info.ejs', {
        title: '登录',
        content: '恭喜您登录成功',
        hrefText: '后台首页',
        href: '/admin'
      });
    }
  } else {
    res.render('info/info.ejs', {
      title: '密码或用户错误',
      content: '请重新登入',
      hrefText: '登录页',
      href: '/rl/login'
    });
  }
});

//监听注册表单数据--------------------------------------------
router.post('/register', async (req, res) => {
  let username = req.body.username;
  let password = Md5(req.body.password);
  let phone_number = req.body.phone_number;
  let email = req.body.email;
  let sqlStr = 'select * from user where username = ? or email = ?';
  let arr = [username, email];
  let result = await conQuery(sqlStr, arr);
  if (result.length == 0) {
    let sqlStr =
      'insert into user (username,password,phone_number,email,roleid) values (?,?,?,?,1)';
    arr = [username, password, phone_number, email];
    await conQuery(sqlStr, arr);
    res.render('info/info.ejs', {
      title: '注册成功',
      content: '恭喜您注册成功',
      hrefText: '登录页',
      href: '/rl/login'
    });
  } else {
    res.render('info/info.ejs', {
      title: '注册失败',
      content: '用户名或者邮箱已存在，请重新注册',
      hrefText: '注册页',
      href: '/rl/register'
    });
  }
});

//监听用户名是否存在--------------------------------------------
router.post('/registerUser', async (req, res) => {
  let username = req.body.username;
  let sqlStr = 'select * from user where username =?';
  let result = await conQuery(sqlStr, [username]);
  result = result.length > 0 ? false : true;
  //使用json返回给ajax的res
  res.json(result);
});

module.exports = router;
