const mongoose = require('mongoose')
// 替换为全局的promise
mongoose.Promise = Promise
// 开启debug 这样可以看到操作日志
mongoose.set('debug', true)
// 老版写法 新版的createConnection
mongoose.connect('mongodb://localhost/test')
// open事件绑定,在连接的时候给个提示
mongoose.connection.once('open', () => {
  console.log('mongodb opend!')
})

const UserSchema = new mongoose.Schema({
  name: String,
  times:{
    type: Number,
    default: 0
  }
})
// 保存的时候让times自动加1
UserSchema.pre('save', function(next) {
  this.times ++
  next()
})
// 在UserSchema上添加静态方法
UserSchema.statics = {
  async getUser(name) {
    const user = await this.findOne({name: name}).exec()
    return user
  }
}


mongoose.model('User', UserSchema)

// 测试
const User = mongoose.model('User')
;(async () => {
  console.log(await User.getUser('Vue SSR1'))
  // const user = new User({
  //   name: 'Vue'
  // })
  // await user.save()
  // const user = await User.getUser('Vue SSR')
  // user.name = 'Vue SSR1'
  // await user.save()
  // console.log(await User.getUser('Vue'))
})()
