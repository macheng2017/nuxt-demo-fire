Restful API 和 GraphQL

GraphQL 的优点 灵活,对于业务频繁改动的场景比较适合

使用 github GraphQL API

[GraphQL API Explorer | GitHub Developer Guide](https://developer.github.com/v4/explorer/)

使用 ngrok 穿透内网

切换 远程仓库
git remote rm origin

改动 server/index.js 代码

```js
import Koa from "koa";
import { Nuxt, Builder } from "nuxt";

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;
// 将start重新包装改成class形式

class Server {
  constructor() {
    // 在服务器内部可以通过this.app 非常方便的访问到服务器对象
    this.app = new Koa();
    // this.useMiddleWare(this.app)
  }
  // 加载中间件
  useMiddleWare(app) {}
  async start() {
    // Import and Set Nuxt.js options
    let config = require("../nuxt.config.js");
    config.dev = !(this.app.env === "production");
    // Instantiate nuxt.js
    const nuxt = new Nuxt(config);
    // Build in development
    if (config.dev) {
      const builder = new Builder(nuxt);
      await builder.build();
    }

    this.app.use(async (ctx, next) => {
      await next();
      ctx.status = 200; // koa defaults to 404 when it sees that status is unset
      return new Promise((resolve, reject) => {
        ctx.res.on("close", resolve);
        ctx.res.on("finish", resolve);
        nuxt.render(ctx.req, ctx.res, promise => {
          // nuxt.render passes a rejected promise into callback on error.
          promise.then(resolve).catch(reject);
        });
      });
    });

    this.app.listen(port, host);
    console.log("Server listening on " + host + ":" + port); // eslint-disable-line no-console
  }
}
new Server().start();
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

来加载中间件 但是这些会重复 app.use
我们会使用数组或者 map 来管理

可以借助于函数风格的 Ramda

import R from 'ramda'

核心设计理念就是

* 数据不变
* 函数无副作用
* 结合函数自动柯立化让多个函数排列,数据变化传递变得比较容易

```js
import R from "ramda";
import { resolve } from "path";
const MIDDLEWARES = ["router"];
// 拿到当前完整路径
const r = path => resolve(__dirname, path);
// 中间件的个数不确定,顺序有一定的约束
class Server {
  // constructor (){
  //   this.useMiddleWares(this.app)
  // }
  //   userMiddleWares () {
  //     return R.map()(MIDDLEWARES)
  // }
  constructor() {
    //可以在最右侧传入数组
    this.useMiddleWares(this.app)(MIDDLEWARES);
  }
  userMiddleWares(app) {
    return R.map(
      R.compose(
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
        i => `${r("./middlewares")}/${i}`
      )
    );
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

没有安装 babel 模块 没有配置好
yarn add babel-preset-stage-3 -D

* 将其放入开发依赖列表当中 "devDependencies"

yarn add babel-preset-latest-node -D

在项目根目录下新建 启动文件

start.js
从其间接调用 server/index.js 启动整个后台服务

[ECMAScript 6 简介 - ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/intro#Babel-转码器)

下面的参数可以在上面的链接中找到

```js
require("babel-core/register")({
  presets: ["stage-3", "latest-node"]
});
// 通过babel的编译才能放心使用es6 的语法
require("babel-polyfill");
require("./server");
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

1.  没有读懂错误信息的意思/没有反复思考错误信息
2.  没有按照以往的总结按照顺序排查错误
3.  读懂错误信息 -> 定位位置(插件出错应该在 github 中搜索该插件正确配置) -> 根据经验尝试修改 -> Google 错误信息

## part2 通过 mongoose 构建全局票据 access_token

1.  新增 middlewares/database.js

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

对 schema 初始化

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

## 新增 token.js 用来存放全局票据

server/database/schema/token.js

```js
const mongoose = require("mongoose");
const Schema = mogoose.Schema;

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
});
// 2. 保存前使用hook先经过中间件自动处理
TokenSchema.pre("save", function(next) {
  // 如果是新增的数据,则更新 createAt 与 updatedAt时间
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
    // 如果不是新增数据,则只更新updatedAt
  } else {
    this.meta.updatedAt = Date.now();
  }
  next();
});
// 3. 这个预处理相当于mongoose中的中间件在执行保存操作之前,先执行下数据的时间更新
// 别忘了next()

// 4. 然后对这个TokenSchema新增静态方法,是为了让model直接调用的
TokenSchema.statics = {
  // 5. 获取token
  async getAccessToken() {
    const token = await this.findOne({
      // 由于以后token比较多所以,直接将表字段改成token而不再用access_token
      name: "access_token"
    }).exec();
    if (token && token.token) {
      token.access_token = token.token;
    }

    return token;
  },
  // 6. 保存
  async saveAccessToken(data) {
    let token = await this.findOne({
      name: "access_token"
    }).exec();
    // 判断是否找到,如果找到之前存过,不会新增,直接修改
    if (token) {
      token.token = data.access_token;
      token.expire_in = data.expires_in;
    } else {
      // 新增数据
      token = new Token({
        name: "access_token",
        token: data.access_token,
        expires_in: data.expires_in
      });
    }
    await token.save();
    return data;
  }
};
// 前面我们用到了new Token, 拿到TokenSchema 的数据模型
const Token = mongoose.model("Token", TokenSchema);
```

### 在 server/index.js 当中 中间件数组中加入 database.js 中间件

const MIDDLEWARES = ['database','router']
