<template lang='pug'>
  nav#nav(v-if='navVisble')
    nuxt-link(v-for='(item, index) in navList' :to='item.path' :key='index')
      //- 判断当前导航是哪一个
      div(v-if='index === 0')
        img(v-if='activeRoute !== item.name' src='~static/img/home.png')
        img(v-else src='~static/img/home-selected.png')
      div(v-else-if='index === 1')
        img(v-if='activeRoute !== item.name' src='~static/img/shopping.png')
        img(v-else src='~static/img/home-selected.png')
      div(v-else)
        img(v-if='activeRoute !== item.name' src='~static/img/user.png')
        img(v-else src='~static/img/home-selected.png')
      p {{item.text}}

</template>

<script>
  export default {
    data() {
      return {
        navList: [
          {
            'path': '/',
            'name': 'index',
            'text': '脸谱'
          },
          {
            'path': '/shopping',
            'name': 'shopping',
            'text': '周边手办'
          },
          {
            'path': '/user',
            'name': 'user',
            'text': '我的账户'
          }
        ]
      }
    },

    computed: {
      activeRoute() {
        return this.$route.name
      },
      navVisble() {
        // 如果匹配到数组中的任意一个则返回true
        return ['index', 'shopping', 'user'].indexOf(this.activeRoute) > -1
        // return this.activeRoute === 'index' || 'shopping' || 'user'
      }
    }
}
</script>
<style lang="sass" scoped src='static/sass/nav.sass'></style>
