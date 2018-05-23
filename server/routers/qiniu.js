import {
  controller,
  get,
  post,
  put
} from '../decorator/router'
import {
  uptoken,
  upload
} from '../libs/qiniu'

@controller('/qiniu')
export class QiniuController {
  @get('token')
  async qiniuToken(ctx, next) {
    let key = ctx.query.key
    let token = uptoken(key)

    ctx.body = {
      success: true,
      data: {
        key: key,
        token: token
      }
    }
  }
  @post('upload')
  async upload(ctx, next) {
    let file = ctx.query.file
    let token = ctx.query.token
    let key = ctx.query.key
    upload(file, token, key)
    ctx.body = {
      success: true
      // data: {
      //   key: key,
      //   token: token
      // }
    }
  }
}
