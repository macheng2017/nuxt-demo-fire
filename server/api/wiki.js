import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

const WikiHouse = mongoose.model('WikiHouse')
const WikiCharacter = mongoose.model('WikiCharacter')
  // 获取家族数据
export async function getHouses() {
  // 直接可以进行数据库的操作
  const data = await WikiHouse
  .find({})
  .populate({
    path: 'swornMembers.character',
    select: '_id name cname profile'
  }).exec()
  return data
}

// 获取单个家族详细数据
export async function getHouse(_id) {
  const data = await WikiHouse
  .findOne({_id: _id})
  .populate({
    path: 'swornMembers.character',
    select: '_id name profile cname nmid'
  }).exec()
  return data
}
// 获取人物数据
export async function getCharacters(limit = 20) {
  const data = await WikiCharacter
  .find({})
  .limit(Number(limit))
  .exec()
  return data
}
// 获取单个人物详细数据
export async function getCharacter(_id) {
  const data = await WikiCharacter
  .findOne({_id: _id})
  .exec()
  return data
}
