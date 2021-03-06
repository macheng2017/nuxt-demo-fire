import Router from 'koa-router'
import { resolve } from 'path'
import glob from 'glob'
import _ from 'lodash'
import R from 'ramda'
export let routersMap = new Map()

export const symbolPrefix = Symbol('prefix')
// 如果是数组,否则包装成数组
export const isArray = v => _.isArray(v) ? v : [v]

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
      const controllers = isArray(controller)
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

// 封装isArray, 使之成为一个数组
// export const isAarry = c => _.isArray(c) ? c : [c]
const decorate = (args, middleware) => {
  let [target, key, descriptor] = args
  target[key] = isArray(target[key])
  // 把middleware给踢出去
  target[key].unshift(middleware)
  return descriptor
}
// 将所有参数传递给另外一个方法
export const convert = middleware => (...args) => decorate(args, middleware)

export const required = rules => convert(async (ctx, next) => {
  let errors = []
  const passRules = R.forEachObjIndexed(
    (value, key) => {
      errors = R.filter(i => !R.has(i, ctx.request[key]))(value)
    }
  )
  passRules(rules)
  if (errors.length) ctx.throw(412, `${errors.join(', ')} 参数缺失`)
  await next()
})
