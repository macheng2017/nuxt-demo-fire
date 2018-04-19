import { getWechat, getOAuth } from '../wechat'
// 拿到case
const client = getWechat()
// 拿到全局票据
const oauth = getOAuth()
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
  return oauth.getAuthorizeURL(...args)
}
export async function getUserByCode(code) {
  // const oauth = getOAuth()
  const data = await oauth.fetchAccessToken(code)
  const user = await oauth.getUserInfo(data.access_token, data.openid)
  return user
}
