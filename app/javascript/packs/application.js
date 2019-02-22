import Vue from 'vue/dist/vue.esm'
import axios from 'axios'
import VueAxios from 'vue-axios'
// iView
import iView from 'iview'
import locale from 'iview/dist/locale/ru-RU'
import 'iview/dist/styles/iview'
// // Lodash
import lodash from 'lodash'
import VueLodash from 'vue-lodash/dist/vue-lodash.min'
//
import VueConstants from 'vue-constants'
import moment from 'moment'
//
// App
import store from '../packs/store/index'
import App from '../App.vue'
// lib
import makeRequest from '../packs/lib/request'
import showMessage from '../packs/lib/notification'
import * as constants from '../packs/lib/constants'
import getConst from '../packs/lib/constantsPlugin'

Vue.use(VueAxios, axios)
Vue.use(iView, { locale })
Vue.use(VueLodash, lodash)
Vue.use(VueConstants)
Vue.use(getConst)

Vue.prototype.$makeRequest = makeRequest
Vue.prototype.$showMessage = showMessage
Vue.prototype.$moment = moment
Vue.prototype.$FORMATS = constants.FORMATS

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>',
}).$mount('#app')
