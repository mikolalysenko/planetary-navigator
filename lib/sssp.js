var createCrawler = require('./crawler')

module.exports = function sssp (graph, start) {
  var distances = new Array(graph.numVerts)
  for (var i = 0; i < graph.numVerts; ++i) {
    distances[i] = Infinity
  }
  var crawler = createCrawler(graph)
  crawler.crawl(start, function (x, w, outV, outW) {
    for (var i = 0; i < outV.length; ++i) {
      crawler.visit(outV[i], w + outW[i])
    }
  })
  return distances
}
