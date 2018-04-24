RAP  http://rapapi.org/

位置: pages/index.vue

使用pug
```js
<template lang='pug'>
  .container
    .house(ref='houses')
    .characters
    .cities
</template>


<template lang='pug'>
  .container
    .house(ref='house')
      .items(v-for='(item, index) in houses' :key='index' @click = 'showHouse(item)')
        .desc
          .words {{item.words}}
          .cname {{item.cname}}
          .name {{item.name}}
    .character
      .title 主要人物
      .section
      .items(v-for='(item, index) in characters' :key='index' @click = 'showCharacter(item)')
        img(:src='item.profile')
        .desc
          .cname {{item.cname}}
          .name {{item.name}}
          .playedBy {{item.playedBy}}
    .city
      .title 维斯特洛
      .intro xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      .items(v-for='(item, index) in cities' :key='index')
        .title {{item.title}}
        .body {{item.boby}}
</template>



```


```js
<script>
  import { mapState } from 'vuex'
  export default {
    head() {
      return {
        title: '冰火脸谱'
      }
    },
    computed: {
      // 映射到mapState
      ...mapState([
        'houses',
        'characters',
        'cities'
      ])
    },
    methods: {
      showHouse(item) {
        this.$router.push({
          path: '/house',
          query: {
            id: item._id
          }
        })
      },
      showCharacter(item) {
         this.$router.push({
          path: '/character',
          query: {
            id: item._id
          }
        })
      },
      // 在页面加载前获取到数据
      beforeCreate() {
        this.$store.dispatch('fetchHouses')
        this.$store.dispatch('fetchCharacters')
        this.$store.dispatch('fetchCities')

      }
    }
  }

</script>
```

添加获取数据的的service

位置: store/actions.js
```js
 async fetchHouses({ state }) {
    const res = await Services.fetchHouses()
    state.houses = res.data.data
    return res
  },
  async fetchCities({ state }) {
    const res = await Services.fetchCities()
    state.cities = res.data.data
    return res
  },
  async fetchCharacters({ state }) {
    const res = await Services.fetchCharacters()
    state.characters = res.data.data
    return res
  }

```
path: store/service.js

```js
  // 将RAP中的数据前缀复制过来
  const apiUrl = 'http://rapapi.org/mockjsdata/33508'
  // 获取家族的数据
  fetchHouses() {
    return axios.get(`${apiUrl}/wiki/houses`)
  }
  // 获取城市数据
  fetchCities() {
    return axios.get(`${apiUrl}/wiki/cities`)
  }
  // 获取城市数据
  fetchCharacters() {
    return axios.get(`${apiUrl}/wiki/characters`)
  }


```
path: store/index.js
在store/index中同步一下

```js
   state: {
      houses: [],
      cities: [],
      characters: []
    },
```
安装 pug
yarn add pug

为首页添加css样式
```html
<style scoped lang='sass' src='~static/sass/index.sass'></style>
```

### path: static/sass/index.sass

1. 先引入基础定义(字体,颜色,全局)

```css
@import '~static/sass/mixin'
@import '~static/sass/color'
@import '~static/sass/var'

.container
  +border-box
  padding-bottom: $navHeight

.house
  padding: 0 0 $spacing
  +x-scroll

  .house-content
    margin-left: $spacing/2
    width: 90%
    font-size: 0
    display: inline-block

    &:first-child
      margin-left: $spacing

    .house-img-wrapper
      width: 100%
      box-shadow: 0 1px 2px rgba(0, 0, 0, .2)
      overflow: hidden

      img
        width: 100%

    .house-text
      width: 100%
      padding: $spacing/2 0
      +font-dpr(10px)
      +border-box
      +break-word

      .words
        font-size: 1.4em
        color: $grey-700
      .cname
        font-size: 1.9em
        color: $black
      .name
        font-size: 1.8em
        color: $grey-700

.povCharacters
  padding: 0 $spacing
  margin-bottom: $spacing
  background: $white
  +border-box

  .title
    +font-dpr(19px)
    padding: $spacing 0
    border-top: 1px solid $grey-400

  .povCharacter-wrapper
    padding: 0 0 $spacing
    border-bottom: 1px solid $grey-400
    font-size: 0

    .povCharacter-content:nth-child(2n)
      margin-left: 5%

    .povCharacter-content
      width: 47.5%
      +break-word
      display: inline-block
      margin-bottom: $spacing

      img
        width: 100%
        box-shadow: 0 0 2px rgba(0, 0, 0, .2)
        margin-bottom: $spacing/3

      .povCharacter-text
        +font-dpr(10px)
        // line-height: $spacing*1.1

        .cname
          font-size: 1.5em
          color: $black
        .name
          font-size: 1.2em
          color: $grey-600
        .playedBy
          font-size: 1.2em
          color: $grey-600

.city
  padding: 0 $spacing $spacing
  +border-box
  +font-dpr(10px)
  line-height: 2em
  position: relative

  .city-title
    font-size: 1.9em
    padding-bottom: $spacing

  .city-bg
    position: absolute
    width: 100%
    z-index: 0
    top: 3rem
    opacity: .3

  .city-intro
    font-size: 1.6em
    color: $grey-800

  .city-item
    font-size: 1.45em
    color: $grey-700
    margin-top: $spacing*2

```

### mixin.sass

```css
@mixin font-dpr($font-size)
  font-size: $font-size
  [data-dpr='2'] &
    font-size: $font-size * 2
  [data-dpr='3'] &
    font-size: $font-size * 3

@mixin size-dpr($size, $properties...)
  @each $property in $properties
    #{$property}: $size
    [data-dpr='2'] &
      #{$property}: $size * 2
    [data-dpr='3'] &
      #{$property}: $size * 3


@mixin text-overflow
  width: 100%
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis

@mixin x-scroll
  overflow-y: hidden
  overflow-x: scroll
  -webkit-overflow-scrolling: touch
  white-space: nowrap

@mixin y-scroll
  overflow-x: hidden
  overflow-y: scroll
  -webkit-overflow-scrolling: touch

@mixin break-word
  word-wrap: break-word
  white-space: normal

@mixin border-box
  box-sizing: border-box
  -webkit-box-sizing: border-box
  -moz-box-sizing: border-box

@mixin display-flex
  display: flex
  display: -webkit-flex
  display: -webkit-box
  display: -ms-flexbox

@mixin flex-column
  -webkit-box-orient: vertical
  -webkit-box-direction: normal
  -ms-flex-direction: column
  flex-direction: column
```

### var.sass

```css
$imgCdn: 'https://fireice.iblack7.com/images/'

$navHeight: 1.5rem

$spacing: .5rem

$shadow-key-umbra-opacity:      .2
$shadow-key-penumbra-opacity:   .14
$shadow-ambient-shadow-opacity: .12

$card-gutter:                16px
$gutter:                     20px
$carousel-margin:            10px
$media-margin:               10px


$radius-2db:                 2px
$shadow-1db:                 0 1px 3px rgba(0,0,0,.2), 0 1px 1px rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12)
$shadow-2db:                 0 1px 5px rgba(#000, $shadow-key-umbra-opacity), 0 2px 2px rgba(#000, $shadow-key-penumbra-opacity), 0 3px 1px -2px rgba(#000, $shadow-ambient-shadow-opacity) !default;
$shadow-3db:                 0 1px 8px rgba(#000, $shadow-key-umbra-opacity), 0 3px 4px rgba(#000, $shadow-key-penumbra-opacity), 0 3px 3px -2px rgba(#000, $shadow-ambient-shadow-opacity) !default;
$shadow-4db:                 0 2px 4px -1px rgba(#000, $shadow-key-umbra-opacity), 0 4px 5px rgba(#000, $shadow-key-penumbra-opacity), 0 1px 10px rgba(#000, $shadow-ambient-shadow-opacity) !default;

$fastOutSlowIn:              cubic-bezier(0.4, 0.0, 0.2, 1)
$linearOutSlowIn:            cubic-bezier(0.0, 0.0, 0.2, 1)
$fastOutLinearIn:            cubic-bezier(0.4, 0.0, 1, 1)

$display1:                   34px
$headline:                   24px

$title:                      21px
$title2:                     20px

$subheading:                 17px

$content:                    18px
$content2:                   16px

$body1:                      15px
$body2:                      14px

$footer:                     12px
$supplement:                 14px

$button:                     15px
$caption:                    13px

$light:                      300
$regular:                    400
$semibold:                   600



```
### color.sass

```css
$red:                          #F44336

$pink:                         #E91E63

$purple:                       #9C27B0

$blue:                         #2196F3
$blue-600:                     #1E88E5

$cyan:                         #00BCD4

$teal:                         #009688
$teal-50:                      #E0F2F1
$teal-100:                     #B2DFDB
$teal-200:                     #80CBC4
$teal-300:                     #4DB6AC
$teal-400:                     #26A69A
$teal-500:                     #009688
$teal-600:                     #00897B
$teal-700:                     #00796B
$teal-800:                     #00695C
$teal-900:                     #004D40
$teal-A100:                    #A7FFEB
$teal-A200:                    #64FFDA
$teal-A400:                    #1DE9B6
$teal-A700:                    #00BFA5

$green:                        #4CAF50

$yellow:                       #FFEB3B

$orange:                       #FF9800

$amber:                        #FFC107

$deep-orange:                  #FF5722

$grey:                         #9E9E9E
$grey-50:                      #FAFAFA
$grey-100:                     #F5F5F5
$grey-200:                     #EEEEEE
$grey-300:                     #E0E0E0
$grey-400:                     #BDBDBD
$grey-500:                     #9E9E9E
$grey-600:                     #757575
$grey-700:                     #616161
$grey-800:                     #424242
$grey-900:                     #212121

$blue-grey:                    #607D8B
$blue-grey-50:                 #ECEFF1
$blue-grey-100:                #CFD8DC
$blue-grey-200:                #B0BEC5
$blue-grey-300:                #90A4AE
$blue-grey-400:                #78909C
$blue-grey-500:                #607D8B
$blue-grey-600:                #546E7A
$blue-grey-700:                #455A64
$blue-grey-800:                #37474F
$blue-grey-900:                #263238

$black:                        #000
$white:                        #fff
```

### icon.sass

```css
$material-cdn: 'https://cdn.bootcss.com/material-design-icons/3.0.0/iconfont/MaterialIcons-Regular'

@font-face
  font-family: 'Material Icons'
  font-style: normal
  src: url("#{$material-cdn}.eot")
  src: local('Material Icons'), local('MaterialIcons-Regular'), url("#{$material-cdn}.woff2") format("woff2"), url("#{$material-cdn}.woff") format("woff"), url("#{$material-cdn}.ttf") format("truetype")

.material-icon
  font-family: 'Material Icons'
  font-weight: normal
  font-style: normal
  // font-size: 24px
  line-height: 1
  letter-spacing: normal
  text-transform: none
  display: inline-block
  white-space: nowrap
  word-wrap: normal
  direction: ltr
  -webkit-font-smoothing: antialiased
```
### base.sass

```css
@import './color'
@import './icon'
@import './var'
@import './mixin'

html, body
  margin: 0
  padding: 0
  width: 100%
  height: 100%
  letter-spacing: 1px
  font-family: "Source Sans Pro", Arial, sans-serif
  overflow: hidden
  >div
    width: inherit
    height: inherit

  #app
    width: 100%
    height: 100%

a
  text-decoration: none
  color: $black

p, h1, h2, h3, h4, h5, h6
  margin: 0

input
  min-height: 32px
  color: rgba(0, 0, 0, .54)
  border-color: rgba(0, 0, 0, .12)
  border-width: 1px
  border-radius: 2px
  padding: 0 5px

  &:focus, &:active
    border-color: rgba(0, 0, 0, .22)
    outline: 0
    box-shadow: none

#main
  width: 100%
  height: 100%

  .container
    width: 100%
    height: 100%
    text-align: justify
    +y-scroll
    transition: all .5s cubic-bezier(.55, 0, .1, 1)

    >*
      width: 100%

.page-enter-active, .page-leave-active
  transition: opacity .1s

.page-enter, .page-leave-to
  opacity: 0

.slide-left-enter, .slide-right-leave-to
  opacity: 0
  transform: translateX(100%)
  -webkit-transform: translateX(100%)

.slide-left-leave-active, .slide-right-enter
  opacity: 0
  transform: translateX(0)
  -webkit-transform: translateX(0)

.swiper-pagination-bullet
  background-color: $white !important
  border: 1px solid $grey
  opacity: .7 !important
.swiper-pagination-bullet-active
  background-color: $grey-400 !important




.table
  background-color: $white
  border: 0
  box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.06), 0 0 3px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.18)
  margin-top: 16px
  margin-bottom: 16px
  width: 100%


  tbody
    &:first-child > tr:first-child
      td,th
        border-top: 0


    tr:hover
      background-color: $white

  td,th
    border-top: 1px solid $grey-300
    font-size: 20px
    line-height: 30px
    padding: 6px 32px 6px 24px
    vertical-align: top

    &.nowrap
      white-space: nowrap
      width: 1%

  thead
    &:first-child > tr:first-child
      td, th
        border-top: 0

    td, th
      color: $grey-400
      font-size: 14px
      vertical-align: bottom
```

## 到nuxt.config中配置下

```js
css: ['~static/css/main.css'],

```
```js
css: [
  {
    src: 'static/sass/base.sass',
    lang: 'sass?indentedSyntax=true'
    }
],

// 设置lang 使用sass进行解析
```

### 到oauth.vue中修改,删除about.vue

```js
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
```

### path: layouts/default.vue

```js
<template lang='pug'>
  #app
    #main
      nuxt
    v-nav
</template>

<script>
import vNav from '../components/nav.vue'

export default {
  components: {
    vNav
  }
}
</script>
```

### error
```js
<template lang='pug'>
  .container
    img(src="~/static/img/logo.png")
    h1.title {{ error.statusCode }}
    h2.info {{ error.message }}
    nuxt-link.button(to="/" v-if="error.statusCode === 404") 首页
</template>
<script>
export default {
  props: ['error']
}
</script>

<style scoped lang='sass'>
.title
  margin-top: 15px
  font-size: 5em

.info
  font-weight: 300
  color: #9aabb1
  margin: 0
.button
  margin-top: 50px
</style>
```

## 添加家族主页


```js
<template lang="pug">
.container
  .house-media
    .desc
      .words {{house.words}}
      .name {{house.name}}
  .house-body
    .title {{house.cname}}
    .body {{house.intro}}
    .title 主要角色
    .times(v-for='(item, index) in house.swornMembers' :key='index')
      .members
        img(:src='item.profile')
        .desc
          .cname {{item.cname}}
          .intro {{item.text}}
  .house-history(v-for='(item, index) in house.sections' :key='index')
    .title {{item.title}}
    .content(v-for='(text, index) in item.content' :key='index') {{text}}
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    head() {
      return {
        title: '家族详情'
      }
    },
    computed: {
      ...mapState({
        house: 'currentHouse'
      })
    },
    beforeCreate() {
      let id = this.$route.query.id

      this.$store.dispatch('showHouse', id)
    }
  }
</script>
<style lang="sass" scoped scr ='~/static/sass/house.sass'></style>

```

位置: store/actions.js

```js
  async showHouses({ state }, _id) {
    // id相同即为当前页,返回
    if (_id === state.currentHouse._id) return
    const res = await Services.fetchHouse(_id)
    state.currentHouse = res.data.data
    return res
  }
```

位置: store/services.js

```js
  // 获取家族的数据
  fetchHouse(id) {
    return axios.get(`${apiUrl}/wiki/houses/${id}`)
  }
}
```

新建家族主页

位置: page/character/index.vue

复制 house.vue文件并修改

```js
<template lang="pug">
.container
  .character-header
    img.background(v-if='character.images', :src='character.images[character.images.length - 1]')
    .media
      img(v-if='character.profile', :src='character.profile')
      .desc
        .names
          p.cname {{character.cname}}
          p.name {{character.name}}
  .character-body
    .intro
      p(v-for = 'item in character.intro') {{item}}
    .stills
      img(v-for='(item, index) in character.images' :src='item' :key='index')
    .items(v-for = 'item in character.sections')
      .title {{item.title}}
      .body(v-for='text in item.content') {{text}}
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    head() {
      return {
        title: '家族成员详情'
      }
    },
    computed: {
      ...mapState({
        character: 'currentCharacter'
      })
    },
    beforeCreate() {
      let id = this.$route.query.id

      this.$store.dispatch('showCharacter', id)
    }
  }
</script>
<style lang='sass' scoped src='static/sass/character.sass' ></style>

```

* 需要注意的是
* 
```js
    computed: {
          ...mapState({
            character: 'currentCharacter'
          })
        },
```

## 增加导航

位置: components/nav.vue

```js
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

```
在RAP中增加页面

## 增加商品页面 pages/shopping/index.vue

复制 house.vue

```js
<template lang="pug">
.container
  .shopping
    .title 权游周边
    .list
      .items(v-for='(item, index) in products' :key = 'index' @click='showProduct(item)')
        img(:src='item.images[0]')
        .body
          .title {{item.title}}
          .content {{item.intro}}

</template>

<script>
  import { mapState } from 'vuex'
  export default {
    head() {
      return {
        title: '手办商城'
      }
    },
    computed: {
      ...mapState([
        'products'
      ])
    },
    methods: {
      showProduct(item) {
        this.$router.push({
          path: '/deal',
          query: {
            id: item._id
          }
        })
      }
    },
    beforeCreate() {
      // let id = this.$route.query.id
      this.$store.dispatch('fetchProducts')
    }
  }
</script>
<style lang='sass' scoped src='static/sass/shopping.sass' ></style>

```

### 增加 actions.js

```js
  async fetchProducts({ state }) {
    // id相同即为当前页,返回
    const res = await Services.fetchProducts()
    // console.log(' fetchProducts data = ' + JSON.stringify(res.data))
    state.products = res.data.data
    return res
  }

```
### 添加 /store/service.js

```js
  fetchProducts() {
    return axios.get(`${apiUrl}/wiki/products`)
  }

```

### 添加字段 /store/index.js

```js
    state: {
      houses: [],
      cities: [],
      characters: [],
      products: [],
      currentHouse: {},
      currentCharacter: {}
    },


```

```js



```

```js



```

```js



```


