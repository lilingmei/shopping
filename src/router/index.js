import Vue from 'vue'
import Router from 'vue-router'
import seller from 'components/seller/seller'
import goods from 'components/goods/goods'
import ratings from 'components/ratings/ratings'

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: '/goods'
  },
  {
    path: '/goods',
    component: goods
  },
  {
    path: '/seller',
    component: seller
  },
  {
    path: '/ratings',
    component: ratings
  }
]

export default new Router({
  linkActiveClass: 'active',
  routes
})
