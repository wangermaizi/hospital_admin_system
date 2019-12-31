var express = require('express');
var router = express.Router();
const multipart = require('connect-multiparty');
let getTime = require('../../../public/js/common/getTime');
let mySql = require('../../../public/js/common/mysql');
let parseTime = require('../../../public/js/common/parseTime');
// 配置multer模块的信息
var multipartMiddleware = multipart();

const fs = require('fs');

router.get('/', async (req, res) => {
  let sqlStr = 'select * from news_catagory';
  let result = await mySql(sqlStr);
  // res.render('./admin/news/newslist.ejs')
});

// 以下关于文章管理
router.get('/manage', async (req, res) => {
  let page = parseInt(req.query.page);
  page = page ? page : 1;
  let searchItem = req.query.search;
  searchItem = searchItem == "" ?undefined:searchItem;
  let cid = req.query.cid;
  cid = cid == "" ?undefined:cid;
  let cataInfo = await mySql("select * from news_catagory");
  if (searchItem != undefined && cid == undefined) {
    let str =
      'select * from news INNER JOIN role ON news.roleid = role.id where title like ? or author like ? limit ? ,5';
    let result = await mySql(str, [
      '%' + searchItem + '%',
      '%' + searchItem + '%',
      (page - 1) * 5
    ]);
    let allPage = await mySql(
      'select count(*) as allpage from news INNER JOIN role ON news.roleid = role.id where title like ? or author like ?',
      ['%' + searchItem + '%', '%' + searchItem + '%']
    );
    allPage = parseInt(allPage[0].allpage);
    let allnum = allPage;
    allPage = Math.ceil(allPage / 5);
    let option = {
      newsInfo: Array.from(result),
      cataInfo:Array.from(cataInfo),
      allPage,
      page,
      allnum,
      searchItem,
      cid:cid,
      parseTime
    };
    res.render('./admin/news/article_manage.ejs', option);
  } else if (cid != undefined && searchItem != undefined) {
    let str =
        'select * from news INNER JOIN role ON news.roleid = role.id where (title like ? or author like ?) and catagory = ? limit ? ,5';
    let result = await mySql(str, [
      '%' + searchItem + '%',
      '%' + searchItem + '%',
      cid
      (page - 1) * 5
    ]);
    let allPage = await mySql(
        'select count(*) as allpage from news INNER JOIN role ON news.roleid = role.id where title like ? or author like ?',
        ['%' + searchItem + '%', '%' + searchItem + '%']
    );
    allPage = parseInt(allPage[0].allpage);
    let allnum = allPage;
    allPage = Math.ceil(allPage / 5);
    let option = {
      newsInfo: Array.from(result),
      cataInfo:Array.from(cataInfo),
      allPage,
      page,
      allnum,
      searchItem,
      cid,
      parseTime
    };
    res.render('./admin/news/article_manage.ejs', option);
  } else if (cid != undefined && searchItem == undefined){
    let str = 'select * from news INNER JOIN role ON news.roleid = role.id where news.catagory = ? order by newsID desc limit ? ,5';
    let result = await mySql(str, [cid,(page - 1) * 5]);
    let allPage = await mySql('select count(*) as allpage from news where news.catagory = ?',[cid]);
    allPage = parseInt(allPage[0].allpage);
    let allnum = allPage;
    allPage = Math.ceil(allPage / 5);
    let option = {
      newsInfo: Array.from(result),
      cataInfo:Array.from(cataInfo),
      allPage,
      page,
      allnum,
      searchItem,
      cid,
      parseTime
    };
    res.render('./admin/news/article_manage.ejs', option);
  }
  else {
    let str = 'select * from news INNER JOIN role ON news.roleid = role.id order by newsID desc limit ? ,5';
    let result = await mySql(str, [(page - 1) * 5]);
    let allPage = await mySql('select count(*) as allpage from news');
    allPage = parseInt(allPage[0].allpage);
    let allnum = allPage;
    allPage = Math.ceil(allPage / 5);
    console.log(result);
    let option = {
      newsInfo: Array.from(result),
      cataInfo:Array.from(cataInfo),
      allPage,
      page,
      allnum,
      searchItem:undefined,
      cid:undefined,
      parseTime
    };
    res.render('./admin/news/article_manage.ejs', option);
  }
});

// 搜索新闻文章
router.post('/searchNews', async (req, res) => {
  let page = parseInt(req.query.page);
  page = page ? page : 1;
  let pid = req.query.cid;
  pid = pid?pid:null;
  let str = 'select * from news INNER JOIN role ON news.roleid = role.id where title like ? or author like ? limit ? ,5';
  let cataInfo = await mySql("select * from news_catagory");
  let searchItem = req.body.newsname;
  let result = await mySql(str, [
    '%' + searchItem + '%',
    '%' + searchItem + '%',
    (page - 1) * 5
  ]);
  let allPage = await mySql(
    'select count(*) as allpage from news where title like ? or author like ?',
    ['%' + searchItem + '%', '%' + searchItem + '%']
  );
  allPage = parseInt(allPage[0].allpage);
  let allnum = allPage;
  allPage = Math.ceil(allPage / 5);
  let option = {
    newsInfo: Array.from(result),
    cataInfo:Array.from(cataInfo),
    allPage,
    page,
    allnum,
    searchItem,
    cid:pid,
    parseTime
  };
  res.render('./admin/news/article_manage.ejs', option);
});

// 文章管理-->删除文章
router.post('/delnews', async (req, res) => {
  let delData = req.body['data[]'];
  if (typeof delData == 'string') {
    delData = [delData];
  }
  delData.forEach(async (item, index) => {
    let delSql = 'DELETE FROM news where newsID = ?';
    await mySql(delSql, [item]);
  });
  res.json({
    status: 'ok',
    content: '内容删除成功'
  });
});
router.post('/singleDel', async (req, res) => {
  let sqlStr = 'delete from news where newsID = ?';
  await mySql(sqlStr, [req.body.id]);
  res.json({
    status: 'ok',
    content: '内容删除成功'
  });
});

// 文章管理-->修改文章
router.get('/singleEdit', async (req, res) => {
  let newsID = req.query.newsID;
  let catagoryID = req.query.catagoryID;
  if (newsID != undefined) {
    let sqlStr =
      'SELECT n.title,n.author,n.roleid,n.content,n.isPub,n.allowmen,c.catagory from news AS n INNER JOIN news_catagory AS c ON n.catagory = c.id WHERE newsID = ?;';
    let result = await mySql(sqlStr, [newsID]);
    let roleInfo = await mySql('select * from roleid');
    let cataInfo = await mySql('select * from news_catagory');
    let option = {
      roleInfo: Array.from(roleInfo),
      cataInfo: Array.from(cataInfo),
      newsInfo: result[0]
    };
    res.render('./admin/news/article_edit', option);
  } else if (catagoryID != undefined) {
    let sqlStr = 'SELECT * from news_catagory where id = ?';
    let result = await mySql(sqlStr, [catagoryID]);
    let roleInfo = await mySql('select * from roleid');
    let option = {
      cataInfo: Array.from(result)[0],
      roleInfo: Array.from(roleInfo)
    };
    res.render('./admin/news/add_catagory', option);
  } else {
    res.json('神仙操作,可怕可怕');
  }
});
// 文章管理--添加文章
router.get('/addarticle', async (req, res) => {
  let newsId = req.query.newsID;
  let roleInfo = await mySql('select * from role');
  let cataInfo = await mySql('select * from news_catagory');
  if (newsId == undefined) {
    let option = {
      roleInfo: Array.from(roleInfo),
      cataInfo: Array.from(cataInfo)
    };
    res.render('./admin/news/add_article', option);
  } else {
    let sqlStr = 'select * from news inner JOIN news_catagory ON news.catagory = news_catagory.id where news.newsID = ?';
    let newsInfo = await mySql(sqlStr, [newsId]);
    let option = {
      roleInfo: Array.from(roleInfo),
      cataInfo: Array.from(cataInfo),
      newsInfo: Array.from(newsInfo)[0]
    };
    res.render('./admin/news/article_edit', option);
  }
});

// 文章管理--添加文章进入数据库
router.post('/addnews', async (req, res) => {
  let title = req.body.title;
  let catagoryID = req.body.catagory;
  let author = req.session.username;
  let roleid = await mySql("select * from user where username = ?",[author]);
  roleid = Array.from(roleid)[0].roleid;
  let content = req.body.content;
  let pubtime = getTime();
  let headImg = req.body.headImg;
  headImg = headImg?headImg:null;
  let sqlStr =
    'insert into news (title,author,roleid,pubtime,content,catagory,headImg) values (?,?,?,?,?,?,?)';
  await mySql(sqlStr, [title, author, roleid, pubtime, content, catagoryID,headImg]);
  res.send(`修改成功<script>var index = parent.layer.getFrameIndex(window.name);
            //关闭当前frame
            parent.layer.close(index);
            parent.location.reload()</script>`);
});

// 以下关于文章分类
router.get('/catagory', async (req, res) => {
  let page = req.query.page;
  page = page ? page : 1;
  let sqlStr = 'select * from news_catagory';
  let result = await mySql(sqlStr);
  let allPage = await mySql('select count(*) as allpage from news_catagory');
  let allNum = parseInt(allPage[0].allpage);
  allPage = Math.ceil(parseInt(allPage[0].allpage) / 5);
  let option = {
    newsInfo: Array.from(result),
    allPage,
    page,
    allNum,
    parseTime
  };
  res.render('./admin/news/news_catagory_list.ejs', option);
  // res.send('分页列表')
});

router.post('/catagory', async (req, res) => {
  let search = req.body.cataname;
  let page = req.query.page;
  page = page ? page : 1;
  let sqlStr = 'select * from news_catagory where catagory = ?';
  let result = await mySql(sqlStr, [search]);
  let allPage = await mySql('select count(*) as allpage from news_catagory');
  let allNum = parseInt(allPage[0].allpage);
  allPage = Math.ceil(parseInt(allPage[0].allpage) / 5);
  let option = {
    newsInfo: Array.from(result),
    allPage,
    page,
    allNum,
    parseTime
  };
  res.render('./admin/news/news_catagory_list.ejs', option);
});

//添加分类
router.get('/addcatagory', async (req, res) => {
  let result = await mySql('select * from role');
  let option = {
    roleInfo: Array.from(result),
    cataInfo: null
  };
  res.render('./admin/news/add_catagory.ejs', option);
});

//修改分类
router.post('/addcatagory', async (req, res) => {
  let catagoryname = req.body.catagoryname;
  let confirmtime = getTime();
  let author = req.body.author;
  let roleID = req.body.roleID;
  let insertSql =
    'insert into news_catagory (catagory,confirmTime,author,rolename) values (?,?,?,?)';
  await mySql(insertSql, [catagoryname, confirmtime, author, roleID]);
  res.send(`修改成功<script>var index = parent.layer.getFrameIndex(window.name);
            //关闭当前frame
            parent.layer.close(index);
            parent.location.reload()</script>`);
});

router.post('/catagory/delcatagory', async (req, res) => {
  let id = req.body.id;
  let deleArr = req.body['data[]'];
  if (id != undefined) {
    let sqlStr = 'DELETE from news_catagory where id = ?';
    await mySql(sqlStr, [id]);
    res.json({
      status: 'ok',
      content: '内容删除成功'
    });
  } else if (deleArr != undefined) {
    if (typeof deleArr == 'string') {
      let sqlStr = 'DELETE from news_catagory where id = ?';
      await mySql(sqlStr, [deleArr]);
      res.json({
        status: 'ok',
        content: '内容删除成功'
      });
      res.json({
        status: 'ok',
        content: '内容删除成功'
      });
    } else {
      deleArr.forEach(async (item, index) => {
        let sqlStr = 'DELETE from news_catagory where id = ?';
        await mySql(sqlStr, [id]);
        res.json({
          status: 'ok',
          content: '内容删除成功'
        });
      });
    }
  } else {
    res.json({
      status: '444',
      content: '我透还能触发此操作,这是什么神仙玩意'
    });
  }
});

router.get('/newslist', (req, res) => {
  /*var ipStr = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    // 获取到请求的IP地址
    console.log(ipStr);*/

  if (req.headers['user-agent'] == undefined) {
    // 阻止类似于node request 的爬取
    res.redirect('http://www.baidu.com');
  } else if (req.headers['user-agent'].indexOf('axios') != -1) {
    // 阻止类似node axios 的爬取
    res.redirect('http://www.baidu.com');
  } else if (req.headers['user-agent'].indexOf('python') != -1) {
    // 阻止类似Python request的爬取
    res.redirect('http://www.baidu.com');
  } else if (req.headers['user-agent'].indexOf('Scrapy') != -1) {
    // 阻止类似Python Scrapy框架的爬取
    res.redirect('http://www.baidu.com');
  } else {
    res.json({
      status: 'ok',
      content: '已接收到内容'
    });
  }
});

// 监听新闻是否可以发布
router.post('/ispub', async (req, res) => {
  let newsID = req.body.newsID;
  let isPub = req.body.isPub;
  let updataSql = 'update news set isPub = ? where newsID = ?';
  await mySql(updataSql, [isPub, newsID]);
  res.json({ status: 'ok', content: '内容已修改' });
});

// 监听新闻发布图片
router.post('/upLoad',multipartMiddleware,async (req, res)=>{
  console.log(req.files.newsPicture);
  let fileObj = req.files.newsPicture;
  let oldPath = fileObj.path;
  let oldName = oldPath.split('\\')[2];
  let newName = fileObj.name.split('.')[0]+oldName;
  console.log('/public/upLoad/'+oldName);
  console.log('/public/upLoad/'+newName);
  await rename('./public/upLoad/'+oldName,'./public/upLoad/'+newName);
  res.json({
     "errno": 0,
    "data": [
      '/upLoad/'+newName
    ],
  })
});

function rename(oldpathname,newpathname){
  return new Promise((resolve, reject) => {
    fs.rename(oldpathname,newpathname,err=>{
      if (err) {
        reject()
      } else {
        resolve('重命名成功')
      }
    })
  })
}

module.exports = router;
