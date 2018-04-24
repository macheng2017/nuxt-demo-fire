import Koa from 'koa'
import { Nuxt, Builder } from 'nuxt'
import R from 'ramda'
import { resolve } from 'path'
// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env === 'production')
// 拿到当前完整路径
const r = path => resolve(__dirname, path)
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000
const MIDDLEWARES = ['database', 'router']

// 将start重新包装改成class形式

class Server {
  constructor() {
    // 在服务器内部可以通过this.app 非常方便的访问到服务器对象
    this.app = new Koa()
    this.useMiddleWares(this.app)(MIDDLEWARES)
  }
  // 加载中间件
  useMiddleWares(app) {
    return R.map(R.compose(
      R.map(i => i(app)),
      require,
      i => `${r('./middlewares')}/${i}`
    ))
  }
  async start() {
    // Instantiate nuxt.js
    const nuxt = new Nuxt(config)
    // Build in development
    if (config.dev) {
      try {
        const builder = new Builder(nuxt)
        await builder.build()
      } catch (e) {
        console.error(e)
        process.exit(1)
      }
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
