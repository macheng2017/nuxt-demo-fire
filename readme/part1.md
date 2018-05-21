安装 vue-cli

npm i vue-cli -g

使用 nuxt 脚手架

vue init nuxt/koa xxx

[使用 nuxt](https://zh.nuxtjs.org/guide/installation)

更改目录结构

模版引擎

[pug(jade)](https://pugjs.org/api/getting-started.html)

[mongoose](https://docs.mongodb.com/manual/tutorial/getting-started/)

[Mongoose ODM v5.0.13 ](http://mongoosejs.com/)

```js
const mongoose = require("mongoose");
// 替换为全局的promise
mongoose.Promise = Promise;
// 开启debug 这样可以看到操作日志
mongoose.set("debug", true);
// 老版写法 新版的createConnection
mongoose.connect("mongodb://localhost/test", {
  useMongoClient: true
});
// open事件绑定,在连接的时候给个提示
mongoose.connection.on("open", () => {
  console.log("mongodb opend!");
});

const UserSchema = new mongoose.Schema({
  name: String,
  times: {
    type: Number,
    default: 0
  }
});

mongoose.model("User", UserSchema);

// 测试
const User = mongoose.model("User");
(async () => {
  console.log(await User.find({}).exec());
})();
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

```js
// 修改数据
 const user = await User.findOne({name: 'Vue'})
  user.name = 'Vue SSR'
  await user.save()
  console.log(await User.find({}).exec())
```

### 让 times +1

```js
const UserSchema = new mongoose.Schema({
  name: String,
  times: {
    type: Number,
    default: 0
  }
});

UserSchema.pre("save", function(next) {
  this.times++;
  next();
});
```

* [使用 pre(预处理)hook(钩子) 对数据进行预处理](http://mongoosejs.com/docs/api.html#schema_Schema-pre)

添加静态方法

```js
// 在UserSchema上添加静态方法
UserSchema.statics = {
  async getUser(name) {
    const user = await this.findOne({ name: name }).exec();
    return user;
  }
};
```

* UserSchema.statics [可以直接在 Schema 上直接添加静态方法](http://mongoosejs.com/docs/api.html#schema_Schema-static)
* UserSchema.methods 可以对实例添加一些方法,查询数据库

```js
UserSchema.methods = {
  async fetchUser(name) {
    const user = await this.model("User")
      .findOne({
        name: name
      })
      .exec();
    return user;
  }
};
```

* 出现错误:最后找到的原因是--数据库没有数据;先检查数据库有没有数据
