import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

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
}
