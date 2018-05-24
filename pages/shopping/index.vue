<template lang="pug">
.container
  .shopping
    .title 权游周边
    .list
      .items(v-for='(item, index) in products' :key = 'index' @click='showProduct(item)')
        img(:src= 'imageCDN +item.images[0]')
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
        'imageCDN',
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
