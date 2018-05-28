// import Router from 'koa-router'
import {
  controller,
  get,
  post,
  required
} from '../decorator/router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import {
  signature,
  redirect,
  oauth
} from '../controllers/wechat'
import {
  getParamsAsync
} from '../wechat-lib/pay'

import mongoose from 'mongoose'
const User = mongoose.model('User')
const Product = mongoose.model('Product')
const Payment = mongoose.model('Payment')

// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
@controller('')
export class WechatCotroller {
  @get('/wechat-hear')
  async wechatHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle(ctx, next)
    ctx.body = body
  }
  @post('/wechat-hear')
  async wechatPostHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle(ctx, next)
    ctx.body = body
  }
  // wechat pay

  @post('/wechat-pay')
  @required({
    body: ['productId', 'name', 'phoneNumber', 'address']
  })
  async createOrder(ctx, next) {
    // 在本地做域名代理的时候会带上一些额外的符号,额外ip的标识
    const ip = ctx.ip.replace('::ffff:', '')
    // 用户初次登录会公众号网页,会让其授权,然后就持有了用户信息,持久化session
    const session = ctx.session
    const {
      productId,
      name,
      phoneNumber,
      address
    } = ctx.request.body
    const product = await Product.findOne({
      _id: productId
    }).exec()
    if (!product) {
      return (ctx.body = {
        success: false,
        err: '这个宝贝不在了'
      })
    }
    try {
      let user = await User.findOne({
        unionid: session.unionid
      }).exec()
      if (!user) {
        user = new User({
          openid: [session.user.openid],
          unionid: session.user.unionid,
          nickname: session.user.nickname,
          address: session.user.address,
          province: session.user.province,
          country: session.user.country,
          sex: session.user.sex,
          email: session.user.email,
          headimgurl: session.user.headimgurl,
          avatarUrl: session.user.avatarUrl
        })
        user = await user.save()
      }
      // 需要发送给微信支付系统的
      let orderParams = {
        body: product.title,
        attach: '公众号周边手办支付',
        aut_trade_no: 'Product' + (new Date()), // 跟随一个时间戳不是最佳方式,最好是uuid
        spbill_create_ip: ip,
        total_fee: product.price * 100, // 微信公众号文档中单位是分,我们的是元
        openid: session.user.unionid,
        trade_type: 'JSAPI'
      }
      // 生成预支付订单
      const order = await getParamsAsync(orderParams)
      let payment = new Payment({
        user: user._id,
        product: product._id,
        name: name,
        phoneNumber: phoneNumber,
        address: address,
        payType: '公众号',
        order: order,
        total_fee: product.price
      })
      payment = await payment.save()
      ctx.body = {
        success: true,
        data: payment.order
      }
    } catch (err) {
      ctx.body = {
        success: false,
        err: err
      }
    }
  }
  @get('/wechat-signature')
  async wechatSignature(ctx, next) {
    await signature(ctx, next)
  }
  // 跳转到目标地址(二跳)
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
