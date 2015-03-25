// Generated by CoffeeScript 1.6.3
(function() {
  var RenderContext, initCanvas,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  RenderContext = (function() {
    function RenderContext(canvas, width, height, xRange, yRange) {
      this.canvas = canvas;
      this.width = width;
      this.height = height;
      this.xRange = xRange;
      this.yRange = yRange;
      this.lineTo = __bind(this.lineTo, this);
      this.moveTo = __bind(this.moveTo, this);
      ({});
    }

    RenderContext.prototype.clear = function() {
      return this.canvas.clearRect(0, 0, this.width, this.height);
    };

    RenderContext.prototype.setStroke = function(style, width) {
      this.canvas.strokeStyle = style;
      return this.canvas.lineWidth = width;
    };

    RenderContext.prototype.stroke = function(cb) {
      this.canvas.beginPath();
      cb();
      return this.canvas.stroke();
    };

    RenderContext.prototype.plotToCanvas = function(p) {
      p.x = (p.x - this.xRange.min) / this.xRange.span * this.width;
      return p.y = (1 - (p.y - this.yRange.min) / this.yRange.span) * this.height;
    };

    RenderContext.prototype.canvasToPlot = function(p) {
      p.x = p.x * this.xRange.span / this.width + this.xRange.min;
      return p.y = (1 - p.y / this.height) * this.yRange.span + this.yRange.min;
    };

    RenderContext.prototype.moveTo = function(p) {
      this.plotToCanvas(p);
      return this.canvas.moveTo(p.x, p.y);
    };

    RenderContext.prototype.lineTo = function(p) {
      this.plotToCanvas(p);
      return this.canvas.lineTo(p.x, p.y);
    };

    RenderContext.prototype.drawMarkers = function(marker, size, color, xs, ys) {
      var i, p, _i, _ref, _results;
      this.canvas.fillStyle = color;
      _results = [];
      for (i = _i = 0, _ref = xs.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        p = {
          x: xs[i],
          y: ys[i]
        };
        this.plotToCanvas(p);
        switch (marker) {
          case 'circle':
            this.canvas.beginPath();
            this.canvas.arc(p.x, p.y, size / 2, 0, Math.PI * 2, false);
            _results.push(this.canvas.fill());
            break;
          case 'triangle':
            this.canvas.beginPath();
            this.canvas.moveTo(p.x, p.y - size / 2);
            this.canvas.lineTo(p.x - size / 2, p.y + size / 2);
            this.canvas.lineTo(p.x + size / 2, p.y + size / 2);
            _results.push(this.canvas.fill());
            break;
          case 'square':
            this.canvas.beginPath();
            this.canvas.moveTo(p.x - size / 2, p.y - size / 2);
            this.canvas.lineTo(p.x - size / 2, p.y + size / 2);
            this.canvas.lineTo(p.x + size / 2, p.y + size / 2);
            this.canvas.lineTo(p.x + size / 2, p.y - size / 2);
            _results.push(this.canvas.fill());
            break;
          default:
            throw "Unknown marker: " + marker;
        }
      }
      return _results;
    };

    return RenderContext;

  })();

  initCanvas = function(container) {
    var canvasElem;
    canvasElem = container.find('canvas')[0];
    canvasElem.width = container.width();
    canvasElem.height = container.height();
    return canvasElem.getContext('2d');
  };

  this.Chart = (function() {
    function Chart(container, opts) {
      var startClick,
        _this = this;
      this.container = $(container);
      this.container.addClass('tinyplot-chart');
      this.opts = opts;
      _.defaults(opts, {
        title: 'Chart Title',
        subtitle: '',
        xZoom: 'none',
        yZoom: 'none',
        xLabel: 'x',
        yLabel: 'y',
        grid: null
      });
      this.xZoomType = opts.xZoom;
      this.yZoomType = opts.yZoom;
      this.xFormatter = new NumberFormatter();
      this.yFormatter = new NumberFormatter();
      this.titleArea = $('<div class="title-area"></div>').appendTo(this.container);
      $("<div class='title text'>" + opts.title + "</div>").appendTo(this.titleArea);
      $("<div class='subtitle text'>" + opts.subtitle + "</div>").appendTo(this.titleArea);
      this.xAxisCanvasContainer = $('<div class="x-axis"><canvas/></div>').appendTo(this.container);
      this.xAxisCanvas = initCanvas(this.xAxisCanvasContainer);
      this.xAxis = new XAxis(0, 1);
      this.xAxis.label = this.opts.xLabel;
      this.yAxisCanvasContainer = $('<div class="y-axis"><canvas/></div>').appendTo(this.container);
      this.yAxisCanvas = initCanvas(this.yAxisCanvasContainer);
      this.yAxis = new YAxis(0, 1);
      this.yAxis.label = this.opts.yLabel;
      this.dataCanvasContainer = $('<div class="data"><canvas/></div>').appendTo(this.container);
      this.dataCanvas = initCanvas(this.dataCanvasContainer);
      this.dataIntercept = $('<div class="data-intercept"></div>').appendTo(this.container);
      startClick = false;
      this.dataIntercept.mousedown(function(evt) {
        return startClick = true;
      });
      this.dataIntercept.click(function(evt) {
        if (startClick) {
          _this.onClick({
            x: evt.offsetX,
            y: evt.offsetY
          });
          return startClick = false;
        }
      });
      interact(this.dataIntercept[0]).draggable({
        inertia: true,
        onstart: function(evt) {
          return startClick = false;
        },
        onmove: function(evt) {
          return _this.pan(evt.dx, evt.dy);
        }
      }).gesturable({
        onmove: function(evt) {
          return _this.zoom(1 + evt.ds);
        }
      });
      this.makeContext();
      this.container.on('mousewheel', function(evt) {
        _this.zoom(1 + evt.deltaY / 1000);
        return evt.preventDefault();
      });
    }

    Chart.prototype.xResize = function(min, max) {
      this.xAxis.resize(min, max);
      console.log("xAxis: " + (this.xAxis.toString()));
      return this.xAxis.makeDirty();
    };

    Chart.prototype.xRound = function() {
      this.xAxis.round();
      return console.log("xAxis: " + (this.xAxis.toString()));
    };

    Chart.prototype.xClamp = function() {
      return this.xAxis.clamp();
    };

    Chart.prototype.yResize = function(min, max) {
      this.yAxis.resize(min, max);
      console.log("yAxis: " + (this.yAxis.toString()));
      return this.yAxis.makeDirty();
    };

    Chart.prototype.yRound = function() {
      this.yAxis.round();
      return console.log("yAxis: " + (this.yAxis.toString()));
    };

    Chart.prototype.yClamp = function() {
      return this.yAxis.clamp();
    };

    Chart.prototype.makeContext = function() {
      return this.context = new RenderContext(this.dataCanvas, this.dataCanvasContainer.width(), this.dataCanvasContainer.height(), this.xAxis, this.yAxis);
    };

    Chart.prototype.zoom = function(delta) {
      var hasZoomed;
      hasZoomed = false;
      if (this.xZoomType === 'user') {
        this.xAxis.zoom(delta);
        hasZoomed = true;
      }
      if (this.yZoomType === 'user') {
        this.yAxis.zoom(delta);
        hasZoomed = true;
      }
      if (hasZoomed) {
        return this.render();
      }
    };

    Chart.prototype.pan = function(dx, dy) {
      var hasPanned;
      hasPanned = false;
      if (this.xZoomType === 'user') {
        this.xAxis.pan(dx / this.context.width * this.xAxis.span);
        hasPanned = true;
      }
      if (this.yZoomType === 'user') {
        this.yAxis.pan(dy / this.context.height * this.yAxis.span);
        hasPanned = true;
      }
      if (hasPanned) {
        return this.render();
      }
    };

    Chart.prototype.onClick = function(p) {
      return {};
    };

    Chart.prototype.renderData = function(context) {
      return {};
    };

    Chart.prototype.render = function() {
      var startTime, stopTime;
      startTime = new Date().getTime();
      if (this.xAxis.dirty) {
        this.xAxis.render(this.xAxisCanvas, this.xFormatter, this.xAxisCanvasContainer.width(), this.xAxisCanvasContainer.height());
      }
      if (this.yAxis.dirty) {
        this.yAxis.render(this.yAxisCanvas, this.yFormatter, this.yAxisCanvasContainer.width(), this.yAxisCanvasContainer.height());
      }
      this.context.clear();
      if (this.opts.grid && this.opts.grid.indexOf('x') >= 0) {
        this.xAxis.renderGrid(this.dataCanvas, this.context.width, this.context.height);
      }
      if (this.opts.grid && this.opts.grid.indexOf('y') >= 0) {
        this.yAxis.renderGrid(this.dataCanvas, this.context.width, this.context.height);
      }
      this.renderData(this.context);
      stopTime = new Date().getTime();
      return console.log("rendered chart in " + (stopTime - startTime) + "ms");
    };

    return Chart;

  })();

}).call(this);

/*
//@ sourceMappingURL=chart.map
*/
