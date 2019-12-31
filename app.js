//导入模块---------------------------------
const express = require('express');
const path = require('path');
const session = require('express-session');
// 导入图片上传模块
const multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir:'./public/upLoad' });
//导入路由模块------------------------------
const indexRouter = require('./routes/index/index');
const usersRouter = require('./routes/users');
//后台模块
const adminRouter = require('./routes/admin/admin');
//注册登入模块
const loginRouter = require('./routes/login/login');
//退出登录模块
const loginOut = require('./routes/login/loginOut');


//实例化app--------------------------------
let app = express();

//设置视图引擎------------------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//设置中间件---------------------------
app.use(express.json());
//post请求解析body
app.use(express.urlencoded({ extended: false }));
//静态目录中间件
app.use(express.static(path.join(__dirname, 'public')));
// 上传模块的中间件
app.use(multipartMiddleware);
//配置session中间件
app.use(
  session({
    secret: 'kas@#._23ld', //cookie签名，这个属性是必须的
    resave: 'false', //当用户的session无变化时依然自动保存
    saveUninitialized: true, //是否自动初始化，默认为true
    cookie: {
      maxAge: 5 * 60 * 1000, //设置session的有效期
      secure: false
    }
  })
);

//设置路由中间件---------------------------
//前台路由
app.use('/index', indexRouter);
app.use('/users', usersRouter);
//后台路由
app.use('/admin', adminRouter);
//登入路由
app.use('/rl', loginRouter);
//退出登录路由
app.use('/loginOut', loginOut);

module.exports = app;
