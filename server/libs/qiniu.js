import qiniu from 'qiniu'
import config from '../config'

qiniu.config.ACCESS_KEY = config.qiniu.AK
qiniu.config.SECRET_KEY = config.qiniu.SK

const bucket = 'gotice'

export const fetchImage = async(url, key) => {
  const  client = new qiniu.rs.Client()
  // promise 封装下
  return new Promise((resolve, reject) => {
    client.fetch(url, bucket, key, (err, ret) => {
      if (err) reject(err)
      else resolve(ret)
    })
  })
}
