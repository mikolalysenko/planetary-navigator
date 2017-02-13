// var assert = require('assert')

var HubIndex = require('./hub')
var PriorityQueue = require('./pq')
var createCrawler = require('./crawler')

var NUM_COUNTERS = 16
var INITIAL_TREES = 32

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
  var i
  var numVerts = graph.numVertices

  var inV = fillArrays(numVerts)
  var inW = fillArrays(numVerts)
  var outV = fillArrays(numVerts)
  var outW = fillArrays(numVerts)

  var hub = new HubIndex(graph, inV, inW, outV, outW)

  var crawler = createCrawler(graph)
  var toVisit = new PriorityQueue(numVerts)
  var visited = new Array(numVerts)
  for (i = 0; i < numVerts; ++i) {
    visited[i] = false
  }

  var treeWork = 0
  var labelWork = 0
  var treeVerts = 0

  // Tree sketch data structures
  var bucket = 0
  var counters = new Array(NUM_COUNTERS * numVerts)
  for (i = 0; i < counters.length; ++i) {
    counters[i] = 0
  }
  var trees = new Array(numVerts)
  var parent = new Array(numVerts)
  for (i = 0; i < numVerts; ++i) {
    parent[i] = null
    trees[i] = []
    toVisit.push(i, Infinity)
  }

  var counterList = new Array(NUM_COUNTERS / 2)
  for (var pp = 0; pp < counterList.length; ++pp) {
    counterList[pp] = 0
  }

  function recalcWeight (vertex) {
    for (var n = 0; n < counterList.length; ++n) {
      counterList[n] = 0
    }
    for (var i = 0; i < NUM_COUNTERS; ++i) {
      var c = counters[NUM_COUNTERS * vertex + i]
      for (var j = counterList.length - 1; j >= 0; --j) {
        var x = counterList[j]
        if (x < c) {
          for (var k = 1; k <= j; ++k) {
            counterList[k - 1] = counterList[k]
          }
          counterList[j] = c
          break
        }
      }
    }
    toVisit.update(vertex, -counterList[0])
    /*
    assert(toVisit.weight(vertex) === -counterList[0])
    if (counterList[counterList.length - 1]) {
      assert(trees[vertex].length > 0)
    } else {
      assert(trees[vertex].length === 0)
    }
    */
  }

  var treeCache = []

  function allocTree (index, vertex, parent) {
    if (treeCache.length > 0) {
      var t = treeCache.pop()
      t.index = index
      t.vertex = vertex
      t.parent = parent
      return t
    } else {
      var res = new Tree(index, vertex, parent, [])
      return res
    }
  }

  function freeTree (tree) {
    tree.parent = null
    tree.children.length = 0
    treeCache.push(tree)
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
      counters[NUM_COUNTERS * vertex + index] -= s
      removeUnsorted(trees[vertex], this)
      recalcWeight(vertex)
      freeTree(this)
      return s
    },

    _finalizeTraversal: function () {
      var s = 1
      var children = this.children
      for (var i = 0; i < children.length; ++i) {
        s += children[i]._finalizeTraversal()
      }
      var index = this.index
      var vertex = this.vertex
      parent[vertex] = null
      trees[vertex].push(this)
      counters[NUM_COUNTERS * vertex + index] += s
      recalcWeight(vertex)
      return s
    }
  }

  var rootTree = new Tree(-1, -1, null, [])

  function addOutTree (index, root) {
    parent[root] = rootTree
    crawler.crawl(root, function (s, sw, ov, ow, iv, iw) {
      treeWork += 1
      var p = parent[s]
      var tree = allocTree(index, s, p)
      parent[s].children.push(tree)
      for (var i = 0; i < ov.length; ++i) {
        var t = ov[i]
        var tw = ow[i]
        var d = tw + sw
        if (crawler.visited(t) ||
            visited[t] ||
            crawler.pq.weight(t) <= d ||
            hub._intersect(root, t) <= d) {
          continue
        }
        parent[t] = tree
        crawler.push(t, d)
      }
    })
    var result = rootTree.children[0]
    rootTree.children.length = 0
    result.parent = null
    treeVerts += result._finalizeTraversal()
  }

  function addInTree (index, root) {
    parent[root] = rootTree
    crawler.crawl(root, function (t, tw, ov, ow, iv, iw) {
      treeWork += 1
      var p = parent[t]
      var tree = allocTree(index, t, p)
      parent[t].children.push(tree)
      for (var i = 0; i < iv.length; ++i) {
        var s = iv[i]
        var sw = iw[i]
        var d = tw + sw
        if (crawler.visited(s) ||
            visited[s] ||
            crawler.pq.weight(s) <= d ||
            hub._intersect(s, root) <= d) {
          continue
        }
        parent[s] = tree
        crawler.push(s, d)
      }
    })
    var result = rootTree.children[0]
    rootTree.children.length = 0
    result.parent = null
    treeVerts += result._finalizeTraversal()
  }

  function addTree () {
    var root = toVisit.items[(toVisit.count * Math.random()) | 0]
    addInTree(bucket, root)
    addOutTree(bucket, root)
    bucket = (bucket + 1) % NUM_COUNTERS
  }

  function addHub (v) {
    crawler.crawl(v, function (s, sw, ov, ow, iv, iw) {
      labelWork += 1
      insertHub(inV[s], inW[s], v, sw)
      for (var i = 0; i < ov.length; ++i) {
        var t = ov[i]
        var tw = ow[i]
        if (crawler.visited(t) || hub._intersect(v, t) <= tw + sw) {
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
        if (crawler.visited(s) || hub._intersect(s, v) <= sw + tw) {
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

    /*
    console.log('adding hub:', v, treeList.length, toVisit.weights[0])
    console.log(
      'queue size:', toVisit.count,
      'total tree size: ', treeVerts,
      'tree work:', treeWork,
      'label work:', labelWork)
    var expectedCounters = (new Array(NUM_COUNTERS)).fill(0)
    for (var i = 0; i < treeList.length; ++i) {
      expectedCounters[treeList[i].index] += treeList[i]._size()
    }
    var actualCounters = []
    for (var i = 0; i < NUM_COUNTERS; ++i) {
      actualCounters.push(counters[NUM_COUNTERS * v + i])
    }
    // console.log(expectedCounters)
    // console.log(actualCounters)
    assert(expectedCounters.join() === actualCounters.join())
    for (var i = 0; i < treeList.length; ++i) {
      for (var j = 0; j < i; ++j) {
        assert(treeList[i] !== treeList[j])
      }
    }
    */

    while (treeList.length > 0) {
      var tree = treeList[0]
      var p = tree.parent
      var s = tree.cut()
      treeVerts -= s
      if (p) {
        removeUnsorted(p.children, tree)
      }
      while (p) {
        counters[NUM_COUNTERS * p.vertex + p.index] -= s
        recalcWeight(p.vertex)
        p = p.parent
      }
    }
    toVisit.push(v, -Infinity)
    toVisit.pop()
    addHub(v)
    visited[v] = true
    while (treeWork < NUM_COUNTERS * labelWork &&
      treeVerts < 10 * NUM_COUNTERS * toVisit.count) {
      addTree()
    }
  }

  return hub
}
