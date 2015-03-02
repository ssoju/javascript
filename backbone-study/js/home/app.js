define([
    './views/MainView'
], function(MainView) {
	return {
		run: function (viewManager) {
			var view = new MainView();
			viewManager.show(view);
		}
	};
});
