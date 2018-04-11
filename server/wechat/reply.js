const tip = '欢迎来到河间地!'
export default async (ctx, next) => {
  const message = ctx.weixin
  console.log(message)
  ctx.body = tip
}
