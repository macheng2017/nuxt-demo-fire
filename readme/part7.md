## 利用修饰器 decoratorr重构koa路由策略

1. 数据
2. 页面
3. 将本地数据页面链接起来

通过路由 将api或者页面通过路由中间件,将请求匹配到后端的控制器

### 通过拆分路由把不同的业务逻辑放在单独的路由页面中去

1. 微信服务
2. 小程序
3. 网站后端
4. 网站前端
5. groupQL

## 微信有关路由
新建 server/routes 存放不同业务路由的中间件

将原有的 middlewares/router.js 复制到routers/wechat.js
```js
import Router from 'koa-router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { signature, redirect, oauth } from '../controllers/wechat'

export const router = app => {
  const router = new Router()
  router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
  router.get('/wechat-signature', signature)
  // 将用户偷偷跳转到二跳地址
  router.get('/wechat-redirect', redirect)
  // 用户跳转过来之后需要通过授权机制获取用户信息
  router.get('/wechat-oauth', oauth)
  app.use(router.routes())
     .use(router.allowedMethods())
}
```

改动原来的middlewares/router.js

```js
import Router from '../decorator/router'
import {resolve} from 'path'
const r = path => resolve(__dirname, path)

export const router = app => {
  const apiPath = r('../routers')
  const router = new Router(app, apiPath)
  router.init()
}
```


新建../decorator/router.js

实现将页面装入路由当中

```js
import Router from 'koa-router'
import { resolve } from 'path'
import glob from 'glob'
import _ from 'lodash'
export let routersMap = new Map()

export const symbolPrefix = Symbol('prefix')
// 如果是数组,否则包装成数组
export const isAarry = v => _.isArray(v) ? v : [v]

export const normalizePath = path => path.startsWith('/') ? path : `/${path}`

export default class Route {
  constructor(app, apiPath) {
    this.app = app
    this.router = new Router()
    this.apiPath = apiPath
  }
  init() {
    // 1.遍历路由中所有文件
    glob.sync(resolve(this.apiPath, './*.js')).forEach(require)
    // 2. 对其内部进行路径判断路径解析,让每个路径对上一个controller
    // 分别将其加载进来
    //
    for (let [conf, controller] of routersMap) {
      // 把每一个路由文件中的controller取出来跟他们的路由进行一一匹配
      // 来判断下是否是数组
      const controllers = isAarry(controller)
      // 改动下微信的路由
      let prefixPath = conf.target[symbolPrefix]
      // symbolPrefix 是什么意思?
      // 在JavaScript 数据类型 symbol可以看做是第七种类型,不同于以往的数据类型
      // 通过symbol创建的值与任何其他值都不相等,也就是每个symbol都是独一无二的
      // ,创建之后不能修改
      // 拿到正常路径
      if (prefixPath) prefixPath = normalizePath(prefixPath)
      const routerPath = prefixPath + conf.path
      // 对里面的每个方法施加到他们自身,让其可以生效
      this.router[conf.method](routerPath, ...controllers)
    }
    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
  }
}
export const router = conf => (target, key, desc) => {
  conf.path = normalizePath(conf.path)
  routersMap.set({
    target: target,
    ...conf
  }, target[key])
}
// symbolPrefix 是唯一的值, 这样每一个controller都是唯一的值
export const controller = path => target => target.prototype[symbolPrefix] = path
// 简单的配置get请求的router
export const get = path => router({
  method: 'get',
  path: path
})
export const post = path => router({
  method: 'post',
  path: path
})

export const put = path => router({
  method: 'put',
  path: path
})
export const del = path => router({
  method: 'del',
  path: path
})


```

初步来看glob是一个多了匹配功能的require,还没详细看
https://github.com/isaacs/node-glob



### 改动下微信的路由
```js

import Router from 'koa-router'
import { controller, get, post } from '../decorator/router'
import config from '../config'
import wechatMiddle from '../wechat-lib/middleware'
import reply from '../wechat/reply'
import { signature, redirect, oauth } from '../controllers/wechat'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')
@controller('')
export class WechatCotroller {
  @get('/wechat-hear')
  async wechatHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle (ctx, next)
    ctx.body = body
  }
  @post('/wechat-hear')
  async wechatPostHear(ctx, next) {
    const middle = wechatMiddle(config.wechat, reply)
    const body = await middle (ctx, next)
    ctx.body = body
  }
  @get('/wechat-signature')
  async wechatSignature(ctx, next) {
    await signature(ctx, next)
  }
  @get('/wechat-redirect')
  async wechatRedirect(ctx, next) {
    await redirect(ctx, next)
  }
  @get('/wechat-oauth')
  async wechatOauth(ctx, next) {
    await oauth(ctx, next)
  }
}

// 这样做的好处
// 1. 通过这样的写法可以将路由拆开
// 2. 不同业务对应不同的文件
// 3. 可以使整个的路由层次更加清楚,只需要看一下controller的命名空间,
// 就知道它里面包含哪些业务对应过来这个路由
// 4. get/post 请求在这里可以做更加精细的控制,而不是像之前的router.get
//  router.post 将整个数据流程整个丢给了下个函数




// export const router = app => {
//   const router = new Router()
//   router.all('/wechat-hear', wechatMiddle(config.wechat, reply))
//   router.get('/wechat-signature', signature)
//   // 将用户偷偷跳转到二跳地址
//   router.get('/wechat-redirect', redirect)
//   // 用户跳转过来之后需要通过授权机制获取用户信息
//   router.get('/wechat-oauth', oauth)
//   app.use(router.routes())
//      .use(router.allowedMethods())
// }

```

修饰器 是es7的语法 decorator 还不能原生的支持,还是需要babel的编译
需要在start.js 引入插件plugin


```js
const { resolve } = require('path')
const r = path => resolve(__dirname, 'path')
require('babel-core/register')({
  'presets': [
    'stage-3',
    ['latest-node',
     { 'target': 'current' }
    ]
  ],
  plugins: [
    'transform-decorators-legacy',
    [
      'module-alias', [
        {
          src: r('./server'), 'expose': '~',
          src: r('./server/database'), 'expose': 'database'
        }
      ]
    ]
  ]
})
// 通过babel的编译才能放心使用es6 的语法
require('babel-polyfill')
require('./server')
// require('./server/crawler/imdb')
// require('./server/crawler/api')
// require('./server/crawler/check')
// require('./server/crawler/wiki')
// require('./test/testRamda')



```


yarn add babel-plugin-module-alias -D
yarn add babel-plugin-transform-decorators-legacy -D

WARNING: This project has been renamed to babel-plugin-module-resolver. Install babel-plugin-module-resolver for new features

yarn add babel-plugin-module-resolver babel-plugin-transform-decorators-legacy -D

测试数据

http://localhost:3000/wechat-signature?url=abcd

如果测试通过说明,路由分层已经可以了

## 开发家族数据API

开发前后端接口

位置: routes/wiki.js

copy wechat.js code


```js
import { controller, get, post } from '../decorator/router'
import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

const WikiHouse = mongoose.model('WikiHouse')
@controller('/wiki')
export class WechatCotroller {
  // 获取家族数据
  @get('/houses')
  async getHouses(ctx, next) {
    // 直接可以进行数据库的操作
    const houses = await WikiHouse
    .find({})
    .populate({
      path: 'swornMembers.character',
      select: '_id name cname profile'
    }).exec()
    ctx.body = {
      data: houses,
      success: true
    }
  }
  // 获取单个家族详细数据
  @get('/houses/:_id')
  async getHouse(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) return (ctx.body = {success: false, err: 'id is required'})
    const house = await WikiHouse
    .findOne({_id: _id})
    .populate({
      path: 'swornMembers.character',
      select: '_id name cname nmid'
    }).exec()
    ctx.body = {
      data: house,
      success: true
    }
  }
}


```

### 测试 替换RAP api

位置 server/store/services.js


更改 apiUrl 为 baseUrl


### 手动上传家族图片到七牛云

测试域名
minipro.spzwl.com



### 位置 store/index.js
增加

```js
   return new Vuex.Store({
    state: {
      imageCDN: 'http://minipro.spzwl.com',
```

### path index.vue

```js
  .desc
        .words {{item.words}}
        .cname {{item.name}}
        .name {{item.cname}}
      .house-flag
        img(:src='imageCDN + item.cname + ".jpg"')

        //...
  computed: {
      // 映射到mapState
      ...mapState([
        'imageCDN',

```

### index.sass

```js
    .house-flag
      width: 100%
      box-shadow: 0 1px 2px rgba(0, 0, 0, .2)
      overflow: hidden

      img
        width: 100%

```

## 添加人物数据的api

### 位置 routers.js

copy code of above example and modify

```js
const WikiCharacter = mongoose.model('WikiCharacter')

 // 获取人物数据
  @get('/characters')
  async getCharacters(ctx, next) {
    let { limit = 20 } = ctx.query
    const data = await WikiCharacter
    .find({})
    .limit(Number(limit))
    .exec()
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取单个人物详细数据
  @get('/characters/:_id')
  async getCharacter(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) return (ctx.body = {success: false, err: 'id is required'})
    const data = await WikiCharacter
    .findOne({_id: _id})
    .exec()
    ctx.body = {
      data: data,
      success: true
    }
  }
```

## 将cities 写成固定值

### path store/services.js
```js
  // // 获取城市数据
  // fetchCities() {
  //   // console.log(`${baseUrl}/wiki/cities`)
  //   // return axios.get(`${baseUrl}/wiki/cities`)
  //   // 测试用假数据
  //   return {data: {data: [], success: true}}
  // }
```
### path store/actions.js
```js
  // async fetchCities({ state }) {
  //   const res = await Services.fetchCities()
  //   state.cities = res.data.data
  //   return res
  // },
```

### path index.vue

add code

```js
cities: [
        {
          title: '北境',
          body: '北境是颈泽以北的地带，临冬城的史塔克家族作为北境之王和伊耿征服后的北境守护已统治了数千年之久。'
        },
        {
          title: '铁群岛',
          body: '铁群岛是位于大陆西海岸铁民湾中的一组群岛，它们分别是派克岛，大威克岛，老威克岛，哈尔洛岛，盐崖岛，黑潮岛和奥克蒙岛。'
        },
        {
          title: '河间地',
          body: '河间地是位于三叉戟河流域的肥沃地带。他们的统治者是奔流城的徒利家族。在远古的河流王灭绝后，河间地进入一个动荡的历史时期，其他的南方王国纷纷入侵，河间地多次易主。'
        },
        { title: '艾林谷',
          body: '谷地是一处几乎被明月山脉完全环绕的区域，他们的统治者是艾林家族，是最古老的安达尔人贵族之一，在伊耿征服之前是山岭和谷地之王。'
        },
        { title: '西境',
          body: '西境位于河间地以西和河湾以北，由凯岩城的兰尼斯特家族统治，他们是从前的岩地之王。'
        },
        { title: '河湾',
          body: '河湾是由高庭的提利尔家族所统治的肥沃土地。提利尔家族原本是园丁家族的总管，园丁家族是伊耿征服之前的河湾王。'
        },
        {
          title: '风暴之地',
          body: '风暴之地位于君临和多恩海之间，在东边则是被破船湾和多恩海与南方分隔开来。'
        },
        {
          title: '多恩',
          body: '多恩是维斯特洛最南部的土地，从多恩边境地的高山一直延伸到大陆的南海岸。这里是维斯特洛最炎热的国度，拥有大陆上仅有的沙漠。'
        },
        {
          title: '王领',
          body: '王领是铁王座之王的直属领地。这块区域包括君临以及周围地带的罗斯比城和暮谷城。'
        },
        {
          title: '龙石岛',
          body: '龙石岛是位于狭海中的岛屿要塞，同时管理着狭海中的一些其他岛屿如潮头岛和蟹岛，以及位于大陆上的尖角要塞。'
        }
      ]
```

### 指定图片剪裁宽度

```js
 .title 主要人物
    .section
      .items(v-for='(item, index) in characters' :key='index' @click='showCharacter(item)')
        img(:src='imageCDN + item.profile + "?imageView2/1/w/280/h/400/q/75|imageslim"')
```
* 在七牛中配置好参数

```js

```

```js

```
## 重构代码

### 位置: server/index.js

```js
// import {
//   getSignatureAsync,
//   getAuthorizeURL,
//   getUserByCode
// } from './wechat'

// export {
//   getSignatureAsync,
//   getAuthorizeURL,
//   getUserByCode
// }

// 这样就可以在其他文件中通过 import * as api from '../api'
// 直接通过api来调用所暴露出来的方法了
import * as wechat from './wechat'

export default {
  wechat: wechat
}

```
### 位置  controllers/wechat.js

```js
const params = await api.wechat.getSignatureAsync(url)

const url = await api.wechat.getAuthorizeURL(scope, target, params)

const user = await api.wechat.getUserByCode(code)

```
### copy code from  path routers/wiki.js

```js
import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

const WikiHouse = mongoose.model('WikiHouse')
const WikiCharacter = mongoose.model('WikiCharacter')
  // 获取家族数据
export async function getHouses() {
  // 直接可以进行数据库的操作
  const data = await WikiHouse
  .find({})
  .populate({
    path: 'swornMembers.character',
    select: '_id name cname profile'
  }).exec()
  return data
}

// 获取单个家族详细数据
export async function getHouse(_id) {
  const data = await WikiHouse
  .findOne({_id: _id})
  .populate({
    path: 'swornMembers.character',
    select: '_id name cname nmid'
  }).exec()
  return data
}
// 获取人物数据
export async function getCharacters(limit = 20) {
  const data = await WikiCharacter
  .find({})
  .limit(Number(limit))
  .exec()
  return data
}
// 获取单个人物详细数据
export async function getCharacter(_id) {
  const data = await WikiCharacter
  .findOne({_id: _id})
  .exec()
  return data
}

```
### index.js import wiki.js

```js
import * as wechat from './wechat'
import * as wiki from './wiki'

export default {
  wechat: wechat,
  wiki: wiki
}


```
### path /routers/wiki.js 
```js
import { controller, get, post } from '../decorator/router'
import api from '../api'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

@controller('/wiki')
export class WechatCotroller {
  // 获取家族数据
  @get('/houses')
  async getHouses(ctx, next) {
    const data = await api.wiki.getHouses()
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取单个家族详细数据
  @get('/houses/:_id')
  async getHouse(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) return (ctx.body = {success: false, err: 'id is required'})
    const data = await api.wiki.getHouse(_id)
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取人物数据
  @get('/characters')
  async getCharacters(ctx, next) {
    let { limit = 20 } = ctx.query
    const data = await api.wiki.getCharacters(limit)
    ctx.body = {
      data: data,
      success: true
    }
  }
  // 获取单个人物详细数据
  @get('/characters/:_id')
  async getCharacter(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) return (ctx.body = {success: false, err: 'id is required'})
    const data = await api.wiki.getCharacter(_id)
    ctx.body = {
      data: data,
      success: true
    }
  }
}


```
### 完善家族封面图片

添加字段
```js

 .populate({
    path: 'swornMembers.character',
    select: '_id name profile cname nmid'
  }).exec()

```

### 突然发现一个问题house.swornMember 下面没有character的数据

通过查看console vue 查看数据类型
得到item.character._id 而不是在item._id
```js
   methods: {
      showCharacter(item) {
        this.$router.push({
          path: '/character',
          query: {
            id: item.character._id
          }
        })
      }

```

## 实现商城页面的后台路由功能

add path server/database/schema/product.js

```js
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed

const ProductSchema = new Schema({
  price: String,
  title: String,
  intro: String,
  images: [
    String
  ],
  parameters: [
    {
      key: String,
      value: String
    }
  ]
})

```

### 添加路由
add path routers/product.js
copy code from wiki.js

```js
import xss from 'xss'


```
* xss filter malicious string



添加 处理方法

path server/api/product.js

cp code of wiki.js
```js

import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

const Product = mongoose.model('product')

// 获取人物数据
export async function getProducts(limit = 50) {
  const data = await Product
  .find({})
  .limit(Number(limit))
  .exec()
  return data
}
// 获取单个人物详细数据
export async function getProduct(_id) {
  const data = await Product
  .findOne({_id: _id})
  .exec()
  return data
}
export async function save(product) {
  product = new Product(product)
  product = await product.save()
  return product
}
export async function update(product) {
  product = await product.save()
  return product
}
export async function del(product) {
  await product.remove()
  return true
}

```

## 宝贝上传后台

path: pages/admin/product.vue

1. 上传
2. 展示
3. 上传图片
4. 编辑

```js
<template lang="pug">
.content
  .related-products
    table.table
      thead
        tr
          th 图片
          th 标题
          th 价格
          th 简介
          th 参数
          th 修改
      tbody
        tr(v-for='item in products')
          td
            .img(v-for='image in item.images')
              img(:src='imageCDN + image + "?imageView2/1/w/280/h/400/q/75|imageslim"')
          td {{item.title}}
          td {{item.price}}
          td(v-html='item.intro')
          td(v-for='parameter in item.parameters') {{parameter.key}} {{parameter.value}}
          td
            button.btn(@click='editProduct(item)') edit
              .material-icon edit
            button.btn(@click='deleteProduct(item)')
              .material-icon delete
  .edit-product(:class='{active: editing}')
    .edit-header
      .material-icon edit
      div(style='flex: 1')
        .material-icon(@click='editing =! editing') close
    .edit-body
      .form.edit-form
        .input-group
          label 标题
          input(v-model='edited.title')
        .input-group
          label 价格
          input(v-model='edited.price', type='number')
        .input-group
          label 简介
          textarea(v-model='edited.intro', @keyup='editedIntro')
        .input-group
          label 参数
          .parameters
            .inputs(v-for='item, index in edited.parameters')
              input(v-model='item.key', placeholder='名称')
              input(v-model='item.value', placeholder='值')
              .remove(@click='removeParameter(index)')
                .material-icon remove
    .edit-footer
      button.btn.save(@click='saveEdited', v-if='!isProduct') 创建宝贝
      button.btn.save(@click='saveEdited', v-if='isProduct') 保存修改

      .btn.add-parameter(@click='addParameter')
        .material-icon add
        | 添加参数

  .float-btn(@click='createProduct')
    .material-icon add
  v-snackbar(:open.sync='openSnackbar')
    span(slot='body') 保存成功
</template>


<script>
import { mapState } from 'vuex'
// import axios from 'axios'
import vSnackbar from '~/components/snackbar'

export default {
  layout: 'admin', // 不在使用default模板
  head() {
    return {
      title: '宝贝列表'
    }
  },
  data() {
    return {
      isProduct: false,
      openSnackbar: false,
      edited: {
        images: [],
        parameters: []
      },
      editing: false
    }
  },
  async created() {
    this.$store.dispatch('fetchProducts')
  },
  computed: mapState([
    'imageCDN',
    'products'
  ]),
  methods: {
    editedIntro(e) {
      // get data
      let html = e.target.value
      // replace  <br/>>
      html = html.replace(/\n/g, '<br />')
      this.edited.intro = html
    },
    // if edit data then assignment
    editProduct(item) {
      this.edited = item
      this.isProduct = true
      this.editing = true
    },
    createProduct() {
      this.edited = {
        images: [],
        parameters: []
      }
      this.isProduct = false
      this.editing = true
    },
    async saveEdited() {
      // 根据isProduct状态判断是 编辑/新增
      this.isProduct
        ? await this.$store.dispatch('putProduct', this.edited)
        : await this.$store.dispatch('saveProduct', this.edited)
      // 重置状态
      this.openSnackbar = true
      this.isProduct = false
      this.edited = {
        images: [],
        parameters: []
      }
      this.editing = !this.editing
    },
    // 添加参数,push一条空数据就行
    // 爽点: vue angler.js 对于表单的编辑,新增一条表单域,
    // 不需要关心dom节点,只需要对数据进行删减或者新增,数据状态的变化就会引发dom结构的变化
    addParameter() {
      this.edited.parameters.push({
        key: '',
        value: ''
      })
    },
    removeParameter(index) {
      this.edited.parameters.splice(index, 1)
    }
  },
  components: {
    vSnackbar
  }
}
</script>

<style lang="sass" scoped src='static/sass/admin.sass'></style>

```


API: layout 属性 - Nuxt.js  https://zh.nuxtjs.org/api/pages-layout

### add path layouts/admin.vue

```js
<template lang='pug'>
header
  .menu
    //-  便于后面对左边顶部菜单展开收缩的控制,先挖个坑
    span.material-icon menu

</template>

<script>

</script>
<style lang="sass" scoped >
header
  height: 56px
  width: 100%
  box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4px 8px rgba(0, 0, 0, .28)
  background-color: #ff6600
  color: #fff
  display: flex
  align-items: center

  .menu
    cursor: pointer
    margin-left: 20px
    font-size: 26px
</style>
```

### path  header.vue

```js
<template lang='pug'>
header
  .menu
    //-  便于后面对左边顶部菜单展开收缩的控制,先挖个坑
    span.material-icon menu

</template>

<style lang='sass'>
header
  height: 56px
  width: 100%
  box-shadow: 0 0 4px rgba(0, 0, 0, .14), 0 4p 8px rgba(0, 0, 0, .28)
  background-color: #ff6600
  color: #fff
  display: flex
  align-items: center

  .menu
    cursor: pointer
    margin-left: 20px
    font-size: 26px


</style>

```

### add path layouts/aside.vue 边栏

放几个主要页面的连接

```js
<template lang='pug'>
aside
  ul
    li
      nuxt-link(to='/admin/proucts') 宝贝列表
</template>
<style lang="sass" scoped >
aside
  width: 230px
  height: calc(100vh - 56px)
  overflow: scroll
  padding-top: 20px

  ul
    list-style: none
    padding: 0

    a
      display: block
      font-size: 14px
      height: 40px
      line-height: 40px
      padding-left: 40px
      color: #666
      text-decoration: none

      &:hover
        background-color: rgba(0,0,0,.05)
        text-decoration: none

      &.nuxt-link-exact-active
        font-weight: 500
        color: #222
        background-color: rgba(0,0,0,.05)
</style>
```


### add path layouts/snackbar.vue 

```js
<template lang='pug'>
//- 动画效果
transition(name=swing)
  .snackbar(v-if='open')
    .snackbar-content
      slot(name='body')
      slot(name='action', @click='$emit("update:open", false)')
</template>
<script>
  export default {
    props: {
      open: {
        default: false
      }
    },
    watch: {
      // open 的状态 有新值则清除延时
      'open': function (newVal, oldVal) {
        if (newVal) {
          var timer = setTimeout(() => {
            this.$emit('update:open', false)
            clearTimeout(timer)
          }, 3 * 1000)
        }
      }
    }
  }
</script>
<style lang='sass' src='../static/sass/snackbar.sass' ></style>


```

## 增加后台操作的数据接口

### path store/actions.js

```js
import axios from 'axios'
async saveProduct({ state, dispatch }, product) {
  await axios.post('/api/products', product)
// 获取商品列表
  let res = await dispatch('fetchProducts')
  return res.data.data
},
// update
async putProduct({ state, dispatch }, product) {
  await axios.put('/api/products', product)
// 获取商品列表
  let res = await dispatch('fetchProducts')
  return res.data.data
},

```

修改 routers/product.js
```js
@controller('/api')
```
store/service.js

```js
  fetchProducts() {
    console.log(`${baseUrl}/api/products`)
    return axios.get(`${baseUrl}/api/products`)
  }
  fetchProduct(id) {
    console.log(`${baseUrl}/api/product/${id}`)
    return axios.get(`${baseUrl}/api/product/${id}`)
  }
```

## 增加中间件,存储宝贝的是put 请求的body需要解析


### path server/index.js
```js

const MIDDLEWARES = ['database', 'common', 'router']
```

### path server/middlewares/common.js

```js
import koaBody from 'koa-bodyparser'
// 解析body的中间件
export const addBody = app => {
  app.use(koaBody())
}


```


yarn add koa-bodyparser


### 需要在api中将与数据交互的方法暴露出去
```js

import * as wechat from './wechat'
import * as wiki from './wiki'
import * as product from './product'

export default {
  wechat: wechat,
  wiki: wiki,
  product: product
}
```
