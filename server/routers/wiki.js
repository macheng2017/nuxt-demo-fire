import { controller, get, post } from '../decorator/router'
import api from '../api'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

@controller('/wiki')
export class WechatCotroller {
  // 获取家族数据
  @get('/houses')
  async getHouses(ctx, next) {
    const data = await api.wiki.getHouses()
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
    const data = await api.wiki.getHouse(_id)
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取人物数据
  @get('/characters')
  async getCharacters(ctx, next) {
    let { limit = 20 } = ctx.query
    const data = await api.wiki.getCharacters(limit)
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
    const data = await api.wiki.getCharacter(_id)
    ctx.body = {
      data: data,
      success: true
    }
  }
}
