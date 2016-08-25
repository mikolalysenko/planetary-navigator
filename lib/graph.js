function Arc (target, weight) {
  this.t = target
  this.w = weight
}

function Graph (numVertices, inV, outV) {
  this.numVertices = numVertices
  this.inV = inV
  this.outV = outV
}

function createGraph (numVertices, edges) {
  var inV = Array(numVertices).fill().map(() => [])
  var outV = Array(numVertices).fill().map(() => [])
  edges.forEach(({s, t, w}) => {
    outV[s].push(new Arc(t, w))
    inV[t].push(new Arc(s, w))
  })
  return new Graph(numVertices, inV, outV)
}

module.exports = createGraph
