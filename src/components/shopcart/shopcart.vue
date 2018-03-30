<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <!--==================-->
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount>0}">
              <i class="icon-shopping_cart"  :class="{'highlight':totalCount>0}"></i>
            </div>
            <div class="num" v-show="totalCount>0">
              {{ totalCount }}
            </div>
          </div>
          <div class="price" :class="{'highlight':totalPrice>0}">
            ￥{{ totalPrice }}
          </div>
          <div class="desc">
            另需配送费{{ deliveryPrice }}元
          </div>
        </div>
        <!--==================-->
        <div class="content-right" @click="pay">
          <div class="pay" :class="payClass">
            {{ payDesc }}
          </div>
        </div>
      </div>
      <!--==================-->
      <div class="ball-container">
        <div v-for="(ball,index) in balls" :key="index">
          <transition name="drop"
           @before-enter="beforeDrop"
           @enter="dropping"
           @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <!--==================-->
        <!--购物车中的浮层部分-->
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="(food,index) in selectFoods" :key="index">
                <span class="name">{{ food.name }}</span>
                <div class="price">
                  <span>￥{{ food.price * food.count }}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol @add="addFood" :food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <!--=====================-->
    <!--以下是背景的HTML：当购物车浮层显示的时候，这个背景也要显示-->
    <transition name="fade">
      <div class="list-mask" v-show="listShow" @click="hideList"></div>
    </transition>
    <!--=====================-->
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import Vue from 'vue'
import cartcontrol from 'components/cartcontrol/cartcontrol'
export default {
  props: {
    selectFoods: {
      type: Array,
      default () {
        return [
          {
            price: 10,
            count: 1
          }
        ]
      }
    },
    deliveryPrice: {
      type: Number,
      default: 0
    },
    minPrice: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // shopcart组件中维护这个balls数组
      balls: [
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        }
      ],
      // 已经下落后的小球数组
      dropBalls: [],
      // fold为true表示收起；fold为false表示展开
      fold: true,
      scroll: false
    }
  },
  // 计算属性
  computed: {
    totalCount () {
      let count = 0
      this.selectFoods.forEach((food) => {
        count += food.count
      })
      return count
    },
    totalPrice () {
      let total = 0
      this.selectFoods.forEach((food) => {
        total += food.price * food.count
      })
      return total
    },
    payDesc () {
      if (this.totalPrice === 0) {
        return `￥${this.minPrice}元起送`
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice
        return `还差￥${diff}元起送`
      } else {
        return '去结算'
      }
    },
    payClass () {
      if (this.totalPrice < this.minPrice) {
        return 'not-enough'
      } else {
        return 'enough'
      }
    },
    // 浮层的计算属性
    listShow () {
      if (!this.totalCount) {
        // this.fold = true
        Vue.set(this, 'fold', true)
        return false
      }
      let show = !this.fold
      if (show) {
        // 异步处理
        this.$nextTick(() => {
          // 保证只有一个better-scroll对象存在
          if (!this.scroll) {
            /* eslint-disable no-unused-vars */
            let betterScroll = new BScroll(this.$refs.listContent, {
              click: true
            })
            if (betterScroll) {
              Vue.set(this, 'scroll', true)
            } else {
              Vue.set(this, 'scroll', false)
            }
          }
        })
      }
      return show
    }
  },
  // 方法
  methods: {
    // 维护一个【小球下落】的方法
    // target会传递给这个el，表示即将下落的目标小球
    drop (el) {
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i]
        if (!ball.show) {
          ball.show = true
          ball.el = el
          this.dropBalls.push(ball)
          return
        }
      }
    },
    // 小球飞出前
    // 这里的el就是真的能确定是哪个小球飞出去
    beforeDrop (el) {
      let count = this.balls.length
      while (count--) {
        let ball = this.balls[count]
        if (ball.show) {
          let rect = ball.el.getBoundingClientRect()
          // console.log(rect.left)
          // console.log(rect.top)
          // console.log(rect.right)
          // console.log(rect.bottom)
          // console.log(rect.width)
          // console.log(rect.height)
          // console.log(window.innerHeight)
          // console.log(window.innerHeight - rect.top)
          let x = rect.left - 28
          let y = -(window.innerHeight - rect.top - 47.5)
          // console.log(x)
          // console.log(y)
          // 小球飞出之前的样式设置
          el.style.display = ''
          el.style.webkitTransform = `translate3d(0, ${y}px, 0)`
          el.style.transform = `translate3d(0, ${y}px, 0)`
          let inner = el.getElementsByClassName('inner-hook')[0]
          inner.style.webkitTransform = `translate3d(${x}px, 0, 0)`
          inner.style.transform = `translate3d(${x}px, 0, 0)`
        }
      }
    },
    // 飞行中
    // 这里我们必须要【触发它的重绘制：el.offsetHeight】
    dropping (el, done) {
      /* eslint-disable no-unused-vars */
      let rf = el.offsetHeight
      el.style.webkitTransform = `translate3d(0, 0, 0)`
      el.style.transform = `translate3d(0, 0, 0)`
      let inner = el.getElementsByClassName('inner-hook')[0]
      inner.style.webkitTransform = `translate3d(0, 0, 0)`
      inner.style.transform = `translate3d(0, 0, 0)`
      el.addEventListener('transitionend', done)
    },
    // 飞行完毕
    afterDrop (el) {
      let ball = this.dropBalls.shift()
      if (ball) {
        ball.show = false
        el.style.display = 'none'
      }
    },
    // 去结算
    pay () {
      if (this.totalPrice < this.minPrice) {
        return
      }
      window.alert(`刚从你的钱包里面扣除了${this.totalPrice}元`)
    },
    // 点击展开或者收起浮层
    toggleList () {
      if (!this.totalCount) {
        return
      }
      this.fold = !this.fold
    },
    // 点击mask遮掩层可以隐藏浮层
    hideList () {
      this.fold = true
    },
    // 点击浮层中的【清空】按钮可以清空购物车中的商品
    empty () {
      this.selectFoods.forEach((food) => {
        food.count = 0
      })
      // 防止点击【清空】后再次购物的时候浮层自动弹出
      // this.fold = true
    },
    // 接收从cartcontrol派发出来的target
    addFood (target) {
      this.drop(target)
    }
  },
  components: {
    cartcontrol
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"

  .shopcart
    position: fixed
    left: 0
    bottom: 0
    z-index: 50
    width: 100%
    height: 48px
    .content
      display: flex
      background: #141d27
      font-size: 0
      color: rgba(255,255,255,0.4)
      .content-left
        flex: 1
        .logo-wrapper
          display: inline-block
          vertical-align: top
          position: relative
          background: green
          top: -10px
          margin: 0 18px
          width: 56px
          height: 56px
          padding: 6px
          box-sizing: border-box
          border-radius: 50%
          .logo
            width: 100%
            height: 100%
            border-radius: 50%
            /*background: white*/
            background: #2b343c
            text-align: center
            &.highlight
              background: rgb(0,160,220)
            .icon-shopping_cart
              line-height: 44px
              font-size: 24px
              color: #6D7277
              &.highlight
                color: #fff
           .num
             position: absolute
             top: 0
             right: 0
             width: 24px
             height: 16px
             line-height: 16px
             text-align: center
             border-radius: 16px
             font-size: 12px
             font-weight: 700
             color: #fff
             background: rgb(240,20,20)
             box-shadow: 0 4px 8px 0 rgba(0,0,0,0.4)
        .price
          display: inline-block
          vertical-align: top
          margin-top: 12px
          padding-right: 12px
          line-height: 24px
          box-sizing: border-box
          border-right: 1px solid rgba(255,255,255,0.1)
          font-size: 16px
          font-weight: 700
          &.highlight
            color: #fff
        .desc
          display: inline-block
          vertical-align: top
          margin: 12px 0 0 12px
          line-height: 24px
          font-size: 16px
          font-weight: 200
      .content-right
        flex: 0 0 105px
        width: 105px
        .pay
          height: 48px
          line-height: 48px
          text-align: center
          font-size: 12px
          font-weight: 700
          &.not-enough
            background: #20262D
          &.enough
            background: #00b43c
            color: #fff
            font-size: 18px
    .ball-container
      .ball
        position: fixed
        left: 38px
        bottom: 22px
        z-index: 200
        /*background: red*/
        transition: all 0.4s cubic-bezier(0.49,-0.29,0.75,0.41)
        .inner
          width: 16px
          height: 16px
          border-radius: 50%
          background: rgb(0,160,220)
          /*background: green*/
          transition: all 0.4s linear
    .shopcart-list
      position: absolute
      left: 0
      top: 0
      z-index: -1
      width: 100%
      transform: translate3d(0,-100%,0)
      &.fold-enter-active,&.fold-leave-active
        transition: all 0.5s linear
      &.fold-enter,&.fold-leave-active
        transform: translate3d(0,0,0)
      .list-header
        height: 40px
        line-height: 40px
        padding: 0 18px
        background: #f3f5f7
        border-bottom: 1px solid rgba(7,17,27,0.1)
        .title
          float: left
          font-size: 14px
          color: rgb(7,17,27)
        .empty
          float: right
          font-size: 12px
          color: rgb(0,160,220)
      .list-content
        padding: 0 18px
        max-height: 240px
        overflow: hidden
        background: #fff
        .food
          position: relative
          padding: 12px 0
          box-sizing: border-box
          border-1px(rgba(7,17,27,0.1))
          .name
            line-height: 24px
            font-size: 14px
            color: rgb(7,17,27)
          .price
            position: absolute
            right: 100px
            bottom: 12px
            line-height: 24px
            font-size: 14px
            font-weight: 700
            color: rgb(240,20,20)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 6px
  .list-mask
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 40
    opacity: 1
    background: rgba(7,17,27,0.6)
    &.fade-enter-active,&.fade-leave-active
      transition: all 0.5s linear
    &.fade-enter,&.fade-leave-active
      opacity: 0
      background: rgba(7,17,27,0)
</style>
