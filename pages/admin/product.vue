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
            button.btn(@click='deleteProduct(item)') delete
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
          label 图片
          .upload-images
            .img(v-for='item, index in edited.images')
              img(:src='imageCDN + item + "?imageView2/1/w/280/h/400/q/75|imageslim"')
              .tools
                .material-icon(@click='deleteImg(index)') delete
            .upload-btn
              //- svg code instead of icon
              g#Page-1(stroke='none', stroke-width='1', fill='none', fill-rule='evenodd')
                g#ic_backup_black_24px(transform='translate(-1.000000, -6.000000)')
                  polygon#Shape(points='0 0 55 0 55 55 0 55')
                  path#outline(d='M42.6907609,20.7503727 C41.2853571,13.6200155 35.0230435,8.26708075 27.5,8.26708075 C21.5270342,8.26708075 16.339441,11.6565839 13.7559783,16.6168323 C7.535,17.2781988 2.69875776,22.5484627 2.69875776,28.9347826 C2.69875776,35.7757919 8.25836957,41.3354037 15.0993789,41.3354037 L41.9673913,41.3354037 C47.671677,41.3354037 52.3012422,36.7058385 52.3012422,31.0015528 C52.3012422,25.5452795 48.0643634,21.1223913 42.6907609,20.7503727 Z', stroke='#78909C', stroke-width='3', :stroke-dasharray='upload.dasharray', :stroke-dashoffset='upload.dashoffset')
                  path#Shape(d='M42.6907609,20.7503727 C41.2853571,13.6200155 35.0230435,8.26708075 27.5,8.26708075 C21.5270342,8.26708075 16.339441,11.6565839 13.7559783,16.6168323 C7.535,17.2781988 2.69875776,22.5484627 2.69875776,28.9347826 C2.69875776,35.7757919 8.25836957,41.3354037 15.0993789,41.3354037 L41.9673913,41.3354037 C47.671677,41.3354037 52.3012422,36.7058385 52.3012422,31.0015528 C52.3012422,25.5452795 48.0643634,21.1223913 42.6907609,20.7503727 Z M31.6335404,26.8680124 L31.6335404,35.1350932 L23.3664596,35.1350932 L23.3664596,26.8680124 L17.1661491,26.8680124 L27.5,16.5341615 L37.8338509,26.8680124 L31.6335404,26.8680124 Z', fill='#CFD8DC', fill-rule='nonzero')
              br
              .text 上传图片
              input(type='file', @change='uploadImg($event)')
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
import axios from 'axios'
import vSnackbar from '~/components/snackbar'
import randomToken from 'random-token'

import Uploader from 'qiniu-web-uploader'
// import * as uploadFile from '../../server/libs/upload'
// const qiniu = require('qiniu')

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
      upload: {
        dasharray: 0,
        dashoffset: 0
      },
      process: 0,
      editing: false
    }
  },
  async created() {
    this.$store.dispatch('fetchProducts')
  },
  computed: mapState(['imageCDN', 'products']),
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

    async deleteProduct(item) {
      await this.$store.dispatch('deleteProduct', item)
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
    },
    // 获取token
    async getUptoken(key) {
      let res = await axios.get('/qiniu/token', {
        params: {
          key: key
        }
      })
      return res.data.data.token
    },
    // async uploadFile(file, token, key) {
    //   let res = await axios.post('/qiniu/upload', {
    //     params: {
    //       file: file,
    //       token: token,
    //       key: key
    //     }
    //   })
    //   return res.data.data.token
    // },
    // 上传图片 e是事件
    async uploadImg(e) {
      // this.upload.dashoffset = this.upload.dasharray
      let file = e.target.files[0]
      let key = randomToken(32)
      // 通过这个key 传递给七牛,返回一个凭证
      key = `products/${key}${file.name.substr(file.name.lastIndexOf('.'))}`
      console.log('product.vue key ' + key)
      console.log('product.vue file ' + file.name)
      let token = await this.getUptoken(key)
      console.log('token ' + token)
      let uptoken = {
        uptoken: token,
        key: Buffer.from(key).toString('base64')
      }
      // 华东z0
      // Uploader.QINIU_UPLOAD_URL = '//up-z0.qiniu.com'
      // const url = '//up-z0.qiniu.com'
      let uploader = new Uploader(file, uptoken)
      // listener upload process
      uploader.on('progress', () => {
        console.log(uploader.percent)
        // let dashoffset = this.upload.dasharray * (1 - uploader.percent)
        // this.upload.dashoffset = dashoffset
      })
      let res = await uploader.upload()
      // await this.uploader(file, token, key)
      uploader.cancel()
      console.log(res)
      this.edited.images.push(res.key)
      // let self = this
      // var data = new FormData()
      // data.append('token', token)
      // data.append('file', file)
      // const axiosInstance = axios.create({})
      // axiosInstance({
      //   method: 'POST',
      //   url: 'http://up.qiniu.com',
      //   data: data,
      //   onUploadProgress: function (progressEvent) {
      //     var percentCompleted = Math.round(
      //       progressEvent.loaded * 100 / progressEvent.total
      //     )
      //     // console.log(percentCompleted)
      //     // 对应上传进度条
      //     self.progress = percentCompleted
        // }
      // })
      //   .then(function (res) {
      //     // console.log('res',res)
      //     // let { base_url, path } = res.data
      //     console.log(' res.data ' + JSON.stringify(res.data))
      //     // // 页面所用字段
      //     // self.previewAvatar = `${base_url}${path}?imageView2/1/w/154/h/154`
      //     // //传给后台不完整
      //     // self.formData.avatar = `${path}`
      //   })
      //   .catch(function (err) {
      //     console.log('err', err)
      //   })
    // },
    // uploader(localFile, uploadToken, key) {
    // let config = new qiniu.conf.Config()
    // config.useHttpsDomain = true
    // 华东地区的空间qiniu.zone.Zone_z0
    // config.zone = qiniu.zone.Zone_z0
    // const bucketManager = new qiniu.rs.BucketManager(mac, config)
    // let resumeUploader = new qiniu.resume_up.ResumeUploader(config)
    // let putExtra = new qiniu.resume_up.PutExtra()
    // 扩展参数
    // this.putExtra.params = {
    //   'x:name': '',
    //   'x:age': 27,
    // }
    // this.putExtra.fname = 'testfile.mp4'
    // 如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
    // putExtra.resumeRecordFile = 'progress.log'
    // let key = null
    // 文件分片上传
    // resumeUploader.putFile(uploadToken, key, localFile, putExtra, function(
    //   respErr,
    //   respBody,
    //   respInfo
    // ) {
    //   if (respErr) {
    //     throw respErr
    //   }
    //   if (respInfo.statusCode === 200) {
    //     console.log(respBody)
    //   } else {
    //     console.log(respInfo.statusCode)
    //     console.log(respBody)
    //   }
    // })
    },

    deleteImg(index) {
      this.edited.images.splice(index, 1)
    }
  },
  components: {
    vSnackbar
  }
}
</script>

<style lang="sass" scoped src='static/sass/admin.sass'></style>
