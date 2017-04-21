/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
(function($, core, ui, undefined) {
    var $win = core.$win,
        $doc = core.$doc;

	
	// 서브페이지의 드롭다운  네비게이션
	ui('DropdownLocation', {
        /**
         * @constructor
         * @param el
         * @param options
         */
		initialize: function(el, options) {
			var me = this;
			if(me.callParent(el, options) === false) { return; }

			me._bindEvents();
		},

        /**
         *
         * @private
         */
		_bindEvents: function() {
			var me = this;

            // 클릭에 의한 포커스랑 탭키에 대한 포커스를 분기(클릭과 포커스인이 같은 기능이기에..)
			me.on('click', '>a.sel', function(e) {
				e.preventDefault();
				var $el = $(this);
				if($el.data('byfocus')){ $el.removeData('byfocus'); return; }
				me.toggleDropdown(!me.$el.hasClass('on'));
			}).on('click', function(e){
				e.stopPropagation();
			}).on('focusin', '>a.sel', function(e) { 
				$(this).data('byfocus', true); 
				me.toggleDropdown(true);
			});

			var timer = null;
            // 탭키에 의해서 포커스가 드롭다운 레이어를 빠져나가면 레이어를 닫는다.
			me.on('focusin focusout', 'a', function(e) {
				clearTimeout(timer);
				switch(e.type) {
					case 'focusout':
					timer = setTimeout(function() {
						me.toggleDropdown(false);
					}, 200);
					break;
				}
			});
		},

        /**
         *
         * @param {Boolean} toggle 드롭다운 레이어에 대한 토글값
         */
		toggleDropdown: function(toggle) {
			var me = this;
			if(toggle){
				me.$el.addClass('on');
				core.$doc.on('click.dropdownlocation', function(e) {
					me.toggleDropdown(false);
				});
			} else {
				me.$el.removeClass('on');
				me.$('>a.sel').removeData('byfocus');
				core.$doc.off('.dropdownlocation');				
			}
		}
	});

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);
