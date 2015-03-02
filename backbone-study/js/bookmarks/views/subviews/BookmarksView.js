define([
    'baseview',
    'text!./../../templates/BookmarksView.html'
], function(BaseView, tmpl) {

	var BookmarksView = BaseView.extend({
		templateStr: tmpl,

		render: function () {
            this.$el.html(this.template({items: this.collection.toJSON()}));
            return this;
		}
	});

	return BookmarksView;
});
