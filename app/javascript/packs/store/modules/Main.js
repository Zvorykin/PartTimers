const state = {
  apiLink:'',
  masterLogin: false
}

const mutations = {
  UPDATE_APILINK(state, link) {
    state.apiLink = link
  },
  UPDATE_MASTERLOGIN(state) {
    state.masterLogin = true
  }
}

const actions = {
  updateMedics ({ commit }) {
    commit('UPDATE_MEDICLIST')
  }
}

export default {
  state,
  mutations,
  actions
}
