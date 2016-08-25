var tape = require('tape')
var createGraph = require('../lib/graph')

tape('graph constructor', function (t) {
  var g = createGraph(4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]])

  t.same(g.inV[0], [])
  t.same(g.inV[1], [0])
  t.same(g.inV[2], [1])
  t.same(g.inV[3], [2])

  t.same(g.outV[0], [1])
  t.same(g.outV[1], [2])
  t.same(g.outV[2], [3])
  t.same(g.outV[3], [])

  t.end()
})
