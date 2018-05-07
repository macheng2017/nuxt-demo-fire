import { controller, get, post } from '../decorator/router'
import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

const WikiHouse = mongoose.model('WikiHouse')
const WikiCharacter = mongoose.model('WikiCharacter')
@controller('/wiki')
export class WechatCotroller {
  // 获取家族数据
  @get('/houses')
  async getHouses(ctx, next) {
    // 直接可以进行数据库的操作
    const data = await WikiHouse
    .find({})
    .populate({
      path: 'swornMembers.character',
      select: '_id name cname profile'
    }).exec()
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取单个家族详细数据
  @get('/houses/:_id')
  async getHouse(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) return (ctx.body = {success: false, err: 'id is required'})
    const data = await WikiHouse
    .findOne({_id: _id})
    .populate({
      path: 'swornMembers.character',
      select: '_id name cname nmid'
    }).exec()
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取人物数据
  @get('/characters')
  async getCharacters(ctx, next) {
    let { limit = 20 } = ctx.query
    const data = await WikiCharacter
    .find({})
    .limit(Number(limit))
    .exec()
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取单个人物详细数据
  @get('/characters/:_id')
  async getCharacter(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) return (ctx.body = {success: false, err: 'id is required'})
    const data = await WikiCharacter
    .findOne({_id: _id})
    .exec()
    ctx.body = {
      data: data,
      success: true
    }
  }
}
