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
        R.map(i => i(app))
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
