import fs from 'fs'
import { resolve } from 'path'
import mongoose from 'mongoose'
import config from '../config'
import R from 'ramda'

const models = resolve('__dirname', '../server/database/schema/')
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*js$/))
  .forEach(file => require(resolve(models, file)))
// 先引入需要导入数据库的json文件
let wikiHouses = require(resolve(__dirname, '../../completeHouses.json'))
let wikiCharacters = require(resolve(__dirname, '../../complateCharacters.json'))
// 3. 调整字段
const formatData = R.map(
  i => {
    i._id = i.nmId
    return i
  }
)
wikiCharacters = formatData(wikiCharacters)
export const database = app => {
  mongoose.set('debug', true)
  mongoose.connect(config.db)
}
mongoose.connection.on('disconnected', () => {
  mongoose.connect(config.db)
})
mongoose.connection.on('error', err => {
  console.error(err)
})
mongoose.connection.on('open', async () => {
  console.log('Connected to MongoDB', config.db)
  // 在连接数据库的时候将数据导入进行去
  // 拿到模型
  const WikiHouses = mongoose.model('WikiHouse')
  const WikiCharacter = mongoose.model('WikiCharacter')

  const existWikiHouses = await WikiHouses.find({}).exec()
  const existWikiCharacter = await WikiCharacter.find({}).exec()

  if (!existWikiHouses.length) WikiHouses.insertMany(wikiHouses)
  if (!existWikiCharacter.length) WikiCharacter.insertMany(wikiCharacters)
  // 1.wikiCharacters schema 需要先处理下 由于其实用了自定义 _id 也就是 nmId
  // 这样就可以通过wikiHouse中的ref: 查到 里面的人物数据
  // 2. 需要在插入之前通过formatdata 整理

})
