window.siteConfigs = {

};

var pendingRequests = {};
$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
  var key = options.url;

  if (!pendingRequests[key]) {
    pendingRequests[key] = jqXHR;
  } else {
    //jqXHR.abort(); // Submission after giving up 
    pendingRequests[key].abort(); //  To give up the first trigger 
  }

  var complete = options.complete;
  options.complete = function(jqXHR, textStatus) {
    delete pendingRequests[key];
    
    if ($.isFunction(complete)) {
      complete.apply(this, arguments);
    }
  };
});
