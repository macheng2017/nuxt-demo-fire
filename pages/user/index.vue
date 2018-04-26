<template lang="pug">
.container
  .user(v-if='user')
    .user-header
      .text {{user.nickname}}
      img(:src='user.avatar')
    .user-address
      cell(title='收货地址')
      .user-content {{user.address}}
    .user-phone
      cell(title='电话')
      .user-content {{user.phoneNumber}}
    .user-name
      cell(title='姓名')
      .user-content {{user.name}}
    .user-order(v-if='user.orders && user.orders.length > 0')
      cell(title='我的订单')
      .user-order-items(v-for='(item, index) in user.orders' :key='index')
        img(:src='item.image')
        .user-order-intro
          .title {{item.title}}
          .content {{item.intro}}
        .user-order-price
          span {{item.price}}
</template>

<script>
  import cell from '~/components/cell.vue'
  import { mapState } from 'vuex'

  export default {
    head() {
      return {
        title: '个人账户'
      }
    },

    computed: {
      // 映射到mapState
      ...mapState([
        'user'
      ])
    },
    methods: {},
    components: {
      cell
    },
    beforeCreate() {
      this.$store.dispatch('fetchUserAndOrders')
    }
  }

</script>
<style scoped lang='sass' src='static/sass/user.sass'></style>
