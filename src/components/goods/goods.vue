<template>
  <div>
    <div class="goods">
      <div class="menu-wrapper" ref="menuWrapper">
        <ul>
          <li v-for="(item,index) in goods" class="menu-item" :class="{'current': currentIndex === index}" :key="index" @click="selectMenu(index)" ref="menuList">
            <span class="text border-1px">
              <span v-show="item.type>0" class="icon" :class="classMap[item.type]">
              </span>
              {{ item.name }}
            </span>
          </li>
        </ul>
      </div>
      <!--======================-->
      <div class="foods-wrapper"  ref="foodsWrapper">
        <ul>
          <li v-for="(item,index_1) in goods" class="food-list" :key="index_1" ref="foodList">
            <h1 class="title">{{ item.name }}</h1>
            <ul>
              <li class="food-item border-1px" v-for="(food,index_2) in item.foods"  :key="index_2" @click="selectFood(food)">
                <div class="icon">
                  <img :src="food.icon" width="56" height="54"/>
                </div>
                <div class="content">
                  <h2 class="name">{{ food.name }}</h2>
                  <p class="desc">{{ food.description }}</p>
                  <!--=============-->
                  <div class="extra">
                    <span class="count">月售{{ food.sellCount }}份</span>
                    <span>好评率{{ food.rating }}%</span>
                  </div>
                  <!--=============-->
                  <div class="price">
                    <span class="now">￥{{ food.price }}</span>
                    <span class="old" v-show="food.oldPrice">￥{{ food.oldPrice }}</span>
                  </div>
                  <!--=============-->
                  <div class="cartcontrol-wrapper">
                    <cartcontrol @add="addFood" :food="food"></cartcontrol>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <!--======================-->
      <!--购物车组件-->
      <shopcart ref="shopcart"
        :selectFoods="selectFoods"
        :deliveryPrice="seller.deliveryPrice"
        :minPrice="seller.minPrice"></shopcart>
    </div>
    <!--======================-->
    <!--food详情页组件-->
    <food @add="addFood" :food="selectedFood" ref="food"></food>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import shopcart from 'components/shopcart/shopcart'
import cartcontrol from 'components/cartcontrol/cartcontrol'
import food from 'components/food/food'

const ERR_OK = 0
const debug = process.env.NODE_ENV !== 'production'
export default {
  props: {
    seller: {
      type: Object
    }
  },
  data () {
    return {
      goods: [],
      listHeight: [],
      scrollY: 0,
      selectedFood: {}
    }
  },
  // 计算属性
  computed: {
    // 把scrollY和左侧的索引做一个映射
    currentIndex () {
      for (let i = 0; i < this.listHeight.length; i++) {
        let height1 = this.listHeight[i]
        let height2 = this.listHeight[i + 1]
        // height2如果在最后一个位置的时候是undefined
        // 它如果是最后一个元素或者它落在了当前的这个区间，那么我们就返回这个当前的索引i
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          this._followScroll(i)
          return i
        }
      }
      // 否则默认返回0
      return 0
    },
    // 选择食物的计算属性
    selectFoods () {
      let foods = []
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food)
          }
        })
      })
      return foods
    }
  },
  created () {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
    const url = debug ? '/api/goods'
      : 'http://ustbhuangyi.com/sell/api/goods'
    this.$http.get(url)
      .then((response) => {
        response = response.body
        if (response.errno === ERR_OK) {
          this.goods = response.data
          // 异步处理
          this.$nextTick(() => {
            // 初始化better-scroll
            this._initScroll()
            // 计算高度
            this._calculateHeight()
          })
        }
      })
  },
  methods: {
    // 当点击左侧的时候，右侧要变化到实时的位置
    selectMenu (index) {
      // console.log(index)
      let foodList = this.$refs.foodList
      let el = foodList[index]
      // 这个300是动画的时间300ms
      this.foodsScroll.scrollToElement(el, 300)
    },
    _initScroll () {
      this.menuScroll = new BScroll(this.$refs.menuWrapper, {
        // 允许better-scroll监听点击事件
        click: true
      })
      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        // 允许better-scroll监听点击事件
        click: true,
        // 这个属性的意思就是希望scroll在滚动的时候【能实时告诉我们滚动的位置】
        probeType: 3
      })
      // 监听滚动的实时位置，位置信息会放在pos中
      this.foodsScroll.on('scroll', (pos) => {
        // 判断滑动的方向，避免下拉时分类高亮错误
        // 比如：第一分类商品数量为1的时候，下拉使得第二分类高亮
        if (pos.y <= 0) {
          this.scrollY = Math.abs(Math.round(pos.y))
        }
      })
    },
    //  ==============================
    // 计算高度
    _calculateHeight () {
      let foodList = this.$refs.foodList
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < foodList.length; i++) {
        // item是某个食品类
        let item = foodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    // 左侧也滚动到相应的位置
    _followScroll (index) {
      let menuList = this.$refs.menuList
      let el = menuList[index]
      this.menuScroll.scrollToElement(el, 300, 0, -100)
    },
    // cartcontrol组件中派发的事件，
    // 如右：this.$emit('add',event.target)
    // 在这个addFood中可以接收到target对象
    addFood (target) {
      this._drop(target)
    },
    // 小球下落的方法
    _drop (target) {
      // this.$refs.shopcart是在goods组件中
      // 拿到shopcart组件，从而可以调用shopcart组件中的drop方法
      this.$refs.shopcart.drop(target)
    },
    // 点击并选择某一种食物
    selectFood (food) {
      this.selectedFood = food
      this.$refs.food.show()
    }
  },
  components: {
    shopcart,
    cartcontrol,
    food
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"
  .goods
    display: flex
    position: absolute
    top: 174px
    bottom: 46px
    width: 100%
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px
      width: 80px
      background: #f3f5f7
      .menu-item
        display: table
        height: 54px
        width: 56px
        padding: 0 12px
        line-height: 14px
        font-weight: 200
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          /*background: #fff*/
          background: red
          font-weight: 700
          .text
            border-none()
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          font-size: 13px
          border-1px(rgba(7,17,27,0.1))
          .icon
            display: inline-block
            vertical-align: top
            width: 12px
            height: 12px
            background-size: 12px 12px
            background-repeat: no-repeat
            &.decrease
              bg-image('decrease_3')
            &.discount
              bg-image('discount_3')
            &.special
              bg-image('special_3')
            &.invoice
              bg-image('invoice_3')
            &.guarantee
              bg-image('guarantee_3')
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147,153,159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7,17,27,0.1))
        &:last-child
          border-none()
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7,17,27)
          .desc,.extra
            line-height: 10px
            font-size: 10px
            color: rgb(147,153,159)
          .desc
            margin-bottom: 8px
          .extra
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right: 8px
              font-size: 14px
              color: rgb(240,20,20)
            .old
              text-decoration: line-through
              font-size: 10px
              color: rgb(147,153,159)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px
            /*background: yellow*/
</style>
