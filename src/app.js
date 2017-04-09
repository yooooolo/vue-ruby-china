import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import { sync } from 'vuex-router-sync'

const app = new Vue({
  router,
  store,
  render: h => h(App)
})

export { app, router, store }
