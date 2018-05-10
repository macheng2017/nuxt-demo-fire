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
