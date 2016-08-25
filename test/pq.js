var tape = require('tape')
var PriorityQueue = require('../lib/pq')

tape('simple priority queue test', function (t) {
  var pq = new PriorityQueue()

  t.equals(pq.count, 0, 'queue initially empty')
  pq.push(0, 10)
  t.equals(pq.count, 1)
  t.equals(pq.topItem(), 0, 'top item ok')
  t.equals(pq.topWeight(), 10, 'top weight ok')
  pq.pop()
  t.equals(pq.count, 0)
  pq.push(1, 2)
  t.equals(pq.count, 1)
  pq.push(0, 0)
  t.equals(pq.count, 2)

  t.equals(pq.topItem(), 0)
  pq.pop()
  t.equals(pq.count, 1)
  t.equals(pq.topItem(), 1)
  pq.pop()
  t.equals(pq.count, 0)

  t.end()
})

tape('heap sort test', function (t) {
  var N = 50
  function testSort () {
    var i
    var pq = new PriorityQueue()
    var items = []
    var weights = []
    var pairs = []
    for (i = 0; i < N; ++i) {
      var x = i
      var w = Math.random()
      items.push(x)
      weights.push(w)
      pairs.push([x, w])
      t.equals(pq.count, i)
      pq.push(x, w)
    }
    t.equals(pq.count, N)
    pairs.sort(function (a, b) { return a[1] - b[1] })

    for (i = 0; i < N; ++i) {
      t.equals(pq.count, N - i, 'pq not empty')
      t.equals(pq.topItem(), pairs[i][0], 'top item ' + i)
      t.equals(pq.topWeight(), pairs[i][1], 'top weight ' + i)
      pq.pop()
    }
    t.equals(pq.count, 0, 'count cleared')
  }

  for (var i = 0; i < 10; ++i) {
    testSort()
  }

  t.end()
})
