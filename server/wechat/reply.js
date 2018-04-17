const tip = '欢迎来到河间地!\n\n<a href="http://www.baidu.com">传送</a>'
export default async (ctx, next) => {
  const message = ctx.weixin

  // 测试微信粉丝,用户获取相关接口
  let mp = require('../wechat')
  let client = mp.getWechat()
  // const data = await client.handle('uploadMaterial', 'news', news, {})
  console.log(message)

  // 关注/取消关注
  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      ctx.body = tip
    } else if (message.Event === 'unsubscribe') {
      console.log('取关!')
      // 上报地理位置信息
    } else if (message.Event === 'LOCATION') {
      ctx.body = message.Latitude + ' : ' + message.Longitude
      // 测试点击菜单式事件推送
    } else if (message.Event === 'VIEW') {
      ctx.body = message.EventKey + ' ' + message.MenuID
    } else if (message.Event === 'pic_sysphoto') {
      ctx.body = message.Count + ' ' + 'photo send'
    }
  } else if (message.MsgType === 'text') {
    if (message.Content === '1') {
      try {
        // const data = await client.handle('createTag', '特别关注')
        // const data = await client.handle('fetchTags')
        // const data = await client.handle('fetchTagUsers', 100)
        // const data = await client.handle('batchTag', ['od9fNwqEOXR-CIapYDFEsCqhygro'], 100)
        const data = await client.handle('getTagList', 'od9fNwqEOXR-CIapYDFEsCqhygro')

        console.log('data= ' + JSON.stringify(data))
      } catch (err) {
        console.log(err)
      }
      ctx.body = message.Content
      // 测试菜单各项功能
    } else if (message.Content === '2') {
      // const menuData = await client.handle('getMenu')
      const menu = require('./menu.js').default
      await client.handle('delMenu')
      const menuData = await client.handle('createMenu', menu)
      console.log('data= ' + JSON.stringify(menuData))
      ctx.body = message.Content
    }
  } else if (message.MsgType === 'image') {
    console.log('================')
    ctx.body = {
      type: 'image',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'voice') {
    ctx.body = {
      type: 'voice',
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'video') {
    ctx.body = {
      type: 'video',
      title: message.ThumbMediaId,
      mediaId: message.MediaId
    }
  } else if (message.MsgType === 'location') {
    ctx.body = message.Location_X + ' : ' + message.Location_Y
  } else if (message.MsgType === 'link') {
    // 这里是一个数组, 在util中会被添加为news
    ctx.body = [{
      title: message.Title,
      description: message.Description,
      picUrl: 'https://mmbiz.qpic.cn/mmbiz_jpg/VXnhnc9vfmrUjHfjXrRtyq4WldQCxpcEt70jlNCGicaibSJ4TycPwdZlJnibOhgbdaOueMraicsbZQMHAicQ3tNeLOQ/0',
      url: message.Url
    }]
  }
}
