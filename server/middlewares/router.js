import Router from 'koa-router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { resolve } from 'path'

export const router = app => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
  app.use(router.routes())
     .use(router.allowedMethods())
}
