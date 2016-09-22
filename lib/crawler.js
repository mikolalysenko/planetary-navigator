var PriorityQueue = require('./pq')

function Crawler (graph, pq, visited, counter) {
  this.graph = graph
  this.pq = pq
  this.visitCounter = visited
  this.counter = 0
}

Crawler.prototype = {
  crawl: function (start, visit) {
    var graph = this.graph
    var pq = this.pq
    var counter = ++this.counter
    pq.push(start, 0)
    while (pq.count > 0) {
      var x = pq.topItem()
      var w = pq.topWeight()
      pq.pop()
      if (this.visited(x)) {
        return
      }
      this.visitCounter[x] = counter
      visit(x, w, graph.outV[x], graph.outW[x], graph.inV[x], graph.inW[x])
    }
  },

  push: function (vert, weight) {
    if (!this.visited(vert)) {
      this.pq.push(vert, weight)
    }
  },

  visited: function (vert) {
    return this.counter === this.visitCounter[vert]
  }
}

module.exports = function createCrawler (graph) {
  return new Crawler(
    graph,
    new PriorityQueue(graph.numVertices),
    [],
    0)
}
