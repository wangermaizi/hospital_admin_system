const express = require('express');
const router = express.Router();
const queryFn = require('../../../public/js/common/mysql');

router.get('/addRole', (req, res) => {
  res.render('admin/users/addRole.ejs');
});

router.get('/reviseRole', (req, res) => {
  let id = req.query.id;
  res.render('admin/users/reviseRole.ejs', { id });
});

router.get('/', async function(req, res) {
  let searchName = req.query.searchName;
  let page = parseInt(
    req.query.page && req.query.page > 0 ? req.query.page : 1
  );
  let sqlStr;
  let result;
  if (searchName) {
    sqlStr = 'select * from `role` where rolename = ? limit ?,10';
    result = await queryFn(sqlStr, [searchName, (page - 1) * 10]);
  } else {
    sqlStr = 'select * from role limit ?,10';
    result = await queryFn(sqlStr, [(page - 1) * 10]);
  }
  let sqlStr1 = 'SELECT COUNT(id) as count FROM `role`';
  let count = await queryFn(sqlStr1);
  let countNumber = count[0].count;
  count = Math.ceil(count[0].count / 10);
  result = Array.from(result);
  res.render('admin/users/roleList.ejs', { result, page, count, countNumber });
});

//增加角色
router.post('/addRole', async (req, res) => {
  //1.增加角色表
  //获取角色名称和简介
  let rolename = req.body.rolename;
  let brief = req.body.brief;
  //将内容插入
  let sqlStr = 'insert into role (rolename,brief) values (?,?)';
  await queryFn(sqlStr, [rolename, brief]);
  //2.修改角色与权限关系表
  let sqlStr1 =
    'insert into role_auth (roleid,authid) values ((select id from role where rolename = ?),?)';
  //获取权限数组
  let authList = req.body.authlist;
  authList.forEach((item, i) => {
    let id = item.value;
    queryFn(sqlStr1, [rolename, id]);
  });

  res.send({
    state: 'ok',
    content: '输入成功'
  });
});

//修改角色信息
router.post('/reviseRole', async (req, res) => {
  //1.修改角色表
  //获取角色名称和简介
  let id = req.body.id;
  let rolename = req.body.rolename;
  let brief = req.body.brief;
  //将内容修改
  let sqlStr = 'update role set rolename = ? where id = ?';
  await queryFn(sqlStr, [rolename, id]);
  let sqlStr1 = 'update role set brief = ? where id = ?';
  await queryFn(sqlStr1, [brief, id]);
  let sqlStr2 = 'delete from role_auth where roleid = ?';
  await queryFn(sqlStr2, [id]);
  let authlist = req.body.authlist;
  
  authlist.forEach(async item => {
    let sqlStr3 = 'insert into role_auth (roleid,authid) values (?,?)';
    await queryFn(sqlStr3, [id, item.value]);
  });

  res.send({
    state: 'ok',
    content: '修改成功'
  });
});

//删除路由
router.post('/delRole', (req, res) => {
  let delId = req.body['data[]'];
  let type = typeof delId;
  if (type == 'string') {
    delId = [delId];
  }
  delId.forEach(item => {
    let sqlStr = 'delete from role where id = ?';
    let arr = [item];
    queryFn(sqlStr, arr);
    let sqlStr1 = 'delete from role_auth where roleid = ?';
    queryFn(sqlStr1, arr);
  });
});

//获取权限页面渲染数据
router.post('/roleData', async (req, res) => {
  let sqlStr = 'select * from auth';
  let result = await queryFn(sqlStr);
  let options = {
    code: 0,
    data: Array.from(result)
  };
  res.json(options);
});

module.exports = router;
