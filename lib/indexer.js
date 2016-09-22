var HubIndex = require('./hub')
var PriorityQueue = require('./pq')
var createCrawler = require('./crawler')

var NUM_COUNTERS = 16

function fillArrays (n) {
  var result = new Array(n)
  for (var i = 0; i < n; ++i) {
    result[i] = []
  }
  return result
}

function insertHub (verts, weights, v, w) {
  for (var i = 0; i < verts.length; ++i) {
    if (v < verts[i]) {
      verts.splice(i, 0, v)
      weights.splice(i, 0, w)
      return
    }
  }
  verts.push(v)
  weights.push(w)
}

module.exports = function createIndex (graph) {
  var numVerts = graph.numVertices

  var inV = fillArrays(numVerts)
  var inW = fillArrays(numVerts)
  var outV = fillArrays(numVerts)
  var outW = fillArrays(numVerts)

  var hub = new HubIndex(graph, inV, inW, outV, outW)

  var crawler = createCrawler(graph)

  // Tree sketch data structures
  var counters = new Array(NUM_COUNTERS * numVerts)
  var trees = new Array(numVerts)
  var parent = new Array(numVerts)
  var distance = new Array(numVerts)
  for (var i = 0; i < counters.length; ++i) {
    counters[i] = 0
    distance[i] = Infinity
    parent[i] = null
    trees[i] = []
  }

  var toVisit = new PriorityQueue()

  function Tree (index, vertex, size, parent, children) {
    this.index = index
    this.vertex = vertex
    this.size = size
    this.parent = parent
    this.children = children
  }

  Tree.prototype = {
    cut: function () {
    },

    _finalizeTraversal: function () {
      var s = 1
      var children = this.children
      for (var i = 0; i < children.length; ++i) {
        var c = children[i]
        distance[c.vertex] = Infinity
        parent[c.vertex] = null
        s += c.calcSize()
      }
      this.size = s
      var index = this.index
      var vertex = this.vertex
      counters[NUM_COUNTERS * vertex + index] += s

      // reinsert vertex
      return s
    }
  }

  function addOutTree (index, root) {
    var rootTree = new Tree(index, -1, 0, null, [])
    parent[root] = rootTree
    distance[root] = 0
    crawler.crawl(v, function (s, sw, ov, ow, iv, iw) {
      var p = parent[s]
      var tree = new Tree(index, s, 0, p, [])
      parent[s].children.push(tree)
      trees[s].push(tree)
      for (var i = 0; i < ov.length; ++i) {
        var t = ov[i]
        var tw = ow[i]
        var d = tw + sw
        if (crawler.visited(t) || hub._intersect(v, t) <= d) {
          continue
        }
        if (d < distance[t]) {
          distance[t] = d
          parent[t] = tree
          crawler.push(t, sw + tw)
        }
      }
    })
    var result = rootTree.children[0]
    result.parent = null
    result._finalizeTraversal()
    return result
  }

  function addHub (v) {
    crawler.crawl(v, function (s, sw, ov, ow, iv, iw) {
      insertHub(inV[s], inW[s], v, sw)
      for (var i = 0; i < ov.length; ++i) {
        var t = ov[i]
        var tw = ow[i]
        if (crawler.visited(t) || hub._intersect(v, t) < tw + sw) {
          continue
        }
        crawler.push(t, sw + tw)
      }
    })
    crawler.crawl(v, function (t, tw, ov, ow, iv, iw) {
      insertHub(outV[t], outW[t], v, tw)
      for (var i = 0; i < iv.length; ++i) {
        var s = iv[i]
        var sw = iw[i]
        if (crawler.visited(s) || hub._intersect(s, v) < sw + tw) {
          continue
        }
        crawler.push(s, sw + tw)
      }
    })
  }

  // temporary hack
  for (var i = 0; i < numVerts; ++i) {
    toVisit.push(i, Math.random())
  }

  while (toVisit.count > 0) {
    var v = toVisit.topItem()
    toVisit.pop()
    addHub(v)
  }

  return hub
}
