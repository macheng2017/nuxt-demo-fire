import mongoose from 'mongoose'
const User = mongoose.model('User')
export async function login(email, password) {
  let user
  let match = false // 是否匹配
  try {
    user = await User.findOne({email: email}).exec()
    if (user) {
      match = await user.comparePassword(password, user.password)
    }
  } catch (e) {
    throw new Error(e)
  }
  return {
    match,
    user
  }
}
