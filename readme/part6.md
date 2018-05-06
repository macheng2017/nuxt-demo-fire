# 爬取数据

使用爬虫爬取冰火之歌的数据

总共分为两大部分

1. 家族数据
2. 角色数据

https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast

在sever下面新建一个爬虫 crawler



使用es6语法

先设置/start.js便于测试时使用es6语法

```js
require('./server/crawler/imdb')
```


```js
import cheerio from 'cheerio'
import rp from 'request-promise'

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    transform: body => cheerio.load(body)
  }
  const $ = await rp(options)
  // 通过选择器
  console.log($('table.cast_list tr.odd, tr.even').length)
}

getIMDBCharacters()
```

https://github.com/cheeriojs/cheerio

https://github.com/request/request-promise

### 测试

爬取数据的时候我们刚刚修改了
配置文件

start.js 

所以我们可以直接使用 
node start来运行测试

爬取数据一定要耐心

爬取数据可能会出错或者残缺
1. 在本地配置代理翻墙
2. 配置socket

### 首先确定自己需要什么数据

1. 演员的名字,角色的名字,cmid nmid




```js
import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
// import Agent from 'socks5-http-client/lib/Agent'

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'http://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // },
    transform: body => cheerio.load(body)
  }

  // 通过选择器拿到数据
  // 遍历数据
  let photos = []
  const $ = await rp(options)
  $('table.cast_list tr.odd, tr.even').each(function () {
    // 当前dom节点上的id
    const nmIdDom = $(this).find('td.itemprop a')
    // 拿到url
    const nmId = nmIdDom.attr('href')

    const characterDom = $(this).find('td.character a')
    const name = characterDom.text()
    const chId = characterDom.attr('href')
    // console.log(' chId ' + chId)

    const playedByDom = $(this).find('td.itemprop span.itemprop')
    const playedBy = playedByDom.text()
    // 得到原始数据
    photos.push({
      nmId,
      chId,
      name,
      playedBy
    })
  })
  console.log('拿到多少条数据? ' + photos.length)
// 通过ramda 将

  const fn = R.compose(
// 6. 再过滤一遍,将不符合要求的数据过滤出去
  R.filter(photo => photo.playedBy && photo.name && photo.nmId && photo.chId !== '#'),
// 3. 过滤整条数据之后,通过map遍历数据
  R.map(photo => {
// 5. 构建一个正则,将cmid拿出来
    const reg1 = /\/name\/(.*?)\/\?ref/
    const reg2 = /\/title\/tt0944947\/characters\/(.*?)\?ref/
    console.log(' reg1 ' + reg1)
    console.log(' reg2 ' + reg2)
    console.log(' nmId ' + photo.nmId)
    console.log(' chId ' + photo.chId)
    const match1 = photo.nmId.match(reg1)
    const match2 = photo.chId.match(reg2)
    console.log(' match1 ' + match1)
    console.log(' match2 ' + match2)

    photo.nmId = match1[1]
    if (match2) {
      photo.chId = match2[1]
    }
    // 4. 最终返回的还是photo
    return photo
  }),
// 1. 先倒着写,通过filter拿到push到photo上的元数据,确定下数据是否完整
// 2. 只有当4个字段都有,才会将数据进行分析,如果字段不全则丢掉这条数据
// 通过R.compose可以倒着实现流程,最右边函数的结果就是左边函数的输入
  R.filter(photo => photo.playedBy && photo.name && photo.nmId && photo.chId)
)
  photos = fn(photos)
  console.log('清洗后剩余多少条数据? ' + photos.length)
  // 将数据写到本地
  fs.writeFileSync('./imdb.json', JSON.stringify(photos, null, 2), 'utf8')
}

getIMDBCharacters().catch(err => console.log(err))
```






如果本地获取数据太慢的话可以使用代理
https://github.com/mattcg/socks5-http-client

```js
import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
// import Agent from 'socks5-http-client/lib/Agent'

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 1080
    // },
    transform: body => cheerio.load(body)
  }

```

### 这个正则表达式真坑啊

* 看清楚取得的URI一个是nm1043031/?ref 一个是characters/nm1043031?ref
 nmId /name/nm1043031/?ref_=ttfc_fc_cl_t111
 chId /title/tt0944947/characters/nm1043031?ref_=ttfc_fc_cl_t111
* 还有最后一个多了个#号的href 加上判断

总结: 还是RSA 简单的原则自己都做不到
* 第一步都没做好 确实读懂报错了吗? 确实读懂log信息了吗? 确实逐字逐句读了吗?
* 两句话真的没有区别吗?
* 字母和符号都检查了吗?
* 单词拼写都检查了吗?
* 语法都检查了吗?


### 另外一个网站的数据

https://anapioficeandfire.com/

位置 /server/crawler/api.js
复制imdb.js修改

```js
// import cheerio from 'cheerio'
import rp from 'request-promise'
import _ from 'lodash'
import fs from 'fs'
let characters = []

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
export const getAPICharacters = async(page = 1) => {
  const url = `http://www.anapioficeandfire.com/api/characters?page=${page}&pageSize=50`
    // 返回的是json数据不需要对页面进行dom分析
  console.log('正在爬第 ' + page + ' 页数据')
  let body = await rp(url)
  body = JSON.parse(body)
  console.log('爬到  ' + body.length + ' 条数据')
  // 拼接数组的数据
  characters = _.union(characters, body)
  console.log('现有  ' + characters.length + ' 条数据')
  // 如果数据小于50则停止
  if (body.length < 50) {
    console.log('爬完了')
    return
  } else {
    // 将数据写到本地,设置为追加模式
    fs.writeFileSync('./characters.json', JSON.stringify(characters, null, 2), 'utf8')
    // 间歇时间
    await sleep(1000)
    page++
    getAPICharacters(page).catch(err => console.log(err))
  }
}

getAPICharacters().catch(err => console.log(err))
```


https://www.cnblogs.com/chyingp/p/node-guide-file-write.html


测试 

start.js
```js
// require('./server/crawler/imdb')
require('./server/crawler/api')
```


## 校对
```js
import { resolve } from 'path'
import R from 'ramda'
import { find } from 'lodash'
import { writeFileSync } from 'fs'

// 比对爬到的数据
const characters = require(resolve(__dirname, '../../characters.json'))
const IMDbData = require(resolve(__dirname, '../../imdb.json'))
// 定义比对规则
const findNameInAPI = (item) => {
  return find(characters, {
    name: item.name
  })
}
// 同一个角色,在不同的年龄段有不同的扮演者,在API中playedBy是一个数组
const findPlayedByInAPI = (item) => {
  return find(characters, i => {
    return i.playedBy.includes(item.playedBy)
  })
}

const validData = R.filter(
  // 比对imdb的名字,在不在另外爬到的api里面,如果在就是合法的
  i => findNameInAPI(i) && findPlayedByInAPI(i)
)

const IMDb = validData(IMDbData)

// 把文件写到本地
writeFileSync('./wikiCharacters.json', JSON.stringify(IMDb, null, 2), 'utf8')


```
https://lodash.com/docs/4.17.10#find
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
http://ramda.cn/docs/#filter

## 爬取头像信息

分析需要爬取的图片位置,由于imdb网站改版,需要重新对演员的图片位置定位分析

https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast

第一个演员的角色图片
我们只要获取本页面中photos第一张图片地址即可
https://www.imdb.com/title/tt0944947/characters/nm0227759?ref_=ttfc_fc_cl_t1


https://ia.media-imdb.com/images/M/MV5BODI3ODA5NTQ5OF5BMl5BanBnXkFtZTgwODkzODMzMzI@._V1_SY100_CR25,0,100,100_AL_.jpg

去掉限制参数

https://ia.media-imdb.com/images/M/MV5BODI3ODA5NTQ5OF5BMl5BanBnXkFtZTgwODkzODMzMzI@.jpg


位置imdb.js

## 新增爬取头像的方法

```js
import { resolve } from 'path'
const fetchIMDbProfile = async (url) => {
  // 5.structure options object
  // 6.copy options object code of the example above
  const options = {
    uri: url,
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // },
    transform: body => cheerio.load(body)
  }
  // 7.Node that the following is identical in meaning to the example above
  const $ = await rp(options)
  // 8.for example, will you get that element for <a></a> such as
  const img = $('a[class="titlecharacters-image-grid__thumbnail-link"] img')
  // 9.declare the src
  let src = img.attr('src')
  // 10.decide this src make sure that is not null && empty
  if (src) {
    //  split string up into several part  whit '_v1'
    // The shift() method removes the first element from an array and returns that removed element.
    // This method changes the length of the array
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    src = src.split('_V1').shift()
    src += '_V1.jpg'
  }
  return src
}
const sleep = time => new Promise(resolve => setTimeout(resolve, time))
// 1新增爬取头像的方法
export const getIMDbProfile = async () => {
  // 2 遍历数据
  const characters = require(resolve(__dirname, '../../imdb.json'))
  console.log('characters.length ' + characters.length)
  // for (let i = 0; i < 2; i++) { use length with 2 test prevent blacklist
  for (let i = 0; i < characters.length; i++) {
    // 3判断这个对象如果没有profile,则添加
    if (!characters[i].profile) {
      // 4构建url的请求地址,也就是角色主页
      const url = `https://www.imdb.com/title/tt0944947/characters/${characters[i].chId}`
      console.log('crawling... ' + characters[i].name)
      // 5 request the url and fetch data
      const src = await fetchIMDbProfile(url)
      console.log('crawled ' + src)
      // 11 save the avatar of fetch the data
      characters[i].profile = src

      fs.writeFileSync('./imdbCharacters.json', JSON.stringify(characters, null, 2), 'utf8')
      await sleep(500)
    }
  }
}


```
## add check avatar function 

```js
// check the profile avatar
const checkIMDbProfile = () => {
  // NOTE: use imdb.json instead of wikitCharacters.json that is empty
  const characters = require(resolve(__dirname, '../../imdbCharacters.json'))
  const newCharacters = []
  characters.forEach((item) => {
    // if (!item.profile) {
    //   console.log(item.name)
    // }
    if (item.profile) {
      newCharacters.push(item)
    }
    // push characters with profile filed in new file
  })
  fs.writeFileSync('./validCharacters.json', JSON.stringify(newCharacters, null, 2), 'utf8')
}
checkIMDbProfile()
```

###  add fetch the photos of character function

**copy code of above example function**

```js
export const getIMDbImages = async () => {
  // 2 遍历数据
  const characters = require(resolve(__dirname, '../../validCharacters.json'))
  console.log('characters.length ' + characters.length)
  // use length with 2 test prevent blacklist
  // for (let i = 0; i < 2; i++) {
  for (let i = 0; i < characters.length; i++) {
    // 3判断这个对象如果没有profile,则添加
    if (!characters[i].images) {
      // 4构建url的请求地址,也就是角色主页
      const url = `https://www.imdb.com/title/tt0944947/characters/${characters[i].chId}`
      console.log('crawling... ' + characters[i].name)
      // 5 request the url and fetch data
      const images = await fetchIMDbImages(url)
      console.log('crawled ' + images.length)
      // 11 save the avatar of fetch the data
      characters[i].images = images

      fs.writeFileSync('./fullCharacters.json', JSON.stringify(characters, null, 2), 'utf8')
      await sleep(500)
    }
  }
}

const fetchIMDbImages = async (url) => {
  // 5.structure options object
  // 6.copy options object code of the example above
  const options = {
    uri: url,
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // },
    transform: body => cheerio.load(body)
  }
  // 7.Node that the following is identical in meaning to the example above
  const $ = await rp(options)
  let images = []
  // 8.for example, will you get that element for <a></a> such as
  $('a[class="titlecharacters-image-grid__thumbnail-link"] img').each(function () {
    // 9.declare the src
    let src = $(this).attr('src')
    // 10.decide this src make sure that is not null && empty
    if (src) {
      //  split string up into several part  whit '_v1'
      // The shift() method removes the first element from an array and returns that removed element.
      // This method changes the length of the array
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
      src = src.split('_V1').shift()
      src += '_V1.jpg'
      images.push(src)
    }
  })
  return images
}
getIMDbImages()
```


## fetch the data for article

http://www.wikia.com/api/v1/


http://zh.asoiaf.wikia.com/api/v1/Search/List?query=Tywin%20Lannister


根据上面的url查询到的id 查询角色详细信息

http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=244


对上面的两份数据进行整合


### add wiki.js

```js

import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'
import _ from 'lodash'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
// 这个函数需要先弄懂_.reduce是什么意思
// 然后  R.concat()
const normalizedContent = content => _.reduce(content, (acc, item) => {
  // 进行迭代,判断每条数据有没有这个text 如果有的话
  if (item.text) {
    // 将内容push进去
    acc.push(item.text)
  }
  if (item.elements && item.elements.length) {
    // 如果里面还有数组的对象嵌套,还要将其数据拿出来
    let _acc = normalizedContent(item.elements)
    acc = R.concat(acc, _acc)
  }
  return acc
}, [])

const normalizedSections = R.compose(
  R.nth(1),
  R.splitAt(1),
  R.map( i => ({
    level: i.level,
    title: i.title,
    content: normalizedContent(i.content)
  }))
)
const getWikiId = async data => {
  const query = data.name || data.cname
  const url = `http://zh.asoiaf.wikia.com/api/v1/Search/List?query=${encodeURI(query)}`
  // request maybe break
  let res
  try {
    res = await rp(url)
  } catch (e) {
    console.log(e)
  }

  res = JSON.parse(res)
  res = res.items[0]
  console.log(res.id)

  return R.merge(data, res)
}
const getWikiDetail = async data => {
  const { id } = data
  const url = `http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`
  // request maybe break
  let res
  try {
    res = await rp(url)
  } catch (e) {
    console.log(e)
  }

  res = JSON.parse(res)
  // 接下来将数据结构打平,清洗一些不需要的数据,重新生成一个json

  const getCNameAndIntro = R.compose(
    // 5.重新构建json对象,拿到之后将参数传入进去,参数是一个数组,整个数组作为参数传给一个function,里面是一个对象,
    // 对象返回两个字段 cname
    i => ({
      cname: i.title,
      intro: R.map(R.prop(['text']))(i.content)
    }),

    // 4. 挑选出title,content字段
    R.pick(['title', 'content']),
    // 3. 把过滤后的数据第一条拿出来
    R.nth(0),
    // 2. 筛选出level 值为1的数据
    R.filter(R.propEq('level', 1)),
    // 1. 将原始对象中的,sections属性取出
    R.prop('sections')
  )

  const getLevel = R.compose(
    R.project(['title', 'content', 'level']),
    R.reject(R.propEq('title', '扩展阅读')),
    R.reject(R.propEq('title', '引用与注释')),
    R.filter(i => i.content.length),
    R.prop('sections')
  )

  const cnameIntro = getCNameAndIntro(res)
  let sections = getLevel(res)
  // 初始的body
  let body = R.merge(data, getCNameAndIntro(res))
  // 重新设置sections 对数据进行深层的遍历
  sections = normalizedSections(sections)

  body.sections = sections
  body.wikiId = id
// 返回打平的数据
  return R.pick(['name', 'cname', 'playedBy', 'profile', 'images', 'nmId', 'chId', 'sections', 'intro', 'wikiId', 'words'], body)
}

export const getWikiCharacters = async () => {
  // 引入做过清理的imdb的数据

  let data = require(resolve(__dirname, '../../fullCharacters.json'))
// 测试不要一次测试所有数据,预防ip被封
  data = [data[0], data[1]]

  console.log(data.length)

  data = R.map(getWikiId, data)
  // 通过R.map构建了很多个异步的请求,等所有的请求都执行完毕之后就拿到了所有人的id
  // Promise.all 的执行方式是传入一个函数数组,里面的值最终都返回promise对象,
  // 在传入的promise中按照执行最慢的回调函数返回统一结果,返回结果是一个数组
  console.log('获取wiki id' + data[0])

  data = await Promise.all(data)

  data = R.map(getWikiDetail, data)
  console.log('获取wiki 详细资料' + data[0])
  data = await Promise.all(data)
  // 最后将文件写入本地
  fs.writeFileSync('./finalCharacters.js', JSON.stringify(data, null, 2), 'utf8')
}

getWikiCharacters()
// p57bh6q88.bkt.clouddn.com 测试域名
// minipro.spzwl.com


```



http://www.cnblogs.com/lvdabao/p/es6-promise-1.html

http://www.css88.com/doc/lodash/#_reducecollection-iteratee_identity-accumulator

### 测试
修改位置 /start.js
require('./server/crawler/wiki')

```js
// 测试不要一次测试所有数据,预防ip被封
  data = [data[0], data[1]]
```


// p57bh6q88.bkt.clouddn.com 测试域名
// minipro.spzwl.com

## 使用七牛云图床

配置 config/index.js


```js

export default {
  db: 'mongodb://localhost/ice',
  SITE_ROOT_URL: 'http://vuespz.viphk.ngrok.org',
  wechat: {
    // 这里面内容比较多token, key...
    appID: 'wxf5aeebc328524308',
    appSecret: '5b57ba61c806ce50f5d074fc81ddcb29',
    token: 'Vcqwqc3uQCR4LMD2'
  },
  'qiniu': {
    'AK': 'rvMb2GJrTE5b74_F1TZyNrAbcTG1XQnAaLJZXyJ-',
    'SK': 'j9fh9KCdCMW9_e5q032VnQgbt2RcWAx5kZV5AZFz'
  }
}
```

### 使用七牛的sdk上传图片

增加 server/libs/qiniu.js


https://developer.qiniu.com/kodo/sdk/3828/node-js-v6


```js
import qiniu from 'qiniu'
import config from '../config'

qiniu.config.ACCESS_KEY = config.qiniu.AK
qiniu.config.SECRET_KEY = config.qiniu.SK

const bucket = 'gotice'

export const fetchImage = async(url, key) => {
  const  client = new qiniu.rs.Client()
  // promise 封装下
  return new Promise((resolve, reject) => {
    client.fetch(url, bucket, key, (err, ret) => {
      if (err) reject(err)
      else resolve(ret)
    })
  })
}
```
修改 wiki.js

```js
import { fetchImage } from '../libs/qiniu'
import randomToken from 'random-token'


export const fetchImageFromIMDb = async () => {
  let IMDbCharacters = require(resolve(__dirname, '../../finalCharacters.json'))
  // 测试 先使用一个对象测试下代码
  // IMDbCharacters = [IMDbCharacters[0]]
  // 遍历
  IMDbCharacters = R.map(
    async item => {
      try {
        let key = `${item.nmId}/${randomToken(32)}`
        // fetch avatar
        await fetchImage(item.profile, key)
        console.log(item.profile)
        console.log(key)
        console.log('upload done!')
        // replace url of qiniu server with in item.profile
        item.profile = key
        // upload stage photo on the qiniu server
        // 长度改为2 比较快的加载到图片
        // for (let i = 0; i < 2; i++) {
        for (let i = 0; i < item.images.length; i++) {
          let _key = `${item.nmId}/${randomToken(32)}`
          await fetchImage(item.images[i], _key)
          console.log(item.images[i])
          console.log(_key)
          // waiting for 100 ms
          await (100)
          // replace url of qiniu server created with in item.images
          item.images[i] = _key
        }
      } catch (e) {
        console.log(e)
      }
      return item
    }
  )(IMDbCharacters)

  IMDbCharacters = await Promise.all(IMDbCharacters)

  // write the file into the local hardDisk

  fs.writeFileSync('./complateCharacters.json', JSON.stringify(IMDbCharacters, null, 2), 'utf8')
}

fetchImageFromIMDb()


```


## 使用sdk抓取url
https://developer.qiniu.com/kodo/sdk/1289/nodejs#5
https://developer.qiniu.com/kodo/sdk/1289/nodejs#rs-fetch

## 使用qshell方式 抓取url的图片
### 安装shell
https://developer.qiniu.com/kodo/tools/1302/qshell

// 需要把shell安装到全局
// npm i qshell -g
### 配置shell

qshell account rvMb2GJrTE5b74_F1TZyNrAbcTG1XQnAaLJZXyJ- j9fh9KCdCMW9_e5q032VnQgbt2RcWAx5kZV5AZFz


```js
// import qiniu from 'qiniu'
// import config from '../config'
import { exec } from 'shelljs'

// qiniu.config.ACCESS_KEY = config.qiniu.AK
// qiniu.config.SECRET_KEY = config.qiniu.SK
// 存储空间名称
const bucket = ' miniprogram'
// https://developer.qiniu.com/kodo/sdk/1289/nodejs#5
// 资源管理相关的操作首先要构建BucketManager对象：
// var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
// var config = new qiniu.conf.Config()
// // config.useHttpsDomain = true
// // 华东地区的空间qiniu.zone.Zone_z0
// config.zone = qiniu.zone.Zone_z0
// var bucketManager = new qiniu.rs.BucketManager(mac, config)

export const fetchImage = async(url, key) => {
  // const client = new qiniu.rs.Client()
  // promise 封装下
  return new Promise((resolve, reject) => {
    // client.fetch(url, bucket, key, (err, ret) => {
    //   if (err) reject(err)
    //   else resolve(ret)
    // })
  // 使用七牛的shell 脚本
    const bash = `qshell fetch ${url} ${bucket} ${key}`
    // execute shell
    const child = exec(bash, {async: true})

    child.stdout.on('data', data => {
      console.log(data)
      resolve(data)
    })
  })
}
// 需要把shell安装到全局
// npm i qshell -g
```

minipro.spzwl.com/nm0227759/34kilrrsw6t8yue9wzpmb4u4rqzjubj7


## 由于家族数量太多,将主要家族放上即可


在爬家族数据之前,先罗列出需要爬取那些家族信息
位置 crawler/wiki.js

```js

const HOUSES = [
  {
    name: 'House Stark of Winterfell',
    cname: '史塔克家族',
    words: 'Winter is Coming'
  },
  {
    name: 'House Targaryen',
    cname: '坦格利安家族',
    words: 'Fire and Blood'
  },
  {
    name: 'House Lannister of Casterly Rock',
    cname: '兰尼斯特家族',
    words: 'Hear Me Roar!'
  },
  {
    name: 'House Arryn of the Eyrie',
    cname: '艾林家族',
    words: 'As High as Honor'
  },
  {
    name: 'House Tully of the Riverrun',
    cname: '徒利家族',
    words: 'Family, Duty, Honor'
  },
  {
    name: 'House Greyjoy of Pyke',
    cname: '葛雷乔伊家族',
    words: 'We Do Not Sow'
  },
  {
    name: "House Baratheon of Storm's End",
    cname: '风息堡的拜拉席恩家族',
    words: 'Ours is the Fury'
  },
  {
    name: 'House Tyrell of Highgarden',
    cname: '提利尔家族',
    words: 'Growing Strong'
  },
  {
    name: 'House Nymeros Martell of Sunspear',
    cname: '马泰尔家族',
    words: 'Unbowed, Unbent, Unbroken'
  }
]


```

获取家族数据和获取个人数据的方法是一样的,拿到wikiId 根据wikiId,拿到详细信息,然后打平整理出来就是家族数据了


```js


export const getHouses = async () => {
    // 获取wikiId 返回一个数组 全是promise请求
  let data = R.map(getWikiId, HOUSES)

  // 把所有异步动作全部跑一遍,并且依据最慢的一个返回一个数组
  data = await Promise.all(data)
  // 获取详细的信息
  data = R.map(getWikiDetail, data)
  data = await Promise.all(data)
  fs.writeFileSync('./wikiHouses.json', JSON.stringify(data, null, 2), 'utf8')
}

getHouses()

```
## 关联家族数据与主要人物数据


用爬取的成员 去匹配 伊耿历三世纪末的成员

```js
export const getSwornMembers = () => {
  let houses = require(resolve(__dirname, '../../wikiHouses.json'))
  let characters = require(resolve(__dirname, '../../complateCharacters.json'))
  // 通过map可以拿到一份数据经过分析改造后的数据
  const findSwornMembers = R.map(
    R.compose(
      // 将所有的数据都拼接到一个数组中
      i => _.reduce(i, (acc, item) => {
        acc = acc.concat(item)
        return acc
      }, []),
      // 将过滤之后的数据粘合起来
      R.map(i => {
        let item = R.find(R.propEq('cname', i[0]))(characters)
        return {
          character: item.nmId,
          text: i[1]
        }
      }),
      // 7比对是否是列表中的数据,看一下人物名称是否在列表中
      R.filter(item => R.find(R.propEq('cname', item[0]))(characters)),
      R.map(i => {
        let item = i.split('，')
        let name = item.shift()
        return [name.replace(/(【|】|爵士|一世女王|三世国王|公爵|国王|王后|夫人|公主|王子)/g, ''), item.join(',')]
      }),
      // 6 第一句是废话不要
      R.nth(1),
      // 5在指定索引为1截断成两个数组
      R.splitAt(1),
      // 4取出content
      R.prop('content'),
      // 3取出数组中第一条数据
      R.nth(0),
      // 2过滤出title含有关键字的,返回一个数组
      R.filter(i => R.test(/伊耿历三世纪末的/, i.title)),
      // 1取出sections
      R.prop('sections')
    )
  )

  let swornMembers = findSwornMembers(houses)

  houses = _.map(houses, (item, index) => {
    item.swornMembers = swornMembers[index]

    return item
  })
  fs.writeFileSync('./completeHouses.json', JSON.stringify(houses, null, 2), 'utf8')
}

getSwornMembers()

```


## 数据入库


path : server/database/schema/wikiHouse.js

copy ./token.js code to wikiHouse.js

```js
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed

const WikiHouseSchema = new Schema({
  name: String,
  cname: String,
  works: String,
  intro: String,
  cover: String,
  wikiId: Number,
  sections: Mixed, // 混合类型
  swornMembers: [ // 主要成员, 与爬取的数据保持一致
    {
      characters: {
        type: String,
        ref: 'WikiCharacter' // 指向到另外一张schema
      },
      text: String
    }
  ],
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

WikiHouseSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})
const WikiHouse = mongoose.model('WikiHouse', WikiHouseSchema)

```
add  server/database/schema/wikiCharacter.js
```js
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed

const WikiCharacterSchema = new Schema({
  _id: String, // 通过这个id进行关联 外键
  wikiId: Number,
  nmId: String,
  chId: String,
  name: String,
  cname: String,
  playedBy: String,
  profile: String,
  images: [
    String
  ],
  sections: Mixed, // 混合类型
  intro: [
    String
  ],
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

WikiCharacterSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})
const WikiCharacter = mongoose.model('WikiCharacter', WikiCharacterSchema)

```


### 进行入库操作

server/middlewares/database.js

```js
import R from 'ramda'
// 先引入需要导入数据库的json文件
let wikiHouses = require(resolve(__dirname, '../../completeHouses.json'))
let wikiCharacters = require(resolve(__dirname, '../../complateCharacters.json'))
// 3. 调整字段
const formatData = R.map(
  i => {
    i._id = i.nmId
    return i
  }
)
wikiCharacters = formatData(wikiCharacters)

mongoose.connection.on('open', async () => {
  console.log('Connected to MongoDB', config.db)
  // 在连接数据库的时候将数据导入进行去
  // 拿到模型
  const WikiHouses = mongoose.model('WikiHouse')
  const WikiCharacter = mongoose.model('WikiCharacter')

  const existWikiHouses = await WikiHouses.find({}).exec()
  const existWikiCharacter = await WikiCharacter.find({}).exec()

  if (!existWikiHouses.length) WikiHouses.insertMany(wikiHouses)
  if (!existWikiCharacter.length) WikiCharacter.insertMany(wikiCharacters)
  // 1.wikiCharacters schema 需要先处理下 由于其实用了自定义 _id 也就是 nmId
  // 这样就可以通过wikiHouse中的ref: 查到 里面的人物数据
  // 2. 需要在插入之前通过formatdata 整理

})

```
### 修改 start.js

require('./server')
