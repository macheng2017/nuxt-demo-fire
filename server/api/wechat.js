import {
  getWechat,
  getOAuth
} from '../wechat'
import mongoose from 'mongoose'
const User = mongoose.model('User')
// 拿到case
const client = getWechat()
// 拿到全局票据
export async function getSignatureAsync(url) {
  const data = await client.fetchAccessToken()
  const token = data.access_token
  console.log(' getSignatureAsync token' + token)
  const ticketData = await client.fetchTicket(token)
  const ticket = ticketData.ticket

  let params = client.sign(ticket, url)
  console.log(' getSignatureAsync params ' + JSON.stringify(params))
  params.appId = client.appID
  return params
}
export async function getAuthorizeURL(...args) {
  const oauth = getOAuth()
  return oauth.getAuthorizeURL(...args)
}
export async function getUserByCode(code) {
  console.log('------------- getUserByCode code ' + code)
  const oauth = getOAuth()
  console.log('------------- getUserByCode oauth ' + JSON.stringify(oauth))
  const data = await oauth.fetchAccessToken(code)
  console.log('------------- getUserByCode data ' + JSON.stringify(data))
  // 只开发一个应用可以通过openid,如果是多个则是unionid
  // const user = await oauth.getUserInfo(data.access_token, data.openid)
  // 拿到的用户资料
  // https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
  const user = await oauth.getUserInfo(data.access_token, data.unionid)
  console.log(' api/wechat user ' + JSON.stringify(user))
  // 去除重复
  const existUser = await User.findOne({
    unionid: data.unionid
  }).exec()
  console.log('api/wechat existUser ' + existUser)
  console.log('api/wechat unionid ' + data.unionid)
  console.log('api/wechat user.unionid ' + user.unionid)

  if (!existUser) {
    let newUser = new User({
      openid: [data.openid],
      unionid: data.unionid,
      nickname: user.nickname,
      province: user.province,
      country: user.country,
      city: user.city,
      headimgurl: user.headimgurl,
      sex: user.sex
    })
    await newUser.save()
  }
  return {
    nickname: user.nickname,
    province: user.province,
    country: user.country,
    city: user.city,
    unionid: user.unionid,
    headimgurl: user.headimgurl,
    sex: user.sex
  }
}
