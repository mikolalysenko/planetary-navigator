var createCrawler = require('./crawler')

module.exports = function sssp (graph, start) {
  var distances = new Array(graph.numVertices)
  for (var i = 0; i < graph.numVertices; ++i) {
    distances[i] = Infinity
  }
  var crawler = createCrawler(graph)
  crawler.crawl(start, function (x, w, outV, outW) {
    distances[x] = w
    for (var i = 0; i < outV.length; ++i) {
      crawler.push(outV[i], w + outW[i])
    }
  })
  return distances
}
