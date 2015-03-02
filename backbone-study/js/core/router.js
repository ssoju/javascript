define([
    'backbone',
    'underscore',
    'configs',
    './viewManager'
], function(Backbone, _, configs, viewManager) {

    var routes = {
            routes: {}
        },
        idx = 0;

    _.each(configs.routes, function (item) {
        var funcName = '_route_'+(idx++);
        routes.routes[item.path] = funcName;
        routes[funcName] = function() {
			var args = [].slice.call(arguments);
            if(item.location){
				location.href = item.location;
			} else if(item.redirect) {
                Backbone.history.navigate(item.redirect, true);
            } else {
                require([].concat(item.app), function (app) {
                    app.run(viewManager, args);
                });
            }
        };
    });

    return Backbone.Router.extend(routes);
});
