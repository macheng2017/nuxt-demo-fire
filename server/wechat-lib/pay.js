import wechatPay from 'wechat-pay'
import fs from 'fs'
import config from '../config'
import path from 'path'

const cert = path.resolve(__dirname, '../', 'config/cert/apiclient_cert.p2')

const paymentConfig = {
  appId: config.shop.appId, // 商户id
  partnerKey: config.shop.partnerKey,
  mchId: config.shop.mchId,
  notifyUrl: config.shop.notifyUrl,
  ptx: fs.readdirSync(cert) // 证书

}
const Payment = wechatPay.Payment
const payment = new Payment(paymentConfig || {})

export const getParamsAsync = (order) => {
  return new Promise((resolve, reject) => {
    payment.getBrandWCPayRequestParams(order, (err, payargs) => {
      if (err) {
        reject(err)
      } else {
        // 返回预支付订单信息
        resolve(payargs)
      }
    })
  })
}

// 获取订单数据方法

export const getPayDataAsync = (req) => {
  return new Promise((resolve, reject) => {
    let data = ''
    req.setEncoding('utf8')
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      req.rawBody = data
      resolve(data)
    })
  })
}

// 接收微信推送通知到订单
export const getNoticeAsync = (rawBody) => {
  return new Promise((resolve, reject) => {
    payment.validate(rawBody, (err, message) => {
      if (err) {
        reject(err)
      } else {
        resolve(message)
      }
    })
  })
}

export const getBillAsync = (date) => {
  return new Promise((resolve, reject) => {
    payment.downloadBill({
      bill_date: date,
      bill_type: 'ALL'
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
// 获取订单这些方法不一定能用的上,只是给一个思路
export const getOrderAsync = (params) => {
  return new Promise((resolve, reject) => {
    payment.orderQuery(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
// 增加两个工具方法
export const buildFailXML = (err) => {
  return payment.buildXML({
    return_code: 'FAIL',
    return_msg: err.name
  })
}
export const buildSuccessXML = (err) => {
  if (err) {
    return buildFailXML(err)
  }
  return payment.buildXML({
    return_code: 'SUCCESS'
  })
}
