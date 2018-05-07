import Vuex from 'vuex'
import getters from './getters'
import actions from './actions'
import mutations from './mutations'

const createStore = () => {
  return new Vuex.Store({
    state: {
      imageCDN: 'http://minipro.spzwl.com/',
      houses: [],
      // cities: [],
      characters: [],
      products: [],
      currentProduct: [],
      user: null,
      currentHouse: {},
      currentCharacter: {}
    },
    getters,
    actions,
    mutations
  })
}

export default createStore
