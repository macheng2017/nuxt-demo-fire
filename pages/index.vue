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

<script>
  import { mapState } from 'vuex'
  export default {
    asyncData({ req }) {
      return {
        name: req ? 'server' : 'client'
      }
    },
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
      }
    },
    beforeCreate() {
      console.log('------------------------')
      this.$store.dispatch('fetchHouses')
      this.$store.dispatch('fetchCharacters')
      this.$store.dispatch('fetchCities')
    },
    beforeMount() {
      console.log('*************************************')
    }
  }

</script>
<style scoped lang='sass' src='~static/sass/index.sass'></style>
