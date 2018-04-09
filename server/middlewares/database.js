import fs from 'fs'
import { resolve } from 'path'
import mongoose from 'mongoose'
import config from '../config'

export const database = app => {
  mongoose.set('debug', true)
  mongoose.connect(config.db)
}
mongoose.connection.on('disconnected', () => {
  mongoose.connect(config.db)
})
mongoose.connection.on('error', err => {
  console.error(err)
})
mongoose.connection.on('open', async => {
  console.log('Connected to MongoDB', config.db)
})

const models = resolve('__dirname', '../database/schema')
fs.readdirSync(models)
  .filter(file => ~file.search('/^[^\.].*js$'))
  .forEach(file => require(resolve(models, file)))
