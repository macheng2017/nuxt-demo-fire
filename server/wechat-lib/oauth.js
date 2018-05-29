import request from 'request-promise'
const base = 'https://api.weixin.qq.com/sns/'
const api = {
  // 用来让用户手动同意授权的地址,二跳地址
  authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
  accessToken: base + 'oauth2/access_token?',
  userInfo: base + 'userinfo?'
}

export default class WechatOAuth {
  constructor(opts) {
    this.opts = Object.assign({}, opts)

    this.appID = opts.appID
    this.appSecret = opts.appSecret
  }
  async request(options) {
    options = Object.assign({}, options, {
      json: true
    })
    try {
      const response = await request(options)
      return response
    } catch (error) {
      console.error(error)
    }
  }
  getAuthorizeURL(scope = 'snsapi_base', target, state) {
    // 拼接
    const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    // console.log(' getAuthorizeURL ' + url)
    return url
  }

  async fetchAccessToken (code) {
    const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`
    const data = await this.request({url: url})

    return data
  }

  async getUserInfo(token, openID, lang = 'zh_CN') {
    const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
    console.log('+++++++++getUserInfo url ' + url)
    const data = await this.request({
      url: url
    })
    return data
  }
}
