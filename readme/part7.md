## 利用修饰器 decoratorr重构koa路由策略

1. 数据 
2. 页面
3. 将本地数据页面链接起来

通过路由 将api或者页面通过路由中间件,将请求匹配到后端的控制器

### 通过拆分路由把不同的业务逻辑放在单独的路由页面中去

1. 微信服务
2. 小程序
3. 网站后端
4. 网站前端
5. groupQL

## 微信有关路由
新建 server/routes 存放不同业务路由的中间件

将原有的 middlewares/router.js 复制到routers/wechat.js
```js
import Router from 'koa-router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { signature, redirect, oauth } from '../controllers/wechat'

export const router = app => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
  router.get('/wechat-signature', signature)
  // 将用户偷偷跳转到二跳地址
  router.get('/wechat-redirect', redirect)
  // 用户跳转过来之后需要通过授权机制获取用户信息
  router.get('/wechat-oauth', oauth)
  app.use(router.routes())
     .use(router.allowedMethods())
}
```

改动原来的middlewares/router.js

```js
import Router from '../decorator/router'
import {resolve} from 'path'
const r = path => resolve(__dirname, path)

export const router = app => {
  const apiPath = r('../routers')
  const router = new Router(app, apiPath)
  router.init()
}
```


新建../decorator/router.js

实现将页面装入路由当中

```js
import Router from 'koa-router'
import { resolve } from 'path'
import glob from 'glob'
import _ from 'lodash'
export let routersMap = new Map()

export const symbolPrefix = Symbol('prefix')
// 如果是数组,否则包装成数组
export const isAarry = v => _.isArray(v) ? v : [v]

export const normalizePath = path => path.startsWith('/') ? path : `/${path}`

export default class Route {
  constructor(app, apiPath) {
    this.app = app
    this.router = new Router()
    this.apiPath = apiPath
  }
  init() {
    // 1.遍历路由中所有文件
    glob.sync(resolve(this.apiPath, './*.js')).forEach(require)
    // 2. 对其内部进行路径判断路径解析,让每个路径对上一个controller
    // 分别将其加载进来
    //
    for (let [conf, controller] of routersMap) {
      // 把每一个路由文件中的controller取出来跟他们的路由进行一一匹配
      // 来判断下是否是数组
      const controllers = isAarry(controller)
      // 改动下微信的路由
      let prefixPath = conf.target[symbolPrefix]
      // symbolPrefix 是什么意思?
      // 在JavaScript 数据类型 symbol可以看做是第七种类型,不同于以往的数据类型
      // 通过symbol创建的值与任何其他值都不相等,也就是每个symbol都是独一无二的
      // ,创建之后不能修改
      // 拿到正常路径
      if (prefixPath) prefixPath = normalizePath(prefixPath)
      const routerPath = prefixPath + conf.path
      // 对里面的每个方法施加到他们自身,让其可以生效
      this.router[conf.method](routerPath, ...controllers)
    }
    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
  }
}
export const router = conf => (target, key, desc) => {
  conf.path = normalizePath(conf.path)
  routersMap.set({
    target: target,
    ...conf
  }, target[key])
}
// symbolPrefix 是唯一的值, 这样每一个controller都是唯一的值
export const controller = path => target => target.prototype[symbolPrefix] = path
// 简单的配置get请求的router
export const get = path => router({
  method: 'get',
  path: path
})
export const post = path => router({
  method: 'post',
  path: path
})

export const put = path => router({
  method: 'put',
  path: path
})
export const del = path => router({
  method: 'del',
  path: path
})


```

初步来看glob是一个多了匹配功能的require,还没详细看
https://github.com/isaacs/node-glob



### 改动下微信的路由
```js

import Router from 'koa-router'
import { controller, get, post } from '../decorator/router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { signature, redirect, oauth } from '../controllers/wechat'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
@controller('')
export class WechatCotroller {
  @get('/wechat-hear')
  async wechatHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle (ctx, next)
    ctx.body = body
  }
  @post('/wechat-hear')
  async wechatPostHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle (ctx, next)
    ctx.body = body
  }
  @get('/wechat-signature')
  async wechatSignature(ctx, next) {
    await signature(ctx, next)
  }
  @get('/wechat-redirect')
  async wechatRedirect(ctx, next) {
    await redirect(ctx, next)
  }
  @get('/wechat-oauth')
  async wechatOauth(ctx, next) {
    await oauth(ctx, next)
  }
}

// 这样做的好处
// 1. 通过这样的写法可以将路由拆开
// 2. 不同业务对应不同的文件
// 3. 可以使整个的路由层次更加清楚,只需要看一下controller的命名空间,
// 就知道它里面包含哪些业务对应过来这个路由
// 4. get/post 请求在这里可以做更加精细的控制,而不是像之前的router.get
//  router.post 将整个数据流程整个丢给了下个函数




// export const router = app => {
//   const router = new Router()
//   router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
//   router.get('/wechat-signature', signature)
//   // 将用户偷偷跳转到二跳地址
//   router.get('/wechat-redirect', redirect)
//   // 用户跳转过来之后需要通过授权机制获取用户信息
//   router.get('/wechat-oauth', oauth)
//   app.use(router.routes())
//      .use(router.allowedMethods())
// }

```

修饰器 是es7的语法 decorator 还不能原生的支持,还是需要babel的编译 
需要在start.js 引入插件plugin


```js
const { resolve } = require('path')
const r = path => resolve(__dirname, 'path')
require('babel-core/register')({
  'presets': [
    'stage-3',
    ['latest-node',
     { 'target': 'current' }
    ]
  ],
  plugins: [
    'transform-decorators-legacy',
    [
      'module-alias', [
        {
          src: r('./server'), 'expose': '~',
          src: r('./server/database'), 'expose': 'database'
        }
      ]
    ]
  ]
})
// 通过babel的编译才能放心使用es6 的语法
require('babel-polyfill')
require('./server')
// require('./server/crawler/imdb')
// require('./server/crawler/api')
// require('./server/crawler/check')
// require('./server/crawler/wiki')
// require('./test/testRamda')



```


yarn add babel-plugin-module-alias -D
yarn add babel-plugin-transform-decorators-legacy -D


测试数据

http://localhost:3000/wechat-signature?url=abcd

如果测试通过说明,路由分层已经可以了
