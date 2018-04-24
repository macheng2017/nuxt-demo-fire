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

    .name {{product.name}}
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
    span(@click='buyProduct') 购买
</template>

<script>
  import cell from '~/components/cell.vue'
  import { mapState } from 'vuex'
  export default {
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
        ]
      }
    },
    computed: {
      ...mapState({
        'product': 'currentProduct'
      })
    },
    methods: {
      buyProduct(item) {
        console.log(item)
     // 支付功能暂未实现
      }
    },
    beforeCreate() {
      const id = this.$route.query.id
      this.$store.dispatch('showProduct', id)
    },
    components: {
      cell
    }
  }
</script>
<style lang='sass' scoped src='static/sass/deal.sass' ></style>
