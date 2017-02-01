var createGraph = require('../lib/graph')
var createIndex = require('../lib/indexer')

var canvas = document.createElement('canvas')
canvas.width = canvas.height = 512
document.body.appendChild(canvas)

var CLICK_RADIUS = 30

var context = canvas.getContext('2d')

var state = {
  mouse: [0, 0],
  buttons: [0, 0],
  graph: genGrid(3, 3),
  blue: -1,
  red: -1
}

rebuildIndex(state)

canvas.addEventListener('mousemove', mouseChange)
canvas.addEventListener('mousedown', mouseChange)
canvas.addEventListener('mouseup', mouseChange)

function rebuildIndex (state) {
  var graph = state.graph
  var positions = graph.positions
  var numVerts = positions.length
  var labeledEdges = graph.edges.map(([a, b]) => {
    var p = positions[a]
    var q = positions[b]
    return [
      a, b, Math.sqrt(
        Math.pow(p[0] - q[0], 2) +
        Math.pow(p[1] - q[1], 2))
    ]
  })
  state.topology = createGraph(numVerts, labeledEdges)
  state.index = createIndex(state.topology)
}

var setRed = makeHub('red')
var setBlue = makeHub('blue')

function makeHub (color) {
  var div = document.createElement('div')
  div.style.display = 'block'

  var nameDiv = document.createElement('div')
  nameDiv.style.color = color
  nameDiv.style.display = 'inline'
  nameDiv.innerText = color + ':'
  div.appendChild(nameDiv)

  var infoDiv = document.createElement('div')
  infoDiv.style.display = 'inline'
  div.appendChild(infoDiv)

  document.body.appendChild(div)

  return function setInfo (str) {
    infoDiv.innerText = str
  }
}

function mouseChange (ev) {
  var box = canvas.getBoundingClientRect()

  state.mouse[0] = ev.clientX - box.left
  state.mouse[1] = ev.clientY - box.top

  var v = closestVert(state.graph.positions, state.mouse)
  var id = -1
  if (v.distance < CLICK_RADIUS) {
    id = v.id
  }
  state.red = id
  if (ev.buttons) {
    state.blue = id
  }

  ev.preventDefault()
  window.requestAnimationFrame(draw)
}

function genGrid (n, m) {
  var positions = []
  var edges = []
  var stepX = canvas.width / (n + 2)
  var stepY = canvas.height / (m + 2)

  function V (i, j) {
    return i * m + j
  }

  for (var i = 0; i < n; ++i) {
    for (var j = 0; j < m; ++j) {
      positions.push([stepX * (i + 1), stepY * (j + 1)])
      if (i + 1 < n) {
        edges.push([V(i, j), V(i + 1, j)])
        edges.push([V(i + 1, j), V(i, j)])
      }
      if (j + 1 < m) {
        edges.push([V(i, j), V(i, j + 1)])
        edges.push([V(i, j + 1), V(i, j)])
      }
    }
  }
  return {
    positions,
    edges
  }
}

function drawLine (a, b) {
  context.moveTo(a[0], a[1])
  context.lineTo(b[0], b[1])
  context.stroke()
}

function drawEdge (a, b) {
  drawLine(a, b)
}

function drawVert (n) {
  var a = state.graph.positions[n]
  context.fillText('' + n, a[0], a[1])
}

function drawGraph (graph) {
  var positions = graph.positions
  var edges = graph.edges
  context.fillStyle = context.strokeStyle = '#000'
  for (var i = 0; i < edges.length; ++i) {
    var e = edges[i]
    drawEdge(positions[e[0]], positions[e[1]])
  }
  context.fillStyle = '#f0f'
  for (i = 0; i < positions.length; ++i) {
    drawVert(i)
  }
}

function closestVert (positions, x) {
  var closestId = -1
  var closestDist = Infinity
  for (var i = 0; i < positions.length; ++i) {
    var p = positions[i]
    var d = Math.pow(p[0] - x[0], 2) + Math.pow(p[1] - x[1], 2)
    if (d < closestDist) {
      closestDist = d
      closestId = i
    }
  }
  return {
    id: closestId,
    distance: Math.sqrt(closestDist)
  }
}

function draw () {
  context.fillStyle = '#fff'
  context.clearRect(0, 0, canvas.width, canvas.height)

  context.font = '12px sans-serif'

  drawGraph(state.graph)

  var index = state.index

  function labelStr (v, w) {
    var result = []
    for (var i = 0; i < v.length; ++i) {
      result.push(`(${v[i]}, ${w[i]})`)
    }
    return `[${result.join()}]`
  }

  function setLabels (color, update) {
    var v = state[color]
    context.fillStyle = color
    if (v >= 0) {
      drawVert(v)

      var V = index.inLabels[v]
      var W = index.inWeights[v]
      var str = 'in: '

      if (color === 'blue') {
        V = index.outLabels[v]
        W = index.outWeights[v]
        str = 'out: '
      }

      update(`${str}: ${labelStr(V, W)}`)
    } else {
      update('')
    }
  }

  setLabels('red', setRed)
  setLabels('blue', setBlue)
}

window.requestAnimationFrame(draw)
