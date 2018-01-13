var z = document.getElementsByClassName("zoomable")[0];
var baseWidth = 500;
var padding = 100;

var zoomStep = 30;

// Based on http://www.sitepoint.com/html5-javascript-mouse-wheel/
var handleWheel = function (event) 
{
  // cross-browser wheel delta
  // Chrome / IE: both are set to the same thing - WheelEvent for Chrome, MouseWheelEvent for IE
  // Firefox: first one is undefined, second one is MouseScrollEvent
  var e = window.event || event;
  // Chrome / IE: first one is +/-120 (positive on mouse up), second one is zero
  // Firefox: first one is undefined, second one is -/+3 (negative on mouse up)
  var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));

  // Do something with `delta`
  var zz = z.clientWidth - padding + zoomStep * delta;
  zz = Math.max(zoomStep, Math.min(2 * baseWidth, zz));
  z.style.width = zz + "px";
  z.innerHTML = "<small>" + window.event + " | " + event +
      "</small><br><small>" +   e.wheelDelta + " | " + e.detail + 
      "</small><br>" + delta + " | " + zz + " | " + z.clientWidth + "px";

  e.preventDefault();
};

var addMouseWheelEventListener = function (scrollHandler)
{
  if (window.addEventListener) 
  {
    // IE9+, Chrome, Safari, Opera
    window.addEventListener("mousewheel", scrollHandler, false);
    // Firefox
    window.addEventListener("DOMMouseScroll", scrollHandler, false);
  } 
  else 
  {
    // // IE 6/7/8
    window.attachEvent("onmousewheel", scrollHandler);
  }
}

addMouseWheelEventListener(handleWheel);
