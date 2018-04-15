import Router from 'koa-router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { resolve } from 'path'

export const router = app => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
  router.get('/upload', (ctx, next) => {
    let mp = require('../wechat')
    let client = mp.getWechat()
    client.handle('uploadMaterial', 'video', resolve(__dirname, '../../123.mp4'))
  })
  app.use(router.routes())
     .use(router.allowedMethods())
}
