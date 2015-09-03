/**
 * Created by 김승일책임(comahead@vi-nyl.com) on 2015-08-27
 * @module
 * @description 주소찾기 자동완성 모듈(30분만에 후딱 만든..)
 */
(function($, core) {
    "use strict";

    if (core.ui.AutoComplete) {
        return;
    }

    /**
     * 주소찾기 자동완성 모듈
     */
    var AutoComplete = core.ui('AutoComplete', {
        bindjQuery: 'autoComplete',
        defaults: {
            url: '/guide/script/demo/addr_keywords.html?q={keyword}'
        },
        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            me.$listWrap = me.$el.parent().next();
            me.$scroller = me.$listWrap.find('.ui_scrollarea');
            me.$listbox = me.$listWrap.find('ul').css('position', 'relative');
            me.itemCount = 0;

            me._bindEvents();
        },
        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function() {
            var me = this,
                xhr, timer;

            // 리스트 조회
            var loadList = function() {
                if (me.oldValue === me.$el.val()) {
                    return;
                }
                if (xhr && xhr.readystate != 4) {
                    xhr.abort();
                    xhr = null;
                }

                xhr = $.ajax({
                    url: me.options.url.replace(/\{keyword\}/, me.$el.encodeURI()),
                    dataType: "json"
                }).done(function(json) {
                    me._render(json);
                });
            };

            // 키보드를 입력할 때 0.1초 이후에 조회(타이핑이 잠깐 멈첬을 때 조회)
            me.$el.on('keyup paste', core.delayRun(function(e) {
                if (!$.trim(me.$el.val())) {
                    me.close();
                    return;
                }
                if (core.array.include([38, 37, 40, 39, 35, 36, 13, 27], e.keyCode)) {
                    return;
                } // 키능식 조작시 ajax콜 방지

                loadList();
            }, 100)).next().on('click', function() {
                me.close();
            });

            // 리스트에서 항목 선택
            me.$listWrap.on('click', 'a', function(e) {
                e.preventDefault();
                me.close();
                me.$el.val($(this).text()).focus();
            });

            // 포커스를 벗어나면 닫히도록
            var $wrapper = me.$el.parent().parent().on('focusin focusout', 'a, input', function(e) {
                clearTimeout(timer);
                if (e.type === 'focusout') {
                    timer = setTimeout(function() {
                        me.close();
                    }, 100);
                }
            });

            // 키보드 방향키 바인딩
            !core.browser.isTouch && me.$el.on('keydown', function(e) {
                switch (e.keyCode) {
                    case 38: // 위로
                        if (!me.isOpened) {
                            return;
                        }

                        e.preventDefault();
                        me._selectItem('up');
                        break;
                    case 40: // 아래로
                        if (me.itemCount === 0) {
                            return;
                        }
                        if (!me.isOpened) {
                            if (me.oldValue === me.$el.val()) {
                                me.open();
                            } else {
                                loadList();
                            }
                            return;
                        }

                        e.preventDefault();
                        me._selectItem('down');
                        break;
                    case 27: // esc
                        e.preventDefault();
                    case 13: // enter
                        me.close();
                        break;
                }
            });

            // 바깥영역을 클릭할 때 닫히도록
            $(document).on('click.' + me.cid, function(e) {
                if (!$.contains($wrapper[0], e.target)) {
                    clearTimeout(timer);
                    me.close();
                }
            });
        },

        // 활성화
        _selectItem: function(dir) {
            var me = this,
                $items = me.$listbox.children(),
                index = $items.index($items.filter('.active')),
                $item;

            if (dir === 'up') {
                index -= 1;
                if (index < 0) {
                    index = me.itemCount - 1;
                }
            } else {
                index += 1;
                if (index >= me.itemCount) {
                    index = 0;
                }
            }


            $items.filter('a.active').removeClass('active');
            $item = $items.eq(index);
            $item.children().addClass('active'); // 활성화
            me.$scroller.scrollTop($item.position().top - 50); // 활성화된 항목의 위치가 가운데 오게 강제스크롤
            me.$el.val($item.text()); // 인풋에 삽입
        },

        // 렌더링
        _render: function(json) {
            var me = this,
                html = '',
                keyword = me.$el.val(),
                list = json.list,
                len = list.length;

            me.itemCount = len;
            me.oldValue = keyword;
            me.currIndex = 0;

            if (!$.trim(keyword) || len === 0) {
                me.close();
                return;
            }

            for (var i = 0; i < len; i++) {
                html += '<li><a href="#" tabindex="-1">' + list[i].replace(keyword, '<b>' + keyword + '</b>') + '</a></li>';
            }
            me.$listbox.html(html);
            me.$scroller.scrollTop(0);
            me.open();
        },
        // 열기
        open: function() {
            this.isOpened = true;
            this.$listWrap.show().find('.ui_scrollview').removeAttr('tabindex');
        },
        // 닫기
        close: function() {
            this.isOpened = false;
            this.$listWrap.hide();
        }
    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return AutoComplete;
        });
    }

})(jQuery, window[LIB_NAME]);
