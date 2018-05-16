<template lang="pug">
.content
  h3 登录成功 {{user.email}}
</template>


<script>
import {mapState} from 'vuex'

export default {
  middleware: 'auth',
  layout: 'admin',
  head() {
    return {
      title: '后台管理首页'
    }
  },
  // data() {
  //   return {
  //     user: {}
  //   }
  // },
  computed: mapState([
    'user'
  ])
}
</script>

<style lang="sass" scoped src='~/static/sass/admin.sass'></style>
