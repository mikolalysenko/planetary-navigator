var tape = require('tape')
var sssp = require('../lib/sssp')
var createGraph = require('../lib/graph')
var createIndex = require('../lib/indexer')

tape('hub simple tests', function (t) {
  function testGraph (g, name) {
    var i
    var distMatrix = new Array(g.numVertices)
    for (i = 0; i < g.numVertices; ++i) {
      distMatrix[i] = sssp(g, i)
    }

    for (i = 0; i < 10; ++i) {
      var index = createIndex(g)
      for (var source = 0; source < g.numVertices; ++source) {
        for (var sink = 0; sink < g.numVertices; ++sink) {
          t.same(
            index.distance(source, sink),
            distMatrix[source][sink],
            name + ': distance ' + source + ',' + sink + ' ok')
        }
      }
    }
  }

  testGraph(createGraph(2, [
    [0, 1, 1],
    [1, 0, 1]
  ]), '2 verts')

  testGraph(createGraph(3, [
    [0, 1, 1],
    [1, 2, 1],
    [2, 0, 1]
  ]), '3 verts')

  testGraph(createGraph(5, []), 'empty')

  testGraph(createGraph(4, [
    [0, 1, 1],
    [1, 2, 2],
    [2, 3, 1]
  ]), 'chain')

  t.end()
})
