const express = require('express');
const router = express.Router();
const queryFn = require('../../../public/js/common/mysql');

//渲染添加权限名称和路径页面--------------------------------------------
router.get('/addAuth', (req, res) => {
  res.render('admin/users/addAuth.ejs');
});

//渲染修改权限名称和路径页面--------------------------------------------
router.get('/reviseAuth', (req, res) => {
  let id = req.query.id;
  res.render('admin/users/reviseAuth.ejs', { id });
});

router.get('/', async function(req, res) {
  let searchName = req.query.searchName;
  let page = parseInt(
    req.query.page && req.query.page > 0 ? req.query.page : 1
  );
  let sqlStr;
  let result;
  if (searchName) {
    sqlStr = 'select * from `auth` where authname = ? limit ?,10';
    result = await queryFn(sqlStr, [searchName, (page - 1) * 10]);
  } else {
    sqlStr = 'select * from auth limit ?,10';
    result = await queryFn(sqlStr, [(page - 1) * 10]);
  }
  let sqlStr1 = 'SELECT COUNT(id) as count FROM `auth`';
  let count = await queryFn(sqlStr1);
  let countNumber = count[0].count;
  count = Math.ceil(count[0].count / 10);
  result = Array.from(result);
  res.render('admin/users/authList.ejs', { result, page, count, countNumber });
});

//获取添加权限数据--------------------------------------------
router.post('/addAuth', async (req, res) => {
  let id = req.body.id;
  let authname = req.body.authname;
  let authurl = req.body.authurl;
  let sqlStr;
  if (id) {
    sqlStr = 'insert into auth (id,authname,authurl) value (?,?,?)';
    await queryFn(sqlStr, [id, authname, authurl]);
  } else {
    sqlStr = 'insert into auth (authname,authurl) value (?,?)';
    await queryFn(sqlStr, [authname, authurl]);
  }
  res.send({
    state: 'ok',
    content: '成功'
  });
});

//删除路由
router.post('/delAuth', (req, res) => {
  let delId = req.body['data[]'];
  let type = typeof delId;
  if (type == 'string') {
    delId = [delId];
  }
  delId.forEach(item => {
    let sqlStr = 'delete from auth where id = ?';
    let arr = [item];
    queryFn(sqlStr, arr);
    let sqlStr1 = 'delete from role_auth where authid = ?';
    queryFn(sqlStr1, arr);
  });
});

//修改路由
router.post('/reviseAuth', (req, res) => {
  let id = req.body.id;
  let authname = req.body.authname;
  let authurl = req.body.authurl;
  let sqlStr = 'update auth set authname=? where id = ?';
  queryFn(sqlStr, [authname, id]);
  let sqlStr1 = 'update auth set authurl=? where id = ?';
  queryFn(sqlStr1, [authurl, id]);
  res.send({
    state: 'ok',
    content: '修改成功'
  });
});

module.exports = router;
