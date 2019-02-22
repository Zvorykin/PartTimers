const state = {
  loggedIn: false,
  admin: false
}

const mutations = {
  UPDATE_ADMIN(state) {
    state.admin = true
  },
  LOGIN(state) {
    state.loggedIn = true
  }
}

export default {
  state,
  mutations
}
