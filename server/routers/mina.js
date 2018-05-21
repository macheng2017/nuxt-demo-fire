// 小程序路由文件
// import Router from 'koa-router'
import {
  controller,
  get,
  post,
  required
} from '../decorator/router'
import config from '../config'
import mongoose from 'mongoose'
import {
  openidAndSessionKey,
  WXBizDataCrypt
} from '../wechat-lib/mina'

const User = mongoose.model('User')
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
@controller('/mina')
export class MinaCotroller {
  @get('codeAndSessionKey')
  @required({
    query: ['code']
  })
  async getCodeAndsessionKey(ctx, next) {
    const {
      code
    } = ctx.query
    let res = await openidAndSessionKey(code)
    ctx.body = {
      success: true,
      data: res
    }
  }
  // 获取用户信息
  @get('user')
  @required({
    query: ['code', 'userInfo']
  })
  async getUser(ctx, next) {
    const {
      code,
      userInfo
    } = ctx.query
    const minaUser = await openidAndSessionKey(code)

    let user = await User.findOne({
      unionid
      // openid: {
      //   '$in': [minaUser.openid]
      // }
    }).exec()
    if (!user) {

      // 复制微信官方提供的解密demo代码
      let pc = new WXBizDataCrypt(minaUser.session_key)
      // 传入加密的数据和iv
      var data = pc.decryptData(userInfo.encryptedData, userInfo.iv)
      try {
        user = await User.findOne({
          unionid: data.unionId
        })
        if (!user) {
          let _userData = userInfo.userInfo
          user = new User({
            avatarUrl: _userData.avatarUrl,
            nickName: _userData.nickName,
            unionid: data.unionid,
            openid: [minaUser.openid],
            sex: _userData.gender,
            country: _userData.country,
            province: _userData.province,
            city: _userData.city

          })
          await user.save()
        }
      } catch (err) {
        ctx.body = {
          success: false,
          err: err
        }
      }
      ctx.body = {
        success: true,
        data: {
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          sex: user.sex
        }
      }
    }
  }

  @post('login')
  // 约束必须包含哪些字段
  @required({
    body: ['code', 'avatarUrl', 'nickName']
  })
  async login(ctx, next) {
    const {
      code,
      avatarUrl,
      nickName
    } = ctx.reqest.body
    try {
      const {
        openid,
        unionid
      } = await openidAndSessionKey(code)
      let user = await User.findOne({
        unionid
      }).exec()
      if (!user) {
        user = new User({
          openid: [openid],
          nickName: nickName,
          unionid,
          avatarUrl
        })
        user = await user.save()
      } else {
        user.avatarUrl = avatarUrl
        user.nickName = nickName
        user = await user.save()
      }

      // 返回body,固定字段
      ctx.body = {
        success: true,
        data: {
          nickName: nickName,
          avatarUrl: avatarUrl
        }
      }
    } catch (err) {
      ctx.body = {
        success: false,
        err: err
      }
    }
  }
}
