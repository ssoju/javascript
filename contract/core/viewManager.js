define(['jquery', 'pubsub', './transition'], function ($, PubSub, transition) {

    var viewManager = (function () {
		var currentView;
		var transitionType = $('#app').data('transition'),
            $header = $('#header'),
            $title= $header.find('.page-title');

		function showView(app, view, cb) {
			PubSub.trigger('view:before');

			disposeView(currentView, function () {
				render(view);
                $title.html(app.title || '사내연락망');
                $header.toggleClass('search', app.search === true);
                cb && cb();
			});
		}

		function disposeView(view, callback) {
			if (!view) {
				return callback();
			}

			return applyTransition(view.$el, transitionType, function () {
				_disposeView(view);
				return callback();
			});

			function applyTransition(el, name, callback) {
				if (!name) {
					return callback();
				}

				return transition.apply(el, name, callback);
			}

			function _disposeView(view) {
				view.subviews && view.subviews.forEach(function (subview) {
					_disposeView(subview);
				});

				view.remove();
			}
		}

		function render(view) {
			currentView = view;

			$("#app").html(currentView.el);
			currentView.render();

			PubSub.trigger('route:after');
			PubSub.trigger('view:after');
		}

		return {
			show: showView
		};
	})();

	return viewManager;
});