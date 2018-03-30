// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
// alias别名的用法只能用于import JS文件或者是组件的时候，不能用于CSS类的文件
import './common/stylus/index.styl'

Vue.config.productionTip = false
Vue.use(VueResource)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
  /* components: { App },
  template: '<App/>' */
})
