define([
    'baseview',
    'underscore',
    'jquery',
    'pubsub',
    'text!../templates/ContactsView.html'
], function(BaseView, _, $, PubSub, tmpl) {
    var $win = $(window);

	var MainView = BaseView.extend({
        tagName: 'div',
        className: 'wrap_contents',
        templateStr: tmpl,
		initialize: function(){
			BaseView.prototype.initialize.apply(this, arguments);

			var me = this;

			PubSub.off('.contacts').on('search.contacts', function(e, data){
				me.collection.fetch({
					data: {
						search: data.searchText
					}
				}).done(function(res){
					if(res.status){
						me.render();
					} else {
						me.remove();
					}
				});
			});
		},
		render: function () {
            var me = this;

			this.$el.html(this.template(this.collection));

            return this;
		},
        remove: function() {
			console.log('contact remove');
			var me = this;
			if(me.slideView){
				me.slideView.remove();
				me.slideView = null;
			}
			PubSub.off('.contacts');
            $win.off('.contactsScroller');

            BaseView.prototype.remove.call(this);
        }
	});

	return MainView;
});