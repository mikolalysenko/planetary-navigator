var HubIndex = require('./hub')
var createCrawler = require('./crawler')

function fillArrays (n) {
  var result = new Array(n)
  for (var i = 0; i < n; ++i) {
    result[i] = []
  }
  return result
}

module.exports = function createIndex (graph) {
  var numVerts = graph.numVerts

  var inV = fillArrays(numVerts)
  var inW = fillArrays(numVerts)
  var outV = fillArrays(numVerts)
  var outW = fillArrays(numVerts)

  var hub = new HubIndex(graph, inV, inW, outV, outW)

  var crawler = createCrawler(graph)

  function addHub (hub) {
    crawler.crawl(hub, function (s, sw, ov, ow) {
      inV[s].push(hub)
      inW[s].push(sw)
      for (var i = 0; i < ov.length; ++i) {
        var t = ov[i]
        var tw = ow[i]
        if (hub._intersect(s, t) <= tw + sw) {
          continue
        }
        crawler.push(t, sw + tw)
      }
    })
    crawler.crawl(hub, function (t, tw, _0, _1, iv, iw) {
      outV[t].push(hub)
      outW[t].push(tw)
      for (var i = 0; i < iv.length; ++i) {
        var s = iv[i]
        var sw = iw[i]
        if (hub._intersect(s, t) <= sw + tw) {
          continue
        }
        crawler.push(s, sw + tw)
      }
    })
  }

  return hub
}
