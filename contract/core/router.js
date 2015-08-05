define([
    'backbone',
    'underscore',
    'configs',
    './viewManager'
], function(Backbone, _, configs, viewManager) {

    var routes = {
            routes: {}
        },
        currentPath,
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
                    if(currentPath === location.pathname && app.onChangeParameter) {
                        app.onChangeParameter.apply(app, args);
                        return;
                    }
                    currentPath = location.pathname;
                    app.run(viewManager, args);
                });
            }
        };
    });

    return Backbone.Router.extend(routes);
});