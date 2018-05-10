import axios from 'axios'
const baseUrl = ''
// 将RAP中的数据前缀复制过来
// const apiUrl = 'http://rapapi.org/mockjsdata/33508'

class Services {
  getWechatSignature(url) {
    return axios.get(`${baseUrl}/wechat-signature?url=${url}`)
  }
  getUserByOAuth(url) {
    return axios.get(`${baseUrl}/wechat-oauth?url=${url}`)
  }
  // 获取家族的数据
  fetchHouse(id) {
    console.log(`${baseUrl}/wiki/houses/${id}`)
    return axios.get(`${baseUrl}/wiki/houses/${id}`)
  }
  // 获取家族的数据
  fetchHouses() {
    console.log(`${baseUrl}/wiki/houses`)
    return axios.get(`${baseUrl}/wiki/houses`)
  }
  // // 获取城市数据
  // fetchCities() {
  //   // console.log(`${baseUrl}/wiki/cities`)
  //   // return axios.get(`${baseUrl}/wiki/cities`)
  //   // 测试用假数据
  //   return {data: {data: [], success: true}}
  // }
  // 获取角色数据
  fetchCharacter(id) {
   // console.log(`${baseUrl}/wiki/character/${id}`)
    return axios.get(`${baseUrl}/wiki/characters/${id}`)
    // 测试用假数据
    // return {data: {data: [], success: true}}
  }
  // 获取城市数据
  fetchCharacters() {
    // console.log(`${baseUrl}/wiki/characters`)
    return axios.get(`${baseUrl}/wiki/characters`)
    // 测试用假数据
    // return {data: {data: [], success: true}}
  }
  fetchProducts() {
    console.log(`${baseUrl}/api/products`)
    return axios.get(`${baseUrl}/api/products`)
  }
  fetchProduct(id) {
    console.log(`${baseUrl}/api/product/${id}`)
    return axios.get(`${baseUrl}/api/product/${id}`)
  }
  fetchUserAndOrders() {
    console.log(`${baseUrl}/api/user`)
    return axios.get(`${baseUrl}/api/user`)
  }
}
export default new Services()
