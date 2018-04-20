import axios from 'axios'
const baseUrl = ''
// 将RAP中的数据前缀复制过来
const apiUrl = 'http://rapapi.org/mockjsdata/33508'

class Services {
  getWechatSignature(url) {
    return axios.get(`${baseUrl}/wechat-signature?url=${url}`)
  }
  getUserByOAuth(url) {
    return axios.get(`${baseUrl}/wechat-oauth?url=${url}`)
  }
  // 获取家族的数据
  fetchHouses() {
    return axios.get(`${apiUrl}/wiki/houses/123`)
  }
  // 获取城市数据
  fetchCities() {
    return axios.get(`${apiUrl}/wiki/city/12`)
  }
  // 获取城市数据
  fetchCharacters() {
    return axios.get(`${apiUrl}/wiki/character/123`)
  }
}
export default new Services()
