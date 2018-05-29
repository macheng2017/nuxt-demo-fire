# 完善商城功能

## 实现支付功能

增加中间件

对于后台的每个页面都希望有中间件的控制,即像过滤器那样,添加一个字段就可以使用了

调整数据库

1.  增加中间件,放到 index.vue,在页面初始化需要跟微信服务器,加密认证行为
2.  在微信网页的的宿主环境下,把当前的网页或者域名注册到微信宿主环境里面,允许调用这个接口

https://cn.vuejs.org/v2/guide/mixins.html

npm install wechat-pay --save

ngrok 代理合并到一个窗口

修改 package.js

// "build": "nuxt build && backpack build",

"build": "nuxt build",
编译 nuxt

npm run build
启动生产环境
NODE_ENV=production node start
