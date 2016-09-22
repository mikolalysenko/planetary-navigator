var tape = require('tape')
var PriorityQueue = require('../lib/pq')

tape('simple priority queue test', function (t) {
  var pq = new PriorityQueue(2)

  t.equals(pq.count, 0, 'queue initially empty')
  pq.push(0, 10)
  t.equals(pq.count, 1)
  t.equals(pq.topItem(), 0, 'top item ok')
  t.equals(pq.topWeight(), 10, 'top weight ok')
  pq.pop()
  t.equals(pq.count, 0, 'popping clears count')
  pq.push(1, 2)
  t.equals(pq.count, 1, 'count now 1')
  pq.push(0, 0)
  t.equals(pq.count, 2, 'count now 2')

  t.equals(pq.topItem(), 0)
  pq.pop()
  t.equals(pq.count, 1)
  t.equals(pq.topItem(), 1)
  pq.pop()
  t.equals(pq.count, 0)

  t.end()
})

tape('heap sort test', function (t) {
  var N

  function testSort () {
    var i, j
    var pq = new PriorityQueue(N)
    var items = []
    var weights = []
    var pairs = []
    for (i = 0; i < N; ++i) {
      var x = i
      var w = Math.random()
      items.push(x)
      weights.push(w)
      pairs.push([x, w])
      t.equals(pq.count, i, 'push count ok')
      pq.push(x, w)
      for (j = 0; j < pq.count; ++j) {
        t.equals(pq.index[pq.items[j]], j, 'index ' + j + ' ok')
      }
    }
    t.equals(pq.count, N, 'final count ok')
    pairs.sort(function (a, b) { return a[1] - b[1] })

    for (i = 0; i < N; ++i) {
      t.equals(pq.count, N - i, 'pq not empty')
      t.equals(pq.topItem(), pairs[i][0], 'top item ' + i)
      t.equals(pq.topWeight(), pairs[i][1], 'top weight ' + i)
      for (j = 0; j < pq.count; ++j) {
        t.equals(pq.index[pq.items[j]], j, 'index ' + j + ' ok')
      }
      pq.pop()
    }
    t.equals(pq.count, 0, 'count cleared')
  }

  for (N = 1; N < 50; ++N) {
    for (var i = 0; i < 5; ++i) {
      testSort()
    }
  }

  t.end()
})

tape('heap update test', function (t) {
  var N

  function testSort () {
    var i, j
    var pq = new PriorityQueue(N)
    var items = []
    var weights = []
    var pairs = []
    for (i = 0; i < N; ++i) {
      var x = i
      var w = 0.83 + 0.25 * i + 0.57 * i * i + 0.025 * i * i * i + 0.3 / (2.5 + i)
      w = w - Math.floor(w)
      items.push(x)
      weights.push(w)
      pairs.push([x, w])
      t.equals(pq.count, i, 'push count ok')
      pq.push(x, w)
      for (j = 0; j < pq.count; ++j) {
        t.equals(pq.index[pq.items[j]], j, 'index ' + j + ' ok')
      }
    }
    t.equals(pq.count, N, 'final count ok')

    for (i = 0; i < N; ++i) {
      var pair = pairs[i]
      for (var ww = 0; ww <= 1; ww += 0.25) {
        pq.push(pair[0], -Infinity)
        var xx
        for (j = 0; j < pq.count; ++j) {
          xx = pq.items[j]
          t.equals(pq.index[xx], j, 'index ' + j + ' ok')
          t.equals(
            pq.weights[j],
            xx === i ? -Infinity : weights[xx],
            'weight ' + j + ' ok')
        }
        t.equals(pq.topItem(), pair[0], 'top ok')
        pq.pop()
        for (j = 0; j < pq.count; ++j) {
          xx = pq.items[j]
          t.equals(pq.index[xx], j, 'index ' + j + ' ok')
          t.equals(
            pq.weights[j],
            weights[xx],
            'weight ' + j + ' ok')
        }
        pq.push(pair[0], ww)
        for (j = 0; j < pq.count; ++j) {
          xx = pq.items[j]
          t.equals(pq.index[xx], j, 'index ' + j + ' ok')
          t.equals(
            pq.weights[j],
            xx === i ? ww : weights[pq.items[j]],
            'weight ' + j + ' ok')
        }
      }
      pq.update(pair[0], pair[1])
      for (j = 0; j < pq.count; ++j) {
        t.equals(pq.index[pq.items[j]], j, 'index ' + j + ' ok')
        t.equals(pq.weights[j], weights[pq.items[j]], 'weight ' + j + ' ok')
      }
    }

    pairs.sort(function (a, b) { return a[1] - b[1] })

    for (i = 0; i < N; ++i) {
      t.equals(pq.count, N - i, 'pq not empty')
      t.equals(pq.topItem(), pairs[i][0], 'top item ' + i)
      t.equals(pq.topWeight(), pairs[i][1], 'top weight ' + i)
      for (j = 0; j < pq.count; ++j) {
        t.equals(pq.index[pq.items[j]], j, 'index ' + j + ' ok')
      }
      pq.pop()
    }
    t.equals(pq.count, 0, 'count cleared')
  }

  for (N = 1; N < 30; ++N) {
    testSort()
  }

  t.end()
})
