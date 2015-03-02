define([
    'backbone',
    './HeaderView',
    './FooterView'
], function (Backbone, HeaderView, FooterView) {

	var MainView = Backbone.View.extend({
		initialize: function () {
			this.subviews = [];
		},

		render: function () {
			var headerView = new HeaderView();
			this.subviews.push(headerView);
			this.$el.append(headerView.render().el);

			var footerView = new FooterView();
			this.subviews.push(footerView);
			this.$el.append(footerView.render().el);

			return this;
		}
	});

	return MainView;
});
