const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.render('info/info.ejs', {
        title: '退出失败',
        content: '失败原因为：' + err,
        hrefText: '首页',
        href: '/admin'
      });
    } else {
      res.render('info/info.ejs', {
        title: '退出成功',
        content: '请重新登入',
        hrefText: '登录页',
        href: '/rl/login'
      });
    }
  });
});

module.exports = router;
