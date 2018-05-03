import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'
import Agent from 'socks5-http-client/lib/Agent'

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'http://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    agentClass: Agent,
    agentOptions: {
      socksHost: 'localhost',
      socksPort: 3118
    },
    transform: body => cheerio.load(body)
  }

  // 通过选择器拿到数据
  // 遍历数据
  let photos = []
  const $ = await rp(options)
  $('table.cast_list tr.odd, tr.even').each(function () {
    // 当前dom节点上的id
    const nmIdDom = $(this).find('td.itemprop a')
    // 拿到url
    const nmId = nmIdDom.attr('href')

    const characterDom = $(this).find('td.character a[href!="#"]')
    console.log(' -----characterDom-------- ' + characterDom)
    const name = characterDom.text()
    const chId = characterDom.attr('href')
    // console.log(' chId ' + chId)

    const playedByDom = $(this).find('td.itemprop span.itemprop')
    const playedBy = playedByDom.text()
    // 得到原始数据
    photos.push({
      nmId,
      chId,
      name,
      playedBy
    })
  })
  console.log('拿到多少条数据? ' + photos.length)
// 通过ramda 将

  const fn = R.compose(
// 6. 再过滤一遍,将不符合要求的数据过滤出去
  R.filter(photo => photo.playedBy && photo.name && photo.nmId && photo.chId !== '#'),
// 3. 过滤整条数据之后,通过map遍历数据
  R.map(photo => {
// 5. 构建一个正则,将cmid拿出来
    const reg1 = /\/name\/(.*?)\/\?ref/
    const reg2 = /\/title\/tt0944947\/characters\/(.*?)\?ref/
    // console.log(' reg1 ' + reg1)
    // console.log(' reg2 ' + reg2)
    // console.log(' nmId ' + photo.nmId)
    // console.log(' chId ' + photo.chId)
    const match1 = photo.nmId.match(reg1)
    const match2 = photo.chId.match(reg2)
    // console.log(' match1 ' + match1)
    // console.log(' match2 ' + match2)

    photo.nmId = match1[1]
    if (match2) {
      photo.chId = match2[1]
    }

    // 4. 最终返回的还是photo
    return photo
  }),
// 1. 先倒着写,通过filter拿到push到photo上的元数据,确定下数据是否完整
// 2. 只有当4个字段都有,才会将数据进行分析,如果字段不全则丢掉这条数据
// 通过R.compose可以倒着实现流程,最右边函数的结果就是左边函数的输入
  R.filter(photo => photo.playedBy && photo.name && photo.nmId && photo.chId)
)
  photos = fn(photos)
  console.log('清洗后剩余多少条数据? ' + photos.length)
  // 将数据写到本地
  fs.writeFileSync('./imdb.json', JSON.stringify(photos, null, 2), 'utf8')
}

// getIMDBCharacters().catch(err => console.log(err))

const fetchIMDbProfile = async (url) => {
  // 5.structure options object
  // 6.copy options object code of the example above
  const options = {
    uri: url,
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // },
    transform: body => cheerio.load(body)
  }
  // 7.Node that the following is identical in meaning to the example above
  const $ = await rp(options)
  // 8.for example, will you get that element for <a></a> such as
  const img = $('a[class="titlecharacters-image-grid__thumbnail-link"] img')
  // 9.declare the src
  let src = img.attr('src')
  // 10.decide this src make sure that is not null && empty
  if (src) {
    //  split string up into several part  whit '_v1'
    // The shift() method removes the first element from an array and returns that removed element.
    // This method changes the length of the array
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
    src = src.split('_V1').shift()
    src += '_V1.jpg'
  }
  return src
}
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

// 1新增爬取头像的方法

export const getIMDbProfile = async () => {
  // 2 遍历数据
  const characters = require(resolve(__dirname, '../../wikiCharacters.json'))
  console.log('characters.length ' + characters.length)
  // for (let i = 0; i < 2; i++) { use length with 2 test prevent blacklist
  for (let i = 0; i < characters.length; i++) {
    // 3判断这个对象如果没有profile,则添加
    if (!characters[i].profile) {
      // 4构建url的请求地址,也就是角色主页
      const url = `https://www.imdb.com/title/tt0944947/characters/${characters[i].chId}`
      console.log('crawling... ' + characters[i].name)
      // 5 request the url and fetch data
      const src = await fetchIMDbProfile(url)
      console.log('crawled ' + src)
      // 11 save the avatar of fetch the data
      characters[i].profile = src

      fs.writeFileSync('./imdbCharacters.json', JSON.stringify(characters, null, 2), 'utf8')
      await sleep(100)
    }
  }
}

// check the profile avatar
const checkIMDbProfile = () => {
  // NOTE: use imdb.json instead of wikitCharacters.json that is empty
  const characters = require(resolve(__dirname, '../../imdbCharacters.json'))
  const newCharacters = []
  characters.forEach((item) => {
    // if (!item.profile) {
    //   console.log(item.name)
    // }
    if (item.profile) {
      newCharacters.push(item)
    }
    // push characters with profile filed in new file
  })
  fs.writeFileSync('./validCharacters.json', JSON.stringify(newCharacters, null, 2), 'utf8')
}
// getIMDbProfile()
// checkIMDbProfile()

const fetchIMDbImages = async (url) => {
  // 5.structure options object
  // 6.copy options object code of the example above
  const options = {
    uri: url,
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // },
    transform: body => cheerio.load(body)
  }
  // 7.Node that the following is identical in meaning to the example above
  const $ = await rp(options)
  let images = []
  // 8.for example, will you get that element for <a></a> such as
  $('a[class="titlecharacters-image-grid__thumbnail-link"] img').each(function () {
    // 9.declare the src
    let src = $(this).attr('src')
    // 10.decide this src make sure that is not null && empty
    if (src) {
      //  split string up into several part  whit '_v1'
      // The shift() method removes the first element from an array and returns that removed element.
      // This method changes the length of the array
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
      src = src.split('_V1').shift()
      src += '_V1.jpg'
      images.push(src)
    }
  })
  return images
}

export const getIMDbImages = async () => {
  // 2 遍历数据
  const characters = require(resolve(__dirname, '../../validCharacters.json'))
  console.log('characters.length ' + characters.length)
  // use length with 2 test prevent blacklist
  // for (let i = 0; i < 2; i++) {
  for (let i = 0; i < characters.length; i++) {
    // 3判断这个对象如果没有profile,则添加
    if (!characters[i].images) {
      // 4构建url的请求地址,也就是角色主页
      const url = `https://www.imdb.com/title/tt0944947/characters/${characters[i].chId}`
      console.log('crawling... ' + characters[i].name)
      // 5 request the url and fetch data
      const images = await fetchIMDbImages(url)
      console.log('crawled ' + images.length)
      // 11 save the avatar of fetch the data
      characters[i].images = images

      fs.writeFileSync('./fullCharacters.json', JSON.stringify(characters, null, 2), 'utf8')
      await sleep(10)
    }
  }
}
getIMDbImages()
