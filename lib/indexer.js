var HubIndex = require('./hub')
var PriorityQueue = require('./pq')
var createCrawler = require('./crawler')

var NUM_COUNTERS = 16
var INITIAL_TREES = 100

function removeUnsorted (array, item) {
  for (var i = 0; i < array.length; ++i) {
    if (array[i] === item) {
      array[i] = array[array.length - 1]
      array.pop()
      return
    }
  }
}

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
  var toVisit = new PriorityQueue(numVerts)

  var treeWork = 0
  var labelWork = 0
  var treeVerts = 0

  // Tree sketch data structures
  var bucket = 0
  var counters = new Array(NUM_COUNTERS * numVerts)
  var trees = new Array(numVerts)
  var parent = new Array(numVerts)
  for (var i = 0; i < counters.length; ++i) {
    counters[i] = 0
    parent[i] = null
    trees[i] = []
    toVisit.push(i, Infinity)
  }

  var counterList = new Array(NUM_COUNTERS / 2)
  for (var pp = 0; pp < counterList.length; ++pp) {
    counterList[pp] = 0
  }
  function recalcWeight (vertex) {
    for (var i = 0; i < NUM_COUNTERS; ++i) {
      var c = counters[NUM_COUNTERS * vertex + i]
      for (var j = counterList.length - 1; j >= 0; --j) {
        var x = counterList[j]
        if (c < x) {
          for (var k = 1; k < j; ++k) {
            counterList[k - 1] = counterList[k]
          }
          counterList[j] = c
          break
        }
      }
    }
    toVisit.update(vertex, counterList[counterList.length - 1])
  }

  function Tree (index, vertex, parent, children) {
    this.index = index
    this.vertex = vertex
    this.parent = parent
    this.children = children
  }

  Tree.prototype = {
    cut: function () {
      var s = 1
      var children = this.children
      for (var i = 0; i < children.length; ++i) {
        s += children[i].cut()
      }
      var index = this.index
      var vertex = this.vertex
      counters[NUM_COUNTERS * vertex + index] += s
      removeUnsorted(trees[vertex], this)
      recalcWeight(vertex)
      return s
    },

    _finalizeTraversal: function () {
      var s = 1
      var children = this.children
      for (var i = 0; i < children.length; ++i) {
        var c = children[i]
        parent[c.vertex] = null
        s += c._finalizeTraversal()
      }
      var index = this.index
      var vertex = this.vertex
      counters[NUM_COUNTERS * vertex + index] += s
      trees[vertex].push(this)
      recalcWeight(vertex)
      return s
    }
  }

  function addOutTree (index, root) {
    var rootTree = new Tree(index, -1, 0, null, [])
    parent[root] = rootTree
    crawler.crawl(v, function (s, sw, ov, ow, iv, iw) {
      treeWork += 1
      var p = parent[s]
      var tree = new Tree(index, s, 0, p, [])
      parent[s].children.push(tree)
      trees[s].push(tree)
      for (var i = 0; i < ov.length; ++i) {
        var t = ov[i]
        var tw = ow[i]
        var d = tw + sw
        if (crawler.visited(t) ||
            crawler.pq.weight(t) < d ||
            hub._intersect(v, t) <= d) {
          continue
        }
        parent[t] = tree
        crawler.push(t, d)
      }
    })
    var result = rootTree.children[0]
    result.parent = null
    treeVerts += result._finalizeTraversal()
  }

  function addInTree (index, root) {
    var rootTree = new Tree(index, -1, null, [])
    parent[root] = rootTree
    crawler.crawl(v, function (t, tw, ov, ow, iv, iw) {
      treeWork += 1
      var p = parent[s]
      var tree = new Tree(index, t, p, [])
      parent[s].children.push(tree)
      trees[s].push(tree)
      for (var i = 0; i < iv.length; ++i) {
        var s = iv[i]
        var sw = iw[i]
        var d = tw + sw
        if (crawler.visited(t) ||
            crawler.pq.weight(t) < d ||
            hub._intersect(s, v) <= d) {
          continue
        }
        parent[t] = tree
        crawler.push(t, d)
      }
    })
    var result = rootTree.children[0]
    result.parent = null
    treeVerts += result._finalizeTraversal()
  }

  function addTree () {
    var root = toVisit.items[(toVisit.count * Math.random()) | 0]
    addInTree(root, bucket)
    addOutTree(root, bucket)
    bucket = (bucket + 1) % NUM_COUNTERS
  }

  function addHub (v) {
    crawler.crawl(v, function (s, sw, ov, ow, iv, iw) {
      insertHub(inV[s], inW[s], v, sw)
      for (var i = 0; i < ov.length; ++i) {
        labelWork += 1
        var t = ov[i]
        var tw = ow[i]
        if (crawler.visited(t) || hub._intersect(v, t) < tw + sw) {
          continue
        }
        crawler.push(t, sw + tw)
      }
    })
    crawler.crawl(v, function (t, tw, ov, ow, iv, iw) {
      labelWork += 1
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

  for (var count = 0; count < INITIAL_TREES; ++count) {
    addTree()
  }

  while (toVisit.count > 0) {
    var v = toVisit.topItem()
    var treeList = trees[v]
    while (treeList.length > 0) {
      var tree = treeList[0]
      treeVerts -= tree.cut()
      removeUnsorted(tree.parent.children, tree)
    }
    toVisit.pop()
    addHub(v)
    while (treeWork < labelWork && treeVerts < 10 * NUM_COUNTERS * numVerts) {
      addTree()
    }
  }

  return hub
}
