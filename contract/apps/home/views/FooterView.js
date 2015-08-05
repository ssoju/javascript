define([
    'backbone',
    'handlebars',
    'text!./../templates/FooterView.html'
], function (Backbone, Handlebars, tmpl) {
    console.log(tmpl);

	var FooterView = Backbone.View.extend({
		template: Handlebars.compile(tmpl),

		render: function () {
			this.$el.html(this.template());
			return this;
		}
	});

	return FooterView;
});