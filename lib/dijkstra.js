const PriorityQueue = require('./pq')

function singleSourceShortestPath (s, graph) {
  const pq = new PriorityQueue()
  const weights = Array(graph.numVertices).fill(Infinity)

  pq.push(s, 0)
  while (!pq.empty()) {
    const x = pq.topItem()
    const w = pq.topWeiht()

    pq.pop()
  }
}
