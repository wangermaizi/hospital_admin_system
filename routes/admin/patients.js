//模块导入--------------------------------------------
const express = require('express');
const router = express.Router();
const queryFn = require('../../public/js/common/mysql');

//中间模块导入--------------------------------------------
const patientInfo = require('./patient/patientList')

//患者管理首页--------------------------------------------
router.get('/',async function(req, res) {
  let sqlStr = "SELECT patient.id,`user`.imgheader,patient.patientname,patient.gender,patient.phone_number,patient.email,patient.regtime,patient.seetime,doctor.doctorname,patient.brief,patient.prescribe,state.state FROM patient INNER JOIN doctor on patient.doctorid = doctor.id INNER JOIN user on patient.patientname = `user`.username and patient.phone_number = `user`.phone_number and patient.email = `user`.email INNER JOIN state on patient.stateid = state.id limit ?,5";
  let page = parseInt(
    req.query.page && req.query.page > 0 ? req.query.page : 1
  );
  let result = await queryFn(sqlStr, [(page - 1) * 5]);
  let sqlStr1 = 'SELECT COUNT(id) as count FROM patient';
  let count = await queryFn(sqlStr1);
  let countNumber = count[0].count;
  count = Math.ceil(count[0].count / 5);
  result = Array.from(result);
  res.render('admin/patient/patient',{ result, page, count, countNumber });
});

//患者列表单个删除--------------------------------------------
router.post('/delpatient',async (req,res)=>{
  let patientid = req.body.patientid;
  console.log(patientid)
    let sqlStr = 'delete from patient where id = ?';
    let result = await queryFn(sqlStr,[patientid]);
    res.json({
        state:"ok",
        content:Array.from(result)
    })
})

//患者列表多个个删除--------------------------------------------
router.post('/delpatients',async (req,res)=>{
  let dellist = req.body['dellist[]'];
  if(dellist.length>2){
    dellist.forEach(async (item,i) => {
      let sqlStr = "delete from patient where id = ?"
      await queryFn(sqlStr,item);
    });
  }else{
    let sqlStr = "delete from patient where id = ?"
    await queryFn(sqlStr,dellist);
  }
  res.json({
    state:"ok",
    constent:"删除成功"
  })
})

//患者列表修改--------------------------------------------
router.use('/patientInfo',patientInfo)

module.exports = router;
