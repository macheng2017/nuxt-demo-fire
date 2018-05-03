import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'
import _ from 'lodash'
// import { fetchImage } from '../libs/qiniu'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
// 这个函数需要先弄懂_.reduce是什么意思
// 然后  R.concat()
const normalizedContent = content => _.reduce(content, (acc, item) => {
  // 进行迭代,判断每条数据有没有这个text 如果有的话
  if (item.text) {
    // 将内容push进去
    acc.push(item.text)
  }
  if (item.elements && item.elements.length) {
    // 如果里面还有数组的对象嵌套,还要将其数据拿出来
    let _acc = normalizedContent(item.elements)
    acc = R.concat(acc, _acc)
  }
  return acc
}, [])

const normalizedSections = R.compose(
  R.nth(1),
  R.splitAt(1),
  R.map( i => ({
    level: i.level,
    title: i.title,
    content: normalizedContent(i.content)
  }))
)
const getWikiId = async data => {
  const query = data.name || data.cname
  const url = `http://zh.asoiaf.wikia.com/api/v1/Search/List?query=${encodeURI(query)}`
  // request maybe break
  let res
  try {
    res = await rp(url)
  } catch (e) {
    console.log(e)
  }

  res = JSON.parse(res)
  res = res.items[0]
  console.log(res.id)

  return R.merge(data, res)
}
const getWikiDetail = async data => {
  const { id } = data
  const url = `http://zh.asoiaf.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`
  // request maybe break
  let res
  try {
    res = await rp(url)
  } catch (e) {
    console.log(e)
  }

  res = JSON.parse(res)
  // 接下来将数据结构打平,清洗一些不需要的数据,重新生成一个json

  const getCNameAndIntro = R.compose(
    // 5.重新构建json对象,拿到之后将参数传入进去,参数是一个数组,整个数组作为参数传给一个function,里面是一个对象,
    // 对象返回两个字段 cname
    i => ({
      cname: i.title,
      intro: R.map(R.prop(['text']))(i.content)
    }),

    // 4. 挑选出title,content字段
    R.pick(['title', 'content']),
    // 3. 把过滤后的数据第一条拿出来
    R.nth(0),
    // 2. 筛选出level 值为1的数据
    R.filter(R.propEq('level', 1)),
    // 1. 将原始对象中的,sections属性取出
    R.prop('sections')
  )

  const getLevel = R.compose(
    R.project(['title', 'content', 'level']),
    R.reject(R.propEq('title', '扩展阅读')),
    R.reject(R.propEq('title', '引用与注释')),
    R.filter(i => i.content.length),
    R.prop('sections')
  )

  const cnameIntro = getCNameAndIntro(res)
  let sections = getLevel(res)
  // 初始的body
  let body = R.merge(data, getCNameAndIntro(res))
  // 重新设置sections 对数据进行深层的遍历
  sections = normalizedSections(sections)

  body.sections = sections
  body.wikiId = id
// 返回打平的数据
  return R.pick(['name', 'cname', 'playedBy', 'profile', 'images', 'nmId', 'chId', 'sections', 'intro', 'wikiId', 'words'], body)
}

export const getWikiCharacters = async () => {
  // 引入做过清理的imdb的数据

  let data = require(resolve(__dirname, '../../fullCharacters.json'))
// 测试不要一次测试所有数据,预防ip被封
  // data = [data[0], data[1]]

  console.log(data.length)

  data = R.map(getWikiId, data)
  // 通过R.map构建了很多个异步的请求,等所有的请求都执行完毕之后就拿到了所有人的id
  // Promise.all 的执行方式是传入一个函数数组,里面的值最终都返回promise对象,
  // 在传入的promise中按照执行最慢的回调函数返回统一结果,返回结果是一个数组
  console.log('获取wiki id' + data[0])

  data = await Promise.all(data)

  data = R.map(getWikiDetail, data)
  console.log('获取wiki 详细资料' + data[0])
  data = await Promise.all(data)
  // 最后将文件写入本地
  fs.writeFileSync('./finalCharacters.js', JSON.stringify(data, null, 2), 'utf8')
}

getWikiCharacters()
// p57bh6q88.bkt.clouddn.com 测试域名
// minipro.spzwl.com
