<template lang="pug">
.container
  .user
    .user-header
      .text {{user.nickname}}
      img(:src='user.avatarUrl')
    .user-address
      cell(title='收货地址')
      .user-content {{user.address}}
    .user-phone
      cell(title='电话')
      .user-content {{user.phoneNumber}}
    .user-name
      cell(title='姓名')
      .user-content {{user.name}}
    .user-order
      cell(title='我的订单')
      .user-order-items(v-for='i in 10' :key='i')
        img(:src='productImg')
        .user-order-intro
          .title 手办
          .content Winter is coming !
        .user-order-price
          span $199.0
</template>

<script>
  import cell from '~/components/cell.vue'
  // import { mapState } from 'vuex'

  export default {
    head() {
      return {
        title: '个人账户'
      }
    },
    data() {
      return {
        user: {
          nickname: '水电费',
          address: '第三个防守打法',
          phoneNumber: 32432432432,
          name: '防守打法',
          avatarUrl: 'http://www.qqzhi.com/uploadpic/2014-09-23/000247589.jpg'
        },
        productImg: 'http://img4.imgtn.bdimg.com/it/u=2015411736,3131482880&fm=27&gp=0.jpg'
      }
    },
    // computed: {
    //   // 映射到mapState
    //   ...mapState([
    //     'user',
    //     'orders'
    //   ])
    // },
    methods: {},
    components: {
      cell
    },
    beforeCreate() {
      // this.$store.dispatch('fetchUserAndOrders')
    }
  }

</script>
<style scoped lang='sass' src='static/sass/user.sass'></style>
