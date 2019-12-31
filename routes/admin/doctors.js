//模块导入--------------------------------------------
const express = require('express');
const router = express.Router();
const queryFn = require('../../public/js/common/mysql');
const doctorsRouter=require("./doctors/doctorsList")
const officeRouter=require("./doctors/officeList")

//引入上传模块
const multer = require('multer');
//配置上传目录对象
const upLoad = multer({ dest: './public/upLoad' });
//医生管理首页--------------------------------------------
router.get('/', function(req, res, next) {
  res.send('医生管理');
});





//医生列表中间件路由--------------------------------------------
router.use('/doctorsList',doctorsRouter);

//科室列表中间路由--------------------------------------------
router.use("/officeList",officeRouter);


module.exports = router;
