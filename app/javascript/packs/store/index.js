import Vue from 'vue/dist/vue.esm';
import Vuex from 'vuex';
Vue.use(Vuex);

import modules from './modules'

const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production'
});

export default store;