define([
	'backbone',
	'underscore',
	'baseview',
	'pubsub'
], function(Backbone, _, BaseView, PubSub){

	var _zIndex = 9000,
		zIndex = function(dim) {
			return (_zIndex += dim);
		},
		$html = $('html, body'),
		$body = $('body');

	var ModalView = BaseView.extend({
		tagName: 'div',
		className: 'wrap_layer full',
		initialize: function(){
			ModalView.__super__.initialize.apply(this, arguments);

			var me = this;
			
			me.$el.hide();
			if(me.options.content){
				me.$el.html(me.options.content);
			}

			me.$el.on('click', '.close', _.bind(me.close, me));
			me.$overlay = $('<div>', {'class': 'overlay', 'style': 'display:none'}).hide().appendTo('body');

			window.ModalManager.add(this);
		},
		open: function(){
			var me = this;
			
			me.$overlay.show();
			$body.append(me.el);

			if(me.options.closeByOverlay){
				me.$overlay.on('click', function(){ me.close(); });
			}
			if(me.options.content || me.options.autoPosition){
				me._reposition();
			}
			me.$el.fadeIn(function(){
				window.ModalManager.preventScroll();

				me.trigger('modal:open');
			});

            var el = me.$('a, button, input, button').get(0);
            if(el){ el.focus(); }
			return me;
		},
		_reposition: function(){
			var me = this, w, h;

			me.$el.css('visibility', 'hidden');
			w = me.$el.width();
			h = me.$el.height();
			me.$el.css({
				'visibility': '',
				'margin-left': -(w/2),
				'margin-top': -(h/2),
				'top': '50%',
				'left': '50%'
			});
			if(me.options.cssStyle){
				me.$el.css(me.options.cssStyle);
			}
		},
		close: function(cb){
			var me = this;

			me.$el.fadeOut(function(){
				me.remove();

				me.trigger('modal:close');
			});
		},
		remove: function(){
			var me = this;

			console.log('modal remove');

			me.$overlay.remove();
			me.$el.off().remove();
			PubSub.off('.modalview');

			ModalView.__super__.remove.call(me);
			window.ModalManager.remove(me);
		}
	});

	return ModalView;
});