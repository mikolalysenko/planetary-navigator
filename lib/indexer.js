var HubIndex = require('./hub')
var PriorityQueue = require('./pq')
var createCrawler = require('./crawler')

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

  var toVisit = new PriorityQueue()

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
