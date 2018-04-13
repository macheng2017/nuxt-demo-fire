## access_token 获取

伪代码

使用http请求的库
request 请求官方的地址 apiurl

微信请求的一个构造函数,所有和微信请求相关的功能都放到里面来

## 新增 server/wechat-lib/index.js

微信异步场景的入口文件,在这里我们需要管理很多的微信api地址
首先实现框架代码

在写复杂一点的构造函数的时候,先把主要的api或者说主要的方法罗列出来,然后再去细化

```js
import request from 'request-promise'

class Wechat {
  // 1.j接收一些配置项,token key 
  constructor(opts){

  }
  // 所有异步函数,通过request方法统一管理

  // 发送请求的
  async request (options){
    const response = await request(options)

    return response
  }
  // 2. 获取token
  async fetchAccessToken () {
    // 判断是否过期,如果过期重新请求
    if (isValid(data)) {
      return await this.updateAccessToken()
    }
  }
  // 3. 更新token
  async updateAccessToken () {

  }
}

```

安装库
yarn add request-promise
[Object.assign()用法](https://blog.csdn.net/waiterwaiter/article/details/50267787)
```js
// 1. 声明这个api ,存放具体的地址
const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential'
}
// 2. 现将这个参数去掉&appid=APPID&secret=APPSECRET 
// 一定要按照文档的参数顺序来传递参数
export default class Wechat {
  constructor(opts){
    // 3. 同过assign拿到一个新的对象why? 这样操作一遍不还是以前的那个对象吗?有意义吗?
    this.opts = Object.assign({}, opts)

    this.appID = opts.appID
    this.appSecret = opts.appSecret
    //4. 获取token的外部方法
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    //5.  在实例创建的时候获取这个token
    this.fetchAccessToken()
  }
  // 10 
   async request (options){
     //11 使用object.assign 深copy 并'拼接'一个对象
     options = Object.assign({}, options, {json: true})
     // 12 捕获异常
     try {
       const response = await request(options)
       console.log(response)
       return response
     } catch (error) {
       // 13. 先简单打印一下便于开发,随后再做处理
       console.error(error)
     }

    return response
  }

async fetchAccessToken () {
  // 6. 先拿到当前的token 这个getAccessToken() 就是外部的方法可能是读了本地的文件,也可能是发// 了一个第三方api的请求,还可能是从数据库中查询,取决于怎么管理这个token
  let data = await this.getAccessToken()
  // 7.如果其中的data失效或者不合法,则重新更新token
    if (!this.isValidAccessToken(data)){
      data = await this.updateAccessToken()
    }
    await this.saveAccessToken(data)
    return data
  }
  // 9.
  async updateAccessToken () {
    const url = api.accessToken + '&appid' + this.appID + '&secret' + this.appSecret
    // 从微信服务器获取accessToken
    const data = await this.request({url: url})
    const now = (new Date().getTime())
    // 将过期时间减去20s,让其提前获取新的token
    const expiresIn = now + (data.expires_in - 20) * 1000
    data.expires_in = expiresIn
    return data
  }
  // 8. 判断是token否有效
  isValidAccessToken(data) {
    // 如果data本身就是null或者undefined 
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }
    // 获取过期时间
    const expiresIn = data.expires_in
    // 当前时间
    const now = (new Date().getTime())

    if (now < expiresIn) {
      return true
    } else {
      return false
    }
  }
}
```

## 调用位置 

在server上 server/wechat/index.js

```js
// 在这里对微信异步场景进行初始化
import mongoose from 'mongoose'
import config from '../config'
import Wechat from '../wechat-lib'

const Token = mongoose.model('Token')

// 配置项

const wechatConfig = {
  wechat: {
    appID: config.wechat.appID,
    appSecret: config.wechat.appSecret,
    token: config.wechat.token,
    getAccessToken: async () => await Token.getAccessToken(),
    saveAccessToken: async (data) => await Token.saveAccessToken(data)
  }
}
// 将其暴露出去方便外部调用
export const getWechat = () => {

  const wechatClient = new Wechat(wechatConfig.wechat)
  return wechatClient
}

// 测试

getWechat() 

// 作用: 生成wechat实例,在生成的时候传递进去一个配置参数wechatConfig,
// 包括外部存储/查询token的方法 
```

server/middlewares/到router中引入并测试

等到数据库连接之后在做微信的初始化

requiret('../wechat') 时机是整个项目跑起来对外提供服务的时候


遇到一个巨坑的错误:
 
 * token.js当中的 忘了写next(),导致只有保存前的预处理动作,却没有保存动作,而且还不报错

```js
TokenSchema.pre('save', function (next) {
  // 如果是新增的数据,则更新 createAt 与 updatedAt时间
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  // 如果不是新增数据,则只更新updatedAt
  }else{
    this.meta.updatedAt = Date.now()
  }
  next()
})
```

* 遇到这类问题,先想想那个动作完成了,紧接着什么动作未完成.


## 为微信消息实现一个中间件
结合access_token 来为微信消息进行回复,中间件主要是在路由这一层,
当一个请求进来后,在这个中间件中进行解析
将请求进行分析,并回复

无论微信过来的请求是 get/post 都应该对参数进行字典排序,加密,然后进行比对,成功后再进行数据分析

router.js

可以将get/post请求处理写成一个 router.all()来处理

写一个中间件
wechatMiddle(opts)

```js
import reply from  '../wechat/reply'
  router.all('/wechat-hear',
  // opts 描述了微信公众号的 key secret token 外部获取的方式
  // reply 传入一个回复的策略 
  // 将配置项和回复策略都交给中间件进行相应的处理,这样路由比较简洁干净
  wechatMiddle(config.wechat, reply)
  (ctx, next) => {
    // require('../wechat')
    const token = config.wechat.token
  //...
  app.use(router.routes())
  app.use(router.allowedMethods())
}
```

将这一部分代码剪切,放到外部
```js
   (ctx, next) => {
    // require('../wechat')
    const token = config.wechat.token
    const {
      signature,
      nonce,
      timestamp,
      echostr
    } = ctx.query
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    console.log(sha === signature)
    if (sha === signature) {
      ctx.body = echostr
    } else {
      ctx.body = 'Failed'
    }
  })
```

## 新建server/wechat-lib/middleware.js 微信消息中间件

```js
export default function(opts, replay) {
  // 一个koa中间件结构
  return async function wechatMiddle(ctx, next) {

  }
}
```
把刚刚剪切的代码粘进去
```js
import sha1 from 'sha1'
// 这个模块可以拿到http请求的整个数据包
import getRawBody from 'raw-body'
// 引入整个工具函数,所有方法
import * as util from './util'


export default function(opts, replay) {
  // 一个koa中间件结构
  return async function wechatMiddle(ctx, next) {
    const token = opts.token
    const {
      signature,
      nonce,
      timestamp,
      echostr
    } = ctx.query
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
// 1. 由于我们是通过 reouter.all()方式进来的,需要对请求的方法做判断

  if (ctx.method === 'GET') {
    if (sha === signature) {
      ctx.body = echostr
    } else {
      ctx.body = 'Failed'
    }
  } else if(ctx.method === 'post') {
    // 2. post请求,还是需要先判断签名是否正确
     if (sha !== signature) {
       ctx.body = 'Failed'
       return false
     }
    // 3. 先拿到整个请求的数据包
     // getRawBody原始数据通过 ctx上的req ctx.req 并加上约束
    const data = await getRawBody(ctx.req, {
      length: ctx.length,
      limit: '1mb',
      encoding: ctx.charset
    }) 
    // 4. 拿到整个data先对这个data进行解析,因为它是xml格式的
    const content = await util.parseXML(data)
    // 5. 拿到整个xml数据之后,希望能解析成json格式,这样才能拿到对应的key,value
    const message = util.formatMessage(content.xml)
    // 6. 解析之后的message可以将其挂到ctx上面
    // 这样在后面的代码单元就可以访问到ctx.weixin了
    ctx.weixin = message
    // 7. 将控制权交到reply 通过await 异步让reply内部执行,在执行中可以调用到上下文
    // 使用apply可以在调用函数的同时,指定this值,当前this值为ctx
    await reply.apply(ctx, [ctx, next])
    // 8. 执行之后就可以拿到回复内容了,reply是回复策略
    const replyBody = ctx.body
    const msg = ctx.weixin
    // 9. 我们通过replyBody 和 msg 来构建用来回复给微信服务器的xml数据
    ctx.xml = util.tpl(replyBody, msg)
    ctx.status = 200 
    // 设置回复的类型
    ctx.type = 'application/xml'
    // 将其交给body
    ctx.body = xml
  }
  }
}
```

* Function.prototype.apply() - JavaScript | MDN  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

消息中间件的流程
1. 拿到所有参数,进行字典排序,加密
2. 如果符合加密规则,进而拿到整个http请求的数据包
3. 然后对这个数据包进行解析,拿到里面原始的xml数据
4. 通过工具函数对xml数据进行分析,将其解析成一个js对象
5. 将解析后的对象挂到ctx上面
6. 然后把整个的控制权交出去,让我们的回复策略,根据解析后的内容也就是message,进行具体的处理
7. 然后在拿到回复策略里面的处理后的内容,拿到之前的message
8. 通过工具函数构建xml数据
9. 返回微信服务器


## 实现util.js 
新建 util.js

```js
import xml2js from 'xml2js'
// 解析xml
export function xml2js (xml) {
  return new Promise ((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}
```
## 新建 wechat/reply.js回复策略

```js
const tip = ''
export default async (ctx, next) => {
  const message = ctx.weixin
  console.log(message)
  ctx.body = tip

}

```

测试下

微信公共号给的文档真坑

```xml
<xml> <ToUserName>< ![CDATA[toUser] ]></ToUserName> <FromUserName>< ![CDATA[fromUser] ]></FromUserName> <CreateTime>12345678</CreateTime> <MsgType>< ![CDATA[text] ]></MsgType> <Content>< ![CDATA[你好] ]></Content> </xml>
```

< ![CDATA[toUser] ]> 这个 CDATA 太坑了,写成这样肯定死活不过

* 正确用法去掉空格

 ```js
 import sha1 from 'sha1'
import getRawBody from 'raw-body'
import * as util from './util'

export default function (opts, reply) {
  return async function wechatMiddle(ctx, next) {
    const token = opts.token
    const {
      signature,
      nonce,
      timestamp,
      echostr
    } = ctx.query
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    console.log(sha === signature)
    if (sha === signature) {
      ctx.body = echostr
    } else {
      ctx.body = 'Failed'
    }

// part2
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'Failed'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = 'Failed'
        return false
      }

      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      const content = await util.parseXML(data)
      console.log('content' + JSON.stringify(content))
      // const message =  util.formatMessage(content.xml)
      // ctx.weixin = message
      ctx.weixin = {}
      await reply.apply(ctx, [ctx, next])
      const replyBody = ctx.body
      const msg = ctx.weixin
      console.log(replyBody)
      // ctx.xml = util.tpl(replyBody, msg)
      const xml = `<xml>
          <ToUserName>
          <![CDATA[${content.xml.FromUserName[0]}]]>
          </ToUserName>
          <FromUserName>
          <![CDATA[${content.xml.ToUserName[0]}]]>
          </FromUserName>
          <CreateTime>12345678</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content>
          <![CDATA[${replyBody}]]>
          </Content>
      </xml>`
      console.log(xml)
      ctx.type = 'application/xml'
      ctx.status = 200
      ctx.body = xml
    }
  }
}
```
