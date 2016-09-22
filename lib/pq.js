const SHIFT = 3
const B = 8

function children (i) {
  return (i << SHIFT) + 1
}

function parent (i) {
  return (i - 1) >> SHIFT
}

function nextPowB (x) {
  var s = 0
  for (var i = 1; s < x; i <<= SHIFT) {
    s += i
  }
  return s
}

function PriorityQueue (n) {
  this.count = 0
  var s = nextPowB(n)
  this.items = new Array(s)
  this.weights = new Array(s)
  this.index = new Array(s)
  for (var i = 0; i < s; ++i) {
    this.index[i] = -1
    this.items[i] = -1
    this.weights[i] = Infinity
  }
}

PriorityQueue.prototype = {
  push: function (x, w) {
    var count = this.count
    var items = this.items
    var weights = this.weights
    var index = this.index

    var i = index[x]
    if (i < 0) {
      i = count
      index[x] = i
      this.count += 1
    } else if (weights[i] < w) {
      return
    }
    items[i] = x
    weights[i] = w

    // heap up
    while (i > 0) {
      var p = parent(i)
      var wp = weights[p]
      if (wp <= w) {
        break
      }
      var prev = items[i] = items[p]
      weights[i] = wp
      index[prev] = i
      i = p
    }
    items[i] = x
    weights[i] = w
    index[x] = i
  },

  weight: function (i) {
    var idx = this.index[i]
    if (idx < 0) {
      return Infinity
    }
    return this.weights[i]
  },

  topItem: function () {
    return this.items[0]
  },

  topWeight: function () {
    return this.weights[0]
  },

  update: function (v, w) {
    if (w <= this.weight(v)) {
      this.push(v, w)
    } else {
      this.push(v, -Infinity)
      this.pop()
      this.push(v, w)
    }
  },

  pop: function () {
    this.count -= 1
    var count = this.count
    var items = this.items
    var weights = this.weights
    var index = this.index

    index[items[0]] = -1
    if (count === 0) {
      items[0] = -1
      weights[0] = Infinity
      return
    }

    var x = items[count]
    var w = weights[count]

    // heap down
    var i = 0
    while (true) {
      var c = children(i)
      if (c > count) {
        break
      }

      // find smallest child
      var minC = c
      var minW = weights[c]
      for (var j = 1; j < B; ++j) {
        var wj = weights[j + c]
        if (wj < minW) {
          minC = c + j
          minW = wj
        }
      }

      if (w < minW) {
        break
      }

      var prev = items[i] = items[minC]
      weights[i] = minW
      index[prev] = i
      i = minC
    }

    if (i < count) {
      items[i] = x
      weights[i] = w
      index[x] = i
    }

    items[count] = -1
    weights[count] = Infinity
  }
}

module.exports = PriorityQueue
