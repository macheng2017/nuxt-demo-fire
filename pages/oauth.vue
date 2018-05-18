<template lang='pug'>
  .container

  //- 把测试页面作为跳板页面,来进行目标页面的跳转
</template>
<script>
// 把当前url地址解析,后跳转到目标地址
function getUrlParam(param) {
  const reg = new RegExp('(^|&)' + param + '=([^&]*)(&|$)')
  const result = window.location.search.substr(1).match(reg)
  return result ? decodeURIComponent(result[2]) : null
}
// import {mapState} from 'vuex'
export default {
  asyncData({ req }) {
    return {
      name: req ? 'server' : 'client'
    }
  },
  head() {
    return {
      title: `loading`
    }
  },
  async beforeMount() {
    const url = window.location.href
    const { data } = await this.$store.dispatch('getWechatOAuth', url)
    console.log(' oauth.vue data ' + data)
    if (data.success) {
      await this.$store.dispatch('setAuthUser', data.data)
      const paramsArr = getUrlParam('state').split('_')
      // 判断数组的长度,拼装参数
      const visit = paramsArr.length === 1 ? `/${paramsArr[0]}` : `/${paramsArr[0]}?id=${paramsArr[1]}`
      // 跳转到目标地址
      this.$router.replace(visit)
    } else {
      throw new Error('用户信息获取失败')
    }
  }
}
</script>
