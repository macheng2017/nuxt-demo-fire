<template>
  <section class="container">
    <img src="../static/img/logo.png" alt="Nuxt.js Logo" class="logo" />

  </section>
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
    console.log('---------------------------------------------------------------')
    const wx = window.wx
    const url = window.location.href
    this.$store.dispatch('getWechatSignature', encodeURIComponent(url))
    .then(res => {
      let params = ''
      if (res.data.success) {
        params = res.data.params
      }

      wx.config({
        debug: true,
        appId: params.appId,
        timestamp: params.timestamp,
        nonceStr: params.noncestr,
        signature: params.signature,
        jsApiList: [
          'chooseImage',
          'previewImage',
          'uploadImage',
          'downloadImage',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'onMenuShareQQ',
          'onMenuShareWeibo',
          'onMenuShareQZone',
          'hideAllNonBaseMenuItem',
          'showMenuItems'
        ]
      })
      // 等到config信息验证之后就会执行read()方法,
      // 所有的接口必须要config验证之后才能调用,
      // config权限验证是异步的动作,为保证接口在页面加载的时候都能使用,
      // 将其放入wx.ready回调方法中,如果是用户触发调用的接口比如:分享就不用放入
      wx.ready(() => {
        wx.hideAllNonBaseMenuItem()
        console.log('success!')
      })
    })
  }
}
</script>

<style scoped>
.title
{
  margin-top: 50px;
}
.info
{
  font-weight: 300;
  color: #9aabb1;
  margin: 0;
  margin-top: 10px;
}
.button
{
  margin-top: 50px;
}
</style>
