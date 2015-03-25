// Generated by CoffeeScript 1.6.3
(function() {
  var getIndex,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  getIndex = function(values, value) {
    var iMax, iMid, iMin, vMax, vMid, vMin;
    iMin = 0;
    iMax = values.length - 1;
    vMin = values[iMin];
    vMax = values[iMax];
    if (value <= vMin) {
      return 0;
    }
    if (value >= vMax) {
      return values.length - 1;
    }
    while (iMax - iMin > 1) {
      iMid = Math.round((iMin + iMax) / 2);
      vMid = values[iMid];
      if (vMid > value) {
        iMax = iMid;
        vMax = vMid;
      } else {
        iMin = iMid;
        vMin = vMid;
      }
    }
    if ((value - vMin) > (vMax - value)) {
      return iMax;
    } else {
      return iMin;
    }
  };

  this.TimeseriesChart = (function(_super) {
    __extends(TimeseriesChart, _super);

    function TimeseriesChart(container, data, opts) {
      var mid, s, tMax, tMin, y, yMax, yMin, ys, _i, _j, _k, _len, _len1, _ref, _ref1;
      _.defaults(opts, {
        timeField: 'time',
        xLabel: 'Time',
        xZoom: 'user',
        yZoom: 'auto',
        cursorColor: '#f00',
        series: [],
        xMaxTicks: 6
      });
      TimeseriesChart.__super__.constructor.call(this, container, opts);
      this.container.addClass('timeseries');
      this.xFormatter = new TimeFormatter();
      this.xAxis.roundingStrategy = 'time';
      this.time = _.pluck(data, this.opts.timeField);
      _ref = this.time, tMin = _ref[0], mid = 3 <= _ref.length ? __slice.call(_ref, 1, _i = _ref.length - 1) : (_i = 1, []), tMax = _ref[_i++];
      this.xResize(tMin, tMax);
      this.xClamp();
      yMin = null;
      yMax = null;
      this.data = data;
      _ref1 = this.opts.series;
      for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
        s = _ref1[_j];
        ys = _.pluck(data, s.yField);
        _.defaults(s, {
          color: '#000',
          width: 1,
          markerSize: 6
        });
        for (_k = 0, _len1 = ys.length; _k < _len1; _k++) {
          y = ys[_k];
          if (!yMin || yMin > y) {
            yMin = y;
          }
          if (!yMax || yMax < y) {
            yMax = y;
          }
        }
      }
      this.yResize(yMin, yMax);
      this.yRound();
      this.cursor = $("<div class='cursor'><div class='bar' style='border-left: 1px solid " + opts.cursorColor + "'></div><div class='info'></div></div>").appendTo(this.dataCanvasContainer);
      this.cursorWidth = this.cursor.width();
      this.render();
    }

    TimeseriesChart.prototype.renderData = function(context) {
      var iMax, iMin, p, plotData, plotTime, s, time, ys, _i, _len, _ref;
      iMin = getIndex(this.time, context.xRange.min);
      if (iMin > 0) {
        iMin -= 1;
      }
      iMax = getIndex(this.time, context.xRange.max);
      if (iMax < this.data.length - 2) {
        iMax += 1;
      }
      plotData = this.data.slice(iMin, +iMax + 1 || 9e9);
      plotTime = _.pluck(plotData, this.opts.timeField);
      _ref = this.opts.series;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        ys = _.pluck(plotData, s.yField);
        context.setStroke(s.color, s.width);
        context.stroke(function() {
          var i, _j, _ref1, _results;
          context.moveTo({
            x: plotTime[0],
            y: ys[0]
          });
          _results = [];
          for (i = _j = 1, _ref1 = plotData.length - 1; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
            _results.push(context.lineTo({
              x: plotTime[i],
              y: ys[i]
            }));
          }
          return _results;
        });
        if (s.marker && plotData.length < context.width / 4) {
          context.drawMarkers(s.marker, s.markerSize, s.color, plotTime, ys);
        }
      }
      if (this.cursor.is(':visible')) {
        time = parseFloat(this.cursor.data('time'));
        p = {
          x: time,
          y: 0
        };
        context.plotToCanvas(p);
        return this.cursor.css('left', p.x - this.cursorWidth / 2);
      }
    };

    TimeseriesChart.prototype.onClick = function(p) {
      var index, info, pCanvas, s, t, time, value, _i, _len, _ref;
      this.context.canvasToPlot(p);
      index = getIndex(this.time, p.x);
      value = this.data[index];
      time = value[this.opts.timeField];
      pCanvas = {
        x: time,
        y: 0
      };
      this.context.plotToCanvas(pCanvas);
      this.cursor.css('left', pCanvas.x - this.cursorWidth / 2);
      this.cursor.data('time', time);
      info = this.cursor.find('.info');
      info.html('');
      t = this.xFormatter.format(this.xAxis.span, p.x).replace('|', ' ');
      info.append("<div style='color: " + this.opts.cursorColor + "'>" + t + "</div>");
      _ref = this.opts.series;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        info.append("<div style='color: " + s.color + "'>" + s.yField + ": " + value[s.yField] + "</div>");
      }
      return this.cursor.show();
    };

    return TimeseriesChart;

  })(Chart);

  window.tinyplot = {
    TimeseriesChart: TimeseriesChart
  };

}).call(this);

/*
//@ sourceMappingURL=timeseries.map
*/