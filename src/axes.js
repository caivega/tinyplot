// Generated by CoffeeScript 1.6.3
(function() {
  var Axis,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.NumberFormatter = (function() {
    function NumberFormatter() {}

    NumberFormatter.prototype.format = function(span, value) {
      return value.toString();
    };

    return NumberFormatter;

  })();

  this.TimeFormatter = (function() {
    function TimeFormatter() {}

    TimeFormatter.prototype.format = function(span, value) {
      var formatString, t;
      t = moment(value);
      formatString = span < 10000 ? 'mm:ss.SS' : span < 3600 * 1000 ? 'hh:mm:ss' : span < 3600 * 1000 * 72 ? 'MM/DD hh:mm A' : 'YYYY-MM-DD';
      return t.format(formatString);
    };

    return TimeFormatter;

  })();

  Axis = (function() {
    function Axis(min, max) {
      this.dirty = true;
      this.step = 1;
      this.clampMax = null;
      this.clampMin = null;
      this.tickSize = 8;
      this.fontSize = 12;
      this.color = '#444';
      this.resize(min, max);
    }

    Axis.prototype.toString = function() {
      return "" + this.min + " to " + this.max + ", step = " + this.step + " (clamp at " + this.clampMin + " to " + this.clampMax + ")";
    };

    Axis.prototype.makeDirty = function() {
      return this.dirty = true;
    };

    Axis.prototype.resize = function(min, max) {
      var exp, _results;
      this.min = min;
      this.max = max;
      this.span = max - min;
      exp = Math.floor(Math.log10(this.span) - 1);
      this.step = Math.pow(10, exp);
      _results = [];
      while (this.span / this.step > 10) {
        _results.push(this.step *= 2);
      }
      return _results;
    };

    Axis.prototype.zoom = function(factor) {
      var avg, max, min, newSpan;
      avg = (this.max + this.min) / 2;
      newSpan = this.span / factor;
      if (this.clampMin && this.clampMax && newSpan > (this.clampMax - this.clampMin)) {
        this.min = this.clampMin;
        this.max = this.clampMax;
        this.span = this.clampMax - this.clampMin;
      } else {
        min = avg - newSpan / 2;
        max = avg + newSpan / 2;
        this.resize(min, max);
      }
      return this.dirty = true;
    };

    Axis.prototype.pan = function(delta) {
      if (delta < 0) {
        if (!this.clampMax || this.clampMax > this.max) {
          this.max = Math.min(this.clampMax, this.max - delta);
          this.min = this.max - this.span;
        }
      } else {
        if (!this.clampMin || this.clampMin < this.min) {
          this.min = Math.max(this.clampMin, this.min - delta);
          this.max = this.min + this.span;
        }
      }
      return this.dirty = true;
    };

    Axis.prototype.round = function() {
      return this.resize(Math.floor(this.min / this.step) * this.step, Math.ceil(this.max / this.step) * this.step);
    };

    Axis.prototype.clamp = function() {
      this.clampMin = this.min;
      return this.clampMax = this.max;
    };

    Axis.prototype.render = function(canvas, formatter, width, height) {
      canvas.clearRect(0, 0, width, height);
      return this.dirty = false;
    };

    return Axis;

  })();

  this.XAxis = (function(_super) {
    __extends(XAxis, _super);

    function XAxis(canvas, min, max) {
      XAxis.__super__.constructor.call(this, canvas, min, max);
    }

    XAxis.prototype.render = function(canvas, formatter, width, height) {
      var scale, text, x, xActual, _results;
      XAxis.__super__.render.call(this, canvas, formatter, width, height);
      scale = width / this.span;
      x = Math.floor(this.min / this.step) * this.step;
      canvas.strokeStyle = this.color;
      canvas.beginPath();
      while (x <= this.max) {
        xActual = Math.ceil((x - this.min) * scale) - 0.5;
        canvas.moveTo(xActual, 0);
        canvas.lineTo(xActual, this.tickSize);
        x += this.step;
      }
      canvas.stroke();
      x = Math.floor(this.min / this.step) * this.step;
      canvas.font = "" + this.fontSize + "px sans-serif";
      canvas.textAlign = 'center';
      _results = [];
      while (x <= this.max) {
        xActual = Math.ceil((x - this.min) * scale) - 0.5;
        text = formatter.format(this.span, x);
        canvas.fillText(text, xActual, this.tickSize + this.fontSize);
        _results.push(x += this.step);
      }
      return _results;
    };

    return XAxis;

  })(Axis);

  this.YAxis = (function(_super) {
    __extends(YAxis, _super);

    function YAxis(canvas, min, max) {
      YAxis.__super__.constructor.call(this, canvas, min, max);
    }

    YAxis.prototype.render = function(canvas, formatter, width, height) {
      var scale, text, y, yActual, _results;
      YAxis.__super__.render.call(this, canvas, formatter, width, height);
      scale = height / this.span;
      y = Math.floor(this.min / this.step) * this.step;
      canvas.strokeStyle = this.color;
      canvas.beginPath();
      while (y <= this.max) {
        yActual = Math.ceil(height - (y - this.min) * scale) - 0.5;
        if (yActual < 0) {
          yActual = 0.5;
        }
        canvas.moveTo(width - this.tickSize, yActual);
        canvas.lineTo(width, yActual);
        y += this.step;
      }
      canvas.stroke();
      y = Math.floor(this.min / this.step) * this.step;
      canvas.font = "" + this.fontSize + "px sans-serif";
      canvas.textAlign = 'right';
      _results = [];
      while (y <= this.max) {
        yActual = Math.ceil(height - (y - this.min) * scale) - 0.5;
        canvas.textBaseline = yActual <= 0 ? 'top' : yActual >= height - 1 ? 'alphabetic' : 'middle';
        text = formatter.format(this.span, y);
        canvas.fillText(text, width - this.tickSize - 3, yActual);
        _results.push(y += this.step);
      }
      return _results;
    };

    return YAxis;

  })(Axis);

}).call(this);

/*
//@ sourceMappingURL=axes.map
*/