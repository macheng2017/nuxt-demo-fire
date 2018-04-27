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
