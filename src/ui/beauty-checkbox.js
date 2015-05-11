/*!
 * @author beauty-checkbox
 * @email comahead@gmail.com
 * @create 2013-03-20
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";


	$(document).on('click', 'input[type=radio], input[type=checkbox]', function(e) {
		var $el = $(this);
		$el.parent().toggleClass('checked', $el.prop('checked'));
		if($el.is('[type=radio]')) {
			$(this.form).find('[name="' + this.name + '"]').not(this).parent().removeClass('checked');
		}
	}).on('focusin focusout', 'input[type=checkbox], input[type=radio]', function(e) {
		switch(e.type) {
			case 'focusin':
				$(this).parent().addClass('focus');
				break;
			case 'focusout':
				$(this).parent().removeClass('focus');
				break;
		}
	});

	var inputs = document.getElementsByTagName('input');
	setInterval(function(){
		for(var i = 0, item; item = inputs[i++]; ){
			if((item.type === 'checkbox' || item.type === 'radio') && !item.getAttribute('data-chr-bind')) {
				$(item).parent().toggleClass('checked', item.checked);
				item.setAttribute('data-chr-bind', 'true');
			}
		}
	}, 300);


})(window, jQuery, window[LIB_NAME]);