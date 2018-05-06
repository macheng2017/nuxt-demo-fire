import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'
import _ from 'lodash'

// 1. 读取文件内容

// 2. 过滤出家族名称信息

const getHousesInfo = async () => {
  let houses = require(resolve(__dirname, '../completeHouses.json'))
  // console.log(houses)
  houses = R.map(
    R.compose(
    // i => R.reduce((acc, item) => {
    //   acc = acc.concat(item)
    //   console.log('------' + i)
    //   return acc

    //   // R.concat(acc, item)
    // }, [], i),
    i => {
      let j = []
      j = R.concat(i, j)

      console.log('=====' + i)
      console.log('-------' + j)
      return j
    },
    R.map(i => {
      const item = i.split('，')
      const name = item.shift()
      return [name.replace(/【|】|/g, ''), item.join(',')]
    }),
    R.nth(1),
    // 从指定索引将数组拆成两个数组
    R.splitAt(1),
    R.prop('content'),
    R.nth(0),
    R.filter(i => R.test(/伊耿历/, i.title)),
    R.prop('sections')

  ), houses)

  fs.writeFileSync('./test/houses.json', JSON.stringify(houses, null, 2), 'utf8')
}

getHousesInfo()

// String.prototype.replace() - JavaScript | MDN  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace
