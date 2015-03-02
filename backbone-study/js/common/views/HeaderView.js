define([
    'backbone',
	'jquery',
	'underscore',
	'pubsub',
	'libs/jquery.cookie'
], function (Backbone, $, _, PubSub) {

	var HeaderView = Backbone.View.extend({
        el: '#gnb',
        events: {
            'click >button': 'onNavClick',
			'click ul a': 'onLinkClick'
        },
        initialize: function () {
            var me = this;
			
			me._bindEvents();
		},
		_bindEvents: function() {
			var me = this;

			var $frm = $('#searcher form').on('submit', function(e){
				e.preventDefault();
				var $el = $(this);
				// 검색버튼이 클릭되면 글로벌이벤트를 날린다. 필요한곳에서 알아서 처리하겠지..
				PubSub.trigger('search', {searchText: $el.find('input[type=text]').val()});
				$el.find('input[type=text]').val('');
			});

			// 페이지 전환시 상단 검색폼 리셋
			PubSub.on('view:before', function(){
				$frm[0].reset();
				me.$el.removeClass('on');
			});

			$(window).on('scroll', _.debounce(function(){
				me.$el.removeClass('on');
			}, 100));

        },
        onNavClick: function (e) {
            e.preventDefault();

			var me = this, $el = $(e.currentTarget), dir;
			if($el.hasClass('gnb_arr_tb')){
				if(me.$el.hasClass('lt')){
					dir = 'lb'; 
				} else if(me.$el.hasClass('lb')){
					dir = 'lt'; 
				} else if(me.$el.hasClass('rb')){
					dir = 'rt'; 
				} else if(me.$el.hasClass('rt')){
					dir = 'rb'; 
				}
			} else if($el.hasClass('gnb_arr_rl')){
				if(me.$el.hasClass('lt')){
					dir = 'rt'; 
				} else if(me.$el.hasClass('lb')){
					dir = 'rb'; 
				} else if(me.$el.hasClass('rb')){
					dir = 'lb'; 
				} else if(me.$el.hasClass('rt')){
					dir = 'lt'; 
				}
			}
			if(dir){ 
				me.$el.removeClass('lt lb rt rb').addClass(dir)
				$.cookie('nav_dir', dir, { expires: 7 });
				return; 
			}

            me.$el.toggleClass('on');
		},
		onLinkClick: function(e){

			/*setTimeout(_.bind(function(){
				this.$el.removeClass('on');
			}, this), 200);*/
		}
	});
	return HeaderView;
});
