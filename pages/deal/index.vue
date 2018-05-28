<template lang="pug">
.container
  .product
    //- 放置一个轮播组件
    .swiper(v-swiper='swiperConfig')
      .swiper-wrapper
        .swiper-slide(v-for='item in product.images')
          img(:src='imageCDN + item')
      //- 轮播的翻页
      .swiper-pagination.swiper-pagination-bullets
    //- 内容区
    .content
      .price(v-if='product.price')
        //-  控制价格显示的样式, 取到小数点后两位
        span.main-price {{Number(product.price).toFixed(2) - Number(product.price).toFixed(2).substr(-3)}}
        span.other-price {{Number(product.price).toFixed(2).substr(-3)}}

    .name {{product.title}}
    .intro {{product.intro}}
    .info
      //- cell 是封装好的组件
      cell(v-for='(item, index) in product.parameters' :key='index' title='item.key' :content='Number(item.value)'
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
    .payment-modal(v-if='showInfo')
      .payment-modal-header
        span 准备购买
        span(@click='showInfo = false') 取消
      .payment-modal-body
        .info-item
          img(:src='imageCDN + product.images[0]')
          div
            p {{ product.title }}
            p 价格 ￥{{ product.price }}
        .info-item
          span 收件人
          input(v-model.trim='info.name' placeholder='你的名字')
        .info-item
          span 电话
          input(v-model.trim='info.phoneNumber' type='tel' placeholder='你的电话')
        .info-item
          span 地址
          input(v-model.trim='info.address' type='tel' placeholder='收货地址是？')
      .payment-modal-footer(@click='handPayment') 确认支付
  transition(name='fade')
    //- 提示信息
    span.modal(v-if='modal.visible') {{modal.content}}

</template>

<script>
import cell from '~/components/cell.vue'
import { mapState } from 'vuex'
import wechat from '~/static/mixins/wechat.js'
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
        pagination: '.swiper-pagination'
      },
      attentions: [
        '商品和服务的差异',
        '清关服务',
        '物流服务',
        '需要更多帮助, 请联系管理员'
      ],
      showInfo: false, // 是否出现信息模态窗
      info: {
        name: '',
        phoneNumber: '',
        address: ''
      },
      modal: {
        visible: false,
        content: '成功',
        timer: null
      }
    }
  },
  computed: {
    ...mapState({
      imageCDN: 'imageCDN',
      product: 'currentProduct'
    })
  },
  methods: {
    async handPayment() {
      // 拿到上下文
      // const that = this
      // 取出用户填写数据
      const { name, address, phoneNumber } = this.info
      if (!name || !address || !phoneNumber) {
        toggleModal(this.modal, '收货信息忘填了')
        return
      }
      //
      const res = await this.$store.dispatch('createOrder', {
        productId: this.product._id,
        name: name,
        address: address,
        phoneNumber: phoneNumber
      })
      // 从服务器拿到的数据
      const data = res.data
      if (!data || !data.success) {
        // 使用提示窗口
        toggleModal(this.modal, '服务器异常,请等待后重新尝试')
        return
      }
      // 微信支付api
      // 微信公众平台  https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115
      window.wx.chooseWXPay({
        timestamp: data.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
        nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
        package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
        signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
        paySign: data.paySign, // 支付签名
        success: response => {
          // 支付成功后的回调函数
          try {
            window.WeixinJSBridge.log(response.err_msg)
          } catch (e) {
            console.log(e)
          }
          if (response.err_msg === 'get_brand_wcpay_request:ok') {
            // The wechat pay success
            toggleModal(this.modal, '支付成功')
          }
        }
      })
    }
  },
  // https://cn.vuejs.org/v2/guide/mixins.html
  mixins: [wechat],
  async beforeMount() {
    const id = this.$route.query.id
    this.$store.dispatch('showProduct', id)
    // 在获取商品信息之后,初始化微信网页端接口行为
    const url = window.location.href
    await this.wechatInit(url)
    // 初始化是通过 mixins: [wechat]暴露出来的wechatConfig的方法实现的
  },
  components: {
    cell
  }
}
</script>
<style lang='sass' scoped src='static/sass/deal.sass' ></style>
