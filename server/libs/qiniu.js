import qiniu from 'qiniu'
import config from '../config'
import { exec } from 'shelljs'

// qiniu.config.ACCESS_KEY = config.qiniu.AK
// qiniu.config.SECRET_KEY = config.qiniu.SK
// 存储空间名称
const bucket = ' miniprogram'
// https://developer.qiniu.com/kodo/sdk/1289/nodejs#5
// 资源管理相关的操作首先要构建BucketManager对象：
// var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
// var config = new qiniu.conf.Config()
// // config.useHttpsDomain = true
// // 华东地区的空间qiniu.zone.Zone_z0
// config.zone = qiniu.zone.Zone_z0
// var bucketManager = new qiniu.rs.BucketManager(mac, config)

export const fetchImage = async(url, key) => {
  // const client = new qiniu.rs.Client()
  // promise 封装下
  return new Promise((resolve, reject) => {
    // client.fetch(url, bucket, key, (err, ret) => {
    //   if (err) reject(err)
    //   else resolve(ret)
    // })
  // 使用七牛的shell 脚本
    const bash = `qshell fetch ${url} ${bucket} '${key}'`
    // execute shell
    const child = exec(bash, {async: true})

    child.stdout.on('data', data => {
      console.log(data)
      resolve(data)
    })
  })
}
// 需要把shell安装到全局
// npm i qshell -g
