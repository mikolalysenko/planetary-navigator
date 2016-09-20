var tape = require('tape')
var createGraph = require('../lib/graph')
var sssp = require('../lib/sssp')

tape('single source shortest path', function (t) {
  var g = createGraph(2, [
    [0, 1, 1],
    [1, 0, 2]
  ])
  t.same(sssp(g, 0), [0, 1])
  t.same(sssp(g, 1), [2, 0])

  var g2 = createGraph(3, [
    [0, 1, 1],
    [1, 2, 1],
    [2, 0, 1]
  ])
  t.same(sssp(g2, 0), [0, 1, 2])
  t.same(sssp(g2, 1), [2, 0, 1])
  t.same(sssp(g2, 2), [1, 2, 0])

  t.end()
})
