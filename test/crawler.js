var tape = require('tape')
var createGraph = require('../lib/graph')
var createCrawler = require('../lib/crawler')

tape('crawler', function (t) {
  var g = createGraph(6, [
    [0, 1, 1],
    [1, 2, 1],
    [2, 3, 1],
    [3, 5, 1],
    [0, 4, 5],
    [4, 5, 1]])

  var index = [-1, -1, -1, -1, -1, -1]
  var weights = [Infinity, Infinity, Infinity, Infinity, Infinity, Infinity]
  var crawler = createCrawler(g)

  var count = 0
  crawler.crawl(0, function (x, w, outV, outW, inV, inW) {
    index[x] = count++
    weights[x] = w

    for (var i = 0; i < outV.length; ++i) {
      crawler.push(outV[i], w + outW[i])
    }
  })

  t.same(index, [0, 1, 2, 3, 5, 4])
  t.same(weights, [0, 1, 2, 3, 5, 4])

  t.end()
})
