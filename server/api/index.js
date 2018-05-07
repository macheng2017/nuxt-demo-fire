// import {
//   getSignatureAsync,
//   getAuthorizeURL,
//   getUserByCode
// } from './wechat'

// export {
//   getSignatureAsync,
//   getAuthorizeURL,
//   getUserByCode
// }

// 这样就可以在其他文件中通过 import * as api from '../api'
// 直接通过api来调用所暴露出来的方法了
import * as wechat from './wechat'
import * as wiki from './wiki'

export default {
  wechat: wechat,
  wiki: wiki
}
