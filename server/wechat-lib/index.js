import request from 'request-promise'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential'
}

export default class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)

    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()
  }
  async request(options) {
    const response = await request(options)
    return response
  }

  async fetchAccessToken() {
    let data = await this.getAccessToken()
    console.log('isValidAccessToken=' + this.isValidAccessToken(data))
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken()
    }
    await this.saveAccessToken(data)
    console.log('..............+ ' + data)
    return data
  }

  async updateAccessToken() {
    const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret
    console.log(url)
    let data = await this.request({url: url})
    console.log('-----------' + data)
    data = JSON.parse(data)
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000
    console.log('data.expires_in = ' + data.expires_in)
    console.log('**********' + data + 'now= ' + now + ' expiresIn= ' + expiresIn)
    data.expires_in = expiresIn
    console.log('+++++++++++' + data)
    return data
  }

  isValidAccessToken(data) {
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }
    const expiresIn = data.expires_in
    const now = (new Date().getTime())
    if (now < expiresIn) {
      return true
    } else {
      return false
    }
  }
}
