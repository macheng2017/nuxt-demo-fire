const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed

const WikiHouseSchema = new Schema({
  name: String,
  cname: String,
  works: String,
  intro: String,
  cover: String,
  wikiId: Number,
  sections: Mixed, // 混合类型
  swornMembers: [ // 主要成员, 与爬取的数据保持一致
    {
      characters: {
        type: String,
        ref: 'WikiCharacter' // 指向到另外一张schema
      },
      text: String
    }
  ],
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

WikiHouseSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})
const WikiHouse = mongoose.model('WikiHouse', WikiHouseSchema)
