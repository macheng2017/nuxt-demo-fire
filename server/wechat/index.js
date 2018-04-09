import mongoose from 'mongoose'
import config from '../config'
import Wechat from '../wechat-lib'

const Token = mongoose.model('Token')

const wechatConfig = {
  wechat: {
    appID: config.wechat.appID,
    appSecret: config.wechat.appSecret,
    token: config.wechat.appSecret,
    getAccessToken: async () => await Token.getAccessToken(),
    saveAccessToken: async () => await Token.saveAccessToken(data)
  }
}

export const getWechat = () => {
  const wechatClient = new Wechat(wechatConfig.wechat)
  return wechatClient
}

getWechat()
