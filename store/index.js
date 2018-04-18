import Vuex from 'vuex'
import getters from './getters'
import actions from './actions'
import mutations from './mutations'

const createStore = () => {
  return new Vuex.Store({
    state: {

    },
    getters,
    actions,
    mutations
  })
}

export default createStore
