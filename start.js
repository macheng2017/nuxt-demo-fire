require('babel-core/register')({
  'presets': [
    'stage-3',
    'latest-node',
    ['env', {
      'targets': {
        'node': 'current'
      }
    }]
  ]
})
// 通过babel的编译才能放心使用es6 的语法
require('babel-polyfill')
require('./server')
