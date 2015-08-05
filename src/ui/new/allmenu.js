/** * Created by ê¹??¹ì¼ì±…ìž„(comahead@vi-nyl.com<mailto:comahead@vi-nyl.com>) on 2015-02-22. */ (function ($, core) {
    "use strict";
    var _elementStyle = document.createElement('div').style;
    var _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'], transform, i = 0, l = vendors.length;
        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
        }
        return false;
    })();

    function _prefixStyle(style, isLower) {
        if (_vendor === false) return isLower ? style.toLowerCase() : style;
        if (_vendor === '') return isLower ? style.toLowerCase() : style;
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    var cssTransform = _prefixStyle('transform'), cssTransition = _prefixStyle('transition'), transitionEnd = _prefixStyle('TransitionEnd', true);
    var MobileAllMenu = core.ui('MobileAllMenu', {
        selectors: {
            lNavWrapper: '.l_nav',
            lNavScroller: '.l_nav>*:eq(0)',
            lNavMenus: '.l_nav li:gt(0)',
            dNavWrapper: '.d_nav .h_box',
            dNavScroller: '.d_nav .mov_box',
            dNavNavList: '.d_nav .nav_list',
            dNavNavHeaders: '.d_nav .nav_list>p',
            mask: '.modal',
            staticSec: '.d_nav .static_sec'
        }, events: {}, initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }
            me.$lNavScroller.css('height', 'auto');
            me.$el.css('zIndex', 9001).after(me.$mask.css({
                'opacity': .5,
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'right': 0,
                'background': '#000',
                'zIndex': 9000
            }));
            me._bindEvents();
        }, _bindEvents: function () {
            var me = this;
            core.importJs(['modules/smooth-scroll'], function () {
                me.leftMenuScroll = new core.ui.SmoothScroll(me.$lNavWrapper, {selectors: {scroller: '>*:eq(0)'}});
                me.rightMenuScroll = new core.ui.SmoothScroll(me.$dNavWrapper, {selectors: {scroller: '.mov_box'}});
                var flag = false, prevIndex;
                me.on('click', '.menu_close', function (e) {
                    e.preventDefault();
                    me.close();
                }).on('click', '.d_nav .nav_list a', function () {
                    $(this).closest('li').toggleClass('on');
                    me._refresh();
                }).on('focusin', '.d_nav .mov_box a', function () {
                    var top;
                    if (Math.abs(me.rightMenuScroll.y) > (top = $(this).position().top)) {
                        flag = true;
                        me.rightMenuScroll.scrollTo(0, -top, 0);
                    }
                }).on('click', '.l_nav li>a', function (e) {
                    e.preventDefault();
                    var idx = me.$lNavMenus.index($(this).parent());
                    if (idx >= 0) {
                        var top = me.$dNavNavHeaders.eq(idx).position().top + me.$dNavNavList.position().top;
                        me.rightMenuScroll.scrollTo(0, -top, 200);
                    } else {
                        me.rightMenuScroll.scrollTo(0, 0, 200);
                    }
                });
                me.rightMenuScroll.on('smoothscrollmove', function (e, data) {
                    var lastIndex;
                    for (var i = 0; i < me.tops.length; i++) {
                        if (me.tops[i] - 8 >= Math.abs(data.y)) {
                            lastIndex = i - 1;
                            break;
                        }
                    }
                    if (lastIndex !== undefined && prevIndex !== lastIndex) {
                        me.$lNavMenus.removeClass('on').eq(prevIndex = lastIndex).addClass('on');
                    }
                });
                me.$dNavWrapper.on('scroll', function () {
                    if (flag) {
                        flag = false;
                        return;
                    }
                    flag = true;
                    var top = me.$dNavWrapper.scrollTop() + Math.abs(me.rightMenuScroll.y);
                    me.rightMenuScroll.scrollTo(0, -top, 0);
                    me.$dNavWrapper.scrollTop(0);
                });
                $(window).on('resizeend.' + me.cid, function () {
                    if (!me.opened) {
                        return;
                    }
                    me._refresh();
                }).on('resize.' + me.cid + ' scrollend.' + me.cid, function () {
                    me._resize();
                });
                me._forceFocusin();
            });
            if (core.css3.support) {
                me.$el.on(transitionEnd, function () {
                    me._complete(me.opened);
                });
            }
        }, _refresh: function () {
            if (!this.opened) {
                return;
            }
            var me = this, winHeight = core.util.getWinHeight(), wrapperHeight = winHeight - me.$staticSec.height(), lastBoxHeight = me.$dNavNavHeaders.last().outerHeight() + me.$dNavNavList.find('>ul:last').height(), scrollHeight = me.$dNavScroller.css('height', 'auto').height();
            me.$dNavScroller.css('height', Math.max(scrollHeight, scrollHeight + (wrapperHeight - lastBoxHeight)));
            me.leftMenuScroll && me.leftMenuScroll.refresh();
            me.rightMenuScroll && me.rightMenuScroll.refresh();
            me._updateHeaderTop();
        }, _resize: function () {
            var me = this;
            if (!me.opened) {
                return;
            }
            var winHeight = core.util.getWinHeight(), wrapperHeight = winHeight - me.$staticSec.height();
            me.$el.css('height', winHeight);
            me.$mask.css('height', core.util.getDocHeight());
            me.$lNavWrapper.css('height', winHeight);
            me.$dNavWrapper.css('height', wrapperHeight);
        }, _updateHeaderTop: function () {
            var me = this;
            me.tops = [];
            var navTop = me.$dNavNavList.css('position', 'relative').position().top;
            me.$dNavNavHeaders.each(function () {
                me.tops.push($(this).position().top + navTop);
            });
            me.tops.push(me.$dNavScroller.height());
        }, _forceFocusin: function (isBind) {
            var me = this, $doc = $(document);
            if (isBind !== false) {
                $doc.on('focusin.' + me.cid, function (e) {
                    if (!me.opened) {
                        return;
                    }
                    if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
                        me.$el.find(':focusable:visible').first().focus();
                        e.stopPropagation();
                    }
                });
            } else {
                $doc.off('focusin.' + me.cid);
            }
        }, open: function (isAnimate) {
            var me = this;
            me.opened = true;
            me._resize();
            me.triggerHandler('allmenuopen');
            if (core.css3.support) {
                me.$el.css(cssTransform, 'translateX(-' + core.util.getWinWidth() + 'px)').show();
            } else {
                me.$el.css({'left': -core.util.getWinWidth()}).show();
            }
            if (isAnimate !== false) {
                me.$mask.css('height', core.util.getDocHeight()).show();
                me._animate(0, 0.3);
            } else {
                me._animate(0, 0);
            }
        }, close: function (isAnimate) {
            var me = this;
            me.opened = false;
            if (isAnimate !== false) {
                me._animate(-me.$el.width(), 0.3);
            } else {
                me._animate(-me.$el.width(), 0);
            }
            me.triggerHandler('allmenuclose');
        }, _animate: core.css3.support ? function (left, time) {
            var me = this;
            me.$el.css(cssTransition, 'all ' + (time === 0 ? 0 : '0.3') + 's ease-in-out');
            me.$el.css(cssTransform, 'translate(' + left + 'px, 0px) translateZ(0px)');
            if (!time) {
                me._complete(me.opened);
            }
        } : function (left, time) {
            var me = this;
            if (time === 0) {
                me.$el.css('left', left).toggle(left === 0);
                me._complete(me.opened);
            } else {
                me.$el.animate({left: left}, {
                    duration: 'fast', complete: function () {
                        me._complete(me.opened);
                    }
                });
            }
        }, _complete: function (isOpen) {
            var me = this;
            if (isOpen) { //core.ui.setBodyOverflow(true);
                $(window).triggerHandler('resize.' + me.cid);
                me._refresh();
                me.$el.find(':focusable:visible:eq(0)').focus();
            } else {
                me.$el.hide();
                me.$mask.hide();
//core.ui.setBodyOverflow(false);
            }
        }, release: function () {
            var me = this;
            me._forceFocusin(false);
            me.$dNavWrapper.off();
            me.$dNavScroller.off();
            me.supr();
            core.ui.removedClean();
        }
    });
    var PcAllMenu = core.ui('PcAllMenu', {
        selectors: {}, open: function () {
            this.$el.show();
            this.opened = true;
            this.triggerHandler('allmenuopen')
        }, close: function () {
            this.$el.hide();
            this.opened = false;
            this.triggerHandler('allmenuclose');
        }
    });
    var AllMenu = core.ui('AllMenu', {
        $singleton: true,
        bindjQuery: 'allMenu',
        defaults: {},
        selectors: {},
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }
            if (location.href.indexOf('allmenu') < 0) {
                $('.ui_all_menu_content').hide();
            }
            me.$htop = $('#htop');
            me.$skipNavi = $('.skip');
            me.$mainSec = $('.main_sec, .main, .subm');
            me._bindEvents();
        },
        _bindEvents: function () {
            var me = this;
            me.$('button.all_menu').on('click', function (e) {
                e.preventDefault();
                if (!me.menuOpended) {
                    me.getMenu().open();
                    $(this).html('?„ì²´ë©”ë‰´ ?«ê¸°');
                } else {
                    me.pcMenu && me.pcMenu.close();
                    me.mobileMenu && me.mobileMenu.close();
                    $(this).html('?„ì²´ë©”ë‰´ ?´ê¸°');
                }
            });
        },
        _revertWorks: function () {
            var me = this;
            if ($(window).scrollTop() > me.$skipNavi.height()) {
                me.$htop.add(me.$mainSec).addClass('fixed');
            } else {
                me.$htop.add(me.$mainSec).removeClass('fixed');
            }
            me.$htop.css({'position': '', 'top': ''});
        },
        _isMobileSize: function () {
            return $(window).width() <= core.consts.MOBILE_SIZE;
        },
        _onMenuOpen: function (mode) {
            var me = this;
            me.menuOpended = true;
            me.menuMode = mode;
            $(window).off('resize.' + me.cid).on('resize.' + me.cid, function (e, data) {
                if (!me.menuOpended) {
                    return;
                }
                var newMode = me._isMobileSize() ? 'mobile' : 'pc';
                if (newMode !== me.menuMode) {
                    me._revertWorks();
                    me.getMenu(me.menuMode).close(false);
                }
            });
        },
        _onMenuClose: function (e) {
            var me = this;
            me.menuOpended = false;
            $(window).off('resize.' + me.cid);
        },
        getMenu: function (type) {
            var me = this;
            if (type === undefined) {
                type = me._isMobileSize() ? 'mobile' : 'pc';
            }
            if (type === 'mobile') {
                return me.mobileMenu || (function () {
                        me.mobileMenu = new MobileAllMenu(me.$el.find('.mobile_dom'));
                        me.mobileMenu.on('allmenuopen', function () {
                            me._onMenuOpen('mobile');
                        }).on('allmenuclose', me._onMenuClose.bind(me));
                        return me.mobileMenu;
                    })();
            } else if (type === 'pc') {
                return me.pcMenu || (function () {
                        me.pcMenu = new PcAllMenu(me.$el.find('.pc_dom'));
                        me.pcMenu.on('allmenuopen', function () {
                            me._onMenuOpen('pc');
                        }).on('allmenuclose', me._onMenuClose.bind(me));
                        return me.pcMenu;
                    })();
            }
        }
    });
})(jQuery, window[LIB_NAME]);
