import xml2js from 'xml2js'

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

function 


export {
  formatMessage,
  parseXML,
  tpl
}
