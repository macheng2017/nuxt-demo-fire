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
    if (sha === signature) {
      ctx.body = echostr
    } else {
      ctx.body = 'Failed'
    }

// part2
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr
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
      console.log('content' + JSON.stringify(content))
      // const message =  util.formatMessage(content.xml)
      // ctx.weixin = message
      ctx.weixin = {}
      await reply.apply(ctx, [ctx, next])
      const replyBody = ctx.body
      const msg = ctx.weixin
      console.log(replyBody)
      // ctx.xml = util.tpl(replyBody, msg)
      const xml = `<xml>
          <ToUserName>
          <![CDATA[${content.xml.FromUserName[0]}]]>
          </ToUserName>
          <FromUserName>
          <![CDATA[${content.xml.ToUserName[0]}]]>
          </FromUserName>
          <CreateTime>12345678</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content>
          <![CDATA[${replyBody}]]>
          </Content>
      </xml>`
      console.log(xml)
      ctx.type = 'application/xml'
      ctx.status = 200
      ctx.body = xml
    }
  }
}
