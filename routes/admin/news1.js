//模块导入--------------------------------------------
const express = require('express');
const router = express.Router();

//新闻管理首页--------------------------------------------
router.get('/', function(req, res, next) {
  res.send('新闻管理');
});

module.exports = router;
