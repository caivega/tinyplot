

# Wrap all canvas methods so we can do scaling and such
class RenderContext
	constructor: (@canvas, @width, @height, @xRange, @yRange) -> {}

	clear: ->
		@canvas.clearRect 0, 0, @width, @height

	setStroke: (style, width) ->
		@canvas.strokeStyle = style
		@canvas.lineWidth = width

	stroke: (cb) ->
		@canvas.beginPath()
		cb()
		@canvas.stroke()

	plotToCanvas: (p) ->
		p.x = (p.x - @xRange.min) / @xRange.span * @width
		p.y = (1 - (p.y - @yRange.min) / @yRange.span) * @height

	canvasToPlot: (p) ->
		p.x = p.x * @xRange.span / @width + @xRange.min
		p.y = (1 - p.y / @height) * @yRange.span + @yRange.min

	moveTo: (p) =>
		this.plotToCanvas p
		@canvas.moveTo p.x, p.y

	lineTo : (p) =>
		this.plotToCanvas p
		@canvas.lineTo p.x, p.y

	drawMarkers: (marker, size, color, xs, ys) ->
		@canvas.fillStyle = color
		for i in [0..xs.length]
			p = {x: xs[i], y: ys[i]}
			this.plotToCanvas p
			switch marker
				when 'circle'
					@canvas.beginPath()
					@canvas.arc p.x, p.y, size/2, 0, Math.PI*2, false
					@canvas.fill()
				when 'triangle'
					@canvas.beginPath()
					@canvas.moveTo p.x, p.y-size/2
					@canvas.lineTo p.x-size/2, p.y+size/2
					@canvas.lineTo p.x+size/2, p.y+size/2
					@canvas.fill()
				when 'square'
					@canvas.beginPath()
					@canvas.moveTo p.x-size/2, p.y-size/2
					@canvas.lineTo p.x-size/2, p.y+size/2
					@canvas.lineTo p.x+size/2, p.y+size/2
					@canvas.lineTo p.x+size/2, p.y-size/2
					@canvas.fill()
				else
					throw "Unknown marker: #{marker}"




# gets the canvas element out of a container and sets the size
initCanvas = (container) ->
	canvasElem = container.find('canvas')[0]
	canvasElem.width = container.width()
	canvasElem.height = container.height()
	canvasElem.getContext('2d')


class @Chart

	constructor: (container, opts) ->
		@container = $(container)
		@container.addClass 'tinyplot-chart'
		@opts = opts

		_.defaults opts, {
			title: 'Chart Title'
			subtitle: ''
			xZoom: 'none'
			yZoom: 'none'
			xLabel: 'x'
			yLabel: 'y'
			xMaxTicks: 10
			yMaxTicks: 10
			grid: null
		}
		@xZoomType = opts.xZoom
		@yZoomType = opts.yZoom

		@xFormatter = new NumberFormatter()
		@yFormatter = new NumberFormatter()

		@titleArea = $('<div class="title-area"></div>').appendTo @container
		$("<div class='title text'>#{opts.title}</div>").appendTo @titleArea
		$("<div class='subtitle text'>#{opts.subtitle}</div>").appendTo @titleArea

		@xAxisCanvasContainer = $('<div class="x-axis"><canvas/></div>').appendTo @container
		@xAxisCanvas = initCanvas(@xAxisCanvasContainer)
		@xAxis = new XAxis 0, 1
		@xAxis.label = @opts.xLabel
		@xAxis.maxTicks = @opts.xMaxTicks

		@yAxisCanvasContainer = $('<div class="y-axis"><canvas/></div>').appendTo @container
		@yAxisCanvas = initCanvas(@yAxisCanvasContainer)
		@yAxis = new YAxis 0, 1
		@yAxis.label = @opts.yLabel
		@yAxis.maxTicks = @opts.yMaxTicks

		@dataCanvasContainer = $('<div class="data"><canvas/></div>').appendTo @container
		@dataCanvas = initCanvas @dataCanvasContainer

		@dataIntercept = $('<div class="data-intercept"></div>').appendTo @container
		startClick = false
		@dataIntercept.mousedown (evt) =>
			startClick = true
		@dataIntercept.click (evt) =>
			if startClick
				this.onClick {x: evt.offsetX, y: evt.offsetY}
				startClick = false


		interact(@dataIntercept[0])
			.draggable(
				inertia: true
				onstart: (evt) ->
					startClick = false
				onmove: (evt) =>
					this.pan evt.dx, evt.dy
			)
			.gesturable(
				onmove: (evt) =>
					this.zoom 1+evt.ds
			)

		this.makeContext()

		@container.on 'mousewheel', (evt) =>
			this.zoom(1 + evt.deltaY / 1000)
			evt.preventDefault()

	xResize: (min, max) ->
		@xAxis.resize min, max
		console.log "xAxis: #{@xAxis.toString()}"
		@xAxis.makeDirty()

	xRound: ->
		@xAxis.round()
		console.log "xAxis: #{@xAxis.toString()}"

	xClamp: ->
		@xAxis.clamp()

	yResize: (min, max) ->
		@yAxis.resize min, max
		console.log "yAxis: #{@yAxis.toString()}"
		@yAxis.makeDirty()

	yRound: ->
		@yAxis.round()
		console.log "yAxis: #{@yAxis.toString()}"

	yClamp: ->
		@yAxis.clamp()

	makeContext: ->
		@context = new RenderContext(
			@dataCanvas
			@dataCanvasContainer.width()
			@dataCanvasContainer.height()
			@xAxis
			@yAxis
		)

	zoom: (delta) ->
		hasZoomed = false
		if @xZoomType == 'user'
			@xAxis.zoom delta
			hasZoomed = true
		if @yZoomType == 'user'
			@yAxis.zoom delta
			hasZoomed = true
		if hasZoomed
			this.render()

	pan: (dx, dy) ->
		hasPanned = false
		if @xZoomType == 'user'
			@xAxis.pan dx / @context.width * @xAxis.span
			hasPanned = true
		if @yZoomType == 'user'
			@yAxis.pan dy / @context.height * @yAxis.span
			hasPanned = true
		if hasPanned
			this.render()

	onClick: (p) -> {}

	renderData: (context) -> {}

	render: ->
		startTime = new Date().getTime()
		if @xAxis.dirty
			@xAxis.render @xAxisCanvas, @xFormatter, @xAxisCanvasContainer.width(), @xAxisCanvasContainer.height()
		if @yAxis.dirty
			@yAxis.render @yAxisCanvas, @yFormatter, @yAxisCanvasContainer.width(), @yAxisCanvasContainer.height()
		@context.clear()
		if @opts.grid and @opts.grid.indexOf('x') >= 0
			@xAxis.renderGrid @dataCanvas, @context.width, @context.height
		if @opts.grid and @opts.grid.indexOf('y') >= 0
			@yAxis.renderGrid @dataCanvas, @context.width, @context.height
		this.renderData @context
		stopTime = new Date().getTime()
		console.log "rendered chart in #{stopTime-startTime}ms"
