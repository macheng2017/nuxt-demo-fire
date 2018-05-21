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

## Test login process

path: middlewares/database.js


## 登录成功后需要通过会话的方式同步登录的状态


add /middleware/auth.js

middleware放置前端的中间件


### 拿到store redirect 每次打开后台页面先经过中间件的过滤使检查其登录状态

在server/index.js
需要重新设置session,防止拿不到session

在渲染页面之前,将session同步到req中

## 增加前端微信二跳中间件

* 管理员与用户共用同一套管理模型

* 希望微信中打开网页时候,经过微信中间件的处理,让用户做到和管理员一样都存到数据库中


在pages/index.vue 中增加一个微信中间件

一锅端掉微信公众号-小程序的用户资料获取_慕课手记  https://www.imooc.com/article/details/id/19204


1. 在首页中增加   middleware: 'wechat-auth', 微信的中间件, 
2. 每次打开首页就会走中间件,如果判断authuser没有的话,就会跳转到wechat-redirect



https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842


## 小程序后端登录路由
想几个问题
* 微信消息推送的用户他的session怎么维持?
* 微信网页中的用户session怎么维持?
* 网站 后台管理员的session维持?
* 小程序用户session怎么维持?


## 小程序路由文件


