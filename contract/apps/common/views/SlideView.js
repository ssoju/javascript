define([
	'backbone',
	'underscore',
	'apps/common/views/ModalView',
], function(Backbone, _, ModalView){

	var $body = $('body');

	var SlideView = ModalView.extend({
		tagName: 'div',
		className: 'slideview',
		open: function(){
			var me = this;
							
			$body.append(me.el);	
			me.slideUp();

			return me;
		},
		close: function(){
			this.slideDown();
		},

		slideDown: function(cb){
			var me = this;

			me.direction = 'down';

			me.$el.css({'top': '100%'});
			me.timerSlideDown = setTimeout(function(){
				me.remove();
			}, 1000);

		},

		slideUp: function(){
			var me = this;

			me.direction = 'up';		
			
			me.$overlay.show();
			me.$el.removeClass('ani').css({'top': '100%'}).show().addClass('ani');

			setTimeout(function(){
				me.$el.css({'top': 0});
			}, 100);
		},
		
		render: function() {
			var me = this,
				$el = me.$el;

            $el.off('transitionend').on('transitionend', function(){
				if(me.direction === 'up') {
					me.trigger('slide:up');
                    me.trigger('modal:open');
					window.ModalManager.preventScroll();
				} else {
					me.trigger('slide:down');
                    me.trigger('modal:close');
					window.ModalManager.preventScroll(false);

					me.remove();
				}
				clearTimeout(me.timerSlideDown);
			});

			return me;
		}

	});

	return SlideView;
});