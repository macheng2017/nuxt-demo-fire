## 为用户建立基本信息数据模型

## schema/user.js

添加用户schema

## 后台登录页面


login.vue


actions.js
增加 
- nuxtServerInit
- login
- logout


### mutations.js

### middlewares/common.js

add session

### routes/admin.js


## 实现中间件required



先到装饰器中
/decorator/router.js

添加一个类似接口的东西
```js


```
http://ramda.cn/docs/#forEachObjIndexed

在
path /server/decorate/router.js


把代码 mongoose 放到路由中不推荐,当然不行了,把dao的代码放到控制层,看起来乱七八糟的

```js
import { controller, get, post, required } from '../decorator/router'
import api from '../api'
import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
const User = mongoose.model('User')
@controller('/admin')
export class AdminCotroller {

  @post('user')
  @required({body: ['email', 'password']})
  // 增加一个中间件,规定请求传递过来两个字段,必须有email,password否则不合法
  async logoin(ctx, next) {
    const { email, password } = ctx.request.body
    let user
    let match = null //是否匹配
    try {
      user = await User.findOne({email: email}).exec()

      if (user) {
        match = await User.comparePassword(password, user.password)
      }
    } catch (e) {
      throw new Error(e)
    }
    if (match) {
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
      success: true,
      err: '密码错误'
    })
  }
  @post('logout')
  async logout (ctx, next) {
    ctx.session = null
    ctx.body = {
      success: true
    }

  }
}
```

把数据库和api交互的代码放出去,放到api中

## path: /api/admin.js

```js
 let match = null //是否匹配
    try {
      user = await User.findOne({email: email}).exec()

      if (user) {
        match = await User.comparePassword(password, user.password)
      }
    } catch (e) {
      throw new Error(e)
    }
```

