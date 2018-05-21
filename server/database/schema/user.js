const mongoose = require('mongoose')
// 对用户密码进行加密
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10
// 尝试错误次数
const MAX_LOGIN_ATTEMPTS = 5
// lock time
const LOCK_TIME = 2 * 60 * 60 * 1000
const Schema = mongoose.Schema

const UserSchema = new Schema({
  // user admin superAdmin
  role: {
    type: String,
    default: 'user'
  },
  openid: [String],
  unionid: String,
  nickname: String,
  address: String,
  province: String,
  country: String,
  sex: String,
  email: String,
  headimgurl: String,
  avatarUrl: String,
  password: String,
  hashed_password: String,
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})
// add虚拟字段,并不会真正的存到数据库中,通过virtual拿到一个虚拟的字段
// 通过两次取反
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

UserSchema.pre('save', function (next) {
  let user = this
  // 密码如果没有更改直接返回
  if (!user.isModified('password')) return next()
  // 更改则加密,可以加盐,增加密码的强度
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(error)
      user.password = hash
      next()
    })
  })
})

// comparing the password
//  _password user pass
// password  salt password
UserSchema.methods = {
  comparePassword: function (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch)
        else reject(err)
      })
    })
  },
  // input password is error and increment
  incLoginAttempts: function (user) {
    const that = this
    return new Promise((resolve, reject) => {
      if (that.lockUntil && that.lockUntil < Date.now()) {
        that.update({
            $set: {
              loginAttempts: 1
            },
            $unset: {
              lockUntil: 1
            }
          },
          function (err) {
            if (!err) resolve(true)
            else reject(err)
          })
      } else {
        let updates = {
          $inc: {
            loginAttempts: 1
          }
        }
        if (that.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !that.isLocked) {
          updates.$set = {
            lockUntil: Date.now() + LOCK_TIME
          }
        }
        that.update(updates, err => {
          if (!err) resolve(true)
          else reject(err)
        })
      }
    })
  }
}

mongoose.model('User', UserSchema)
