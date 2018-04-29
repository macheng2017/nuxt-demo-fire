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




https://www.cnblogs.com/chyingp/p/node-guide-file-write.html


测试 

start.js
```js
// require('./server/crawler/imdb')
require('./server/crawler/api')
```
