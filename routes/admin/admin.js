//模块导入--------------------------------------------
const express = require('express');
const router = express.Router();

//中间件模块导入--------------------------------------------
const usersRouter = require('./users');
const newsRouter = require('./news/newsRouter');
const doctorsRouter = require('./doctors');
const patientsRouter = require('./patients');
const drugRouter = require('./drug/drugsRouter');
const queryFn = require('../../public/js/common/mysql');

//判断是否允许登入后台页面中间件--------------------------------------------
function permission(req, res, next) {
  if (req.session.username == undefined) {
    //尚未登入，返回登录页
    res.render('info/info.ejs', {
      title: '尚未登录',
      content: '请您先登录账号',
      hrefText: '登录页',
      href: '/rl/login'
    });
  } else {
    //正常进入
    next();
  }
}

//后台首页--------------------------------------------
router.get('/', permission, async function(req, res) {
  let username = req.session.username; 
  let sqlStr = 'select roleid, imgheader from user where username = ?';
  let imgheader = await queryFn(sqlStr, [username]);
  imgheader = imgheader[0].imgheader;
  //获取权限内容
  let sqlStr1 =
    'select * from role_auth where roleid = (select roleid from user where username = ?)';
  let role_auth = await queryFn(sqlStr1, [username]);
  role_auth = Array.from(role_auth);
  let arr = [];
  role_auth.forEach(item => {
    arr.push(item.authid);
  });
  res.render('admin/index.ejs', { arr, username, imgheader });
});

//设置后台权限的中间件--------------------------------------------
async function adminAuth(req, res, next) {
  //获取登录后的用户名
  let username = req.session.username;
  //获取权限路径
  let sqlStr =
    'select authurl from auth where id in (select authid from role_auth where roleid = (select roleid from user where username = ?))';
  let result = await queryFn(sqlStr, [username]);
  let resultArr = Array.from(result);
  //判断当前请求的路径是否在允许的路径里
  let httpUrl = req.originalUrl;
  let isAllow = resultArr.some((item, index) => {
    return new RegExp('^' + item.authurl).test(httpUrl);
  });
  if (isAllow) {
    next();
  } else {
    res.render('info/info.ejs', {
      title: '禁止访问,404',
      content: '没有权限访问该页面，请联系管理员,并关闭页面',
      hrefText: '，懒得前往了',
      href: '#'
    });
  }
}

// router.use(adminAuth);

//后台用户管理--------------------------------------------
router.use('/users', usersRouter);

//后台新闻管理--------------------------------------------
router.use('/news', newsRouter);

//后台医生管理--------------------------------------------
router.use('/doctors', doctorsRouter);

//后台患者管理--------------------------------------------
router.use('/patients', patientsRouter);

//药品管理--------------------------------------------
router.use('/drugs', drugRouter);

module.exports = router;
