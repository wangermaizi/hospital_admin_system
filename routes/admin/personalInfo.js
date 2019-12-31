//模块导入--------------------------------------------
const express = require('express');
const router = express.Router();
const con = require('../../public/js/common/mysql');

//用户首页--------------------------------------------
router.get('/', async function(req, res) {
  let username = req.session.username;
  let sqlStr = `select * from user where username = ?`;
  let arr = username;
  let result = await con(sqlStr, arr);
  result = result[0];
  res.render('admin/personalInfo.ejs', { result });
});

router.post('/user', (req, res) => {
  
  let sqlStr = 'insert into user '
  res.send('提交成功');
});
module.exports = router;
