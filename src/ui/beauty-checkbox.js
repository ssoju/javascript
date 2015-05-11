/*!
 * @author beauty-checkbox
 * @email comahead@gmail.com
 * @create 2015-03-20
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    core.beautyCheckbox = function(selector) {
        selector || (selector = 'input[type=checkbox]:not(._rc_), input[type=radio]:not(._rc_)');

        var $items = $(selector).not('._rc_').addClass('_rc_');
        $items.wrap('<span></span>').parent()
            .addClass('ui_radiocheck')
            .css({'display': 'inline-block', 'overflow': 'hidden', 'position': 'relative'});

        $items.css({
            position: 'absolute',
            left: '-10%',
            top: '-10%',
            width: '120%',
            height: '120%',
            opacity: 0
        }).each(function(){
            $(this).parent().toggleClass('checked', $(this).prop('checked'));
        });
    };

    $(function(){

        $(document).on('click', '', function(e) {
            var $el = $(this);
            $el.parent().toggleClass('checked', $el.prop('checked'));
        }).on('click', 'input._rc_[type=radio], input[type=checkbox]._rc_', function(e){
            var $el = $(this);
            if($el.is('[type=radio]')) {
                $(this.form).find('._rc_[name="' + this.name + '"]').not(this).parent().removeClass('checked');
            }
            $el.parent().toggleClass('checked', $el.prop('checked'));
        }).on('focusin focusout', 'input._rc_[type=checkbox], input._rc_[type=radio]', function(e) {
            switch(e.type) {
                case 'focusin':
                    $(this).parent().addClass('focus');
                    break;
                case 'focusout':
                    $(this).parent().removeClass('focus');
                    break;
            }
        });

    });


})(window, jQuery, window[LIB_NAME]);