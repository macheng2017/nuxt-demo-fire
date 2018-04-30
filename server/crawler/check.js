import { resolve } from 'path'
import R from 'ramda'
import { find } from 'lodash'
import { writeFileSync } from 'fs'

// 比对爬到的数据
const characters = require(resolve(__dirname, '../../characters.json'))
const IMDbData = require(resolve(__dirname, '../../imdb.json'))
// 定义比对规则
const findNameInAPI = (item) => {
  return find(characters, {
    name: item.name
  })
}
// 同一个角色,在不同的年龄段有不同的扮演者,在API中playedBy是一个数组
const findPlayedByInAPI = (item) => {
  return find(characters, i => {
    return i.playedBy.includes(item.playedBy)
  })
}

const validData = R.filter(
  // 比对imdb的名字,在不在另外爬到的api里面,如果在就是合法的
  i => findNameInAPI(i) && findPlayedByInAPI(i)
)

const IMDb = validData(IMDbData)

// 把文件写到本地
writeFileSync('./wikiCharacters.json', JSON.stringify(IMDb, null, 2), 'utf8')
