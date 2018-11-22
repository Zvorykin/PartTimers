/* eslint no-console: 0 */
// Run this example by adding <%= javascript_pack_tag 'hello_vue' %> (and
// <%= stylesheet_pack_tag 'hello_vue' %> if you have styles in your component)
// to the head of your layout file,
// like app/views/layouts/application.html.erb.
// All it does is render <div>Hello Vue</div> at the bottom of the page.

// import Vue from 'vue'
// import App from '../app.vue'

// document.addEventListener('DOMContentLoaded', () => {
//   const el = document.body.appendChild(document.createElement('hello'))
//   const app = new Vue({
//     el,
//     render: h => h(App)
//   })
//
//   console.log(app)
// })


// The above code uses Vue without the compiler, which means you cannot
// use Vue to target elements in your existing html templates. You would
// need to always use single file components.
// To be able to target elements in your existing html/erb templates,
// comment out the above code and uncomment the below
// Add <%= javascript_pack_tag 'hello_vue' %> to your layout
// Then add this markup to your html template:
//
// <div id='hello'>
//   {{message}}
//   <app></app>
// </div>


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
Vue.use(iView, {locale})
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
  components: {App},
  store,
  template: '<App/>'
}).$mount('#app')


//
//
//
// If the using turbolinks, install 'vue-turbolinks':
//
// yarn add 'vue-turbolinks'
//
// Then uncomment the code block below:
//
// import TurbolinksAdapter from 'vue-turbolinks'
// import Vue from 'vue/dist/vue.esm'
// import App from '../app.vue'
//
// Vue.use(TurbolinksAdapter)
//
// document.addEventListener('turbolinks:load', () => {
//   const app = new Vue({
//     el: '#hello',
//     data: {
//       message: "Can you say hello?"
//     },
//     components: { App }
//   })
// })
