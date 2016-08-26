var tape = require('tape')
var createGraph = require('../lib/graph')
var Hub = require('../lib/hub')

tape('hub simple tests', function (t) {
  var g = createGraph(5, [
    [0, 1, 1],
    [1, 2, 2],
    [2, 3, 1],
    [4, 0, 5],
    [1, 4, 1]
  ])

  t.end()
})
