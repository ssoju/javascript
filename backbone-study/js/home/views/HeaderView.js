define([
    'backbone',
    'handlebars',
    'text!./../templates/HeaderView.html'
], function (Backbone, Handlebars, tmpl) {

	var HeaderView = Backbone.View.extend({
		template: Handlebars.compile(tmpl),

		render: function () {
			this.$el.html(this.template({title: '바이널C 연락망'}));
			return this;
		}
	});

	return HeaderView;
});
