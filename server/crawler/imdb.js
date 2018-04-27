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

  R.filter(photo => photo.playedBy && )
)
}

getIMDBCharacters()
