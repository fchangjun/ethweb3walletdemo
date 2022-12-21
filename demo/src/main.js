import Vue from 'vue'
import App from './App'
import router from './router'
import storage from './store'
Vue.config.productionTip = false

/* eslint-disable no-new */
Vue.prototype.$storage=storage;
console.log(storage)
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
