const mongoose = require('mongoose')
// 替换为全局的promise
mongoose.Promise = Promise
// 开启debug 这样可以看到操作日志
mongoose.set('debug', true)
// 老版写法 新版的createConnection
mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
})
// open事件绑定,在连接的时候给个提示
mongoose.connection.on('open', () => {
  console.log('mongodb opend!')
})

const UserSchema = new mongoose.Schema({
  name: String,
  times:{
    type: Number,
    default: 0
  }
})

mongoose.model('User', UserSchema)

// 测试
const User = mongoose.model('User')
;(async ()=> {
  console.log( await User.find({}).exec())
})()
