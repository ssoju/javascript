/*!
 * @module vcui.ui.MoreLoader
 * @license MIT License
 * @description MoreLoader 컴포넌트
 * @copyright VinylC UID Group.
 */
define(
    'ui/moreLoader', ['jquery', 'vcui'],
    function($, core) {
        "use strict";

        //  사용법
        /*$('#btnMoreLoad').vcMoreLoader({ // 더보기 버튼에 빌드
            list: '#uiBoardList',       // 리스트 요소
            dataSource: function () {   // ajax 를 직접 컨트롤. 결과로 받은 html
        문자열을 list에 append 해준다.
                return $.ajax({
                    url: 'GR3.4_ajax_01.html',
                    data: {
                        categoty: $('#uiCategoryTab').vcTab('getSelectedValue'),
                        lastid: $('#uiBoardList>li:last').data('id'),
                        keyword: $('#search_txt').val()
                    }
                });
            }
        });*/

        return core.ui('MoreLoader', {
            bindjQuery: true,
            selectors: {},
            defaults: {
                type: 'html',
                dataSource: null, // ajax 객체를 받을 콜백함수
                //autofillEven: false,
                list: '.ui_moreloader_list', // 리스트 요소
                onBeforeSend: core.noop,
                onSuccess: core.noop, // 성공적으로 로드됐을 때 호출되는 콜백함수
                onRendered: core.noop, // list 에 append한 후에 호출
                onError: core.noop, // ajax가 에러가 났을 때
                onComplete: core.noop, // ajax가 에러여부에 상관없이 완료됐을 때
                onLoading: core.noop, // ajax가 로딩중일 때
                onLoaded: core.noop, //
                onEmpty: core.noop
            },
            initialize: function(el, options) {
                var self = this;

                if (self.supr(el, options) === false) {
                    return;
                }

                self.disabled = false;
                self.$wrap = $(self.options.target);
                self.$list = self.$wrap.find(self.options.list);
                self.$el.attr('role', 'button').attr('aria-label', '더보기');

                self._bindEvents();
                self.load();
            },
            _bindEvents: function() {
                var self = this,
                    o = self.options;

                // 더보기 클릭시
                self.on('click', function(e) {
                    e.preventDefault();

                    self.load(true).then(function () {
                        if (self.$newFirst[0]) {
                            self.$newFirst.attr('tabindex', -1).focus();
                            setTimeout(function () {
                                self.$newFirst.removeAttr('tabindex');
                            });
                        }
                    });
                });
            },
            _fetch: function(isMore) {
                var self = this,
                    o = self.options;

                if (self.xhr || self.disabled) {
                    return self.xhr;
                }

                o.onBeforeSend.call(self, isMore);
                self.loading = true;
                self.$el.prop('disabled', true);
                self.$wrap.addClass('loading');

                return self.xhr =
                    o.dataSource.call(self, isMore)
                    .done(function(html) {
                        var $html = $('<ul>').append(html);
                        var isBlank = $html.children().length === 0;

                        if (isBlank) {
                            self._renderButton(false);
                            self.setEnabled(false);
                            if (!isMore) {
                                self.$wrap.addClass('no_items');
                                o.onEmpty.call(self, false);
                            }
                            return;
                        }

                        if (o.onSuccess.apply(self, core.toArray(arguments)) === false) {
                            $html = null;
                            return;
                        }

                        if (!isMore) {
                            self.$list.empty();
                        }

                        self.$newFirst = $html.children().first(); // 접근성. 새로 추가된 항목에 포커싱
                        self.$list.append($html.children()).buildCommonUI();
                        self.$wrap.removeClass('no_items');

                        self._renderButton();
                        self.setEnabled(true);

                        o.onRendered.apply(self, core.toArray(arguments));
                        !isMore && o.onEmpty.call(self, true);
                    })
                    .error(function() {
                        o.onError.apply(self, core.toArray(arguments));
                    })
                    .always(function() {
                        o.onComplete.apply(self, core.toArray(arguments));
                        self.$el.prop('disabled', false);
                        self.$wrap.removeClass('loading');
                        self.loading = false;
                        self.xhr = null;
                    });
            },
            /**
             * 상황에 따라 더보기 토글
             * @param flag
             * @private
             */
            _renderButton: function(flag) {
                if (arguments.length) {
                    this.$wrap.toggleClass('has_more', flag);
                    return;
                }

                var self = this;
                var $items = self.getItems();
                var $last;

                if ($items.length) {
                    $last = $items.last();

                    var loadedCount = $items.length;
                    var totalCount = $last.data('total') || 0;

                    //self.$el.toggle(loadedCount < totalCount);
                    self.$wrap.toggleClass('has_more', loadedCount < totalCount);
                } else {
                    //self.$el.hide();
                    self.$wrap.toggleClass('has_more', false);
                }
            },
            /**
             * 아이템 조회
             * @return {*}
             */
            getItems: function () {
                return this.$list.children('[data-id]');
            },
            /**
             * 마지막 아이템의 id 추출
             * @return {*}
             */
            getLastId: function () {
                return this.getItems().last().data('id');
            },
            /**
             * 리스트 조회
             * @param isMore
             * @return {*}
             */
            load: function(isMore) {
                var self = this,
                    opts = self.options;

                if (self.disabled) {
                    return;
                }

                return self._fetch(isMore);
            },
            clear: function () {
                this.$list.empty();
            },
            /**
             * 기존 데이타 지우고 새로 리스트를 불러옴
             */
            cleanAndLoad: function() {
                this.setEnabled(true);
                this.load();
            },

            setEnabled: function(flag) {
                this.disabled = !flag;
            }
        });
    });
