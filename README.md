# fire

> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install*[see note below]

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

*Note: Due to a bug in yarn's engine version detection code if you are
using a prerelease version of Node (i.e. v7.6.0-rc.1) you will need to either:
  1. Use `npm install`
  2. Run `yarn` with a standard release of Node and then switch back

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


安装 vue-cli

npm i vue-cli -g

使用nuxt脚手架

vue init nuxt/koa xxx 

[使用nuxt](https://zh.nuxtjs.org/guide/installation)


更改目录结构


模版引擎

[pug(jade)](https://pugjs.org/api/getting-started.html)

[mongoose](https://docs.mongodb.com/manual/tutorial/getting-started/)

[Mongoose ODM v5.0.13 ](http://mongoosejs.com/)

```js
const mongoose = require('mongoose')
// 替换为全局的promise
mongoose.Promise = Promise 
// 开启debug 这样可以看到操作日志
mongoose.set('debug', true)
// 老版写法 新版的createConnection
mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
})
// open事件绑定,在连接的时候给个提示
mongoose.connection.on('open', () => {
  console.log('mongodb opend!')
})

const UserSchema = new mongoose.Schema({
  name: String,
  times:{
    type: Number,
    default: 0
  }
})

mongoose.model('User', UserSchema)

// 测试
const User = mongoose.model('User')
;(async ()=> {
  console.log( await User.find({}).exec())



})()

```

进入 docker 启动数据库

进入数据库

docker exec -it mongo-test mongo

node mongoose.js

测试成功

```js
mongodb opend!
Mongoose: users.find({}, { fields: {} })
```


```js
// 修改数据
 const user = await User.findOne({name: 'Vue'})
  user.name = 'Vue SSR'
  await user.save()
  console.log(await User.find({}).exec())
```
### 让 times +1

```js
const UserSchema = new mongoose.Schema({
  name: String,
  times:{
    type: Number,
    default: 0
  }
})

UserSchema.pre('save', function(next) {
  this.times ++
  next()
})
```
* [使用pre(预处理)hook(钩子) 对数据进行预处理](http://mongoosejs.com/docs/api.html#schema_Schema-pre)


添加静态方法

```js
// 在UserSchema上添加静态方法
UserSchema.statics = {
  async getUser(name) {
    const user = await this.findOne({name: name}).exec()
    return user
  }
}
```

* UserSchema.statics [可以直接在Schema上直接添加静态方法](http://mongoosejs.com/docs/api.html#schema_Schema-static)
* UserSchema.methods  可以对实例添加一些方法,查询数据库


```js
UserSchema.methods = {
  async fetchUser(name) {
    const user = await this.model('User').findOne({
      name: name
    }).exec()
    return user
  }
}
```
* 出现错误:最后找到的原因是--数据库没有数据;先检查数据库有没有数据

Restful API 和 GraphQL

GraphQL 的优点 灵活,对于业务频繁改动的场景比较适合

使用github GraphQL API

[GraphQL API Explorer | GitHub Developer Guide]( https://developer.github.com/v4/explorer/)

使用ngrok 穿透内网

切换 远程仓库
git remote rm origin




改动server/index.js代码

```js
import Koa from 'koa'
import { Nuxt, Builder } from 'nuxt'

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
// 将start重新包装改成class形式

class Server {
  constructor() {
    // 在服务器内部可以通过this.app 非常方便的访问到服务器对象
    this.app = new Koa()
    // this.useMiddleWare(this.app)
  }
  // 加载中间件
  useMiddleWare(app) {

  }
  async start() {
    // Import and Set Nuxt.js options
    let config = require('../nuxt.config.js')
    config.dev = !(this.app.env === 'production')
    // Instantiate nuxt.js
    const nuxt = new Nuxt(config)
    // Build in development
    if (config.dev) {
      const builder = new Builder(nuxt)
      await builder.build()
    }

    this.app.use(async (ctx, next) => {
      await next()
      ctx.status = 200 // koa defaults to 404 when it sees that status is unset
      return new Promise((resolve, reject) => {
        ctx.res.on('close', resolve)
        ctx.res.on('finish', resolve)
        nuxt.render(ctx.req, ctx.res, promise => {
          // nuxt.render passes a rejected promise into callback on error.
          promise.then(resolve).catch(reject)
        })
      })
    })

    this.app.listen(port, host)
    console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
  }
}
new Server().start()
```
微信公众号

* 在项目中有一层专门用来接管消息的,放在中间件中 useMiddleWares(app)
* 中间件不止一个 路由 bodyParse session
* 正常的我们使用
```js
userMiddleWares(app) {
  app.use(mid1)
  app.use(mid2)
  app.use(mid3)
}
``` 
来加载中间件 但是这些会重复app.use
我们会使用数组或者 map来管理

可以借助于函数风格的Ramda 

import R from 'ramda'

核心设计理念就是

* 数据不变
* 函数无副作用
* 结合函数自动柯立化让多个函数排列,数据变化传递变得比较容易

```js
import R from 'ramda'
import { resolve } from 'path'
const MIDDLEWARES = ['router']
// 拿到当前完整路径
const r = path => resolve(__dirname, path)
// 中间件的个数不确定,顺序有一定的约束
class Server {
  // constructor (){
  //   this.useMiddleWares(this.app)
  // }
  //   userMiddleWares () {
  //     return R.map()(MIDDLEWARES)
  // }
  constructor (){
    //可以在最右侧传入数组
    this.useMiddleWares(this.app)(MIDDLEWARES)
  }
    userMiddleWares (app) {
      return R.map(R.compose(
        // 9. 总结: 通过R.map来解析数组的每一项值,交给了一个专门生成绝对路径的一个函数,然后这个路径交给require ,
        // 然后这个require来加载这个模块,然后我们再对他传入这个app,让每个中间件都能拿到这个app对象,进行初始化的工作
        // 8.我们通过R.map通过传入i(app),把当前app穿进去,从而初始化中间件中的每一个函数
        R.map(i => i(app)),
      // 6. 整个这一行执行完成之返回去的就是一个绝对路径,然后交给一个require,来引入这个模块
      // 7. 就可以拿到模块中暴露的函数
        require,

      // 1. R.compose 中间件的个数是不一定的,可以从右向左进行排列组合,右侧函数的返回结果都是左侧函数的输入参数
      // 2. 所以我们可以倒着写
      // 3. 每次传入的 MIDDLEWARES 通过这个R.map拿到的是一个个字符串
      // 4. 可以将其转成一个标准的路径,+当前文件的名字
      // 5. i => `resolve('./middlewares')/${i}`
        i => `${r('./middlewares')}/${i}`

      ))
  }
} 

```
添加/server/middlewares/router.js
```js
import Router from 'koa-router'
import config from '../config'
import sha1 from 'sha1'

export const router = app => {
  const router = new Router()
// 1.通过router.get/post 拿到微信服务器推送的请求 
// 2. get拿到的是验证的请求
// post拿到的是数据
  router.get('/wechat-hear', (ctx, next) => {
// 3. 我们接收微信服务器所推送的get请求我们可以接收到参数
// 4. 以下是微信官方文档上约束的参数,签名,nonce, 时间戳,echostr
  const token = config.wechat.token 
  // 6. 通过配置文件获取微信公众号token,在server下新建一个config/index.js
  /**
   * export default {
   *    wechat:{
   *      token: 'xxx'
   *    } 
   * }
   * */
  // 7.引入config 文件
  const {
    signature,
    nonce,
    timestamp,
    echostr
  } = ctx.query

// 5. 然后对参数进行排序加密 token 是微信公众号的token
// 8. 进行排序
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
// 判断是否和微信服务器签名一致
    if(sha === signature){

    // 9. 设置返回内容
    ctx.body = echostr
    }eles {
      cxt.body = 'Failed'
    }    
  })
// 3. 我们可以先不管post请求先走通get
  // router.post('/wechat-hear', (ctx, next){

  // })
  app.use(router.routers())
  app.use(router.allowedMethods())
}

```

安装库
ramda
sha1
koa-router

```js
E:\myGitHub\fire\build\webpack:\server\index.js:23
      require,
      ^
Error: Cannot find module "."
```
没有安装babel模块 没有配置好
yarn add babel-preset-stage-3 -D 
* 将其放入开发依赖列表当中 "devDependencies"

yarn add babel-preset-latest-node -D

在项目根目录下新建 启动文件

start.js
从其间接调用server/index.js 启动整个后台服务

[ECMAScript 6 简介 - ECMAScript 6入门](http://es6.ruanyifeng.com/#docs/intro#Babel-转码器)

下面的参数可以在上面的链接中找到

```js
require('babel-core/register')({
  'presets': [
    'stage-3',
    'latest-node'
  ]
})
// 通过babel的编译才能放心使用es6 的语法
require('babel-polyfill')
require('./server')
```

配置启动命令

package.json

```js
dev": "backpack dev", --> nodemon -w ./server -w ./start.js --exec node ./start.js
```

https://github.com/christophehurpeau/babel-preset-latest-node


卡在这里:



```js
Error: Preset latest-node 'target' option must one of 6, 6.5, 7, 7.6, 8, 8.3, current.
// 修改后的配置
require('babel-core/register')({
  'presets': [
    'stage-3',
    ['latest-node',
     { 'target': 'current' }
    ]
  ]
})
// 通过babel的编译才能放心使用es6 的语法
require('babel-polyfill')
require('./server')

```

总结:
卡在这里的原因

1. 没有读懂错误信息的意思/没有反复思考错误信息
2. 没有按照以往的总结按照顺序排查错误
3. 读懂错误信息 -> 定位位置(插件出错应该在github中搜索该插件正确配置) -> 根据经验尝试修改 -> Google错误信息

## part2 通过mongoose构建全局票据 access_token



1. 新增 middlewares/database.js

```js
  import { resolve } from 'path'
  import mongoose from 'mongoose'
  import config from 'config'
  // 1. 从外部服务器拿到传递进来的实例
  export const database = app =>{
    // 2. 在本地开发的时候设置为true,这样可以看到存储时的一些日志
    mongoose.set('debug', true)
    // 3. 从外部配置文件中读取
    mongoose.connect(config.db)
  }
    // 4. 在连接中断的时候重新链接
    mongoose.connection.on('disconnected', () => {
      mongoose.connect(config.db)

    })
    // 5.在出错的时候给出报警日志
    mongoose.connection.on('error', err => {
      console.error(err)
    })
    // 6. 当数据库打开的时候,用一个异步函数,将来可以做一些异步的处理现在简单打印
    mongoose.connection.on('open', async => {
      console.log('Connected to MongoDB', config.db)
    })
// 7. 配置config
//add
 + db: 'mongodb://localhost/ice',

```

对schema初始化

```js
// 1.把所有的model 读出来然后加载
import fs form 'fs'
// 3.新建目录 /server/database/schema 
const models = resolve('__dirname', '../database/schema')
// 2. 同步读入模型文件并过滤,匹配以.s结尾的文件
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => require(resolve(models, file)))


```
## 新增token.js 用来存放全局票据
server/database/schema/token.js

```js
const mongoose = require('mongoose')
const Schema = mogoose.Schema

// 1.新建一张表,存放全局票据
const TokenSchema = new mongoose.Schema({
  name: String,
  token: String,
  expires_in: Number,
  meta: {
    // 创建的时候记录
    createdAt: {
      type: Date,
      default: Date.now()
    },
    // 在更新的时候记录下
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})
// 2. 保存前使用hook先经过中间件自动处理
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
// 3. 这个预处理相当于mongoose中的中间件在执行保存操作之前,先执行下数据的时间更新
// 别忘了next()

// 4. 然后对这个TokenSchema新增静态方法,是为了让model直接调用的
TokenSchema.statics = {
  // 5. 获取token
  async getAccessToken() {
    const token = await this.findOne({
      // 由于以后token比较多所以,直接将表字段改成token而不再用access_token
      name: 'access_token'
    }).exec()
    if (token && token.token ) {
      token.access_token = token.token
    }

    return token
  },
  // 6. 保存
  async saveAccessToken(data) {
    let token = await this.findOne({
      name: 'access_token'
    }).exec()
    // 判断是否找到,如果找到之前存过,不会新增,直接修改
    if (token) {
      token.token = data.access_token
      token.expire_in = data.expires_in
    } else {
      // 新增数据
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }
  await token.save()
  return data
  }
}
// 前面我们用到了new Token, 拿到TokenSchema 的数据模型
const Token =  mongoose.model('Token', TokenSchema)
```

### 在server/index.js当中 中间件数组中加入database.js中间件

const MIDDLEWARES = ['database','router']


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
## [各种消息模板的封装](./readme/part3.md)



