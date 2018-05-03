require('babel-core/register')({
  'presets': [
    'stage-3',
    ['latest-node',
     { 'target': 'current' }
    ]
  ]
})
// 通过babel的编译才能放心使用es6 的语法
require('babel-polyfill')
// require('./server/crawler/imdb')
// require('./server/crawler/api')
// require('./server/crawler/check')
require('./server/crawler/wiki')
