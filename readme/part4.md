# 各种消息模板的封装

把微信中间件中的工具模块完善一下

在util.js中增加一个formatMessage 方法将xml 转换成object

```js
function formatMessage (result) {
  // 先声明一个空对象
  let message = {}
  if (typeof result === 'object') {
    // 拿到keys
    const keys = Object.keys(result)
    // 拿到value
    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]]
      let key = keys[i]
    // 如果不是数组则,跳过当前循环继续下一次
      if(!(item instanceof Array )|| item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]

        if(typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          //不是对象,赋值并判断下是否是空值
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0; i < item.length; j++){
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }
  return message
}
export {
  formatMessage,
  parseXML
}
```
*  const message = util.formatMessage(content.xml)
* // const message = JSON.parse(JSON.stringify(content)).xml
* 使用上面第二种方式可以转换xml2json

[Object.keys() - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

使用插件即可

Leonidas-from-XIV/node-xml2js: XML to JavaScript object converter.  https://github.com/Leonidas-from-XIV/node-xml2js


```js
import template from './tpl'
// content 回复内容
// message 解析后的消息
function tpl (content, message) {
  let type = 'text'
  // 判断是否是一个数组
  if (Array.isArray(content)) {
    // 将类型变更为news
    type = 'news'
  }
  // 如果content 是空值,设置默认的回复内容
  if(!content) {
    content = 'Empty News'
  }
  // 如果type 不是text 设置为text
  if(content && content.type) {
    type = content.type
  }
  // 构建消息对象
  info = Object.assign({}, {
    content: content,
    createTime: new Date().getTime(),
    msgType: type,
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  })
  return template(info)
}

```

## 新建tpl.js

### tpl.js 用于封装存放消息回复模板

```js
import ejs from 'ejs'
      const tpl = `<xml>
          <ToUserName>
          <![CDATA[<%= toUserName %>]]>
          </ToUserName>
          <FromUserName>
          <![CDATA[<%= fromUserName %>]]>
          </FromUserName>
          <CreateTime><%= createTime %></CreateTime>
          <MsgType><![CDATA[<%= msgType %>]]></MsgType>

          <% if (msgType === 'text') { %>
          <Content>
            <![CDATA[<%- content %>]]>
          </Content>
          <% } else if (msgType === 'image') { %>
          <Image>
            <MediaId>
                <![CDATA[<%= content.mediaId %>]]>
            </MediaId>
          </Image>
          <% } else if (msgType === 'voice') { %>
            <Voice>
              <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
            </Voice>
          <% } else if (msgType === 'video') { %>
            <Video>
            <MediaId>
              <![CDATA[<%= content.mediaId %>]]>
            </MediaId>
            <Title>
              <![CDATA[<%= content.title %>]]>
            </Title>
            <Description>
              <![CDATA[<%= content.description %>]]>
            </Description>
            </Video>
        <% } else if (msgType === 'music') { %>
          <Music>
              <Title>
                <![CDATA[<%= content.title %>]]>
              </Title>
              <Description>
                  <![CDATA[<%= content.description %>]]>
              </Description>
              <MusicUrl>
                  <![CDATA[<%= content.musicUrl %>]]>
              </MusicUrl>
              <HQMusicUrl>
                  <![CDATA[<%= content.hqMusicUrl %>]]>
              </HQMusicUrl>
              <ThumbMediaId>
                  <![CDATA[<%= content.thumbMediaId %>]]>
              </ThumbMediaId>
          </Music>
      <% } else if (msgType === 'news') { %>
          <ArticleCount><%= content.length %></ArticleCount>

          <Articles>
            <% content.forEach(function(item){ %>
                <item>
                    <Title>
                        <![CDATA[<%= item.title %>]]>
                    </Title>
                    <Description>
                        <![CDATA[<%= item.description %>]]>
                    </Description>
                        <PicUrl>
                            <![CDATA[<%= item.picUrl %>]]>
                        </PicUrl>
                    <Url>
                        <![CDATA[<%= item.url %>]]>
                    </Url>
                </item>
           <% }) %>

           </Articles>
      <% } %>

      </xml>`

// 不同模板切换通过type来判断

// 模板声明好了之后需要将模板编译一下

const compiled = ejs.compile(tpl)

export default compiled
```
## part4.2 接收微信普通消息


文件位置: /server/wechat/reply.js

```js
const tip = '欢迎来到河间地!\n\n<a href="http://www.baidu.com">传送</a>'
export default async (ctx, next) => {
  const message = ctx.weixin
  console.log(message)
  ctx.body = tip
}
```

微信公众平台  https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140453

```js
// 为什么要用fn.apply()?
 await reply.apply(ctx, [ctx, next])
// ---------------------------------------------------------
const tip = '欢迎来到河间地!\n\n<a href="http://www.baidu.com">传送</a>'
export default async (ctx, next) => {
  const message = ctx.weixin

  // 关注/取消关注
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      ctx.body = tip
    } else if (message.Event === 'unsubscribe') {
      console.log('取关!')
      // 上报地理位置信息
    } else if (message.Event === 'LOCATION') {
      ctx.body = message.Latitude + ' : ' + message.Longitude
    }
  } else if (message.MsgType === 'text') {
    ctx.body = message.Content
  } else if (message.MsgType === 'image') {
    console.log('================')
    ctx.body = {
      type: 'image',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'voice') {
    ctx.body = {
      type: 'voice',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'video') {
    ctx.body = {
      type: 'video',
      title: message.ThumbMediaId,
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'location') {
    ctx.body = message.Location_X + ' : ' + message.Location_Y
  } else if (message.MsgType === 'link') {
    // 这里是一个数组, 在util中会被添加为news
    ctx.body = [{
      title: message.Title,
      description: message.Description,
      picUrl: 'https://mmbiz.qpic.cn/mmbiz_jpg/VXnhnc9vfmrUjHfjXrRtyq4WldQCxpcEt70jlNCGicaibSJ4TycPwdZlJnibOhgbdaOueMraicsbZQMHAicQ3tNeLOQ/0',
      url: message.Url
    }]
  }
}


```


## part4.3 素材管理

### 实现素材上传功能

位置: /server/wechat-lib/index.js


将官网给出的临时素材地址拿过来

```js
const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential'
}

```

```js
// 3
// 新增临时素材
//https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
//https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID
const base = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: base + 'token?grant_type=client_credential',
  temporary: {
    upload: base + 'media/upload?',
    fetch: base + 'media/get?'
  },
  // 新增其他类型永久素材
  // https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
  // https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=ACCESS_TOKEN
  permanent: {
    upload: base + 'material/add_material?',
    // 图文消息内的图片
    uploadNews: base + 'material/add_news?',
    uploadNewsPic: base + 'media/uploadimg?',
    fetch: base + 'material/get_material?',
    del: base + 'material/del_material?',
    update: base + 'material/update_news',
    count: base + 'material/get_materialcount?',
    batch: base+ 'material/batchget_material?'
   }
}

```

```js
import fs from 'fs'
// 声明一个读取文件大小的方法
function statFile(filepath) {
  return new Promise((resolve, reject)=> {
    fs.stat(filepath, (err, stat) => {
      if (err) reject(err)
      else resolve(stat)
    })
  })
}

```

```js
import formstream from 'formstream'


// type 上传类型 图片 图文 视频
// material 素材本身,是图片路径,还是图文消息
// permanent 标识是否是永久素材还是临时
async uploadMaterial(token, type, material, permanent) {
  // 2.构建表单
  let form = {}
  // 2.1 临时素材地址
  let url = api.temporary.upload

  // 2.2 如果未指定则是永久素材
  if (permanent) {
    url = api.permanent.upload
    // 通过loadsh 继承 permanent 里面的数据,里面可能是一个图文素材
    _.extend(form, permanent)

  }
  // 2.3 判断上传素材类型
  if (type === 'pic') {
    url = api.permanent.uploadNewsPic
  }
  if (type === 'news') {
    url = api.permanent.uploadNews
    form = material
  } else {
    // 可能是图片或者视频,这时候需要构建表单
    // 通过 formstream() 生成表单对象
    form = formstream()
    //  media 是官方需要的,material 素材的路径, 素材大小
    const stat = await statFile(material)
      // 可能使用 formstream方式不对,以流的形式读入
      form.media = fs.createReadStream(material)
   // form.file('media', material, path.basename(material), stat.size)

  }
  // 4. 拼接上传url 的参数
  let uploadUrl = url + 'access_token=' + token
  // 如果不是永久类型则追加类型
  if (!permanent) {
    uploadUrl += '&type' + type
  } else {
    // 否则 是永久素材将token加入form表单中
     form.access_token = token
    //form.filed('access_token', access_token)
  }
  // 构建配置项
  const options = {
    methods: 'POST',
    url: uploadUrl,
    json: true
  }
  if (type === 'news') {
    // 如果类型是图文类型,将options设置为当前的form
    options.body = form
  } else {
    // 否则是一个上传图片的表单域
    options.formData = form
  }
return options
}

//  这里的uploadMaterial 不会执行上传动作, 只是配置好了上传需要的参数
//  上传动作再次封装起来

async handle(operation, ...args) {
  // 1. 拿到token
  const tokenData = await this.fetchAccessToken()
  // 2. 根据传递进去的函数和token,拿到已经准备好的配置项
  const options = await this[operation](tokenData.access_token, ...args)
  // 3. 这样options就构建好了,并传入请求
  const data = await this.request(options)
  return data
}

```
* [node-modules/formstream: multipart/form-data encoded stream, helper for file upload.](https://github.com/node-modules/formstream)
* // 2. 根据传递进去的函数和token,拿到已经准备好的配置项
  const options = await this[operation](tokenData.access_token, ...args)

### 测试

位置: server/middlewares/router.js

```js
router.get('/upload', (ctx, next) {
  let Wechat = require('../wechat-lib')
  let wechat = new Wechat(options)
  // 先测试临时素材上传
  wechat.handle('uploadMaterial', type, file)
})
```

```js
import { resolve } from 'path'
router.get('/upload', (ctx, next) => {
  let mp = require('../wechat')
  // 从以前封装好的方法中拿到config /server/wechat/index.js
  let client = mp.getWechat()
  // 先测试临时素材上传
  client.handle('uploadMaterial', 'video', resolve(__dirname, '../../123.mp4'))
})
```

### 测试上传素材

位置: router.js

```js
export const router = app => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
  router.get('/upload', async(ctx, next) => {
    let mp = require('../wechat')
// video
    let client = mp.getWechat()
    // client.handle('uploadMaterial', 'video', resolve(__dirname, '../../123.mp4'))
    const data = client.handle('uploadMaterial', 'video', resolve(__dirname, '../../123.mp4'),
    {type: 'video', description: '{"title": "haha", "introduction": "嘿嘿"}'})
    console.log(data)
  })

  // image 永久
   const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../../bizhi.jpg'), {type: 'image'})
   // image临时
   const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../../bizhi.jpg'))

       // 图文
    const news = {
      articles: [{
        'title': '呵呵笑很重要',
        'thumb_media_id': '5OAlvVYRE87r6FjevhEkNxfIv_8-iCoJYWQHrgco1oM',
        'author': '呵呵笑很重要',
        'digest': '呵呵',
        'show_cover_pic': 1,
        'content': '没有',
        'content_source_url': 'http://www.baidu.com'
      },
      {
        'title': '呵呵笑很重要23',
        'thumb_media_id': '5OAlvVYRE87r6FjevhEkNxfIv_8-iCoJYWQHrgco1oM',
        'author': '呵呵笑很重要',
        'digest': '呵呵',
        'show_cover_pic': 0,
        'content': '没有',
        'content_source_url': 'http://www.baidu.com'
      }
      // 若新增的是多图文素材，则此处应还有几段articles结构
      ]
    }
    const data = await client.handle('uploadMaterial', 'news', news, {})

```

## 获取素材

```js
/**
 * token  
 * mediaId 素材meaiaId
 * type    素材类型
 * permanent 临时或者永久标识
 * */
fetchMaterial (token, mediaId, type, permanent) {
  let form = {}
  // 默认fetchUrl地址
  let fetchUrl = api.temporary.fetch
  if (permanent) {
    fetchUrl = api.permanent.fetch
  }

  let url = fetchUrl + 'access_token' + token
  let options = {method: 'POST', url:url }

  if(permanent) {
    form.media_id = mediaId
    form.assess_token = token
    options.body = form
  } else {
    if (type === 'video') {
      // 官方临时素材视频下载不支持https:// 只能替换 
      url = url.replace('https://','http://')
    }

    url += '&media_id='
  }
return options
}

deleteMaterial(token, mediaId) {
  const form = {
    media_id: mediaId
  }
  const url = api.permanent.del + 'access_token=' + token  + '&media_id=' + mediaId
  return {method: 'POST', url: url, body: form}
}

updateMaterial(token, mediaId, news) {
  const form= {
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

//获取素材列表
batchMaterial (token, options) {
  // 做规范化处理
  options.type = options.type || 'image'
  options.offset = options.offset || 0
  options.count = options.count || 10
  
  const url = api.permanent.batch + 'access_token=' + token
  return {method: 'POST', url:url, body: options}
}
```

* 这里定义的函数都是不直接执行结果的,而是将过程定义清楚之后交给另外一个函数执行
* 这样做的好处是什么?

## 封装用户接口

```js 
// 增加接口api地址
tag: {
  create: base + 'tags/create?',
  fetch: base + 'tags/get?',
  update: base + 'tags/update?',
  del: base + 'tags/delete?',
  fetchUsers: base + 'user/tag/get?',
  batchTag: base + 'tags/members/batchtagging?',
  batchUnTag: base + 'tags/members/batchuntagging?'
  getTagList: base + 'tags/getidlist?'
},
user: {
  remark: base + 'user/info/updateremark?',
  info: base + 'user/info?',
  batchInfo: base + 'user/info/batchget?',
  fetchUserList: base + 'user/get?',
  getBlackList: base + 'tags/members/getblacklist?',
  batchBlackUsers: base + 'tags/members/batchblacklist?',
  batchUnBlackUsers: base + 'tags/members/batchunblacklist?',
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
      id: tagId,
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
batchUserInfo (token, userList) {
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
// 黑名单实现方式类似,没有实现
```

### 测试

在replay里面测试



```js
 // 测试微信粉丝,用户获取相关接口
  let mp = require('../wechat')
  let client = mp.getWechat()
  //....

} else if (message.MsgType === 'text') {
    if (message.Content === '1') {
      try {
        // const data = await client.handle('fetchUserList')
        let userList = [{
          openid: 'od9fNwqEOXR-CIapYDFEsCqhygro',
          lang: 'zh_CN'
        }]
        const data = await client.handle('batchUserInfo', userList)
        console.log('data= ' + JSON.stringify(data))
      } catch (err) {
        console.log(err)
      }
    }
    ctx.body = message.Content
  } else if (message.MsgType === 'image') {

```
```js

  const data = await client.handle('fetchTags')

```

## 自定义菜单创建于删除

### 封装接口

1. 创建接口

```js
// 添加新的api地址
menu: {
  create: base + 'menu/create?',
  get: base + 'menu/get?',
  del: base + 'menu/get?',
  addConditional: base + 'menu/addconditional?',
  delConditional: base + 'menu/delconditional?',
  tryMatch: base + 'menu/trymatch?',
  getInfo: base + 'get_current_selfmenu_info?',
}
// 添加菜单
createMenu(token, menu) {
  const url = api.menu.create + 'access_token=' + token
  return {method: 'POST', url: url, body: menu}
}
// 获取菜单
getMenu(token) {
  const url = api.menu.get + 'access_token=' + token
  return { url: url}
}
// 删除菜单
delMenu(token) {
  const url = api.menu.del + 'access_token=' + token
  return { url: url}
}
// 添加个性化菜单
addCondition(token, menu, rule) {
  const form = {
    button: menu,
    matchrule: rule
  }
  const url = api.menu.addCondition + 'access_token=' + token
  return {method: 'POST', url: url, body: form}
}
// 删除个性化菜单
delCondition(token, menuId) {
  const url = api.menu.delCondition + 'access_token=' + token
  const form = {
    menuid: menuId
  }
  return {method: 'POST', url: url, body: form}
}
//获取自定义菜单配置接口
getCurrentMenuInfo(token) {
  const url = api.menu.getInfo + 'access_token=' + token
  return { url: url}
}

```

### 测试菜单

位置: server/wechat/reply.js

增加回复规则
```js
  // 测试菜单各项功能
    } else if (message.Content === '2') {
      const menuData = await client.handle('getMenu')
      console.log('data= ' + JSON.stringify(menuData))
      ctx.body = message.Content
    }

```

###  新增菜单
增加 server/wechat/menu.js
```js
export default {
  button: [{
    'name': '游戏周边',
    'sub_button': [{
      'name': '小程序'
      'type', 'click',
      'key': 'mini_clicked'
    },{
      'name': '联系我',
      'type': 'click',
      'key': 'contact'
    },{
      'name': '手办',
      'type': 'click',
      'key': 'gift'
    }]
  },{
    'name': '冰火家族',
    'type': 'view',
    'url': 'http://coding.imooc.com'
  },{
    'name': '最新资源',
    'type': 'location_select',
    'key': 'location'
  }]
}

```

## js-SDK权限验证

### 存储临时票据
位置: database/schema/ticket.js
复制token.js代码批量替换ticket

```js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TicketSchema = new Schema({
  name: String,
  ticket: String,
  expires_in: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

TicketSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

TicketSchema.statics = {
  async getTicket() {
    const ticket = await this.findOne({
      name: 'ticket'
    }).exec()

    // if (ticket && ticket.ticket) {
    //   ticket.ticket = ticket.ticket
    // }

    return ticket
  },
  async saveTicket(data) {
    let ticket = await this.findOne({
      name: 'ticket'
    }).exec()
    if (ticket) {
      ticket.ticket = data.ticket
      ticket.expires_in = data.expires_in
    } else {
      ticket = new Ticket({
        name: 'ticket',
        ticket: data.ticket,
        expires_in: data.expires_in
      })
    }

    await ticket.save()
    .then(product => console.log(product))
    .catch(err => console.log(err))
    return data
  }
}
const Ticket = mongoose.model('Ticket', TicketSchema)
```

位置: wechat/index.js

```js
const Token = mongoose.model('Token')
const Ticket = mongoose.model('Ticket')

 getTicket: async () => await Ticket.getTicket(),
 saveTicket: async (data) => await Ticket.saveTicket(data)


```
位置: wechat-lib/index.js 新增

```js
import {sign} from './util'
 ticket: {
    get: base + 'ticket/getticket?'
  }

    this.saveAccessToken = opts.saveAccessToken
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
    this.fetchTicket()

  async fetchTicket() {
    let data = await this.getTicket()
    console.log('isValidToken=' + this.isValidToken(data, 'ticket'))
    if (!this.isValidToken(data, 'ticket')) {
      data = await this.updateTicket()
    }
    await this.saveTicket(data)
    return data
  }
  async updateTicket(token) {
    const url = api.ticket.get + '&token=' + token + '&type=jsapi'
    console.log(url)
    let data = await this.request({url: url})
    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000
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

    // 签名方法
  sign(ticket, url) {
    return sign(ticket, url)
  }

```
2. sign签名算法 

位置: wechat-lib/util.js

```js
// 生成随机字符串

function createNonce() {
  return Math.random().toString(36).substr(2, 15)
}
// 生成时间戳
function createTimestamp() {
  return parseInt(new Date().getTime() / 1000, 0) + ''
}
// 排序方法
function raw(args) {
  let keys = Object.keys(args)
  let str = ''
  let newArgs = {}
  keys = keys.sort()
  keys.forEach((key) => {
    newArgs[key.toLowerCase()] = args[key]
  })

  for (let k in newArgs) {
    str += '&' + k + '=' + newArgs[k]
  }
  return str.substr(1)
}

function signIt(nonce, ticket, timestamp, url) {
  const ret = {
    jsapi_ticket: ticket,
    nonceStr: nonce,
    timestamp: timestamp,
    url: url
  }
  const string = raw(ret)
  const sha = sha1(string)
  return sha

}

function sign(ticket, url) {
  // 声明一个随机的字符串
  const nonceStr = createNonce()
  // 时间戳
  const timestamp = createTimestamp()
  const signature = signIt(nonceStr, ticket, timestamp, url)
  return {
    noncestr: nonceStr,
    timestamp: timestamp,
    signature: signature
  }
}

export {
  formatMessage,
  parseXML,
  sign,
  tpl
}

```
## 签名流程


底层的数据交互的操作/微信相关的数据调用

位置 server/api/wechat.js
```js
import { getWechat } from '../wechat'
// 拿到case
const client = getWechat()
// 拿到全局票据
export async function getSignatureAsync(url) {
  const data = await client.fetchAccessToken()
  const token = data.access_token
  const ticketData = await client.fetchTicket()
  const ticket = ticketData.ticket

  let params = client.sign(ticket, url)
  params.appId = client.appID
  return params
}

// 像俄罗斯套娃一样层层的函数,越往里面的函数需要的参数越少

```

位置: server/api/controllers/wechat.js
微信业务相关的控制逻辑

```js
import * as api from '../api'
export aysnc function signature(ctx, next) {
  const url = ctx.query.url
  // 
  if (!url) ctx.throw(404)
  const params = await api.getSignatureAsync(url)
  ctx.body = {
    success: true,
    params: params
  }
}
```
#### path: server/api/index.js
通过index.js 收集所需要暴露出来的api

```js
import {
  getSignatureAsync
}from './wechat'

export {
  getSignatureAsync
}

// 这样就可以在其他文件中通过 import * as api from '../api'
// 直接通过api来调用所暴露出来的方法了
```

位置:router.js
增加一个

```js
import {signature} from '../controllers/wechat'
router.get('/wechat-signature', wechat.signature)

```

## 测试页面
pages/about.vue

```js


// nuxt.config.js 中增加

,
    scripts: [
      {
        src: 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js'
      }
    ]
```

```js

  beforeMount() {
    const wx = window.wx
    const url = window.location.href
    this.$store.dispatch('getWechatSignture', url)
    .then(res => {
      if (res.data.success) {
        const params = res.data.params
      }

      wx.config({
        debug: true,
        appId: params.appId,
        timestamp: params.timestamp,
        nonceStr: params.noncestr,
        signature: params.signature,
        jsApiList: [
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'onMenuShareTimeline',
          'hideAllNonBaseMenuItem',
          'showMenuItems',
        ]
      })
      // 等到config信息验证之后就会执行read()方法,
      // 所有的接口必须要config验证之后才能调用,
      // config权限验证是异步的动作,为保证接口在页面加载的时候都能使用,
      // 将其放入wx.ready回调方法中,如果是用户触发调用的接口比如:分享就不用放入
      wx.ready(() => {
        wx.hideAllNonBaseMenuItem()
        console.log('success!')
      })
    })
  }
```

## 实现请求签名接口

新增 /store
如果有store会被nuxt 现式的调用,在store里面存放跟vue有关的数据状态

index.js

```js
import Vuex from 'vuex'
import getters from './getters'
import actions from './actions'
import mutations from './mutations'


const createStore = () => {
  return new Vuex.Store({
    state: {

    },
    getters,
    actions,
    mutations
  })
}

export default  createStore
```
新建  actions.js mutations.js getters.js

actions.js
```js
import Services from './Services'
// 通过它来请求签名值的操作
export default {
  getWechatSignature({ commit }, url) {
    return Services.getWechatSignature(url)
  }
}

```
新建 ./services.js

```js
import axios from 'axios'
const baseUrl = ''
class Services {
  getWechatSignature(url) {
    return axios.get(`${baseUrl}/wechat-signature?url=${url}`)
  }
}
export default new Service()
```
mutations.js getters.js 暂时未对外空对象



---
### 一个有趣的问题

当我定义了一个类并将其在其自身当中new 一个实例并导出

```js 

class Services {
  getWechatSignature(url) {
   // ...
}
export default new Service()

// 在其他文件中引用的时候不小心写错了

import Services from './Services'
// 将文件名service 写错成 Service结果,有警告提示


There are multiple modules with names that only differ in casing.
This can lead to unexpected behavior when compiling on a filesystem with other case-semantic.
Use equal casing. Compare these module identifiers:
* E:\myGitHub\fire\node_modules\babel-loader\lib\index.js??ref--1!E:\myGitHub\fire\node_modules\eslint-loader\index.js!E:\myGitHub\fire\store\Services.js
    Used by 1 module(s), i. e.
    E:\myGitHub\fire\node_modules\babel-loader\lib\index.js??ref--1!E:\myGitHub\fire\node_modules\eslint-loader\index.js!E:\myGitHub\fire\store\actions.js
* E:\myGitHub\fire\node_modules\babel-loader\lib\index.js??ref--1!E:\myGitHub\fire\node_modules\eslint-loader\index.js!E:\myGitHub\fire\store\services.js
    Used by 1 module(s), i. e.
    E:\myGitHub\fire\store /^\.\/(?!-)[^.]+\.(js)$/
```

* 猜测应该是 将./service文件导入进来了
* 并且多导入了一份,换了个路径
* 应该是./Service路径有歧义


QA

授权的access_token 和公共号的全局票据access_token有什么区别?

    微信网页授权是基于OAuth2.0 体系是完全独立的,不仅在微信中可以使用而且在其他网站,比如微博github等等 包括自己的网站中都可以使用,让用户手动同意后会颁发一个凭证,这个凭证可以帮助用户登录,也可以帮助服务器获得用户资料,和全局票据access_token,完全不是一个东西,除了名字一样

授权的access_token和 是全局的还是跟每次获取的code要配对?一对一的使用,一个人用一次?


授权的reflash token是怎么回事,刷不刷新有什么区别?

    虽然官方提供了token的刷新机制,不是追求很完备的回话体验,可以完全不用理会,只会让你初次接触授权的时候让你的开发难度变大,索性不要实现它,每次只要重新获取即可,如果我们每次获取一个新的token,而且官方也没有设置调用的门槛限制,那么也不用保存这个token,也不用关心和,用户是一对一和一对多的关系,反正每次都要用户来同意授权然后拿着code换token,再拿token获取用户资料就行了

授权的用户资料获取需要什么资质的公众号?

    必须是认证后的服务号,才能在网页中利用OAuth这个机制,来获取用户的信息,订阅号无论是认证还是不认证都是不行的.


## 用户授权获取用户资料的流程

整个请求的后端流程

1. 用户来访问我们的页面a 路径/a?a=1&b=2
2. 后端收到用户访问的请求, url地址 /a 然后将它拼接成跳转地址redirect_url 这个地址是微信的一个地址,只不过拼接了一个参数这个参数值里面的目标地址,假设是b页面 redirect_url = /b 最终返回给用户的就是 redirect_url = /b 这个地址
3. 当用户点击页面上的同意授权按钮,然后就会二次跳转,就跳到b页面,将上a页面带过来的参数比如商品的id,在b页面可以拿到微信传过来的code 还有state就是从a页面传递过来的参数, /b?code&state,通过拿到的code换区access_token 和openid 然后就能获取用户资料或者可以做一些业务层面的封装

### 新增 wechat-lib/oauth.js

复制 index.js的代码修改

```js
import request from 'request-promise'
const base = 'https://api.weixin.qq.com/sns/'
const api = {
  // 用来让用户手动同意授权的地址,二跳地址
  authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
  // 网页授权token
  access_token: base + 'oauth2/access_token?',
  userInfo: base + 'userinfo?'
}

export default class WechatOAuth {
  constructor(opts) {
    this.opts = Object.assign({}, opts)

    this.appID = opts.appID
    this.appSecret = opts.appSecret
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
  // 拼接一个地址拿到 code
  // 1. 先给一个scope 默认值
  // 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），// snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使// 在未关注的情况下，只要用户授权，也能获取其信息 ）
  // https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
  // target 目标地址
  // state 传递的参数
  getAuthorizeURL(scope = 'snsapi_base', target, state)){
    // 拼接
    const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    return url
  }
  async fetchAccessToken() {
    // 获取token的地址 code 是微信服务器返回的
    const url = `${api.access_token}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`

    const data = await this.request({url: url})
    return data
  }

  async getUserInfo (token, openID, lang='zh_CN') {
    const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
    const data = await this.request({url: url})
    return data
  }
}

```

位置: router.js

```js
import { signature, redirect, oauth } from '../controllers/wechat'
  router.get('/wechat-signature', signature)
  // 将用户偷偷跳转到二跳地址
  router.get('/wechat-redirect', redirect)
  // 用户跳转过来之后需要通过授权机制获取用户信息
```
位置: controllers/wechat.js

```js
// 拼接好跳转的目标地址,把用户重定向到这个地址
export async function redirect(ctx, next) {
  // SITE_ROOT_URL网站根地址
  const target = config.SITE_ROOT_URL + '/oauth'
  const scope = 'snsapi_userinfo' 
  const {a, b} = ctx.query // 拿到的查询参数
  const params = `${a}_${b}`
  const url = api.getAuthorizeURL(scope, target, params)
  // 将用户重定向到新的地址
  ctx.redirect(url)
}

```

* // 为什么需要'/oauth'?(const target = config.SITE_ROOT_URL + '/oauth')
* // 也可以不要授权后跳转地址,自己体会
* // http://vuespz.viphk.ngrok.org/oauth?code=061IDL2D1AWfr20P1SYC1pvY2D1IDL2Y&state=1_2

位置 api/index.js
```js
import {
  getSignatureAsync,
  getAuthorizeURL
} from './wechat'

export {
  getSignatureAsync,
  getAuthorizeURL
}

// 这样就可以在其他文件中通过 import * as api from '../api'
// 直接通过api来调用所暴露出来的方法了

```

位置 api/wechat.js

```js
import { getWechat, getOAuth } from '../wechat'
export async function getAuthorizeURL(...args) {
  const oauth = getOAuth()
  return oauth.getAuthorizeURL(...args)
}
```

新增/wechat/index.js

新增一个接口,暴露出oauth的实例
```js
import WechatOAuth from '../wechat-lib/oauth'
export const getOAuth = () => {
  const oauth = new WechatOAuth(wechatConfig.wechat)
  return oauth
}
```
控制器 controllers/wechat.js
```js
import { parse as urlParse } from 'url'
import { parse as queryParse } from 'querystring'

/ 在router中接收到 redirect的跳转地址
export async function oauth(ctx, next) {
  let url = ctx.query.url
  url = decodeURIComponent(url)
  // 解析
  const urlObj = urlParse(url)
  const params = queryParse(urlObj.query)
  const code = params.code
  const user = await api.getUserByCode(code)
  console.log(' oauth ' + user)
  ctx.body = {
    success: true,
    data: user
  }

```

位置 api/index.js
```js
import {
  getSignatureAsync,
  getAuthorizeURL,
  getUserByCode
} from './wechat'

export {
  getSignatureAsync,
  getAuthorizeURL,
  getUserByCode
}

// 这样就可以在其他文件中通过 import * as api from '../api'
// 直接通过api来调用所暴露出来的方法了

```

位置: api/wechat.js
```js
export async function getUserByCode(code) {
  const oauth = getOAuth()
  const data = await oauth.fetchAccessToken(code)
  const user = await oauth.getUserInfo(data.access_token, data.openid)
  return user
}
```

服务端功能完成

## 测试页面

位置pages/oauth.vue

复制about.vue

修改为
```js
beforeMount() {
    const url = window.location.href
    this.$store.dispatch('getUserByOAuth', encodeURIComponent(url))
    .then(res => {
      let params = ''
      if (res.data.success) {
        params = res.data.params
      }

      console.log(' OAuth.vue ' + res.data)
    })
  }
}
```
位置 /store/actions.js
```js
 getUserByOAuth({ commit }, url) {
    return Services.getUserByOAuth(url)
  }
  ```

在service.js新增
```js
 getUserByOAuth(url) {
    return axios.get(`${baseUrl}/wechat-oauth?url=${url}`)
  }
```
在config中新增

```js
 SITE_ROOT_URL: 'http://http://vuespz.viphk.ngrok.org',
 ```
## 添加回调域名
 在测试号的
https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index

* 接口配置信息修改 
* 体验接口权限表 > 网页服务 > 网页帐号	网页授权获取用户基本信息
* vuespz.viphk.ngrok.org/
