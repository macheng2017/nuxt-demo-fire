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
  }
}
