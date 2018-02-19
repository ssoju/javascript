/*!
 * @module vcui.ui.SkbHeader
 * @description 헤더 컴포넌트
 * @license MIT License
 * @copyright VinylC UID Group
 */
define('ui/skbHeader', [
    'jquery',
    'vcui',
    'ui/scrollview'
], function ($, core) {

    return core.ui('SkbHeader', {
        bindjQuery: true,
        defaults: {},
        selectors: {
            menuContainer: '>.menus_sec',           // 컨테이너
            depth1Menus: '.deps1',                  // 1뎁스 메뉴
            utilMenus: '.util_menus > ul > li',     // 유틸 메뉴
            gnb: '#gnb'                             // GNB
        },
        templates: {},
        initialize: function (el, options) {
            var self = this;

            if (self.supr(el, options) === false) {
                return null;
            }

            self._bindEvents();
            self._requestMenu();
        },

        /**
         *
         * @private
         */
        _bindEvents: function () {
            var self = this;

            // 1depth focus: 터치기반 디바이스가 아닌 경우 포커스이벤트+마우스오버에 반응하도록 처리
            if (!core.detect.isTouch) {
                self._bindFocusEvents();
                self._bindMouseEvents();
            } else {
                self._bindClickEvents();
            }

            // 3depth: 서브메뉴가 있을 경우 서브메뉴 표시
            self.on('click', '.deps3 > a', function (e) {
                var $a = $(this);
                var $li = $a.parent();
                var isOpened = $li.hasClass('on');

                $li.siblings('.on').removeClass('on');

                if ($li.hasClass('nxt_step')) {
                    e.preventDefault();

                    $('>ul', $li).stop()[isOpened ? 'slideUp' : 'slideDown']('fast', function () {
                        $li.toggleClass('on', !isOpened);
                    });

                    if (!isOpened) {
                        $li.siblings().find('>ul').slideUp('fast');
                    }
                }
            })
        },

        /**
         * 오직 클릭에 의해 반응하도록(터치기반 디바이스 대응)
         * @private
         */
        _bindClickEvents: function () {
            var self = this;

            // 1depth
            self.on('click', '.deps1 > a, .util_menus > ul > li > a', function (e) {
                e.preventDefault();

                var $li = $(this).parent();

                if ($li.hasClass('on')) {
                    self._close1Depth();
                } else {
                    self._open1Depth($li);
                }
            });

            // 2depth
            self.on('click', '.deps2 > a', function (e) {
                var $li = $(this).parent();

                self._active2Depth($li);
            });
        },

        /**
         * 포커스가 들어왔을 때 열리고, 나갔을 때 닫히도록
         * @private
         */
        _bindFocusEvents: function () {
            var self = this;

            // 1depth
            self.on('focusin', '.deps1 > a, .util_menus > ul > li > a', function (e) {
                var $li = $(this).parent();

                self._open1Depth($li);
            });

            // 2depth
            self.on('focusin', '.deps2 > a', function (e) {
                self._active2Depth($(this).parent());
            });
        },

        /**
         * 마우스가 오버되었냐에 따라  gnb표시
         * @private
         */
        _bindMouseEvents: function () {
            var self = this;

            /*self.on('mouseleave', function (e) {
                console.log(999)
                $('.menu_over_wrap li.on:not(.active)', self.$gnb).removeClass('on')
                    .filter('.nxt_step')
                    .each(function () {
                        $('>ul', this).hide();
                    });
            });*/

            // 나가면 닫아준다.
            self.$('.menus_sec').on('mouseleave', core.delayRun(function (e) {
                self._close1Depth();
            }, 200));

            // 1depth
            self.on('mouseenter', '.deps1, .util_menus > ul > li', function (e) {
                e.preventDefault();

                var $li = $(this);
                self._open1Depth($li);
            });

            // 2depth
            self.on('mouseenter', '.deps2', function (e) {
                var $li = $(this);

                self._active2Depth($li);
            });
        },

        /**
         * gnb를 열고 li 활성화
         * @param $li
         * @private
         */
        _open1Depth: function ($li) {
            var self = this;

            self.$el.addClass('gnb_open');
            self.$depth1Menus.removeClass('on');
            self.$utilMenus.removeClass('on');

            $li.addClass('on');
            $('.scroll_wrap', $li).vcScrollview('scrollTop', 0);
            $('li.on', $li).removeClass('on');

            self.docOn('keydown', function (e) {
                if (e.which === core.keyCode.ESCAPE) {
                    self.$('.deps1.on>a').focus();
                    self._close1Depth();
                }
            });

            self.docOn('focusin', function (e) {
                if (!$.contains(self.$menuContainer[0], e.target)) {
                    self._close1Depth();
                }
            });
        },

        /**
         * gnb 닫기
         * @private
         */
        _close1Depth: function () {
            var self = this;

            console.trace();

            self.$el.removeClass('gnb_open');
            self.$depth1Menus.removeClass('on');
            self.$utilMenus.removeClass('on');

            self.docOff('keydown click focusin');
        },

        /**
         * 메뉴 활성화
         * @param $li
         * @private
         */
        _active2Depth: function ($li) {
            var self = this;

            $li.activeItem('on');
            $li.siblings().find('.nxt_step.on').removeClass('on').find('>ul').hide();
        },

        /**
         *
         * @param menuId
         */
        activeMenu: function (menuId) {
            var self = this;
            var $menu = $('#menu_' + menuId);
            var depth = $menu.data('depth');

            while (depth-- > 1) {

            }
        },

        /**
         * 메뉴 데이타 로드
         * @private
         */
        _requestMenu: function () {
            var self = this;
            var opts = self.$gnb.data();

            if (!opts.menuUrl) {
                return $.Deferred().reject().promise();
            }

            return $.ajax({
                url: opts.menuUrl,
                contentType: 'json'
            }).done(function (data) {
                self.menuList = core.util.parse(data);
                self.menuTree = findChild(self.menuList, 1);
                self._render();
            });

            function findChild(menuList, depth, menu_id) {
                var items = [], tmp;
                if (depth >= 5) {
                    return [];
                }

                for (var i = -1, item; item = menuList[++i];) {
                    if (item.menu_depth == depth && item.display_yn === 'Y') {
                        if (menu_id && menu_id !== item.parent_menu_id) {
                            continue;
                        }
                        tmp = core.clone(item);
                        items.push(tmp);
                        tmp.childs = findChild(menuList, depth + 1, tmp.menu_id);
                    }
                }
                return items;
            }
        },

        /**
         * 렌더링
         * @private
         */
        _render: function () {
            var self = this;
            var enc = core.string.escapeHTML;

            // 1depth
            core.each(self.menuTree, function (menu1) {
                var $wrap1 = self.$('[data-menu-id="' + menu1.menu_id + '"] .menu_over_view');
                var html = renderItem(menu1, 1);

                $wrap1.html(html);
            });

            self.$('.scroll_wrap').vcScrollview({
                selectors: {
                    inner: '>.scroll_inner',
                    vscrollbar: '>.scroll_track>div'
                }
            });

            function renderItem(menu, depth) {
                var html = '';
                var newDepth = depth + 1;

                if (newDepth < 4) {
                    html += '<div class="scroll_wrap deps' + newDepth + '_wrap">';
                    html += '<div class="scroll_inner">';
                    html += '<ul>';
                } else {
                    // depth 4
                    html += '<ul class="deps4_wrap" style="display:none;">';
                }

                core.each(menu.childs, function (subMenu) {
                    var hasChilds = !core.isEmpty(subMenu.childs);
                    html += '<li class="deps' + newDepth + (hasChilds ? ' nxt_step' : '') + '">';
                    html += '<a href="' + subMenu.menu_url + '" data-menu-depth="' + subMenu.menu_depth;
                    html += '" id="menu_' + subMenu.menu_id + '">' + enc(subMenu.menu_name) + '</a>';
                    if (hasChilds) {
                        html += renderItem(subMenu, newDepth);
                    }
                    html += '</li>';
                });

                html += '</ul>';

                if (newDepth < 4) {
                    html += '</div>';
                    html += '<div class="scroll_track"><div class="scroll_bar"></div></div>';
                    html += '</div>';
                }

                return html;
            }
        }
    });

});
