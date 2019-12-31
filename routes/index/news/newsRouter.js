// 这是新闻路由模块
var express = require('express');
var router = express.Router();
let getTime = require('../../../public/js/common/getTime');
let mySql = require('../../../public/js/common/mysql');


// 获取分类新闻
// api接口 /index/api/news/getcid
router.get('/getcid',async (req, res)=>{
    let sqlStr = "select * from news_catagory";
    let cataInfo = await mySql(sqlStr)
    res.json({
        status:'ok',
        data:Array.from(cataInfo)
    })
})


// 获取分类新闻以及新闻的分页
// 接口名:/index/api/news/cidXX?page=XX
router.get('/cid:cid',async (req,res)=>{
    let cataId = req.params.cid;
    let page = req.query.page;
    if(page == undefined){
        let sqlStr = "select * from news where catagory = ? and isPub = 'true' limit 0,10"
        let result = await mySql(sqlStr,[cataId])
        res.json({
            status:'ok',
            content:'11111',
            data:Array.from(result)
        })
    } else{
        let sqlStr = "select * from news where catagory = ? and isPub = 'true' limit ?,10"
        let result = await mySql(sqlStr,[cataId,(page-1)*10])
        let sqlStr1 = "select * from role"
        let roleInfo = await mySql(sqlStr1)
        res.json({
            status:'ok',
            content:'11111',
            roleInfo:Array.from(roleInfo),
            data:Array.from(result)
        })
    }  
})

// 获取具体的新闻
// 接口 /index/api/news/newsidXX
router.get('/newsid:newsid',async (req, res)=>{
    let newsID = req.params.newsid;
    let sqlStr = "select * from news where newsID = ?"
    let newsInfo = await mySql(sqlStr,[newsID])
    let roleInfo = await mySql("select * from role")
    res.json({
        status:'ok',
        roleInfo:Array.from(roleInfo),
        newsInfo:Array.from(newsInfo)
    })
})

module.exports = router;