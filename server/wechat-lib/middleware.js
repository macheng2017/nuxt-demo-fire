import sha1 from 'sha1'
import getRawBody from 'raw-body'
import * as util from './util'

export default function (opts, reply) {
  return async function wechatMiddle(ctx, next) {
    const token = opts.token
    const {
      signature,
      nonce,
      timestamp,
      echostr
    } = ctx.query
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    console.log(sha === signature)
    // if (sha === signature) {
    //   ctx.body = echostr
    // } else {
    //   ctx.body = 'Failed'
    // }

    // part2
    if (ctx.method === 'GET') {
      if (sha === signature) {
        // console.log('echostr ' + echostr)
        // ctx.body = echostr
        return echostr
      } else {
        ctx.body = 'Failed'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        ctx.body = 'Failed'
        return false
      }

      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      const content = await util.parseXML(data)
      console.log('content = ' + JSON.stringify(content))
      // content.xml 不是一个文件,而是content的xml属性
      const message = util.formatMessage(content.xml)
      // const message = JSON.parse(JSON.stringify(content)).xml
      console.log('message = ' + JSON.stringify(message))
      ctx.weixin = message
      await reply.apply(ctx, [ctx, next])
      const replyBody = ctx.body
      console.log('replyBody = ' + JSON.stringify(replyBody))
      const msg = ctx.weixin
      console.log('msg= ' + JSON.stringify(msg))
      const xml = util.tpl(replyBody, msg)
      // console.log(xml)
      ctx.type = 'application/xml'
      ctx.status = 200
      ctx.body = xml
    }
  }
}
