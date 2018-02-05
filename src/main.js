// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router.conf.js'
import YDUI from 'vue-ydui'
import { store } from './store/index'
import 'vue-ydui/dist/ydui.rem.css'
import { Confirm, Alert, Toast, Notify, Loading } from 'vue-ydui/dist/lib.rem/dialog'
import {DateTime} from 'vue-ydui/dist/lib.rem/datetime'
import { config } from './utils/device/WXDevice'
import './utils/jquery-1.7.2'
import './utils/newfemale'

config(store, router)

Vue.config.productionTip = false
Vue.use(YDUI)

store.dispatch('mainthead')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App },
  render: h => h(App)
})