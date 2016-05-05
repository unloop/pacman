var Game;
Game = function(id, params) {
  var $canvas, Item, Map, Stage, settings, _, _context, _events, _extend, _hander, _index, _stages;
  _ = this;
  params = params || {};
  settings = {
    width: 960,
    height: 640
  };
  _extend = function(target, settings, params) {
    var i;
    for (i in settings) {
      target[i] = params[i] || settings[i];
    }
    return target;
  };
  _extend(this, settings, params);
  $canvas = document.getElementById(id);
  $canvas.width = _.width;
  $canvas.height = _.height;
  _context = $canvas.getContext('2d');
  _stages = [];
  _events = {};
  _index = 0;
  _hander = void 0;
  Item = function(params) {
    this._params = params || {};
    this._settings = {
      x: 0,
      y: 0,
      width: 20,
      height: 20,
      type: 0,
      color: '#F00',
      status: 1,
      orientation: 0,
      speed: 0,
      location: null,
      coord: null,
      path: [],
      vector: null,
      stage: null,
      index: 0,
      frames: 1,
      times: 0,
      timeout: 0,
      control: {},
      update: function() {},
      draw: function() {}
    };
    _extend(this, this._settings, this._params);
  };
  Item.prototype.bind = function(eventType, callback) {
    if (!_events[eventType]) {
      _events[eventType] = {};
      $canvas.addEventListener(eventType, function(e) {
        var position;
        position = _.getPosition(e);
        _stages[_index].items.forEach(function(item) {
          var key;
          if (Math.abs(position.x - item.x) < item.width / 2 && Math.abs(position.y - item.y) < item.height / 2) {
            key = 's' + _index + 'i' + item.index;
            if (_events[eventType][key]) {
              _events[eventType][key](e);
            }
          }
        });
        e.preventDefault();
      });
    }
    _events[eventType]['s' + this.stage.index + 'i' + this.index] = callback.bind(this);
  };
  Map = function(params) {
    this._params = params || {};
    this._settings = {
      x: 0,
      y: 0,
      size: 20,
      data: [],
      stage: null,
      x_length: 0,
      y_length: 0,
      frames: 1,
      times: 0,
      update: function() {},
      draw: function() {}
    };
    _extend(this, this._settings, this._params);
  };
  Map.prototype.get = function(x, y) {
    if (this.data[y] && typeof this.data[y][x] !== 'undefined') {
      return this.data[y][x];
    }
    return -1;
  };
  Map.prototype.set = function(x, y, value) {
    if (this.data[y]) {
      this.data[y][x] = value;
    }
  };
  Map.prototype.coord2position = function(cx, cy) {
    return {
      x: this.x + cx * this.size + this.size / 2,
      y: this.y + cy * this.size + this.size / 2
    };
  };
  Map.prototype.position2coord = function(x, y) {
    var fx, fy;
    fx = Math.abs(x - this.x) % this.size - (this.size / 2);
    fy = Math.abs(y - this.y) % this.size - (this.size / 2);
    return {
      x: Math.floor((x - this.x) / this.size),
      y: Math.floor((y - this.y) / this.size),
      offset: Math.sqrt(fx * fx + fy * fy)
    };
  };
  Map.prototype.finder = function(params) {
    var current, defaults, finded, options, result, steps, steps_length, x, x_length, y, y_length, _getValue, _next, _render;
    defaults = {
      map: null,
      start: {},
      end: {},
      type: 'path'
    };
    options = _extend({}, defaults, params);
    result = [];
    if (options.map[options.start.y][options.start.x] || options.map[options.end.y][options.end.x]) {
      return [];
    }
    finded = false;
    y_length = options.map.length;
    x_length = options.map[0].length;
    steps = [];
    steps_length = 0;
    y = y_length;
    while (y--) {
      steps[y] = [];
      x = x_length;
      while (x--) {
        steps[y][x] = 0;
      }
    }
    _getValue = function(x, y) {
      if (options.map[y] && typeof options.map[y][x] !== 'undefined') {
        return options.map[y][x];
      }
      return -1;
    };
    _next = function(to) {
      var value;
      value = _getValue(to.x, to.y);
      if (value < 1) {
        if (value === -1) {
          to.x = (to.x + x_length) % x_length;
          to.y = (to.y + y_length) % y_length;
          to.change = 1;
        }
        if (!steps[to.y][to.x]) {
          result.push(to);
        }
      }
    };
    _render = function(list) {
      var current, i, len, new_list, next;
      new_list = [];
      next = function(from, to) {
        var value;
        value = _getValue(to.x, to.y);
        if (value < 1) {
          if (value === -1) {
            to.x = (to.x + x_length) % x_length;
            to.y = (to.y + y_length) % y_length;
            to.change = 1;
          }
          if (to.x === options.end.x && to.y === options.end.y) {
            steps[to.y][to.x] = from;
            finded = true;
          } else if (!steps[to.y][to.x]) {
            steps[to.y][to.x] = from;
            new_list.push(to);
          }
        }
      };
      i = 0;
      len = list.length;
      while (i < len) {
        current = list[i];
        next(current, {
          y: current.y + 1,
          x: current.x
        });
        next(current, {
          y: current.y,
          x: current.x + 1
        });
        next(current, {
          y: current.y - 1,
          x: current.x
        });
        next(current, {
          y: current.y,
          x: current.x - 1
        });
        i++;
      }
      if (!finded && new_list.length) {
        _render(new_list);
      }
    };
    _render([options.start]);
    if (finded) {
      current = options.end;
      if (options.type === 'path') {
        while (current.x !== options.start.x || current.y !== options.start.y) {
          result.unshift(current);
          current = steps[current.y][current.x];
        }
      } else if (options.type === 'next') {
        _next({
          x: current.x + 1,
          y: current.y
        });
        _next({
          x: current.x,
          y: current.y + 1
        });
        _next({
          x: current.x - 1,
          y: current.y
        });
        _next({
          x: current.x,
          y: current.y - 1
        });
      }
    }
    return result;
  };
  Stage = function(params) {
    this._params = params || {};
    this._settings = {
      status: 0,
      maps: [],
      audio: [],
      images: [],
      items: [],
      timeout: 0,
      update: function() {}
    };
    _extend(this, this._settings, this._params);
  };
  Stage.prototype.resetItems = function() {
    this.status = 1;
    this.items.forEach((function(item, index) {
      var position;
      _extend(item, item._settings, item._params);
      item.index = index;
      item.stage = this;
      if (item.location) {
        position = item.location.coord2position(item.coord.x, item.coord.y);
        item.x = position.x;
        item.y = position.y;
      }
    }).bind(this));
  };
  Stage.prototype.resetMaps = function() {
    this.status = 1;
    this.maps.forEach((function(map) {
      _extend(map, map._settings, map._params);
      map.data = JSON.parse(JSON.stringify(map._params.data));
      map.stage = this;
      map.y_length = map.data.length;
      map.x_length = map.data[0].length;
    }).bind(this));
  };
  Stage.prototype.reset = function() {
    _extend(this, this._settings, this._params);
    this.resetItems();
    this.resetMaps();
  };
  Stage.prototype.createItem = function(options) {
    var item, position;
    item = new Item(options);
    item.stage = this;
    item.index = this.items.length;
    if (item.location) {
      position = item.location.coord2position(item.coord.x, item.coord.y);
      item.x = position.x;
      item.y = position.y;
    }
    this.items.push(item);
    return item;
  };
  Stage.prototype.getItemsByType = function(type) {
    var items;
    items = this.items.filter(function(item) {
      if (item.type === type) {
        return item;
      }
    });
    return items;
  };
  Stage.prototype.createMap = function(options) {
    var map;
    map = new Map(options);
    map.data = JSON.parse(JSON.stringify(map._params.data));
    map.stage = this;
    map.y_length = map.data.length;
    map.x_length = map.data[0].length;
    this.maps.push(map);
    return map;
  };
  Stage.prototype.bind = function(eventType, callback) {
    if (!_events[eventType]) {
      _events[eventType] = {};
      window.addEventListener(eventType, function(e) {
        var key;
        key = 's' + _index;
        if (_events[eventType][key]) {
          _events[eventType][key](e);
        }
        e.preventDefault();
      });
    }
    _events[eventType]['s' + this.index] = callback.bind(this);
  };
  this.start = function() {
    var f, fn;
    f = 0;
    fn = function() {
      var stage;
      stage = _stages[_index];
      _context.clearRect(0, 0, _.width, _.height);
      f++;
      if (stage.timeout) {
        stage.timeout--;
      }
      if (stage.update() !== false) {
        if (stage.maps.length) {
          stage.maps.forEach(function(map) {
            if (!(f % map.frames)) {
              map.times = f / map.frames;
            }
            map.update();
            map.draw(_context);
          });
        }
        if (stage.items.length) {
          stage.items.forEach(function(item) {
            if (!(f % item.frames)) {
              item.times = f / item.frames;
            }
            if (stage.status === 1 && item.status !== 2) {
              if (item.location) {
                item.coord = item.location.position2coord(item.x, item.y);
              }
              if (item.timeout) {
                item.timeout--;
              }
              item.update();
            }
            item.draw(_context);
          });
        }
      }
      _hander = requestAnimationFrame(fn);
    };
    _hander = requestAnimationFrame(fn);
  };
  this.stop = function() {
    _hander && cancelAnimationFrame(_hander);
  };
  this.getPosition = function(e) {
    var box;
    box = $canvas.getBoundingClientRect();
    return {
      x: e.clientX - (box.left * _.width / box.width),
      y: e.clientY - (box.top * _.height / box.height)
    };
  };
  this.createStage = function(options) {
    var stage;
    stage = new Stage(options);
    stage.index = _stages.length;
    _stages.push(stage);
    return stage;
  };
  this.setStage = function(index) {
    _stages[_index].status = 0;
    _index = index;
    _stages[_index].status = 1;
    return _stages[_index];
  };
  this.nextStage = function() {
    if (_index < _stages.length - 1) {
      _stages[_index].status = 0;
      _index++;
      _stages[_index].status = 1;
      return _stages[_index];
    } else {
      throw new Error('unfound new stage.');
    }
  };
  this.init = function() {
    _index = 0;
    this.start();
  };
};
'use strict';
if (!Date.now) {
  Date.now = function() {
    return (new Date).getTime();
  };
}
(function() {
  'use strict';
  var i, lastTime, vendors, vp;
  vendors = ['webkit', 'moz'];
  i = 0;
  while (i < vendors.length && !window.requestAnimationFrame) {
    vp = vendors[i];
    window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    ++i;
  }
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      var nextTime, now;
      now = Date.now();
      nextTime = Math.max(lastTime + 16, now);
      return setTimeout((function() {
        callback(lastTime = nextTime);
      }), nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();