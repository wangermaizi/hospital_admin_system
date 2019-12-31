var express = require('express');
var router = express.Router();
let getTime = require('../../../public/js/common/getTime');
let mySql = require('../../../public/js/common/mysql');

router.get('/',async (req, res)=>{
    let sqlStr = "select * from news_catagory";
    let result = await mySql(sqlStr);
    console.log(result);
    // res.render('./admin/news/newslist.ejs')
});

// 以下关于文章管理
router.get('/manage',async (req, res)=>{
    let page = parseInt(req.query.page);
    page = page?page:1;
    console.log(page);
    let searchItem = req.query.search;
    if (searchItem != undefined){
        let str = "select * from news where title like ? or author like ? limit ? ,5";
        let result = await mySql(str,['%'+searchItem+'%','%'+searchItem+'%',(page-1)*5]);
        let allPage = await mySql("select count(*) as allpage from news where title like ? or author like ?",['%'+searchItem+'%','%'+searchItem+'%']);
        allPage = parseInt(allPage[0].allpage);
        let allnum = allPage;
        allPage = Math.ceil(allPage/5);
        let option = {
            newsInfo:Array.from(result),
            allPage,
            page,
            allnum,
            searchItem
        };
        res.render('./admin/news/article_manage.ejs',option)
    } else {
        let str = "select * from news limit ? ,5";
        let result = await mySql(str,[(page-1)*5]);
        let allPage = await mySql("select count(*) as allpage from news");
        allPage = parseInt(allPage[0].allpage);
        let allnum = allPage;
        allPage = Math.ceil(allPage/5);
        let option = {
            newsInfo:Array.from(result),
            allPage,
            page,
            allnum,
            searchItem
        };
        res.render('./admin/news/article_manage.ejs',option)
    }

});
router.post('/searchNews',async (req, res)=>{
    let page = parseInt(req.query.page);
    page = page?page:1;
    let str = "select * from news where title like ? or author like ? limit ? ,5";
    let searchItem = req.body.newsname;
    let result = await mySql(str,['%'+searchItem+'%','%'+searchItem+'%',(page-1)*5]);
    let allPage = await mySql("select count(*) as allpage from news where title like ? or author like ?",['%'+searchItem+'%','%'+searchItem+'%']);
    allPage = parseInt(allPage[0].allpage);
    let allnum = allPage;
    allPage = Math.ceil(allPage/5);
    let option = {
        newsInfo:Array.from(result),
        allPage,
        page,
        allnum,
        searchItem
    };
    res.render('./admin/news/article_manage.ejs',option)
});

// 文章管理-->删除文章
router.post('/delnews',async (req, res)=>{
    let delData = req.body['data[]'];
    delData.forEach(async (item,index)=>{
        let delSql = "DELETE FROM news where newsID = ?";
        await mySql(delSql,[item])
    });
    res.json({
        status:'ok',
        content:'内容删除成功'
    })
});
router.post('/singleDel',async (req,res)=>{
    let sqlStr = "delete from news where newsID = ?";
    await mySql(sqlStr,[req.body.id]);
    res.json({
        status:'ok',
        content:'内容删除成功'
    })
});

// 文章管理-->修改文章
router.get('/singleEdit',async (req,res)=>{
    let newsID = req.query.newsID;

    let catagoryID= req.query.catagoryID;

    if (newsID != undefined) {
        let sqlStr = "SELECT n.title,n.author,n.roleid,n.content,n.isPub,n.allowmen,c.catagory from news AS n INNER JOIN news_catagory AS c ON n.catagory = c.id WHERE newsID = ?;";
        let result = await mySql(sqlStr,[newsID]);
        let roleInfo = await mySql("select * from roleid");
        let cataInfo = await mySql("select * from news_catagory");
        let option = {
            roleInfo:Array.from(roleInfo),
            cataInfo:Array.from(cataInfo),
            newsInfo:result[0]
        };
        res.render('./admin/news/article_edit',option)
    } else if (catagoryID != undefined) {
        let sqlStr = "SELECT * from news_catagory where id = ?";
        let result = await mySql(sqlStr,[catagoryID]);
        let roleInfo = await mySql("select * from roleid");
        console.log(result);
        let option = {
            cataInfo:Array.from(result)[0],
            roleInfo:Array.from(roleInfo)
        };
        res.render('./admin/news/add_catagory',option)
    } else {
        res.json('神仙操作,可怕可怕')
    }

});
// 文章管理--添加文章
router.get('/addarticle',async (req,res)=>{
    let newsId = req.query.newsID;
    let roleInfo = await mySql("select * from roleid");
    let cataInfo = await mySql("select * from news_catagory");
    if (newsId == undefined) {
        let option = {
            roleInfo:Array.from(roleInfo),
            cataInfo:Array.from(cataInfo),
        };
        res.render('./admin/news/add_article',option)
    } else {
        let sqlStr = "select * from news where newsID = ?";
        let newsInfo = await mySql(sqlStr,[newsId]);
        let option = {
            roleInfo:Array.from(roleInfo),
            cataInfo:Array.from(cataInfo),
            newsInfo:Array.from(newsInfo)[0]
        };
        res.render('./admin/news/article_edit',option)
    }
});

// 文章管理--添加文化章进数据库
router.post('/addnews',async (req, res)=>{
    console.log(req.body);
    console.log(req.body.author);
    let author = req.body.author;
    let title = req.body.title;
    let catagoryID = req.body.catagory;
    let roleID = req.body.roleID;
    let content = req.body.content;
    let pubtime = getTime();
    let sqlStr = "insert into news (title,author,roleid,pubtime,content,catagory) values (?,?,?,?,?,?)";
    await mySql(sqlStr,[title,author,roleID,pubtime,content,catagoryID]);
    res.json({
        status:'ok',
        content:'内容已接收到'
    })
});


// 以下关于文章分类
router.get('/catagory',async (req,res)=>{
    let page = req.query.page;
    page = page?page:1;
    let sqlStr = "select * from news_catagory";
    let result = await mySql(sqlStr);
    let allPage = await mySql("select count(*) as allpage from news_catagory");
    let allNum = parseInt(allPage[0].allpage);
    allPage = Math.ceil(parseInt(allPage[0].allpage)/5);
    let option = {
        newsInfo:Array.from(result),
        allPage,
        page,
        allNum
    };
    res.render('./admin/news/news_catagory_list.ejs',option);
    // res.send('分页列表')
});
router.post('/catagory',async (req, res)=>{
    let search = req.body.cataname;
    let page = req.query.page;
    page = page?page:1;
    let sqlStr = "select * from news_catagory where catagory = ?";
    let result = await mySql(sqlStr,[search]);
    let allPage = await mySql("select count(*) as allpage from news_catagory");
    let allNum = parseInt(allPage[0].allpage);
    allPage = Math.ceil(parseInt(allPage[0].allpage)/5);
    let option = {
        newsInfo:Array.from(result),
        allPage,
        page,
        allNum
    };
    res.render('./admin/news/news_catagory_list.ejs',option);
});

//添加分类
router.get('/addcatagory',async (req, res)=>{
    let result = await mySql("select * from roleid");
    let option = {
        roleInfo:Array.from(result),
        cataInfo:null
    };
    res.render('./admin/news/add_catagory.ejs',option)
});

//修改分类
router.post('/addcatagory',async (req, res)=>{
    console.log(req.body);
    let catagoryname = req.body.catagoryname;
    let confirmtime = getTime();
    let author = req.body.author;
    let roleID = req.body.roleID;
    let insertSql = "insert into news_catagory (catagory,confirmTime,author,rolename) values (?,?,?,?)";
    await mySql(insertSql,[catagoryname,confirmtime,author,roleID]);
    res.send(`修改成功<script>var index = parent.layer.getFrameIndex(window.name);
            //关闭当前frame
            parent.layer.close(index);
            parent.location.reload()</script>`)
});


router.post('/catagory/delcatagory',async (req, res)=>{
    let id = req.body.id;
    let deleArr= req.body['data[]'];
    if (id != undefined) {
        let sqlStr = "DELETE from news_catagory where id = ?";
        await mySql(sqlStr,[id]);
        res.json({
            status:'ok',
            content:'内容删除成功'
        })
    } else if (deleArr != undefined) {
        if (typeof deleArr == 'string') {
            let sqlStr = "DELETE from news_catagory where id = ?";
            await mySql(sqlStr,[deleArr]);
            res.json({
                status:'ok',
                content:'内容删除成功'
            });
            res.json({
                status:'ok',
                content:'内容删除成功'
            })
        }else {
            deleArr.forEach(async (item,index)=>{
                let sqlStr = "DELETE from news_catagory where id = ?";
                await mySql(sqlStr,[id]);
                res.json({
                    status:'ok',
                    content:'内容删除成功'
                })
            })
        }

    } else {
        res.json({
            status:'444',
            content:'我透还能触发此操作,这是什么神仙玩意'
        })
    }

});

router.get('/newslist',(req, res)=>{
    /*var ipStr = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    // 获取到请求的IP地址
    console.log(ipStr);*/

    if (req.headers['user-agent'] == undefined) {
        // 阻止类似于node request 的爬取
        res.redirect('http://www.baidu.com')
    } else if (req.headers['user-agent'].indexOf('axios') != -1){
        // 阻止类似node axios 的爬取
        res.redirect('http://www.baidu.com')
    } else if (req.headers['user-agent'].indexOf('python') != -1) {
        // 阻止类似Python request的爬取
        res.redirect('http://www.baidu.com')
    } else if (req.headers['user-agent'].indexOf('Scrapy') != -1) {
        // 阻止类似Python Scrapy框架的爬取
        res.redirect('http://www.baidu.com')
    } else {
        res.json({
            status:'ok',
            content:'已接收到内容'
        });
    }

    // 开始尝试使用some方法
    // array.some(function(currentValue,index,arr),thisValue)
    /*let arr = ['axios',undefined,'Scrapy','python']
    arr.some((item,index,arr)=>{
        return
    })*/
});

// 监听新闻是否可以发布
router.post('/ispub',async (req, res)=>{
    let newsID = req.body.newsID;
    let isPub = req.body.isPub;
    let updataSql = "update news set isPub = ? where newsID = ?";
    await mySql(updataSql,[isPub,newsID]);
    res.json({status:'ok',content:'内容已修改'})
});

module.exports = router;