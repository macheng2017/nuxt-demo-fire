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
