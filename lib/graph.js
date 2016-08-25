function Graph (numVertices, inV, inW, outV, outW) {
  this.numVertices = numVertices
  this.inV = inV
  this.inW = inW
  this.outV = outV
  this.outW = outW
}

function fillArray (n) {
  var result = new Array(n)
  for (var i = 0; i < n; ++i) {
    result[i] = []
  }
  return result
}

function createGraph (numVertices, edges) {
  var inV = fillArray(numVertices)
  var inW = fillArray(numVertices)
  var outV = fillArray(numVertices)
  var outW = fillArray(numVertices)
  edges.forEach(function (edge) {
    var s = edge[0]
    var t = edge[1]
    var w = edge[2]
    outV[s].push(t)
    outW[s].push(w)
    inV[t].push(s)
    inW[t].push(w)
  })
  return new Graph(numVertices, inV, inW, outV, outW)
}

module.exports = createGraph
