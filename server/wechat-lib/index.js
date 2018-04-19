import request from 'request-promise'
import fs from 'fs'
import * as _ from 'lodash'
import {sign} from './util'
// import formstream from 'formstream'

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
    update: base + 'material/update_news?',
    count: base + 'material/get_materialcount?',
    batch: base + 'material/batchget_material?'
  },
  tag: {
    create: base + 'tags/create?',
    fetch: base + 'tags/get?',
    update: base + 'tags/update?',
    del: base + 'tags/delete?',
    fetchUsers: base + 'user/tag/get?',
    batchTag: base + 'tags/members/batchtagging?',
    batchUnTag: base + 'tags/members/batchuntagging?',
    getTagList: base + 'tags/getidlist?'
  },
  user: {
    remark: base + 'user/info/updateremark?',
    info: base + 'user/info?',
    batchInfo: base + 'user/info/batchget?',
    fetchUserList: base + 'user/get?',
    getBlackList: base + 'tags/members/getblacklist?',
    batchBlackUsers: base + 'tags/members/batchblacklist?',
    batchUnBlackUsers: base + 'tags/members/batchunblacklist?'
  },
  menu: {
    create: base + 'menu/create?',
    get: base + 'menu/get?',
    del: base + 'menu/delete?',
    addConditional: base + 'menu/addconditional?',
    delConditional: base + 'menu/delconditional?',
    tryMatch: base + 'menu/trymatch?',
    getInfo: base + 'get_current_selfmenu_info?'
  },
  ticket: {
    get: base + 'ticket/getticket?'
  }
}

export default class Wechat {
  constructor(opts) {
    this.opts = Object.assign({}, opts)

    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
    this.fetchAccessToken()
    // 不能在类初始化的时候调用fetchTicket,因为还没有当前url 以及 token
    // this.fetchTicket()
  }
  async request(options) {
    options = Object.assign({}, options, {json: true})
    try {
      const response = await request(options)
      return response
    } catch (error) {
      console.error(error)
    }
  }

  async fetchAccessToken() {
    let data = await this.getAccessToken()
    console.log(' fetchAccessToken isValidToken=' + this.isValidToken(data, 'access_token'))
    if (!this.isValidToken(data, 'access_token')) {
      data = await this.updateAccessToken()
    }
    await this.saveAccessToken(data)
    // console.log('..............+ ' + data)
    return data
  }
  async updateAccessToken() {
    const url = api.accessToken + '&appid=' + this.appID + '&secret=' + this.appSecret
    console.log(' updateAccessToken ' + url)
    let data = await this.request({url: url})
    // console.log('-----------' + data)
    // data = JSON.parse(data)
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000
    console.log(' updateAccessToken data.expires_in = ' + data.expires_in)
    // console.log('**********' + data + 'now= ' + now + ' expiresIn= ' + expiresIn)
    data.expires_in = expiresIn
    // console.log('+++++++++++' + data)
    return data
  }
  async fetchTicket(token) {
    let data = await this.getTicket()
    console.log(' fetchTicket isValidToken=' + this.isValidToken(data, 'ticket'))
    if (!this.isValidToken(data, 'ticket')) {
      data = await this.updateTicket(token)
    }
    await this.saveTicket(data)
    return data
  }

  async updateTicket(token) {
    const url = api.ticket.get + '&access_token=' + token + '&type=jsapi'
    console.log(' updateTicket ' + url)
    let data = await this.request({url: url})
    console.log(' ticket data = ' + JSON.stringify(data))
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000
    console.log(' ticket data.expires_in = ' + data.expires_in)
    data.expires_in = expiresIn
    return data
  }

  isValidToken(data, name) {
    if (!data || !data[name] || !data.expires_in) {
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
      let options = this[operation](tokenData.access_token, ...args)
      console.log('上传中 = ' + JSON.stringify(options))
      const data = await this.request(options)
      // console.log('上传的数据 data = ' + JSON.stringify(data))
      return data
    } catch (error) {
      console.log(error)
    }
  }

/**
 * token
 * mediaId 素材meaiaId
 * type    素材类型
 * permanent 临时或者永久标识
 * */
  fetchMaterial(token, mediaId, type, permanent) {
    let form = {}
    // 默认fetchUrl地址
    let fetchUrl = api.temporary.fetch
    if (permanent) {
      fetchUrl = api.permanent.fetch
    }

    let url = fetchUrl + 'access_token' + token
    let options = { method: 'POST', url: url }

    if (permanent) {
      form.media_id = mediaId
      form.assess_token = token
      options.body = form
    } else {
      if (type === 'video') {
        // 官方临时素材视频下载不支持https:// 只能替换
        url = url.replace('https://', 'http://')
      }

      url += '&media_id='
    }
    return options
  }

  deleteMaterial(token, mediaId) {
    const form = {
      media_id: mediaId
    }
    const url = api.permanent.del + 'access_token=' + token + '&media_id=' + mediaId
    return {method: 'POST', url: url, body: form}
  }

  updateMaterial(token, mediaId, news) {
    const form = {
      media_id: mediaId
    }
    _.extend(form, news)
    const url = api.permanent.update + 'access_token=' + token + '&media_id' + mediaId
    return {method: 'POST', url: url, body: form}
  }
  // 获取素材总数
  countMaterial(token) {
    const url = api.permanent.count + 'access_token=' + token
    return {method: 'POST', url: url}
  }

  // 获取素材列表
  batchMaterial(token, options) {
    // 做规范化处理
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10
    const url = api.permanent.batch + 'access_token=' + token
    return {method: 'POST', url: url, body: options}
  }
    // 创建标签
  createTag(token, name) {
    const form = {
      tag: {
        name: name
      }
    }
    const url = api.tag.create + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }
  // 获取标签列表
  fetchTags(token) {
    const url = api.tag.fetch + 'access_token=' + token
    // 不写method默认get
    return {url: url}
  }
  updateTag(token, tagId, name) {
    const form = {
      tag: {
        id: tagId,
        name: name
      }
    }
    const url = api.tag.update + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }

  delTag(token, tagId) {
    const form = {
      tag: {
        id: tagId
      }
    }
    const url = api.tag.del + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }

  fetchTagUsers(token, tagId, openId) {
    let form = {
      tagid: tagId,
      next_openid: openId || ''
    }
    const url = api.tag.fetchUsers + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }
  // 批量为用户打标签/删除标签
  batchTag(token, openIdList, tagId, unTag) {
    const form = {
      openid_list: openIdList,
      tagid: tagId
    }
    let url = api.tag.batchTag
    if (unTag) {
      url = api.tag.batchUnTag
    }
    url += 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }

  //  获取用户身上的标签列表
  getTagList(token, openId) {
    const form = {
      openid: openId
    }
    const url = api.tag.getTagList + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }
  // 设置用户备注名
  markUser(token, openId, remark) {
    const form = {
      opeid: openId,
      remark: remark
    }
    const url = api.user.remark + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }
  // 获取用户基本信息(UnionID机制)
  getUserInfo(token, openId, lang) {
    const url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang || 'zh_CN'}`
    return {url: url}
  }
  // 批量获取用户基本信息
  batchUserInfo(token, userList) {
    const url = api.user.batchInfo + 'access_token=' + token
    const form = {
      user_list: userList
    }
    return {method: 'POST', url: url, body: form}
  }
  // 获取用户列表
  fetchUserList(token, openId, lang) {
    const url = `${api.user.fetchUserList}access_token=${token}&next_openid=${openId || ''}`
    return {url: url}
  }

    // 添加菜单
  createMenu(token, menu) {
    const url = api.menu.create + 'access_token=' + token
    return {method: 'POST', url: url, body: menu}
  }
  // 获取菜单
  getMenu(token) {
    const url = api.menu.get + 'access_token=' + token
    return {url: url}
  }
  // 删除菜单
  delMenu(token) {
    const url = api.menu.del + 'access_token=' + token
    return {url: url}
  }
  // 添加个性化菜单
  addConditionMenu(token, menu, rule) {
    const form = {
      button: menu,
      matchrule: rule
    }
    const url = api.menu.addConditional + 'access_token=' + token
    return {method: 'POST', url: url, body: form}
  }
  // 删除个性化菜单
  delConditionMenu(token, menuId) {
    const url = api.menu.dellConditional + 'access_token=' + token
    const form = {
      menuid: menuId
    }
    return {method: 'POST', url: url, body: form}
  }
  // 获取自定义菜单配置接口
  getCurrentMenuInfo(token) {
    const url = api.menu.getInfo + 'access_token=' + token
    return {url: url}
  }
  // 签名方法
  sign(ticket, url) {
    return sign(ticket, url)
  }
// 黑名单实现方式类似,没有实现
}
// 声明一个读取文件大小的方法
// function statFile(filepath) {
//   return new Promise((resolve, reject) => {
//     fs.stat(filepath, (err, stat) => {
//       if (err) reject(err)
//       else resolve(stat)
//     })
//   })
// }
