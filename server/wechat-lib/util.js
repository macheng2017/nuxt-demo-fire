import xml2js from 'xml2js'
import template from './tpl'
import sha1 from 'sha1'

function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

/**
 *
 * @param {*} result
 */
function formatMessage(result) {
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
      if (!(item instanceof Array) || item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]

        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          // 不是对象,赋值并判断下是否是空值
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0; i < item.length; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }
  return message
}

function tpl(content, message) {
  let type = 'text'
  if (Array.isArray(content)) {
    type = 'news'
  }
  if (!content) {
    content = 'Empty news'
  }
  if (content && content.type) {
    type = content.type
  }
  let info = Object.assign({}, {
    content: content,
    createTime: new Date().getTime(),
    msgType: type,
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  })
  return template(info)
}
// 生成随机字符串

function createNonce() {
  return Math.random().toString(36).substr(2, 15)
}
// 生成时间戳
function createTimestamp() {
  return parseInt(new Date().getTime() / 1000, 0) + ''
}
// 排序方法,为什么不直接用sort
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
/**
 *
 * @param {*} nonce 随机字符串
 * @param {*} ticket jsapi_ticket
 * @param {*} timestamp 时间戳
 * @param {*} url 当前网页的url，不包含#及其后面部分
 */
function signIt(nonce, ticket, timestamp, url) {
  const ret = {
    jsapi_ticket: ticket,
    noncestr: nonce,
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
