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
            td{{item.title}}
            td{{item.price}}
            td(v-html='item.intro')
            td(v-for='parameter in item.parameters') {{parameter.key}} {{parameter.value}}
            td
              button.btn(@click='editProduct(item)') edit
                .material-icon edit
              //- 表单区 一个表单既是提交也是编辑区,通过一个状态判断
  .edit-product(:class='{active: editing}')
    .edit-header
      .material-icon edit
      div(style='flex: 1')
        .material-icon(@click='editing != editing') close
    .edit-body
      .form.edit-form
        .input-group
          lable 标题
          input(v-model='etited.title')
        .input-group
          lable 价格
          input(v-model='etited.price', type='number')
        .input-group
          lable 简介
          textarea(v-model='etited.intro', @keyup='editedIntro')
        .input-group
          lable 参数
          .parameters
            .inputs(v-for='item, item in edited.parameters')
              input(v-model='item.key', placeholder='名称')
              input(v-model='item.value', placeholder='值')
              .remove(@click='removeParameter(index)')
                .material-icon remove
    .edit-footer
        button.btn.save(@click='saveEdited', v-if='!isProducct') 创建宝贝
        button.btn.save(@click='saveEdited', v-if='isProducct') 保存修改
        .btn.add-parameter(@click='addParameter')
          .material-icon remove
        .btn.add-parameter(@click='addParameter')
          .material-icon add
          添加参数
    .float-btn(@click='createProduct')
        .material-icon add
    v-sanackbar(:open.sybc='openSnackbar')
      span(slot='body') 保存成功

</template>


<script>
  import { mapState } from 'vuex'
  import axios from 'axios'
  import vSnackbar from '~components/snackbar'

  export default {
    layout: 'admin', // 不在使用default模板
    head() {
      return {
        title: '宝贝列表'
      }
    },
    data () {
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
        
      }
    }
  }


</script>

<style lang="sass" scoped>

</style>
