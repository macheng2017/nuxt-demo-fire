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
[Object.keys() - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

使用插件即可

Leonidas-from-XIV/node-xml2js: XML to JavaScript object converter.  https://github.com/Leonidas-from-XIV/node-xml2js


```js
import template from '../tpl'
// content 回复内容
// message 解析后的消息
function tpl (content, message) {
  let type = 'text'
  let info = {}
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
  let info = Object.assign({}, {
    content: content,
    createTime: new Date().getTime(),
    msgType: content.Type || 'text'
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
const tpl = il.tpl(replyBody, msg)
      const xml = `<xml>
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
                < ![CDATA[<%= content.mediaId %>] ]>
            </MediaId>
          </Image>
          <% } else if (msgType === 'image') { %>
            <Voice>
              <MediaId>< ![CDATA[<%= content.mediaId %>] ]></MediaId>
            </Voice>
          <% } else if (msgType === 'image') { %>
            <Video>
            <MediaId>
              <![CDATA[<%= content.mediaId %>]]>
            </MediaId>
            <Title>
              <![CDATA[title]]>
            </Title>
            <Description>
              <![CDATA[description]]>
            </Description>
            </Video>
        <% } else if (msgType === 'image') { %>
          <Music>
              <Title>
                <![CDATA[TITLE]]>
              </Title>
              <Description>
                  <![CDATA[DESCRIPTION]]>
              </Description>
              <MusicUrl>
                  <![CDATA[MUSIC_Url]]>
              </MusicUrl>
              <HQMusicUrl>
                  <![CDATA[HQ_MUSIC_Url]]>
              </HQMusicUrl>
              <ThumbMediaId>
                  <![CDATA[<%= content.mediaId %>]]>
              </ThumbMediaId>
          </Music>
      <% } else if (msgType === 'image') { %>
          <ArticleCount>2</ArticleCount>
          <Articles>
              <item>
                  <Title>
                      <![CDATA[title1]]>
                  </Title>
                  <Description>
                      <![CDATA[description1]]>
                  </Description>
                      <PicUrl>
                          <![CDATA[picurl]]>
                      </PicUrl>
                  <Url>
                      <![CDATA[url]]>
                  </Url>
              </item>
           </Articles>
      <% } else if (msgType === 'image') { %>

      </xml>`

// 不同模板切换通过type来判断
