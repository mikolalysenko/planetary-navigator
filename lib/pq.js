const SHIFT = 3
const B = 8

function children (i) {
  return (i << SHIFT) + 1
}

function parent (i) {
  return (i - 1) >> SHIFT
}

function PriorityQueue () {
  this.count = 0
  this.items = []
  this.weights = []
}

function nextPowB (x) {
  for (var i = 1; i < x; i <<= SHIFT) {}
  return i
}

PriorityQueue.prototype = {
  realloc: function (sz) {
    var i
    var count = this.count

    var items = this.items
    items.length = sz
    for (i = count; i < sz; ++i) {
      items[i] = -1
    }

    var weights = this.weights
    weights.length = sz
    for (i = count; i < sz; ++i) {
      weights[i] = Infinity
    }
  },

  push: function (x, w) {
    var count = this.count
    var items = this.items
    var weights = this.weights
    this.realloc(nextPowB(count + 1))

    // heap up
    var i = count
    while (i > 0) {
      var p = parent(i)
      var wp = weights[p]
      if (wp <= w) {
        break
      }
      items[i] = items[p]
      weights[i] = wp
      i = p
    }
    items[i] = x
    weights[i] = w

    // increment count
    this.count += 1
  },

  topItem: function () {
    return this.items[0]
  },

  topWeight: function () {
    return this.weights[0]
  },

  pop: function () {
    this.count -= 1
    var count = this.count
    var items = this.items
    var weights = this.weights

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

      items[i] = items[minC]
      weights[i] = minW
      i = minC
    }

    items[i] = x
    weights[i] = w

    items[count] = -1
    weights[count] = Infinity
  }
}

module.exports = PriorityQueue
