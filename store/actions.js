import Services from './services'
// 通过它来请求签名值的操作
export default {
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
  async fetchCities({ state }) {
    const res = await Services.fetchCities()
    state.cities = res.data.data
    return res
  },
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
  }
}
