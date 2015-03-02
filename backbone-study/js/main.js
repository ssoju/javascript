require(['core/router', 'core/client', 'backbone', 'jquery'], function (Router, client, Backbone, $) {
	var app = {
		root: '/'
	};

	window.Router = new Router();
	client.setup(window, app);

	Backbone.history.start({ pushState: true });
});
