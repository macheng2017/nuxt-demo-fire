import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'
import _ from 'lodash'
import { fetchImage } from '../libs/qiniu'
import randomToken from 'random-token'

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
  const query = data.cname || data.name
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
  fs.writeFileSync('./finalCharacters.json', JSON.stringify(data, null, 2), 'utf8')
}

// getWikiCharacters()
// p57bh6q88.bkt.clouddn.com 测试域名
// minipro.spzwl.com

//

export const fetchImageFromIMDb = async () => {
  let IMDbCharacters = require(resolve(__dirname, '../../finalCharacters.json'))
  // 测试 先使用一个对象测试下代码
  // IMDbCharacters = [IMDbCharacters[0]]
  // 遍历
  IMDbCharacters = R.map(
    async item => {
      try {
        let key = `${item.nmId}/${randomToken(32)}`
        // fetch avatar
        await fetchImage(item.profile, key)
        console.log(item.profile)
        console.log(key)
        console.log('upload done!')
        // replace url of qiniu server with in item.profile
        item.profile = key
        // upload stage photo on the qiniu server
        // 长度改为2 比较快的加载到图片
        // for (let i = 0; i < 2; i++) {
        for (let i = 0; i < item.images.length; i++) {
          let _key = `${item.nmId}/${randomToken(32)}`
          await fetchImage(item.images[i], _key)
          console.log(item.images[i])
          console.log(_key)
          // waiting for 100 ms
          await (100)
          // replace url of qiniu server created with in item.images
          item.images[i] = _key
        }
      } catch (e) {
        console.log(e)
      }
      return item
    }
  )(IMDbCharacters)

  IMDbCharacters = await Promise.all(IMDbCharacters)

  // write the file into the local hardDisk

  fs.writeFileSync('./complateCharacters.json', JSON.stringify(IMDbCharacters, null, 2), 'utf8')
}

// fetchImageFromIMDb()
const HOUSES = [
  {
    name: 'House Stark of Winterfell',
    cname: '史塔克家族',
    words: 'Winter is Coming'
  },
  {
    name: 'House Targaryen',
    cname: '坦格利安家族',
    words: 'Fire and Blood'
  },
  {
    name: 'House Lannister of Casterly Rock',
    cname: '兰尼斯特家族',
    words: 'Hear Me Roar!'
  },
  {
    name: 'House Arryn of the Eyrie',
    cname: '艾林家族',
    words: 'As High as Honor'
  },
  {
    name: 'House Tully of the Riverrun',
    cname: '徒利家族',
    words: 'Family, Duty, Honor'
  },
  {
    name: 'House Greyjoy of Pyke',
    cname: '葛雷乔伊家族',
    words: 'We Do Not Sow'
  },
  {
    name: "House Baratheon of Storm's End",
    cname: '风息堡的拜拉席恩家族',
    words: 'Ours is the Fury'
  },
  {
    name: 'House Tyrell of Highgarden',
    cname: '提利尔家族',
    words: 'Growing Strong'
  },
  {
    name: 'House Nymeros Martell of Sunspear',
    cname: '马泰尔家族',
    words: 'Unbowed, Unbent, Unbroken'
  }
]

//

export const getHouses = async () => {
    // 获取wikiId 返回一个数组 全是promise请求
  let data = R.map(getWikiId, HOUSES)

  // 把所有异步动作全部跑一遍,并且依据最慢的一个返回一个数组
  data = await Promise.all(data)
  // 获取详细的信息
  data = R.map(getWikiDetail, data)
  data = await Promise.all(data)
  fs.writeFileSync('./wikiHouses.json', JSON.stringify(data, null, 2), 'utf8')
}

// getHouses()

export const getSwornMembers = () => {
  let houses = require(resolve(__dirname, '../../wikiHouses.json'))
  let characters = require(resolve(__dirname, '../../complateCharacters.json'))
  // 通过map可以拿到一份数据经过分析改造后的数据
  const findSwornMembers = R.map(
    R.compose(
      // 将所有的数据都拼接到一个数组中
      i => _.reduce(i, (acc, item) => {
        acc = acc.concat(item)
        return acc
      }, []),
      // 将过滤之后的数据粘合起来
      R.map(i => {
        let item = R.find(R.propEq('cname', i[0]))(characters)
        return {
          character: item.nmId,
          text: i[1]
        }
      }),
      // 7比对是否是列表中的数据,看一下人物名称是否在列表中
      R.filter(item => R.find(R.propEq('cname', item[0]))(characters)),
      R.map(i => {
        let item = i.split('，')
        let name = item.shift()
        return [name.replace(/(【|】|爵士|一世女王|三世国王|公爵|国王|王后|夫人|公主|王子)/g, ''), item.join(',')]
      }),
      // 6 第一句是废话不要
      R.nth(1),
      // 5在指定索引为1截断成两个数组
      R.splitAt(1),
      // 4取出content
      R.prop('content'),
      // 3取出数组中第一条数据
      R.nth(0),
      // 2过滤出title含有关键字的,返回一个数组
      R.filter(i => R.test(/伊耿历三世纪末的/, i.title)),
      // 1取出sections
      R.prop('sections')
    )
  )

  let swornMembers = findSwornMembers(houses)

  houses = _.map(houses, (item, index) => {
    item.swornMembers = swornMembers[index]

    return item
  })
  fs.writeFileSync('./completeHouses.json', JSON.stringify(houses, null, 2), 'utf8')
}

getSwornMembers()
