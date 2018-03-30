<template>
  <div id="app">
  <v-header :seller="seller"></v-header>
  <div class="tab border-1px">
    <div class="tab-item">
      <router-link to="/goods">商品</router-link>
    </div>
    <div class="tab-item">
      <router-link to="/ratings">评论</router-link>
    </div>
    <div class="tab-item">
      <router-link to="/seller">商家</router-link>
    </div>
  </div>
  <keep-alive>
    <router-view :seller="seller"></router-view>
  </keep-alive>
  </div>
</template>

<script>
import { urlParse } from 'common/js/util'
import header from 'components/header/header'

const ERR_OK = 0
const debug = process.env.NODE_ENV !== 'production'
export default {
  name: 'App',
  data () {
    return {
      seller: {
        id: (() => {
          let queryParam = urlParse()
          return queryParam.id
        })()
      }
    }
  },
  created () {
    const url = debug ? '/api/seller'
      : 'http://ustbhuangyi.com/sell/api/seller'
      // 异步请求
    this.$http.get(url + '?id=' + this.seller.id)
      .then((response) => {
        // console.log(response)
        response = response.body
        // console.log(response)
        // console.log('response.errno = ' + response.errno)
        if (response.errno === ERR_OK) {
          // console.log('进来没有？')
          this.seller = Object.assign({}, this.seller, response.data)
          // console.log(this.seller)
        }
      })
  },
  components: {
    'v-header': header
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
/*alias别名的用法只能用于import JS文件或者是组件的时候，不能用于CSS类的文件*/
@import "./common/stylus/mixin.styl"
  #app
    .tab
      display: flex
      width: 100%
      height: 40px
      line-height: 40px
      /*background: yellow*/
      /*border-bottom: 1px solid red*/
      border-1px(rgba(7,17,27,0.1))
      .tab-item
        flex: 1
        text-align: center
        & > a
          display: block
          font-size: 14px
          /*background: green*/
          color: rgb(77,85,93)
          /*建议大家开启HBuilder中“视图”下的“显示缩进对齐线”*/
          &.active
            color: rgb(240,20,20)
</style>
