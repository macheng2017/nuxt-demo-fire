import Services from './services'
import axios from 'axios'
// 通过它来请求签名值的操作
export default {
  // 服务器同步渲染
  nuxtServerInit({commit}, {req}) {
    if (req.session && req.session.user) {
      // 如果页面是直接渲染出来的看下有没有session
      const {email, nickname, avatarUrl} = req.session.user
      // 随后实现session功能
      const user = {
        email,
        nickname,
        avatarUrl
      }
      commit('SET_USER', user)
    }
  },
  // 登录
  async login({commit}, {email, password}) {
    try {
      let res = await axios.post('/admin/login', {
        email,
        password
      })
      let {data} = res
      if (data.success) commit('SET_USER', data.data)
    } catch (err) {
      // 可能登录的时候服务器正在重启,或者后台有些错误
      if (err.response.status === 401) {
        throw new Error('来错地方了')
      }
    }
  },
  async logout({commit}) {
    await axios.post('/admin/logout')
    commit('SET_USER', null)
  },
  getWechatSignature({ commit }, url) {
    return Services.getWechatSignature(url)
  },
  getUserByOAuth({ commit }, url) {
    return Services.getUserByOAuth(url)
  },
  async fetchHouses({ state }) {
    const res = await Services.fetchHouses()
    // console.log(' data = ' + JSON.stringify(res.data.data))
    state.houses = res.data.data
    return res
  },
  // async fetchCities({ state }) {
  //   const res = await Services.fetchCities()
  //   state.cities = res.data.data
  //   return res
  // },
  async fetchCharacters({ state }) {
    const res = await Services.fetchCharacters()
    // console.log(' data = ' + JSON.stringify(res.data.data))
    state.characters = res.data.data
    return res
  },
  async showHouse({ state }, _id) {
    // id相同即为当前页,返回
    if (_id === state.currentHouse._id) return

    const res = await Services.fetchHouse(_id)
    state.currentHouse = res.data.data
    return res
  },
  async showCharacter({ state }, _id) {
    // id相同即为当前页,返回
    if (_id === state.currentCharacter._id) return
    const res = await Services.fetchCharacter(_id)
    // console.log(' showCharacter data = ' + JSON.stringify(res.data.data))
    state.currentCharacter = res.data.data
    return res
  },
  async fetchProducts({ state }) {
    // id相同即为当前页,返回
    const res = await Services.fetchProducts()
    // console.log(' fetchProducts data = ' + JSON.stringify(res.data))
    state.products = res.data.data
    return res
  },
  async showProduct({ state }, _id) {
    if (_id === state.currentProduct._id) return
    const res = await Services.fetchProduct(_id)
    // console.log(' fetchProducts data = ' + JSON.stringify(res.data))
    state.currentProduct = res.data.data
    return res
  },
  async fetchUserAndOrders({ state }) {
    const res = await Services.fetchUserAndOrders()
    // console.log(' fetchProducts data = ' + JSON.stringify(res.data))
    state.user = res.data.data
    return res
  },
  async saveProduct({ state, dispatch }, product) {
    await axios.post('/api/products', product)
  // 获取商品列表
    let res = await dispatch('fetchProducts')
    return res.data.data
  },
  // update
  async putProduct({ state, dispatch }, product) {
    await axios.put('/api/products', product)
  // 获取商品列表
    let res = await dispatch('fetchProducts')
    return res.data.data
  },
  // update
  async deleteProduct({ state, dispatch }, product) {
    console.log('product._id ' + product._id)
    await axios.delete(`/api/products/${product._id}`)
    // 删除商品之后,下面更新下商品列表
  // 获取商品列表
    let res = await dispatch('fetchProducts')
    return res.data.data
  }
}
