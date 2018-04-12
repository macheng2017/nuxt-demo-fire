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
          message[key] = formateMessage(val)
        } else {
          //不是对象,赋值并判断下是否是空值
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0; i < item.length; j++){
          message[key].push(fromatMessage(item[j]))
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
  // 如果type不是text 设置为text
  if(content && content.type) {
    type = 'text'
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
            <% content.forEatch(function(item){ %>
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
const tip = '欢迎来到河间地!\n\n<a href="http://www.baidu.com">传送</a>'
export default async (ctx, next) => {
  const message = ctx.weixin
  // 将消息原样回复
  if (message.MsgType === 'text') {
    ctx.body = message.Content
  } else if (message.MsgType === 'image') {
    ctx.body = {
      msgType: 'image',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'voice') {
    ctx.body = {
      msgType: 'voice',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'video') {
    ctx.body = {
      title: message.ThumbMediaId,
      msgType: 'video',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'location') {
    ctx.body = {
      msgType: 'location',
      Location_X: message.Location_X,
      Location_Y: message.Location_Y
    }
  } else if (message.MsgType === 'link') {
    ctx.body = {
      title: message.Title,
      msgType: 'link',
      mediaId: message.MediaId
    }
  }
```


```js
// 关注/取消关注
if (message.MsgType === 'event') {
  if(message.Event === 'subscribe') {
    ctx.body = tip
  } else if (message.Event === 'unsubscribe') {
    console.log('取关!')
    // 上报地理位置信息
  } else if (message.Event === 'LOCATION') {
    ctx.body = message.Latitude + ' : ' + message.Longitude
  }
}


```
