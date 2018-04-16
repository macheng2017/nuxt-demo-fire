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
