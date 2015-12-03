var DOM = {
  events: {
    CHANGE: "change",
    SUBMIT: "submit",
    RESET: "reset",
    SELECT: "select",
    BLUR: "blur",
    FOCUS: "focus",
    KEYDOWN: "keydown",
    KEYPRESS: "keypress",
    KEYUP: "keyup",
    CLICK: "click",
    DBLCLICK: "dblclick",
    MOUSEDOWN: "mousedown",
    MOUSEMOVE: "mousemove",
    MOUSEOUT: "mouseout",
    MOUSEOVER: "mouseover",
    MOUSEENTER: "mouseenter",
    MOUSELEAVE: "mouseleave",
    MOUSEUP: "mouseup",
    SCROLL: "scroll"
  },
  customEvents: null,
  getElementById: function(id, el) {
    el = el || document;
    return el.getElementById(id);
  },
  getElementsByClassName: function(classNames, el) {
    el = el || document;
    if (typeof document.getElementsByClassName == "function") {
      return el.getElementsByClassName(classNames);
    } else {
      var selectorNames = '.' + classNames.replace('/ +/', '.');
      return el.querySelectorAll(selectorNames);
    }
  },
  getElementsByTagName: function(name, el) {
    el = el || document;
    return el.getElementsByTagName(name);
  },
  dispatchEvent: function(el, eventName, eventData) {
    var eventType = "custom";
    for (var key in this.events) {
      if (eventName == this.events[key]) {
        eventType = "standard";
        break;
      }
    }
    if (eventData && typeof CustomEvent == "function") {
      var event = new CustomEvent(eventName, {
        detail: eventData
      });
      el.dispatchEvent(event);
    } else if (typeof Event == "function") {
      var event = new Event(eventName);
      el.dispatchEvent(event);
    } else if (document.addEventListener) {
      var event = document.createEvent("UIEvents");
      event.initEvent(eventName, false, false);
      el.dispatchEvent(event);
    } else if (document.attachEvent) {
      if (eventType == "custom") {
        document.documentElement[eventName]++;
      } else {
        var event = document.createEventObject();
        event.eventType = eventName;
        el.fireEvent("on" + event.eventType, event);
      }
    }
  },
  addEventListener: function(el, eventName, callback) {
    var eventType = "custom";
    for (var key in this.events) {
      if (eventName == this.events[key]) {
        eventType = "standard";
        break;
      }
    }
    if (document.addEventListener) {
      el.addEventListener(eventName, callback);
    } else if (document.attachEvent) {
      if (eventType == "custom") {
        this.addCustomEvent(el, eventName, callback);
      } else {
        console.log(el);
        el.attachEvent("on" + eventName, callback);
      }
    }
  },
  removeEventListener: function(el, eventName, callback) {
    var eventType = "custom";
    for (var key in this.events) {
      if (eventName == this.events[key]) {
        eventType = "standard";
        break;
      }
    }
    if (document.removeEventListener) {
      el.removeEventListener(eventName, callback);
    } else if (document.detachEvent) {
      if (eventType == "custom") {
        if (DOM.customEvents && DOM.customEvents[eventName]) {
          for (var i = 0; i < DOM.customEvents[eventName].length; i++) {
            if (DOM.customEvents[eventName][i] == callback) {
              var callbackIndex = i;
              DOM.customEvents[eventName].splice(i, 1);
              break;
            }
          }
        }
      } else {
        el.detachEvent("on" + eventName, callback);
      }
    }
  },
  addCustomEvent: function(el, eventName, callback) {
    if (!this.customEvents) {
      document.documentElement.attachEvent("onpropertychange", function(e) {
        for (var name in DOM.customEvents) {
          if (e.propertyName == name) {
            for (var i = 0; i < DOM.customEvents[name].length; i++) {
              DOM.customEvents[name][i]();
            }
            break;
          }
        }
      });
    }
    if (!this.customEvents) this.customEvents = {};
    if (!this.customEvents[eventName]) {
      this.customEvents[eventName] = [];
      document.documentElement[eventName] = 0;
    }
    this.customEvents[eventName].push(callback);
  },
  getParentBySelector: function(el, attr, attrValue) {
    var parentEl = el.parentNode;
    while (parentEl !== null) {
      var currentParentEl = parentEl;
      if (attr == 'id') {
        if (currentParentEl.getAttribute && currentParentEl.getAttribute('id') == attrValue) {
          return currentParentEl;
        }
      } else if (attr == 'class') {
        if (currentParentEl.className && currentParentEl.className.indexOf(attrValue) != -1) {
          return currentParentEl;
        }
      }
      parentEl = currentParentEl.parentNode;
    }
    return false;
  }
};


var Ajax = {
  async: true,
  call: function(url, callback, options) {
    var xhr = null;
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else if (typeof ActiveXObject !== 'undefined' && ActiveXObject) {
      var versions = ["Microsoft.XmlHttp", "MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.2.0", "Msxml2.XMLHTTP"];
      for (var i = 0, len = versions.length; i < len; i++) {
        try {
          xhr = new ActiveXObject(versions[i]);
          break;
        } catch (e) {}
      }
      if (xhr === null) {
        return xhr;
      }
    } else {
      return xhr;
    }
    var timer = null;
    xhr.onreadystatechange = function() {
      if (this.readyState < 4) {
        return;
      }
      if (this.readyState === 4) {
        Debug.print("readyState === 4", 4);
        if (timer !== null) {
          clearTimeout(timer);
        }
        for (var e in this) {}
        callback(this);
      }
    };
    if (options !== undefined && ((options.method !== undefined && (options.method == "POST" || options.method == "post")) || options.params !== undefined)) {
      xhr.open('POST', url, Ajax.async);
      if (options.params !== undefined) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        if (typeof options.params != 'string') {
          options.params = JSON.stringify(options.params);
          options.params = options.params.slice(1);
          options.params = options.params.substring(0, options.params.length - 1);
          options.params = options.params.replace(/\:/gi, '=');
          options.params = options.params.replace(/\"/gi, '');
          options.params = options.params.replace(/\,/gi, '&');
        }
        xhr.send(options.params);
      } else {
        xhr.send('');
      }
    } else {
      if (url.indexOf('?') > -1) {
        url += '&t=' + (new Date().getTime()).toString();
      } else {
        url += '?t=' + (new Date().getTime()).toString();
      }
      xhr.open('GET', url, Ajax.async);
      xhr.send();
    }
    if (options !== undefined && options.timeout !== undefined) {
      timer = setTimeout(function() {
        xhr.abort();
      }, options.timeout);
    }
    return xhr;
  },
  jsonp: function(url) {
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    var assignedJsonpDiv = DOM.getElementById('jsonp');
    if (assignedJsonpDiv) {
      assignedJsonpDiv.appendChild(scriptTag);
    } else {
      var jDiv = document.createElement('div');
      jDiv.setAttribute('id', 'jsonp');
      jDiv.appendChild(scriptTag);
      DOM.getElementById('footer').appendChild(jDiv);
    }
  }
};

var UI = {
  hasClass: function(el, searchClass) {
    if ((' ' + el.className + ' ').indexOf(' ' + searchClass + ' ') > -1) {
      return true;
    }
    return false;
  },
  setClass: function(el, newClass) {
    if ((' ' + el.className + ' ').indexOf(' ' + newClass + ' ') < 0) {
      el.className = (el.className + ' ' + newClass).trim();
    }
  },
  addClass: function(el, newClass) {
    if ((' ' + el.className + ' ').indexOf(' ' + newClass + ' ') < 0) {
      el.className = (el.className + ' ' + newClass).trim();
    }
  },
  removeClass: function(el, oldClass) {
    if ((' ' + el.className + ' ').indexOf(' ' + oldClass + ' ') > -1) {
      el.className = (' ' + el.className + ' ').replace(' ' + oldClass + ' ', ' ').trim();
    }
  },
  toggleClass: function(el, class1, class2) {
    if ((' ' + el.className + ' ').indexOf(' ' + class1 + ' ') > -1) {
      el.className = (' ' + el.className + ' ').replace(' ' + class1 + ' ', ' ' + class2 + ' ').trim();
    } else if ((' ' + el.className + ' ').indexOf(' ' + class2 + ' ') > -1) {
      el.className = (' ' + el.className + ' ').replace(' ' + class2 + ' ', ' ' + class1 + ' ').trim();
    } else {
      this.addClass(el, class1);
    }
  },
  getCoordinates: function(el) {
    var coords = null;
    if (el.getBoundingClientRect) {
      coords = this.getOffsetRect(el);
    } else {
      coords = this.getOffsetSum(el);
    }
    return coords;
  },
  getOffsetRect: function(el) {
    var box = el.getBoundingClientRect();
    return {
      top: Math.round(box.top + scrollTop - clientTop),
      left: Math.round(box.left + scrollLeft - clientLeft)
    };
  },
  getOffsetSum: function(el) {
    var top = 0,
        left = 0;
    while (el) {
      top += parseInt(el.offsetTop);
      left += parseInt(el.offsetLeft);
      el = el.offsetParent;
      if (el && el.tagName.toLowerCase() == 'body') {
        if (el.currentStyle) {
          var styleTop = parseInt(el.currentStyle.top.replace("px", ""));
          if (!isNaN(styleTop)) {
            top += styleTop;
          }
        } else {
          var style = window.getComputedStyle(el, null);
          var styleTop = parseInt(style.top.replace("px", ""));
          if (!isNaN(styleTop)) {
            top += styleTop;
          }
        }
      }
    }
    return {
      top: Math.round(top + scrollTop - clientTop),
      left: Math.round(left + scrollLeft - clientLeft)
    };
  },
  scrollTo: function(el, position) {
    if (position == "bottom") {
      window.scrollTo(0, UI.getCoordinates(el).top + el.offsetHeight);
    } else {
      window.scrollTo(0, UI.getCoordinates(el).top);
    }
  },
  fadeIn: function(el, options) {
    var duration = 500;
    if (typeof options == "object") {
      duration = options.duration || 500;
    }
    var opacity = 0;
    el.style.opacity = opacity;
    el.style.filter = '';
    el.style.display = "";
    if (typeof options == "object") {
      el.style.display = options.style || '';
    }
    var last = +new Date();
    var tick = function() {
      opacity += (new Date() - last) / duration;
      el.style.opacity = opacity;
      el.style.filter = 'alpha(opacity=' + (100 * opacity) | 0 + ')';
      last = +new Date();
      if (opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      }
    };
    tick();
  },
  fadeOut: function(el, options) {
    var duration = 500;
    if (typeof options == "object") {
      duration = options.duration || 500;
    }
    var opacity = 1;
    el.style.opacity = opacity;
    el.style.filter = "";
    el.style.display = "";
    if (typeof options == "object") {
      el.style.display = options.style || "";
    }
    var last = +new Date();
    var tick = function() {
      opacity -= (new Date() - last) / duration;
      el.style.opacity = opacity;
      el.style.filter = "alpha(opacity=" + (100 * opacity) | 0 + ")";
      last = +new Date();
      if (opacity > 0) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      } else {
        el.style.display = "none";
      }
    };
    tick();
  },
  isEmpty: function(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
  },
  isVisible: function(elem) {
    return (elem && elem.offsetWidth > 0 && elem.offsetHeight > 0);
  },
  stopPropagation: function(e) {
    e = e || window.event;
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
      e.returnValue = false;
    }
  }
};

var Log = {
  currentLevel: 0,
  prevEntry: '',
  setLevel: function(level) {
    this.currentLevel = level;
  },
  print: function(message, level, indent, time) {
    if (level <= this.currentLevel) {
      var stringMessage = (new Date()).getTime() + ": ";
      if (indent) {
        var indentSize = "    ";
        for (var i = 0; i < (level - 1); i++) {
          stringMessage += indentSize;
        }
      }
      stringMessage += "[" + level + "] " + message;
      if (time) {
        if (!this.prevEntry) {
          this.prevEntry = new Date().getTime();
        }
        var now = new Date().getTime();
        var timeDiff = (now - this.prevEntry) / 1000;
        this.prevEntry = now;
        stringMessage += ' - Time since last debug: ' + timeDiff + 's';
      }
      console.log(stringMessage);
    }
  }
};

var base64 = {};
base64.PADCHAR = '=';
base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
base64.makeDOMException = function() {
  var e, tmp;
  try {
    return new DOMException(DOMException.INVALID_CHARACTER_ERR);
  } catch (tmp) {
    var ex = new Error("DOM Exception 5");
    ex.code = ex.number = 5;
    ex.name = ex.description = "INVALID_CHARACTER_ERR";
    ex.toString = function() {
      return 'Error: ' + ex.name + ': ' + ex.message;
    };
    return ex;
  }
}
base64.getbyte64 = function(s, i) {
  var idx = base64.ALPHA.indexOf(s.charAt(i));
  if (idx === -1) {
    throw base64.makeDOMException();
  }
  return idx;
}
base64.decode = function(s) {
  s = '' + s;
  var getbyte64 = base64.getbyte64;
  var pads, i, b10;
  var imax = s.length
  if (imax === 0) {
    return s;
  }
  if (imax % 4 !== 0) {
    throw base64.makeDOMException();
  }
  pads = 0
  if (s.charAt(imax - 1) === base64.PADCHAR) {
    pads = 1;
    if (s.charAt(imax - 2) === base64.PADCHAR) {
      pads = 2;
    }
    imax -= 4;
  }
  var x = [];
  for (i = 0; i < imax; i += 4) {
    b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) | (getbyte64(s, i + 2) << 6) | getbyte64(s, i + 3);
    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
  }
  switch (pads) {
  case 1:
    b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12) | (getbyte64(s, i + 2) << 6);
    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
    break;
  case 2:
    b10 = (getbyte64(s, i) << 18) | (getbyte64(s, i + 1) << 12);
    x.push(String.fromCharCode(b10 >> 16));
    break;
  }
  return x.join('');
}
base64.getbyte = function(s, i) {
  var x = s.charCodeAt(i);
  if (x > 255) {
    throw base64.makeDOMException();
  }
  return x;
}
base64.encode = function(s) {
  if (arguments.length !== 1) {
    throw new SyntaxError("Not enough arguments");
  }
  var padchar = base64.PADCHAR;
  var alpha = base64.ALPHA;
  var getbyte = base64.getbyte;
  var i, b10;
  var x = [];
  s = '' + s;
  var imax = s.length - s.length % 3;
  if (s.length === 0) {
    return s;
  }
  for (i = 0; i < imax; i += 3) {
    b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8) | getbyte(s, i + 2);
    x.push(alpha.charAt(b10 >> 18));
    x.push(alpha.charAt((b10 >> 12) & 0x3F));
    x.push(alpha.charAt((b10 >> 6) & 0x3f));
    x.push(alpha.charAt(b10 & 0x3f));
  }
  switch (s.length - imax) {
  case 1:
    b10 = getbyte(s, i) << 16;
    x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) + padchar + padchar);
    break;
  case 2:
    b10 = (getbyte(s, i) << 16) | (getbyte(s, i + 1) << 8);
    x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) + alpha.charAt((b10 >> 6) & 0x3f) + padchar);
    break;
  }
  return x.join('');
};
