define([
    'baseview',
	'jquery',
    'iscroll',
    'hammer',
	'apps/common/views/SlideView',
	'../../models/Contact',
    'text!./../../templates/ContactView.html'
], function (BaseView, $, IScroll, Hammer, SlideView, ContactModel, tmpl) {
	var $body = $('body');

	var ContactView = SlideView.extend({
		templateStr: tmpl,
		events: {
			'click .close_detail': function(e){
				e.preventDefault();

				this.close();
			}
		},
		initialize: function(){
			var me = this;
			ContactView.__super__.initialize.call(me);

			me.model = new ContactModel({id: me.id});
			me.model.fetch().done(function(res){
				if(res.status){
					me.render();
				} else {
					me.remove();
				}
			});
		},
		render: function () {
			var me = this;
			setTimeout(function(){
				me.$el.html(me.template({member: me.model.toJSON()}));
				me._bind();
			}, 60);

			ContactView.__super__.render.call(me);
			return me;
		},

		remove: function(){
			console.log('contact remove');
			var me = this, $el = me.$el;

			me._destroyIScroll();

			$el.off().remove();
			ContactView.__super__.remove.call(me);			
		},

		_destroyIScroll: function() {
			var me = this,
				$el = me.$el;
			
			if($el.data('iscroll')){
				$el.data('iscroll').destroy(); 
				$el.removeData('iscroll');
				me.iscroll = null;
			}
		},

		_bind: function() {
			var me = this,
				$el = me.$el,
				top = 0, time;
						
			me._destroyIScroll();

			$el.data('iscroll', me.iscroll = new IScroll(me.$('.wrapper')[0], {
				vScroll: false, 
				probeType: 3,
				mouseWheel: true,
				scrollbars: false,
                click:true
			}));
		}
	});

	return ContactView;
});
