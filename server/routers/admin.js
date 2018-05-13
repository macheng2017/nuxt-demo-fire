import { controller, get, post } from '../decorator/router'
import api from '../api'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

@controller('/admin')
export class WechatCotroller {

  @post('/user')
  @required({body: ['email', 'password']}) // 增加一个中间件
  async getCharacter(ctx, next) {

  }
}
