import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'
import fs from 'fs'
import { resolve } from 'path'
// import Agent from 'socks5-http-client/lib/Agent'

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'http://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // },
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

    const characterDom = $(this).find('td.character a')
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

// 新增爬取头像的方法
export const getIMDbProfile = async () => {
  // 遍历数据
  const characters = require(resolve(__dirname, '../../wikiCharacters.json'))

  for (let i = 0; i < characters.length; i++) {
    // 判断这个对象如果没有profile,则添加
    if (characters[i].profile) {
      // 构建url的请求地址,也就是角色主页
      const url = `https://www.imdb.com/title/tt0944947/characters/nm0318821?ref_=ttfc_fc_cl_t11`

    }
  }
}
