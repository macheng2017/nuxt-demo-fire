import mongoose from 'mongoose'
// 通过@ decorator 然后传入一个路径,
// 这个路径可以看做一个命名空间,请求地址匹配到这个路径,都应该在这个页面中进行控制的
// 比如可以用@controller('/wechat')

const Product = mongoose.model('Product')

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
