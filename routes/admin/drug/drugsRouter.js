var express = require('express');
var router = express.Router();
let getTime = require('../../../public/js/common/getTime');
let mySql = require('../../../public/js/common/mysql');
const parseTime = require('../../../public/js/common/parseTime');

router.get('/',(req,res)=>{
    res.send('这是后台药品管理首页')
});
router.get('/manage',async (req, res)=>{
    let page = parseInt(req.query.page);
    page = page?page:1;
    let searchItem = req.query.search;
    searchItem = searchItem == ""?undefined:searchItem;
    let cid = req.query.cid;
    cid = cid == ""?undefined:cid;
    let cataInfo = await mySql("select * from drugs_catagory");
    if (searchItem != undefined && cid == undefined){
        let str = "SELECT d.ID,d.drugname,d.company,d.brief,d.price,d.items,d.entrytime,c.catagory FROM drugs AS d INNER JOIN drugs_catagory AS c ON d.catagory = c.ID where d.drugname like ? or d.company like ? limit ? ,10";
        let result = await mySql(str,['%'+searchItem+'%','%'+searchItem+'%',(page-1)*10]);
        let allPage = await mySql("select count(*) as allpage from drugs as d where d.drugname like ? or d.company like ?",['%'+searchItem+'%','%'+searchItem+'%']);
        allPage = parseInt(allPage[0].allpage);
        let allnum = allPage;
        allPage = Math.ceil(allPage/10);
        let option = {
            drugsInfo:Array.from(result),
            cataInfo:Array.from(cataInfo),
            allPage,
            page,
            allnum,
            searchItem,
            cid,
            parseTime
        };
        res.render('./admin/drug/drugs_manage.ejs',option)
    } else if (searchItem != undefined && cid != undefined) {
        let str = "SELECT d.ID,d.drugname,d.company,d.brief,d.price,d.items,d.entrytime,c.catagory FROM drugs AS d INNER JOIN drugs_catagory AS c ON d.catagory = c.ID where (d.drugname like ? or d.company like ?) and d.catagory = ? limit ? ,10";
        let result = await mySql(str,['%'+searchItem+'%','%'+searchItem+'%',cid,(page-1)*10]);
        let allPage = await mySql("select count(*) as allpage from drugs as d where (d.drugname like ? or d.company like ?) and d.catagory = ?",['%'+searchItem+'%','%'+searchItem+'%',cid]);
        allPage = parseInt(allPage[0].allpage);
        let allnum = allPage;
        allPage = Math.ceil(allPage/10);
        let option = {
            drugsInfo:Array.from(result),
            cataInfo:Array.from(cataInfo),
            allPage,
            page,
            allnum,
            searchItem,
            cid,
            parseTime
        };
        res.render('./admin/drug/drugs_manage.ejs',option)
    } else if (searchItem == undefined && cid != undefined){
        let str = "SELECT d.ID,d.drugname,d.company,d.brief,d.price,d.items,d.entrytime,c.catagory FROM drugs AS d INNER JOIN drugs_catagory AS c ON d.catagory = c.ID where d.catagory = ? limit ? ,10";
        let result = await mySql(str,[cid,(page-1)*10]);
        let allPage = await mySql("select count(*) as allpage from drugs where catagory = ?",[cid]);
        allPage = parseInt(allPage[0].allpage);
        let allnum = allPage;
        allPage = Math.ceil(allPage/10);
        let option = {
            drugsInfo:Array.from(result),
            cataInfo:Array.from(cataInfo),
            allPage,
            page,
            allnum,
            searchItem,
            cid,
            parseTime
        };
        res.render('./admin/drug/drugs_manage.ejs',option)
    } else {
        let str = "SELECT d.ID,d.drugname,d.company,d.brief,d.price,d.items,d.entrytime,c.catagory FROM drugs AS d INNER JOIN drugs_catagory AS c ON d.catagory = c.ID limit ? ,10";
        let result = await mySql(str,[(page-1)*10]);
        let allPage = await mySql("select count(*) as allpage from drugs");
        allPage = parseInt(allPage[0].allpage);
        let allnum = allPage;
        allPage = Math.ceil(allPage/10);
        let option = {
            drugsInfo:Array.from(result),
            cataInfo:Array.from(cataInfo),
            allPage,
            page,
            allnum,
            searchItem,
            cid,
            parseTime
        };
        res.render('./admin/drug/drugs_manage.ejs',option)
    }

});

// 搜索药品
router.post('/searchDrugs',async (req, res)=>{
    let page = parseInt(req.query.page);
    let cid = parseInt(req.query.cid);
    console.log(cid);
    page = page?page:1;
    cid = cid == ""?undefined:cid;
    let str = "SELECT d.ID,d.drugname,d.company,d.brief,d.price,d.items,d.entrytime,c.catagory FROM drugs AS d INNER JOIN drugs_catagory AS c ON d.catagory = c.ID where d.drugname like ? or d.company like ? limit ? ,10";
    let searchItem = req.body.drugname;
    let result = await mySql(str,['%'+searchItem+'%','%'+searchItem+'%',(page-1)*10]);
    let allPage = await mySql("select count(*) as allpage from drugs where drugname like ? or company like ?",['%'+searchItem+'%','%'+searchItem+'%']);
    allPage = parseInt(allPage[0].allpage);
    let allnum = allPage;
    allPage = Math.ceil(allPage/10);
    let option = {
        drugsInfo:Array.from(result),
        allPage,
        page,
        allnum,
        searchItem,
        parseTime
    };
    res.render('./admin/drug/drugs_manage.ejs',option)
});

router.get('/adddrugs',async (req,res)=>{
    let ID = req.query.ID;
    let sqlStr = "select * from drugs_catagory";
    let sqlStr1 = "select * from role";
    let cataInfo = await mySql(sqlStr);
    let roleInfo = await mySql(sqlStr1);
    // 判断是需要添加药品还是修改药品
    if (ID == undefined) {
        let option = {
            roleInfo:Array.from(roleInfo),
            cataInfo:Array.from(cataInfo),
            drugInfo:null
        };
        res.render('./admin/drug/add_drugs.ejs',option)
    } else {
        let sqlStr = "SELECT c.ID,d.drugname,d.company,d.brief,d.price,d.items,d.entrytime,c.catagory FROM drugs AS d INNER JOIN drugs_catagory AS c ON d.catagory = c.ID where d.ID = ?";
        let drugInfo = await mySql(sqlStr,[ID]);
        let option = {
            roleInfo:Array.from(roleInfo),
            cataInfo:Array.from(cataInfo),
            drugInfo:Array.from(drugInfo)[0]
        };
        res.render('./admin/drug/add_drugs.ejs',option)
    }
});

// 添加药品--药品提交
router.post('/adddrugs',async (req, res)=>{
    let obj = req.body;
    // 检测是否添加药品还是修改药品
    let sqlStr = "select * from drugs where drugname = ?";
    let result = await mySql(sqlStr,[req.body.drugname]);
    let username = req.session.username;
    let roleid = await mySql("select * from drugs where username = ?",[username]);
    roleid = Array.from(roleid)[0].roleid;
    if (Array.from(result).length == 0){
        // 添加药品
        let insertSql = "insert into drugs (drugname,catagory,company,brief,price,items,author,roleid,entrytime) values(?,?,?,?,?,?,?)";
        await mySql(insertSql,[obj.drugname,obj.catagory,obj.company,obj.brief,obj.price,obj.items,username,roleid,obj.entry]);
    } else {
        // 修改药品
        let updateSql = "update drugs set catagory = ?,company = ?,brief = ?,price =?,items = ?,entrytime = ?,author = ?,roleid = ? where drugname = ?";
        await mySql(updateSql,[obj.catagory,obj.company,obj.brief,obj.price,obj.items,obj.entry,username,roleid,obj.drugname]);
    }
    res.send(`修改成功<script>var index = parent.layer.getFrameIndex(window.name);
            //关闭当前frame
            parent.layer.close(index);
            parent.location.reload()</script>`)
});

// 删除药品
router.get('/manage/deldrugs',async (req, res)=>{
    let obj = req.query.data;
    let sqlStr = "delete from drugs where ID = ?";
    if (typeof obj == "string") {
        await mySql(sqlStr,[obj])
    } else {
        obj.forEach(async (item,index)=>{
            await mySql(sqlStr,[item])
        })
    }
    res.json({
        status: "ok",
        content: "药品已修改完成"
    })
});

// 药品分类表
router.get('/catagory',async (req,res)=>{
    let page = req.query.page;
    page = page?page:1;
    let searchItem = req.query.cataname;
    searchItem = searchItem?searchItem:null;
    if (searchItem != null){
        let sqlStr = "select * from drugs_catagory where catagory = ? limit ?,10";
        let result = await mySql(sqlStr,[searchItem,(page-1)*10]);
        let allPage = await mySql("select count(*) as allpage from drugs_catagory where catagory = ?",[searchItem]);
        let allNum = parseInt(allPage[0].allpage);
        allPage = Math.ceil(parseInt(allPage[0].allpage)/10);
        let option = {
            drugsInfo:Array.from(result),
            allPage,
            page,
            allNum,
            parseTime
        };
        res.render('./admin/drug/drugs_catagory.ejs',option);
    } else {
        let sqlStr = "select * from drugs_catagory limit ?,10";
        let result = await mySql(sqlStr,[(page-1)*10]);
        let allPage = await mySql("select count(*) as allpage from drugs_catagory");
        let allNum = parseInt(allPage[0].allpage);
        allPage = Math.ceil(parseInt(allPage[0].allpage)/10);
        let option = {
            drugsInfo:Array.from(result),
            allPage,
            page,
            allNum,
            parseTime
        };
        res.render('./admin/drug/drugs_catagory.ejs',option);
    }

});

// 添加药品分类
router.get('/addcatagory',async (req,res)=>{
    let id = req.query.catagoryID;
    let sqlStr = "select * from roleid";
    let roleInfo = await mySql(sqlStr);
    if (id == undefined) {
        let option = {
            cataInfo:null,
            roleInfo:Array.from(roleInfo)
        };
        res.render('./admin/drug/add_catagory.ejs',option)
    }else {
        let sqlStrDrug = "select * from drugs_catagory where ID = ?;";
        let cataInfo = await mySql(sqlStrDrug,[id]);
        let option = {
            cataInfo:Array.from(cataInfo)[0],
            roleInfo:Array.from(roleInfo)
        };
        res.render('./admin/drug/add_catagory.ejs',option)
    }
});

//提交药品分类
router.post('/addcatagory',async (req, res)=>{
    let obj = req.body;
    let catagoryname = obj.catagoryname;
    let confirmTime = getTime();
    let author = obj.author;
    let roleID = obj.roleID;
    let sqlStr = "insert into drugs_catagory (catagory,confirmTime,author,roleid) values (?,?,?,?)";
    await mySql(sqlStr,[catagoryname,confirmTime,author,roleID]);
    res.send(`修改成功<script>var index = parent.layer.getFrameIndex(window.name);
            //关闭当前frame
            parent.layer.close(index);
            parent.location.reload()</script>`)
});


//删除分类
router.get('/catagory/delcatagory',async (req, res)=>{
    let obj = req.query.data;
    let sqlStr = "delete from drugs_catagory where ID = ?";
    if (typeof obj == "string") {
        await mySql(sqlStr,[obj])
    } else {
        obj.forEach(async (item,index)=>{
            await mySql(sqlStr,[item])
        })
    }
    res.json({
        status:'ok',
        content:'内容已删除成功'
    })
});



module.exports = router;