import { getWechat, getOAuth } from '../wechat'
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
  console.log('------------- getUserByCode data ' + data)
  const user = await oauth.getUserInfo(data.access_token, data.openid)
  return user
}
