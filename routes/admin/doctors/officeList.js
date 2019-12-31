//科室管理--------------------------------------------
var express = require('express');
var router = express.Router();
var fs = require('fs')
const queryFn = require('../../../public/js/common/mysql');
//引入上传模块
const multer = require('multer');
//配置上传目录对象
const upLoad = multer({ dest: './public/upLoad' });
 //引入改名模块
const rename = require("../../../public/js/common/rename"); 
//引入加密模块
const Md5 = require('../../../public/js/common/encryptMD5');

//渲染科室列表模板--------------------------------------------
router.get('/', async(req, res)=>{
    let sqlStr ="select * from office limit ?,5";
    let page = parseInt(req.query.page && req.query.page > 0 ? req.query.page : 1);
    let result = await queryFn(sqlStr, [(page - 1) * 5]);
    let sqlStr1 = 'SELECT COUNT(id) as count FROM `office`';
    let count = await queryFn(sqlStr1);
    let countNumber = count[0].count;
    count = Math.ceil(count[0].count / 5);
    result = Array.from(result);
    let options={
        result, //计算结果
        page,   //页数
        count,  //总页数
        countNumber //总条数
    }
    res.render("admin/doctors/officeList.ejs",options);
})


//批量删除路由--------------------------------------------
router.post('/delUser', (req, res) => {
  let delId = req.body['data[]'];
  let type = typeof delId;
  if (type == 'string') {
    delId = [delId];
  }
  delId.forEach(item => {
    let sqlStr = 'delete from office where id = ?';
    let arr = [item];
    queryFn(sqlStr, arr);
  });
});


//修改科室信息路由--------------------------------------------
router.get("/modification",async(req,res)=>{
  let doctorsid = req.query.id;
  //通过id查找所有的信息
  let sqlStr = "select *  from office where id=?"
  let result = await queryFn(sqlStr,[doctorsid]);
  result = result[0];
  let officename = await getOffice();
  res.render('admin/doctors/officeMod',{result,officename});
})

//查询所有科室--------------------------------------------
async function getOffice(){
  let sqlStr="select * from  office "
  let result=await queryFn(sqlStr)
  return Array.from(result)
}


//修改科室信息进行提交-------------------------------------------
router.post("/modification",async(req,res)=>{
  let officeid=req.query.id
  let officename=req.body.officename;
  let sqlStr = "update office set officename=? where id=?";
  let arr = [officename,officeid]
  await queryFn(sqlStr,arr);
  res.json({
    state:"ok",
    content:"科室信息更新成功"
  })

})



//添加模块--------------------------------------------
//把科室列表渲染--------------------------------------------
router.get('/addoffices',async (req,res)=>{
  let officename = await getOffice()
  res.render('admin/doctors/officeAdd',{officename})
})

//添加科室--------------------------------------------
router.post('/addoffices',async (req,res)=>{
  let office=req.body.officename;
  let sqlStr = "insert into office (officename) values (?)";
  let arr=[office]
  let result= await queryFn(sqlStr,arr);
  res.json({
    state:"ok",
    content:"添加成功"
  })
})



module.exports = router;