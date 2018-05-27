// mixins 是一种分发vue组件中可复用功能的非常灵活的方式
export default {
  methods: {
    // 让微信客户端知道,在当前的url地址网页能有调用微信api的能力
    async wechatInit(url) {
      // 通过服务器拿到签名
      const res = await this.$store.dispatch('getWechatSignature', url)
      const {
        data,
        success
      } = res.data
      if (!success) throw new Error('不能成功获取服务器签名!')
      // 拿到全局暴露的微信sdk对象
      const wx = window.wx
      // 初始化微信sdk对象, 可以参考文档
      // https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115

      wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: data.appId, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature, // 必填，签名
        jsApiList: ['previewImage',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'chooseWXPay'
        ] // 必填，需要使用的JS接口列表
      })

      wx.ready(() => {
        // this.wechatSetMenu() // inin 微信按钮
        // this.wechatShare()
      })
    }
  }
}
