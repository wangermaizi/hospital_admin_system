var express = require('express');
var router = express.Router();
const apiNewsRouter = require('./news/newsRouter')

router.get('/', function(req, res, next) {
  res.redirect('/index/home');
});

//首页--------------------------------------------
router.use('/home', (req, res) => {
  res.render('index/index.ejs');
});

//新闻页--------------------------------------------
router.use('/news', (req, res) => {
  res.render('index/news.ejs');
});

// 前端新闻api接口模块
router.use('/api/news',apiNewsRouter)

module.exports = router;
