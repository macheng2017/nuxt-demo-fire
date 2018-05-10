import koaBody from 'koa-bodyparser'
// 解析body的中间件
export const addBody = app => {
  app.use(koaBody())
}
