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


})(window, jQuery, window[LIB_NAME]);