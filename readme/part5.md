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
    const res = await Services.fetchCharacters()
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
