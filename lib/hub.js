module.exports = HubIndex

function HubIndex (graph, inLabels, inWeights, outLabels, outWeights) {
  this.graph = graph
  this.inLabels = inLabels
  this.inWeights = inWeights
  this.outLabels = outLabels
  this.outWeights = outWeights

  this._intersectV = 0
  this._intersectS = -1
  this._intersectT = -1
}

HubIndex.prototype = {
  distance: function (s, t) {
    this._intersect(s, t)
    return this._intersectS + this._intersectT
  },

  route: function (s, t) {
    var graph = this.graph
    var path = []
    var toVisit = [s, t]

    while (toVisit.length > 0) {
      var end = toVisit.pop()
      var start = toVisit.pop()

      if (graph.adjacent(start, mid)) {
        path.push(end)
        continue
      }

      this._intersect(start, end)

      var mid = this._intersectV
      if (mid < 0) {
        return path
      }

      toVisit.push(
        mid, end,
        start, mid)
    }

    return path
  },

  _intersect: function (s, t) {
    var sl = this.outLabels[s]
    var sw = this.outWeights[s]
    var tl = this.inLabels[t]
    var tw = this.inWeights[t]

    var a = 0
    var b = 0
    var hub = -1
    var sd = Infinity
    var td = Infinity
    var d = Infinity
    while (a < sl.length && b < tl.length) {
      var i = sl[a]
      var j = tl[b]
      if (i < j) {
        ++i
      } else if (i > j) {
        ++j
      } else {
        var id = sw[a]
        var jd = tw[b]
        var ijd = id + jd
        if (ijd < d) {
          hub = i
          sd = id
          td = jd
          d = ijd
        }
      }
    }

    this._intersectV = hub
    this._intersectS = sd
    this._intersectT = td

    return d
  }
}
