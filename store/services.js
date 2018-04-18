import axios from 'axios'
const baseUrl = ''

class Services {
  getWechatSignature(url) {
    return axios.get(`${baseUrl}/wechat-signature?url=${url}`)
  }
}
export default new Services()
