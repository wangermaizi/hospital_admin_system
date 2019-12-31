var express = require('express');
var router = express.Router();
let fs = require('fs');
var queryFu = require('../../../public/js/common/mysql');
var MD5 = require('../../../public/js/common/encryptMD5');

//患者修改信息页面--------------------------------------------
router.get('/edituser',async function(req, res, next) {
    let patientid = req.query.id
    let sqlStr = "SELECT patient.alterstate,patient.id,`user`.imgheader,patient.patientname,patient.gender,patient.phone_number,patient.email,patient.regtime,patient.seetime,doctor.doctorname,patient.stateid,patient.brief,patient.prescribe FROM patient INNER JOIN doctor on patient.doctorid = doctor.id INNER JOIN user on patient.patientname = `user`.username and patient.phone_number = `user`.phone_number and patient.email = `user`.email where patient.id = ?"
    let result = await queryFu(sqlStr,[patientid])
    let state = await getRoles()
    let sqlStr1 = "select items,drugname from drugs";
    let drugNum = await queryFu(sqlStr1);
    result = {result,state,drugNum}
    res.render('admin/patient/patientInfo',result)
});


async function getRoles(){
    let sqlStr = 'select * from state';
    let result = await queryFu(sqlStr);
    return Array.from(result);
}

router.post('/patientInfo',async (req,res)=>{
    let phone_number = req.body['data[phone_number]'];
    let regtime = req.body['data[regtime]'];
    let seetime = req.body['data[seetime]'];
    let brief = req.body['data[content]'];
    let stateid = req.body['data[stateid]'];
    let prescribeAll = req.body.arr;
    prescribeAll = JSON.parse(prescribeAll)
    let prescribe = "";
    console.log(req.body)
    console.log(prescribeAll)
    prescribeAll.forEach(async (item,i)=>{
        if(i<1){
            prescribe = prescribe + item.drug + ":" + item.num
        }else{
            prescribe = prescribe + "," + item.drug + ":" + item.num
        }
        let name = item.drug;
        let sqlStr = "select items from drugs where drugname = ?"
        let result = await queryFu(sqlStr,[name]);
        let number = parseInt(result[0].items)-parseInt(item.num)
        let update = "update drugs set items = ? where drugname = ?"
        await queryFu(update,[number,name])
    })
    let alterstate = "true"
    let arr = [regtime,seetime,brief,stateid,prescribe,alterstate,phone_number]
    let sqlStr = "update patient set regtime=?,seetime=?,brief=?,stateid=?,prescribe=?,alterstate=? where phone_number = ?";
    await queryFu(sqlStr,arr);
    res.send("页面上传成功")
})


router.post('/change',async (req,res)=>{
    let prescribe = req.body.search;
    let sqlStr = "select drugname from drugs where drugname like ?";
    let result = await queryFu(sqlStr,["%"+prescribe+"%"]);
    res.json({
        drugInfo:Array.from(result)
    })
})


router.post('/drugnum',async (req,res)=>{
    let drugname = req.body.drugname;
    let sqlStr = "select items from drugs where drugname = ?"
    let result = await queryFu(sqlStr,[drugname]);
    res.json({
        state:"ok",
        content:result
    })
})


module.exports = router;
