<template lang="pug">
.container
  .house-media
    img( v-if='house.cname' :src='imageCDN + house.cname + ".jpg"')
    .desc
      .words {{house.words}}
      .name {{house.name}}
  .house-body
    .title {{house.cname}}
    .body {{house.intro}}
    .title 主要角色
    .body(v-for='(item, index) in house.swornMembers' :key='index')
      .members(v-if='item.character')
        img(:src='imageCDN + item.character.profile + "?imageView2/1/w/280/h/400/q/75|imageslim"')
        .desc
          .cname {{item.character.cname}}
          .intro {{item.text}}

    .house-history(v-for='item in house.sections')
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
        house: 'currentHouse',
        imageCDN: 'imageCDN'
      })
    },
    beforeCreate() {
      let id = this.$route.query.id

      this.$store.dispatch('showHouse', id)
    }
  }
</script>
<style lang='sass' scoped src='static/sass/house.sass' ></style>
