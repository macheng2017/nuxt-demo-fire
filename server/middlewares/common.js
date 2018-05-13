import koaBody from 'koa-bodyparser'
import session from 'koa-session'
// 解析body的中间件
export const addBody = app => {
  app.use(koaBody())
}
export const addSession = app => {
  app.keys = ['ice']
  const CONFIG = {
    key: 'koa:sess',
    maxAge: 86400000,
    overwrite: true,
    signed: true,
    rolling: false // 每次返回http请求的时候都会强制设置一下cookie的identity

  }
  app.use(session(CONFIG, app))
}
