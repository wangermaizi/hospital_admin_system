//医生管理--------------------------------------------
var express = require('express');
var router = express.Router();
var fs = require('fs');
const queryFn = require('../../../public/js/common/mysql');
//引入上传模块
const multer = require('multer');
//配置上传目录对象
const upLoad = multer({ dest: './public/upLoad' });
//引入改名模块
const rename = require('../../../public/js/common/rename');
//引入加密模块
const Md5 = require('../../../public/js/common/encryptMD5');

//渲染医生列表模板--------------------------------------------
//多表查询，计算出每页的数据--------------------------------------------
router.get('/', async (req, res) => {
  let sqlStr =
    'select doctor.id, doctorname,age,gender,allpeople,people,doctorheader,office.officename' +
    ' from `doctor` inner join office' +
    ' on doctor.officeid = office.id limit ?,5';
  let page = parseInt(
    req.query.page && req.query.page > 0 ? req.query.page : 1
  );
  let result = await queryFn(sqlStr, [(page - 1) * 5]);
  let sqlStr1 = 'SELECT COUNT(id) as count FROM `doctor`';
  let count = await queryFn(sqlStr1);
  let countNumber = count[0].count;
  count = Math.ceil(count[0].count / 5);
  result = Array.from(result);
  let options = {
    result, //计算结果
    page, //页数
    count, //总页数
    countNumber //总条数
  };
  res.render('admin/doctors/doctorsList.ejs', options);
});

//批量删除路由--------------------------------------------
router.post('/delUser', (req, res) => {
  let delId = req.body['data[]'];
  let type = typeof delId;
  if (type == 'string') {
    delId = [delId];
  }
  delId.forEach(async item => {
    let sqlStr = 'delete from doctor where id = ?';
    let sqlStr1 =
      'delete from user where name = (select doctorname from doctor where id = ?)';
    let arr = [item];
    await queryFn(sqlStr1, arr);
    queryFn(sqlStr, arr);
  });
});

//修改医生个人信息路由--------------------------------------------
router.get('/modification', async (req, res) => {
  let doctorsid = req.query.id;
  //通过id查找所有的信息
  //let sqlStr = "select *,office.officename  from doctor  inner join office on doctor.officeid=office.id where doctor.id =?";
  let sqlStr = 'select * from doctor where id=?';
  let result = await queryFn(sqlStr, [doctorsid]);
  result = result[0];
  let officename = await getOffice();
  res.render('admin/doctors/doctorsMod', { result, officename });
});

//查询所有科室--------------------------------------------
async function getOffice() {
  let sqlStr = 'select * from  office ';
  let result = await queryFn(sqlStr);
  return Array.from(result);
}

//提交修改的医生个人头像--------------------------------------------
router.post('/selfimgupload/', upLoad.single('imgfile'), async (req, res) => {
  let doctorsid = req.query.id;
  let result = rename(req);
  //将改名后的结果，上传到数据库
  let sqlStr = 'update doctor set doctorheader=? where id=?';
  await queryFn(sqlStr, [result.imgUrl, doctorsid]);

  res.json(result);
});

//处理表单提交--------------------------------------------
router.post('/modification', async (req, res) => {
  let doctorsid = req.query.id;
  let age = req.body.age;
  let gender = req.body.gender;
  let officeid = req.body.officeid;
  let doctorname = req.body.doctorname;
  let sqlstr1 =
    'update user set name =? where id = (select userid from doctor where id = ?)';
  await queryFn(sqlstr1, [doctorname, doctorsid]);
  let sqlStr =
    'update doctor set age=?,gender=?,officeid=?,doctorname=? where id=?';
  let arr = [age, gender, officeid, doctorname, doctorsid];
  await queryFn(sqlStr, arr);
  res.json({
    state: 'ok',
    content: '个人信息更新成功'
  });
});
//添加模块--------------------------------------------
//把科室列表渲染--------------------------------------------
router.get('/addDoctors', async (req, res) => {
  let officename = await getOffice();
  res.render('admin/doctors/doctorsAdd', { officename });
});

//添加医生--------------------------------------------
router.post('/addDoctors', async (req, res) => {
  let age = req.body.age;
  let gender = req.body.gender;
  let officeid = req.body.officeid;
  let doctorname = req.body.doctorname;
  let doctorheader = req.body.imgheader;

  //新增用户，默认密码为123456
  let sqlStr1 = 'select * from user where username = ?';
  let result = await queryFn(sqlStr1, [doctorname]);
  if (result.length != 0) {
    res.json({
      state: 'arr',
      content:
        '该用户名已存在，无法创建用户，请联系管理员（添加医生默认以该名字注册用户）'
    });
  } else {
    let sqlStr2 =
      'insert into user (username,name,gender,age,password) values (?,?,?,?,?)';
    let password = Md5(123456);
    let arr1 = [doctorname, doctorname, gender, age, password];
    await queryFn(sqlStr2, arr1);

    let sqlStr3 = 'select id from user where username = ?';
    let result = await queryFn(sqlStr3, [doctorname]);
    let userid = result[0].id;
    let sqlStr =
      'insert into doctor (doctorname,gender,age,officeid,doctorheader,userid) values (?,?,?,?,?,?)';
    let arr = [doctorname, gender, age, officeid, doctorheader, userid];
    await queryFn(sqlStr, arr);

    res.json({
      state: 'ok',
      content: '添加成功'
    });
  }
});

//提交增加医生头像-------------------------------------------
router.post('/addimgupload', upLoad.single('imgfile'), async (req, res) => {
  let doctorname = req.query.doctorname;
  let result = rename(req);
  let strSql = 'update doctor set doctorheader=? where doctorname=?';
  await queryFn(strSql, [result.imgUrl, doctorname]);
  res.json(result);
});

module.exports = router;
