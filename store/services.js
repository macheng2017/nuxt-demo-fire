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
  fetchHouse(id) {
    console.log(`${apiUrl}/wiki/houses/${id}`)
    return axios.get(`${apiUrl}/wiki/houses/${id}`)
  }
  // 获取家族的数据
  fetchHouses() {
    console.log(`${apiUrl}/wiki/houses`)
    return axios.get(`${apiUrl}/wiki/houses`)
  }
  // 获取城市数据
  fetchCities() {
    console.log(`${apiUrl}/wiki/cities`)
    return axios.get(`${apiUrl}/wiki/cities`)
  }
  // 获取角色数据
  fetchCharacter(id) {
    console.log(`${apiUrl}/wiki/character/${id}`)
    return axios.get(`${apiUrl}/wiki/character/${id}`)
  }
  // 获取城市数据
  fetchCharacters() {
    console.log(`${apiUrl}/wiki/characters`)
    return axios.get(`${apiUrl}/wiki/characters`)
  }
  fetchProducts() {
    return axios.get(`${apiUrl}/wiki/products/`)
  }
}
export default new Services()
