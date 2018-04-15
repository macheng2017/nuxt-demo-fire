import request from 'request-promise'
import fs from 'fs'
import * as _ from 'lodash'
import formstream from 'formstream'
import path from 'path'

const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential',
  temporary: {
    upload: base + 'media/upload?',
    fetch: base + 'media/get?'
  },
  permanent: {
    upload: base + 'material/add_material?',
    // 图文消息内的图片
    uploadNews: base + 'material/add_news?',
    uploadNewsPic: base + 'media/uploadimg?',
    fetch: base + 'material/get_material?',
    del: base + 'material/del_material?',
    update: base + 'material/update_news',
    count: base + 'material/get_materialcount?',
    batch: base + 'material/batchget_material?'
  }
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
    try {
      const response = await request(options)
      return response
    } catch (error) {
      console.log(error)
    }
  }

  async fetchAccessToken() {
    let data = await this.getAccessToken()
    console.log('isValidAccessToken=' + this.isValidAccessToken(data))
    if (!this.isValidAccessToken(data)) {
      data = await this.updateAccessToken()
    }
    await this.saveAccessToken(data)
    // console.log('..............+ ' + data)
    return data
  }

  async updateAccessToken() {
    const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret
    console.log(url)
    let data = await this.request({url: url})
    // console.log('-----------' + data)
    data = JSON.parse(data)
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000
    // console.log('data.expires_in = ' + data.expires_in)
    // console.log('**********' + data + 'now= ' + now + ' expiresIn= ' + expiresIn)
    data.expires_in = expiresIn
    // console.log('+++++++++++' + data)
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
  uploadMaterial(token, type, material, permanent) {
    let form = {}
    let url = api.temporary.upload

    if (permanent) {
      url = api.permanent.upload
      _.extend(form, permanent)
    }
    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    }
    if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      // form = formstream()
      // 可能使用 formstream方式不对,以流的形式读入
      form.media = fs.createReadStream(material)
      // const stat = await statFile(material)
      // form.file('media', material, path.basename(material), stat.size)
    }
    let uploadUrl = url + 'access_token=' + token
    if (!permanent) {
      uploadUrl += '&type=' + type
    } else {
      if (type !== 'news') {
        form.access_token = token
        // form.field('access_token', token)
      }
    }

    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }
    if (type === 'news') {
      options.body = form
    } else {
      options.formData = form
    }
    return options
  }

  async handle(operation, ...args) {
    try {
      const tokenData = await this.fetchAccessToken()
      const options = await this[operation](tokenData.access_token, ...args)
      console.log('上传中 = ' + JSON.stringify(options))
      const data = await this.request(options)
      console.log('上传的数据 data = ' + JSON.stringify(data))
      return data
    } catch (error) {
      console.log(error)
    }
  }
}

// 声明一个读取文件大小的方法
function statFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.stat(filepath, (err, stat) => {
      if (err) reject(err)
      else resolve(stat)
    })
  })
}
