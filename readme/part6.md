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

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    transform: body => cheerio.load(body)
  }
  const $ = await rp(options)
  // 通过选择器拿到数据
  // 遍历数据
  let photos = []
  $('table.cast_list tr.odd, tr.even').each(function () {
    // 当前dom节点上的id
    const nmIdDom = $(this).find('td.itemprop a')
    // 拿到url
    const nmId = nmIdDom.attr('href')

    const characterDom = $(this).find('td.character a')
    const name = characterDom.text()
    const chId = characterDom.attr('href')
    console.log(' chId ' + chId)

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
// 3. 过滤整条数据之后,通过map遍历数据
  R.map(photo => {
// 5. 构建一个正则,将cmid拿出来
    const reg1 = /\/name\/(.*?)\/\?ref/
    const reg2 = /\/character\/(.*?)\/\?ref/
    console.log(' reg1 ' + reg1)
    console.log(' nmId' + photo.nmId)
    const mache1 = photo.nmId.match(reg1)
    const mache2 = photo.chId.match(reg2)
    console.log(' mache1 ' + mache1)
    console.log(' mache2 ' + mache2)

    photo.nmId = mache1[1]
    photo.chId = mache2[1]
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

getIMDBCharacters()
```






如果本地获取数据太慢的话可以使用代理
