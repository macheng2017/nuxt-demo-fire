import api from '../api'
import config from '../config'
import { parse as urlParse } from 'url'
import { parse as queryParse } from 'querystring'

export async function signature(ctx, next) {
  let url = ctx.query.url
  //
  if (!url) ctx.throw(404)
  url = decodeURIComponent(url)
  const params = await api.wechat.getSignatureAsync(url)
  ctx.body = {
    success: true,
    params: params
  }
}
// 拼接好跳转的目标地址,把用户重定向到这个地址
export async function redirect(ctx, next) {
  try {
    // SITE_ROOT_URL网站根地址
    // const target = config.SITE_ROOT_URL + '/oauth'
    // 为什么需要'/oauth'?
    // 授权后跳转地址
    // http://vuespz.viphk.ngrok.org/oauth?code=061IDL2D1AWfr20P1SYC1pvY2D1IDL2Y&state=1_2
    const target = config.SITE_ROOT_URL + '/oauth'
    const scope = 'snsapi_userinfo'
    // console.log('-------------------------------------------------------' + ctx.query.url)
    console.log(`-------------------------------------------------------${JSON.stringify(ctx)}`)
    const {visit, id} = ctx.query // visit 跳转地址,以前是写死的,现在重构下
    const params = id ? `${visit}_${id}` : visit
    const url = await api.wechat.getAuthorizeURL(scope, target, params)
    console.log('***************************' + url)
    // 将用户重定向到新的地址
    ctx.redirect(url)
  } catch (error) {
    console.log(error)
  }
}
// 在router中接收到 redirect的跳转地址
export async function oauth(ctx, next) {
  let url = ctx.query.url
  url = decodeURIComponent(url)

  // 解析

  const urlObj = urlParse(url)
  const params = queryParse(urlObj.query)
  const code = params.code
  const user = await api.wechat.getUserByCode(code)
  // 更新session
  ctx.session.user = user
  console.log(' oauth ' + user)
  ctx.body = {
    success: true,
    data: user
  }
}
