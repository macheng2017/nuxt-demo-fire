import { controller, get, post, put, del } from '../decorator/router'
import api from '../api'
import xss from 'xss'
import R from 'ramda'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

@controller('/api')
export class ProductCotroller {
  // fetch detail of products
  @get('/products')
  async getHouses(ctx, next) {
    let { limit = 50 } = ctx.query
    const data = await api.product.getProducts(limit)
    ctx.body = {
      data: data,
      success: true
    }
  }
  // fetch the signal detail of product
  @get('/products/:_id')
  async getProduct(ctx, next) {
    const { params } = ctx
    const { _id } = params
    if (!_id) {
      return (ctx.body = {success: false, err: 'id is required'})
    }
    const data = await api.product.getProduct(_id)
    ctx.body = {
      data: data,
      success: true
    }
  }
  // upload products
  @post('/products')
  async postProducts(ctx, next) {
    let product = ctx.request.body
    product = {
      // filter key words of malicious
      title: xss(product.title),
      price: xss(product.price),
      intro: xss(product.intro),
      images: R.map(xss)(product.images),
      // 对每个字段进行过滤
      parameters: R.map(i => ({
        key: xss(i.key),
        value: xss(i.vlaue)
      }))(product.parameters)
    }
    try {
      product = await api.product.save(product)
      ctx.body = {
        success: true,
        data: product
      }
    } catch (err) {
      ctx.body = {
        success: false,
        err: err
      }
    }
  }
  // update product
  @put('/products')
  async putProducts(ctx, next) {
    let body = ctx.request.body
    const { _id } = body
    if (!_id) {
      return (ctx.body = {success: false, err: 'id is required'})
    }
    let product = await api.product.getProduct(_id)
    if (!product) {
      return (ctx.body = {
        success: false,
        err: 'product not exist'
      })
    }
    product.title = xss(body.title)
    product.price = xss(body.price)
    product.intro = xss(body.intro)
    product.images = R.map(xss)(body.images)
    product.parameters = R.map(
      i => ({
        key: xss(i.key),
        vlaue: xss(i.value)
      })
    )(body.parameters)
    try {
      product = await api.product.update(product)
      ctx.body = {
        success: true,
        data: product
      }
    } catch (err) {
      ctx.body = {
        success: false,
        err: err
      }
    }
  }
  // del product
  @del('/products')
  async delProducts(ctx, next) {
    let body = ctx.request.body
    const { _id } = body
    if (!_id) {
      return (ctx.body = {success: false, err: 'id is required'})
    }
    let product
    try {
      product = await api.product.del(_id)
      ctx.body = {
        success: true
      }
    } catch (err) {
      ctx.body = {
        success: false,
        err: err
      }
    }
  }
}
