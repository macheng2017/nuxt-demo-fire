import cheerio from 'cheerio'
import rp from 'request-promise'
import R from 'ramda'

export const getIMDBCharacters = async() => {
  const options = {
    uri: 'https://www.imdb.com/title/tt0944947/fullcredits?ref_=tt_cl_sm#cast',
    // 使用cheerio进行解析
    transform: body => cheerio.load(body)
  }
  const $ = await rp(options)
  // 通过选择器拿到数据
  // 遍历数据
  let photos = []
  $('table.cast_list tr.odd, tr.even').each(() => {
    // 当前dom节点上的id
    const nmIdDom = $(this).find('td.itemprop a')
    // 拿到url
    const nmId = nmIdDom.attre('href')

    const characterDom = $(this).find('td.character a')
    const name = characterDom[0].text()
    const chId = characterDom.attr('href')

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

// 通过ramda 将

const fn = R.compose(
// 3. 过滤整条数据之后,通过map遍历数据
  R.map(),
// 1. 先倒着写,通过filter拿到push到photo上的元数据,确定下数据是否完整
// 2. 只有当4个字段都有,才会将数据进行分析,通过R.compose可以倒着实现流程,最右边函数的结果就是左边函数的输入
  R.filter(photo => photo.playedBy && photo.name && photo.nmId && photo.chId)

)
}

getIMDBCharacters()
