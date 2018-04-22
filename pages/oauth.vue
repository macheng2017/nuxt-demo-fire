<template lang='pug'>
  .container
</template>
<script>
// import {mapState} from 'vuex'
export default {
  asyncData({ req }) {
    return {
      name: req ? 'server' : 'client'
    }
  },
  head() {
    return {
      title: `测试页面`
    }
  },
  beforeMount() {
    const url = window.location.href
    this.$store.dispatch('getUserByOAuth', encodeURIComponent(url))
    .then(res => {
      // let params = ''
      // if (res.data.success) {
      //   params = res.data.params
      // }
      console.log(' OAuth.vue ' + JSON.stringify(res.data))
    })
  }
}
</script>
