import Vue from 'vue'
// 判断当前环境
// if (process.BROWSER_BUILD) {
if (process.browser) {
  const VueAwesomeSwiper = require('vue-awesome-swiper/dist/ssr')
  Vue.use(VueAwesomeSwiper)
}
