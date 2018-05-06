import Router from '../decorator/router'
import {resolve} from 'path'
const r = path => resolve(__dirname, path)

export const router = app => {
  const apiPath = r('../routers')
  const router = new Router(app, apiPath)
  router.init()
}
