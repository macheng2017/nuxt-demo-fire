<template lang="pug">
.container
  .product
    //- 放置一个轮播组件
    .swiper(v-swiper='swiperConfig')
      .swiper-wrapper
        .swiper-slide(v-for='item in product.images')
          img(:src='item')
      //- 轮播的翻页
      .swiper-pagination.swiper-pagination-bullets
    //- 内容区
    .content
      .price(v-if='product.price')
        //-  控制价格显示的样式, 取到小数点后两位
        span.main-price {{product.price.toFixed(2) - product.price.toFixed(2).substr(-3)}}
        span.other-price {{product.price.toFixed(2).substr(-3)}}

    .name {{product.title}}
    .intro {{product.intro}}
    .info
      //- cell 是封装好的组件
      cell(v-for='(item, index) in product.parameters' :key='index' title='item.key' :content='item.value'
      :title='item.key')

    .attentions
      .title 购买提示
      ol
        li(v-for='item in attentions') {{item}}

  .product-footer
    span(@click='showInfo = true') 购买
    //- 增加一个模态窗,从底下弹出
  transition(name='slide-top')
    //-是否浮出模态窗
    .playment-modal(v-if='showInfo')
      .playment-modal-header
        span 准备购买
        span(@click='showInfo = false')  取消
      .focus-item
        img(:src='imageCDN + product.images[0]')
        div
          p {{ product.title }}
          p 价格 ￥{{product.price}}
      .focus-item
        span 收件人
        input(v-model.trim='info.name' placeholder='你的名字')
      .focus-item
        span 电话
        input(v-model.trim='info.phoneNumber' type='tel' placeholder='你的名字')
      .focus-item
        span 地址
        input(v-model.trim='info.address' type='tel' placeholder='收货地址是?')
    .playment-modal-footer(@click='handPayment') 确认支付
  transition(name='fade')
    //- 提示信息
    span.model(v-if='modal.visible') {{modal.content}}

</template>

<script>
import cell from '~/components/cell.vue'
import { mapState } from 'vuex'
import { setTimeout } from 'timers'
function toggleModal(obj, content) {
  clearTimeout(obj.timer)
  obj.visible = true
  obj.content = content
  obj.timer = setTimeout(() => {
    obj.visible = false
  }, 1500)
}
export default {
  middleware: 'wechat-auth',
  head() {
    return {
      title: '购买页面'
    }
  },
  data() {
    return {
      swiperConfig: {
        autoplay: 4000,
        direction: 'horizontal',
        loop: true,
        pagination: {
          el: '.swiper-pagination'
        }
      },
      attentions: [
        '商品和服务的差异',
        '清关服务',
        '物流服务',
        '需要更多帮助,请联系管理员'
      ],
      showInfo: false, // 是否出现信息模态窗
      inof: {
        name: '',
        phoneNumber: '',
        address: ''
      },
      model: {
        visible: false,
        content: '成功',
        timer: null
      }
    }
  },
  computed: {
    ...mapState({
      product: 'currentProduct'
    })
  },
  methods: {
    async handPayment() {
      // 拿到上下文
      const that = this
      // 取出用户填写数据
      const { name, address, phoneNumber } = this.info
      if (!name || !address || !phoneNumber) {
        toggleModal(this.model, '收货信息忘填了')
        return
      }
      //
      const res = await this.$store.dispatch('createOrder', {
        productId: this.product._id,
        name: name,
        address: address,
        phoneNumber: phoneNumber
      })
      if (!res.order) {
        // 使用提示窗口
        toggleModal(this.modal, '服务器异常,请等待后重新尝试')
        return
      }
      // 微信支付api
      window.wx.chooseWXPay({
        //
      })
      console.log(item)
      // 支付功能暂未实现
    }
  },
  async beforeMount() {
    const id = this.$route.query.id
    this.$store.dispatch('showProduct', id)
  },
  components: {
    cell
  }
}
</script>
<style lang='sass' scoped src='static/sass/deal.sass' ></style>
