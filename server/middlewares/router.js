import Router from 'koa-router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { signature } from '../controllers/wechat'

export const router = app => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
  router.get('/wechat-signature', signature)
  app.use(router.routes())
     .use(router.allowedMethods())
}
