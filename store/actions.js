import Services from './Services'
// 通过它来请求签名值的操作
export default {
  getWechatSignature({ commit }, url) {
    return Services.getWechatSignature(url)
  }
}
