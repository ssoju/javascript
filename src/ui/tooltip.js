/*!
 * @module vcui.ui.Tooltip
 * @license MIT License
 * @description 툴팁 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/tooltip', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    /**
     * 툴팁 레이어
     * @class
     * @name vcui.ui.Tooltip
     * @extends vcui.ui.View
     */
    var Tooltip = core.ui('Tooltip', /** @lends vcui.ui.Tooltip# */{
        $singleton: true,
        bindjQuery: 'tooltip',
        defaults: {
            interval: 200,
            attrName: "data-tooltip"
        },
        templates: {
            tooltip: '<span class="ui_tooltip" role="tooltip" id="uiTooltip" style="z-index:100000;display:none;max-width:200px;height:auto;position:fixed;border:1px solid red;background:blue;" aria-hidden="true"><span class="arrow"></span><span class="message"></span></span>'
        },
        initialize(el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self._bindEvents();
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents() {
            var self = this;
            var $tooltip = self.$tooltip = $(self.tmpl('tooltip')).appendTo('body');
            var attr = self.options.attrName;
            var scrollWidth = core.detect.isWin ? 20 : 0;

            self.docOn('mouseenter mouseleave focusin focusout click', '[data-title]:not([disabled]), [' + attr + ']:not([disabled])', function (e) {

                switch (e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        let el = self.activeEl = this,
                            title = '';

                        title = core.string.escapeHTML(el.getAttribute(attr) || el.getAttribute('data-tooltip'));
                        if (!title) {
                            self._close(false);
                            return;
                        }

                        if (attr === 'title' && el.getAttribute(attr)) {
                            el.setAttribute('data-title', el.getAttribute(attr));
                            el.setAttribute('aria-describedby', 'uiTooltip')
                            el.removeAttribute(attr);
                        }

                        self.showTimer = setTimeout(function () {
                            if (!el || !title) {
                                return;
                            }

                            var measure = core.dom.getDimensions(el);
                            if (measure.left === 0 && measure.top === 0) {
                                self._close();
                                return;
                            }

                            $tooltip.children('.message').html(title);
                            var tooltipWidth = $tooltip.outerWidth(),
                                tooltipHeight = $tooltip.outerHeight(),
                                isUpOut = measure.top - tooltipHeight < 8,
                                diff = measure.width - tooltipWidth,
                                rightOffset,
                                pos = {};

                            if (isUpOut) {
                                $tooltip.removeClass('top bottom').addClass('top');
                                pos.top = measure.top + measure.height + 10;
                            } else {
                                $tooltip.removeClass('top bottom').addClass('bottom');
                                pos.top = measure.top - tooltipHeight - 8;
                            }

                            pos.left = measure.left + (diff / 2);
                            rightOffset = (pos.left + tooltipWidth) - (window.innerWidth - scrollWidth + core.dom.getScrollLeft());

                            if (pos.left < 0) {
                                $tooltip.children('.arrow').css('marginLeft', pos.left);
                                pos.left = 0;
                            } else if (rightOffset > 0) {
                                $tooltip.children('.arrow').css('marginLeft', rightOffset);
                                pos.left -= rightOffset;
                            } else {
                                $tooltip.children('.arrow').css('marginLeft', '');
                            }

                            $tooltip.css(pos).fadeIn('fast');
                            $tooltip.attr('aria-hidden', 'false');
                            self.isShow = true;

                        }, 500);
                        break;
                    case 'mouseleave':
                    case 'focusout':
                        self._close();
                        break;
                }
            }).on('mousedown', function () {
                self._close();
            });

            self.winOn('scroll', function () {
                self._close();
            })
        },
        _close(effect) {
            const self = this;
            clearTimeout(self.showTimer);
            clearTimeout(self.hideTimer);
            self.hideTimer = self.showTimer = null;

            if (self.activeEl) {
                self.activeEl = null;
            }

            if (!self.isShow) {
                return;
            }
            self.isShow = false;

            if (effect) {
                self.$tooltip.fadeOut('fast');
            } else {
                self.$tooltip.hide();
            }
            self.$tooltip.css({'top': '', 'left': ''}).children('.arrow').css({'marginLeft': ''});
            self.$tooltip.attr('aria-hidden', 'true');
        }
    });

    return Tooltip;
});
