define([
    'baseview',
	'jquery',
    'iscroll',
	'apps/common/views/SlideView',
	'../../models/Contact',
    'text!./../../templates/ContactView.html'
], function (BaseView, $, IScroll, SlideView, ContactModel, tmpl) {
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
			ContactView.__super__.initialize.apply(me, arguments);

			me.model = new ContactModel({id: me.id});
			me.on('slide:up', function(){
				console.log('slide:up');
                setTimeout(function () {
                    me.$el.find('.img[data-img]').css('background-image', function () {
                        return 'url(' + $(this).attr('data-img') + ')';
                    });
                }, 30);
			});
		},

		open: function(){
			var me = this;

			me.model.fetch().done(function(res){
				if(res.status){
					me.render();
					ContactView.__super__.open.apply(me, arguments);
				} else {
					me.remove();
				}
			});
		},

		render: function () {
			var me = this;
			
			me.$el.html(me.template({member: me.model.toJSON()}));
			setTimeout(function(){
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