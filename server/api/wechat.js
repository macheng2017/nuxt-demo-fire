import { getWechat } from '../wechat'
// 拿到case
const client = getWechat()
// 拿到全局票据
export async function getSignatureAsync(url) {
  const data = await client.fetchAccessToken()
  const token = data.access_token
  const ticketData = await client.fetchTicket(token)
  const ticket = ticketData.ticket

  let params = client.sign(ticket, url)
  params.appId = client.appID
  return params
}
