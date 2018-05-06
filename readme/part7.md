## 实现路由

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



初步来看glob是一个多了匹配功能的require,还没详细看
https://github.com/isaacs/node-glob



### 改动下微信的路由
```js

// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
@controller('')
export class WechatCotroller {
  @get('wechat-hear')
  async wechatHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle (ctx, next)
    ctx.body = body
  }
  @post('wechat-hear')
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
