/*!
 * @author axl.ui.modal.js
 * @email comahead@gmail.com
 * @create 2013-11-25
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";
    var $doc = $(document),
        $win = $(window),
        browser = core.browser,
        ui = core.ui,
        isTouch = browser.isTouch,
        _zIndex = 9000;


    var ModalManager = {
        init: function(options) {
            var me = this;

            me.options = $.extend({}, options);
            me.stack = [];
            me.active = null;

            me._bind();
        },

        _bind: function() {
            var me = this;

            $win.on('resizeend.modalmanager', function() {
                for(var i = -1, modal; modal = me.stack[++i];){
                    modal.isShown && modal.center();
                }
            });

            $doc.on('modal:show.modalmanager', '.ui_modal_container', function(e) {
                var $modal = $(e.currentTarget),
                    modal = $modal.modal('instance'),
                    zIndex = me.nextZIndex();

                modal.$overlay && modal.$overlay.css('zIndex', zIndex++);
                modal.$el && modal.$el.css('zIndex', zIndex++);

                me.active = modal;
                me.add(modal);

            }).on('modal:hidden', '.ui_modal_container', function(e) {
                var $modal = $(e.currentTarget),
                    modal = $modal.modal('instance');

                me.revertZIndex();
                me.remove(modal);

                if(me.stack.length){
                    me.active = me.stack[me.stack.length - 1];
                } else {
                    me.active = null;
                }
            }).on('focusin.modalmanager', function(e) {
                if (!me.active){ return; }
                if (me.active.$el[0] !== e.target && !$.contains(me.active.$el[0], e.target)) {
                    me.active.$el.find(':focusable').first().focus();
                    e.stopPropagation();
                }
            }).on('click.modalmanager', '[data-control=modal]', function(e) {
                e.preventDefault();

                var $el = $(this),
                    target = $el.attr('href') || $el.attr('data-target'),
                    $modal;
                if (target) {
                    // ajax형 모달인 경우
                    if (!/^#/.test(target)) {
                        $.ajax({
                            url: target
                        }).done(function(html) {
                            $modal = $('<div class="ui_modal ui_modal_ajax" style="display:none"></div>').html(html).appendTo('body');
                            $modal.modal($.extend({
                                removeOnClose: true
                            }, $el.data())).on('modal:hidden', function(e){
                                $el[0].focus();
                                $modal.off('modal:hidden');
                            });
                        });
                    } else {
                        $(target).modal($el.data()).on('modal:hidden', function(e){
                            $el[0].focus();
                            $(this).off('modal:hidden');
                        });
                    }
                }

            });
        },
        add: function(modal) {
            this.stack.push(modal);
        },
        remove: function(modal) {
            this.stack = core.array.remove(this.stack, modal);
        },
        nextZIndex: function() {
            var zi = _zIndex;
            _zIndex += 2;
            return zi;
        },
        revertZIndex: function() {
            _zIndex -= 2;
        }
    };
    ModalManager.init();


    // Modal ////////////////////////////////////////////////////////////////////////////
    /**
     * 모달 클래스<br />
     * // 기본 옵션 <br />
     * options.overlay:true 오버레이를 깔것인가<br />
     * options.clone: true  복제해서 띄울 것인가<br />
     * options.closeByEscape: true  // esc키를 눌렀을 때 닫히게 할 것인가<br />
     * options.removeOnClose: false // 닫을 때 dom를 삭제할것인가<br />
     * options.draggable: true              // 드래그를 적용할 것인가<br />
     * options.dragHandle: 'h1.title'       // 드래그대상 요소<br />
     * options.show: true                   // 호출할 때 바로 표시할 것인가...
     *
     * @class
     * @name axl.ui.Modal
     * @extends axl.ui.View
     */
    var Modal = ui('Modal', /** @lends axl.ui.Modal# */ {
        bindjQuery: 'modal',
        defaults: {
            overlay: true,
            clone: true,
            closeByEscape: true,
            removeOnClose: false,
            draggable: true,
            dragHandle: 'header h1',
            show: true,
            effect: 'fade', // slide | fade
            cssTitle: '.ui_modal_title'
        },

        events: {
            'click button[data-role]': function(e) {
                var me = this,
                    $btn = $(e.currentTarget),
                    role = ($btn.attr('data-role') || ''),
                    ev;

                if (role) {
                    me.triggerHandler(ev = $.Event('modal:'+role), [me]);
                    if (ev.isDefaultPrevented()) {
                        return;
                    }
                }

                this.hide();
            },
            'click .ui_modal_close': function(e) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },
        /**
         * 생성자
         * @constructors
         * @param {String|Element|jQuery} el
         * @param {Object} options
         * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
         * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
         * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
         * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
         * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
         * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
         * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
         */
        initialize: function(el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            // 열릴때 body로 옮겼다가, 닫힐 때 다시 원복하기 위해 임시요소를 넣어놓는다.
            me._createHolder();
            if (me.options.overlay !== false) {
                me._overlay();    // 오버레이 생성
            }
            me.$el.addClass('ui_modal_container');

            me.isShown = false;
            me._originalDisplay = me.$el.css('display');

            me.options.show && core.util.waitImageLoad(me.$('img')).done(function() {
                me.show();
            });
        },

        _bindAria: function() {
            var me = this;
            // TODO
            me.$el.attr({
                'role': 'dialog',
                'aria-hidden': 'false',
                'aria-describedby': me.$('section').attr('id') || me.$('section').attr('id', me.cid + '_content').attr('id'),
                'aria-labelledby': me.$('h1').attr('id') || me.$('h1').attr('id', me.cid + '_title').attr('id')
            });
        },
        /**
         * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
         * 원래 위치에 임시 홀더를 만들어 놓는다.
         * @private
         */
        _createHolder: function() {
            var me = this;

            if (me.$el.parent().is('body')) {
                return;
            }

            me.$holder = $('<span class="ui_modal_holder" style="display:none;"></span>').insertAfter(me.$el);
            me.$el.appendTo('body');
        },
        /**
         * 원래 위치로 복구시키고 홀더는 제거
         * @private
         */
        _replaceHolder: function() {
            var me = this;

            if (me.$holder) {
                me.$el.insertBefore(me.$holder);
                me.$holder.remove();
            }
        },

        /**
         * 토글
         */
        toggle: function() {
            var me = this;

            me[me.isShown ? 'hide' : 'show']();
        },

        /**
         * 표시
         */
        show: function() {
            if (this.isShown) {
                return;
            }

            var me = this,
                opts = me.options,
                e = $.Event('modal:show');

            if (me.isShown || e.isDefaultPrevented()) {
                return;
            }

            me.trigger(e);
            me.isShown = true;

            if (opts.title) {
                me.$(opts.cssTitle).html(opts.title || '알림');
            }

            me.layout();
            var defer = $.Deferred();
            if(opts.effect === 'fade') {
                me.$el.hide().fadeIn('slow', function () {
                    defer.resolve();
                });
            } else if(opts.effect === 'slide') {
                me.$el.css('top', -me.$el.height()).animate({top: '50%'}, function () {
                    defer.resolve();
                });
            } else {
                defer.resolve();
            }

            defer.done(function () {
                me.trigger('modal:shown', {
                    module: me
                });

                //////$('body').attr('aria-hidden', 'true');    // body를 비활성화(aria)

                me._bindAria(); // aria 셋팅
                me._draggabled();    // 드래그 기능 빌드
                me._escape();    // esc키이벤트 바인딩
                ///////////me._enforceFocus();   // 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드

                me.on('mousewheel', function(e) {
                    e.stopPropagation();
                });

                var $focusEl = me.$el.find('[data-autofocus=true]');

                // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
                if ($focusEl.size() > 0) {
                    $focusEl.eq(0).focus();
                } else {
                    // 레이어에 포커싱
                    me.$el.attr('tabindex', 0).focus();
                }
                ///// $win.on('resize'+me.getEN(), me.proxy('center'));

                var $focusEl = me.$('[data-autofocus=true]');
                if ($focusEl.size() > 0) {
                    $focusEl.eq(0).focus();
                } else {
                    me.$el.attr('tabindex', 0).focus();
                }

                // 버튼
                /**************if (me.options.opener) {
                    var modalid;
                    if (!(modalid = me.$el.attr('id'))) {
                        modalid = 'modal_' + core.getUniqId(16);
                        me.$el.attr('id', modalid);
                    }
                    $(me.options.opener).attr('aria-controls', modalid);
                }**********/
            });

        },

        /**
         * 숨김
         */
        hide: function(e) {
            if (e) {
                e.preventDefault();
            }

            var me = this;
            e = $.Event('modal:hide');
            me.trigger(e);
            if (!me.isShown || e.isDefaultPrevented()) {
                return;
            }

            var defer = $.Deferred();
            me.isShown = false;
            if(me.options.effect === 'fade') {
                me.$el.fadeOut('slow', function () {
                    defer.resolve();
                });
            } else if(me.options.effect === 'slide') {
                me.$el.animate({
                    top: -me.$el.outerHeight()
                }, function() {
                   defer.resolve();
                });
            } else {
                defer.resolve();
            }

            defer.done(function() {
                me.trigger('modal:hidden');

                me.$el.removeClass('ui_modal_container');    // dom에 추가된 것들 제거
                me._escape();    // esc 키이벤트 제거
                me._replaceHolder();    // body밑으로 뺀 el를 다시 원래 위치로 되돌린다.

                if (me.options.removeOnClose) {
                    me.$el.remove();    // 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
                }
                /*if (me.options.opener) {
                    $(me.options.opener).removeAttr('aria-controls').focus();    // 레이어팝업을 띄운 버튼에 포커스를 준다.
                }*/
                if (me.$overlay) {
                    me.$overlay.remove(), me.$overlay = null;    // 오버레이를 제거
                }
               ////// $('body').removeAttr('aria-hidden');    // 비활성화를 푼다.

                me.release();
            });
        },


        /**
         * 도큐먼트의 가운데에 위치하도록 지정
         */
        layout: function() {
            var me = this,
                width, height, attr, isOver,
                winHeight = core.util.getWinHeight();

            if (!me.isShown) {
                me.$el.css({
                    'display': 'inline'
                });
            }
            width = me.$el.outerWidth();
            height = me.$el.outerHeight();
            isOver = height > winHeight;
            attr = {
                display: '',
                position: 'absolute',
                backgroundColor: '#ffffff',
                outline: 'none',
                backgroundClip: 'padding-box',
                top: isOver ? 0 : '50%',
                left: '50%',
                marginLeft: Math.ceil(width / 2) * -1,
                marginTop: isOver ? '' : Math.ceil(width / 2) * -1
            };
            me.$el.stop().css(attr);
        },

        /**
         * 타이틀 영역을 드래그기능 빌드
         * @private
         */
        _draggabled: function() {
            var me = this,
                options = me.options;

            if (!options.draggable || me.bindedDraggable) {
                return;
            }
            me.bindedDraggable = true;

            if (options.dragHandle) {
                me.$el.css('position', 'absolute');
                core.css3.prefix('user-select') && me.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
                me.on('mousedown touchstart', options.dragHandle, function(e) {
                    e.preventDefault();

                    var isMouseDown = true,
                        pos = me.$el.position(),
                        oriPos = {
                            left: e.pageX - pos.left,
                            top: e.pageY - pos.top
                        }, handler;

                    $doc.on(me.getEN('mousemove mouseup touchmove touchend touchcancel'), handler = function(e) {
                        console.log(me.cid);
                        switch (e.type) {
                            case 'mousemove':
                            case 'touchmove':
                                if (!isMouseDown) {
                                    return;
                                }
                                me.$el.css({
                                    left: e.pageX - oriPos.left,
                                    top: e.pageY - oriPos.top
                                });
                                break;
                            case 'mouseup':
                            case 'touchend':
                            case 'touccancel':
                                isMouseDown = false;
                                $doc.off(me.getEN(), handler);
                                break;
                        }
                    });
                });

                me.$(options.dragHandle).css('cursor', 'move');
            }
        },

        /**
         * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
         * @private
         */
        _enforceFocus: function() {
            if (!isTouch) { return; }
            var me = this;
            var $focusEl = me.$el.find('[data-autofocus=true]');

            // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
            if ($focusEl.size() > 0) {
                $focusEl.eq(0).focus();
            } else {
                // 레이어에 포커싱
                me.$el.attr('tabindex', 0).focus();
            }

            $doc.off('focusin'+me.getEN())
                .on('focusin'+me.getEN(), me.proxy(function(e) {
                    if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
                        me.$el.find(':focusable').first().focus();
                        e.stopPropagation();
                    }
                }));
        },

        /**
         * esc키를 누를 때 닫히도록
         * @private
         */
        _escape: function() {
            if (!isTouch) { return; }
            var me = this;

            if (me.isShown && me.options.closeByEscape) {
                me.off('keyup').on('keyup', me.proxy(function(e) {
                    e.which === 27 && me.hide();
                }));
            } else {
                me.off('keyup');
            }
        },

        /**
         * 오버레이 생성
         * @private
         */
        _overlay: function() {
            var me = this;
            if (!me.options.overlay || me.$overlay) {
                return false;
            } //140123_추가

            me.$overlay = $('<div class="ui_modal_overlay" />');
            me.$overlay.css({
                'backgroundColor': '#ffffff',
                'opacity': 0.6,
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'right': 0,
                'bottom': 0
            }).appendTo('body');

            me.$overlay.off('click.modal').on('click.modal', function(e) {
                if (e.target != e.currentTarget) {
                    return;
                }
                me.$overlay.off('click.modal');
                me.hide();
            });
        },

        /**
         * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
         * @example
         * $('...').modal(); // 모달을 띄운다.
         * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
         * $('...').modal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
         */
        center: function() {
            this.layout();
        },

        /**
         * 열기
         */
        open: function() {
            this.show();
        },

        /**
         * 닫기
         */
        close: function() {
            this.hide();
        },

        /**
         *
         */
        release: function() {
            var me = this;

            me.supr();
            $doc.off(me.getEN());
            $win.off(me.getEN());
        }
    });


    /**
     * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
     * @example
     * axl.PubSub.trigger('resize:modal')
     */
    /*core.PubSub.on('resize:modal', function() {
        if(Modal.active){
            Modal.active.center();
        }
    });*/

    //윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
    /*$(window).on('resize.modal', function() {
        if(Modal.active){
            Modal.active.center();
        }
    });*/

    core.modal = function(el, options){
        $(el).modal(options);
    };

    /**
     * @class
     * @name axl.ui.AjaxModal
     * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
     * @extends axl.ui.View
     */
    core.ui.ajaxModal = function () {
        return function(url, options) {
            // TODO
            setTimeout(function() {
                var $modal = $('<div class="ui_modal" style="display: none;">').appendTo('body');
                $modal.load(url, function () {
                    $modal.modal($.extend(options, {removeOnClose: true}));
                });
            }, 1000);
        };
    }();

    core.ui.alert = function () {
        /**
         * 얼럿레이어
         * @memberOf axl.ui
         * @name alert
         * @function
         * @param {string} msg 얼럿 메세지
         * @param {Object} options 모달 옵션
         * @example
         * axl.ui.alert('안녕하세요');
         */
        return function (msg, options) {
            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(core.ui.alert.tmpl).appendTo('body').find('div.ui_modal_content').html(msg).end();
            var modal = new Modal(el, core.extend({removeOnClose: true}, options));
            modal.getElement().buildUIControls();
            modal.on('modalhidden', function(){
                el = null;
                modal = null;
            });
            return modal;
        };
    }();
    core.ui.alert.tmpl = ['<div class="layer_popup small ui_alert" role="alert" style="display:none">',
        '<h1 class="title ui_modal_title">알림창</h1>',
        '<div class="cntt">',
        '<div class="ui_modal_content">&nbsp;</div>',
        '<div class="wrap_btn_c">',
        '<button type="button" class="btn_emphs_small" data-role="ok"><span><span>확인</span></span></button>',
        '</div>',
        '</div>',
        '<button type="button" class="ui_modal_close"><span>닫기</span></button>',
        '<span class="shadow"></span>',
        '</div>'].join('');
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Modal;
        });
    }

})(jQuery, window[LIB_NAME]);