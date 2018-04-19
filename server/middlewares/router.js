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
