// import cheerio from 'cheerio'
import rp from 'request-promise'
import _ from 'lodash'
import fs from 'fs'
// import Agent from 'socks5-http-client/lib/Agent'
let characters = []

const sleep = time => new Promise(resolve => setTimeout(resolve, time))
export const getAPICharacters = async(page = 1) => {
  const options = {
    uri: `http://www.anapioficeandfire.com/api/characters?page=${page}&pageSize=50`,
    // 使用cheerio进行解析
    // 网速过慢可以开启代理
    // agentClass: Agent,
    // agentOptions: {
    //   socksHost: 'localhost',
    //   socksPort: 3118
    // }
  }
  // const url = `http://www.anapioficeandfire.com/api/characters?page=${page}&pageSize=50`
    // 返回的是json数据不需要对页面进行dom分析
  console.log('正在爬第 ' + page + ' 页数据')
  let body = await rp(options)
  body = JSON.parse(body)
  console.log('爬到  ' + body.length + ' 条数据')
  // 拼接数组的数据
  characters = _.union(characters, body)
  console.log('现有  ' + characters.length + ' 条数据')
  // 如果数据小于50则停止
  if (body.length < 50) {
    console.log('爬完了')
    return
  } else {
    // 将数据写到本地,设置为追加模式
    fs.writeFileSync('./characters.json', JSON.stringify(characters, null, 2), 'utf8')
    // 间歇时间
    await sleep(200)
    page++
    getAPICharacters(page).catch(err => console.log(err))
  }
}

getAPICharacters().catch(err => console.log(err))
