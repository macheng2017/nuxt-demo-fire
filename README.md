# fire

> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install*[see note below]

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

*Note: Due to a bug in yarn's engine version detection code if you are
using a prerelease version of Node (i.e. v7.6.0-rc.1) you will need to either:
  1. Use `npm install`
  2. Run `yarn` with a standard release of Node and then switch back

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


安装 vue-cli

npm i vue-cli -g

使用nuxt脚手架

vue init nuxt/koa xxx 

[使用nuxt](https://zh.nuxtjs.org/guide/installation)


更改目录结构


模版引擎

[pug(jade)](https://pugjs.org/api/getting-started.html)

[mongoose](https://docs.mongodb.com/manual/tutorial/getting-started/)

[Mongoose ODM v5.0.13 ](http://mongoosejs.com/)

```js
const mongoose = require('mongoose')
// 替换为全局的promise
mongoose.Promise = Promise 
// 开启debug 这样可以看到操作日志
mongoose.set('debug', true)
// 老版写法 新版的createConnection
mongoose.connect('mongodb://localhost/xxo', {
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
(async ()=> {
  console.log( await User.find({}).exec())
})()

```

进入 docker 启动数据库

进入数据库

docker exec -it mongo-test mongo

node mongoose.js

测试成功

```js
mongodb opend!
Mongoose: users.find({}, { fields: {} })
```
