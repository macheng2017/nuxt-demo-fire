import {
  controller,
  get,
  post,
  required
} from '../decorator/router'
import api from '../api'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
@controller('/admin')
export class adminController {

  @post('login')
  @required({
    body: ['email', 'password']
  })
  // 增加一个中间件,规定请求传递过来两个字段,必须有email,password否则不合法
  async login(ctx, next) {
    const {
      email,
      password
    } = ctx.request.body
    const data = await api.admin.login(email, password)
    const {
      user,
      match
    } = data
    if (match) {
      // 添加用户权限的判断
      if (user.role !== 'admin') {
        return (ctx.body = {
          success: false,
          err: '来错地方了'
        })
      }

      // 重新设置session
      ctx.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl
      }
      return (ctx.body = {
        success: true,
        data: {
          email: user.email,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl
        }
      })
    }
    return (ctx.body = {
      success: false,
      err: '账号或者密码错误'
    })
  }
  @post('logout')
  async logout(ctx, next) {
    ctx.session = null
    ctx.body = {
      success: true
    }
  }
}
