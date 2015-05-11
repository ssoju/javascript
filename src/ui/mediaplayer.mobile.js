/**
 * Created by comahead on 2013. 7. 5..
 * @author 김승일
 */ (function($, core, ui, undefined) {
    "use strict";


    if (!$) {
        throw new Error('jQuery라이브러리를 포함시켜 주세요.');
    }
    if (!core) {
        throw new Error('emart라이브러리를 포함시켜 주세요.');
    }

    var idx = 0, // 고유 시퀀스 용도
        nextIdx = function() {
            return idx++;
        },
        isTouch = core.isTouch;

    // query string에 debug=true가 있으면 강제로그인 시킴
    // 실서버에서 이방식으로 강제로 로그인시켜도 서버세션에 cust_id가 없기때문에
    // 리뷰를 등록, 수정, 삭제 처리가 안됨
    if (location.href.indexOf('debug=true') >= 0) {
        window.isLogin = true;
    }

    // 강제로 앱버전으로 전환시킴
    if (location.href.indexOf('app=true') >= 0) {
        window.isApp = window.isIOS = true;
    }

    !window.isIOS && core.$win.on('load', function() {
        // 디바이스에서 ajax 통신 때 옵션으로 showLoading: true을 지정할 경우 로딩이미지를 표시
        var $loading = $('#wrapper>.loading');
        $loading.length && $.ajaxSetup({
            beforeSend: function() {
                if (this.showLoading) {
                    $loading[0].style.cssText = 'display:block !important';
                }
            },
            complete: function() {
                $loading[0].style.cssText = '';
            }
        });
    });

    /**
     * 뮤직에 관련한 공통기능 모음
     */
    axl.music = {
        init: function() {
            this.bindGlobalEvents();
        },
        /**
         * 페이지 곳곳에 포진되어 있는 곡링크를 클릭했을 때,
         * 플레이어에 추가 및 재생할 수 있도록 버블링을 이용하여 처리
         */
        bindGlobalEvents: function() {
            var me = this,
                $doc = $(document);

            $doc.on('click', '.btn_info', function(e) {
                // ... 버튼 클릭
                e.preventDefault();
                _closeSubs(this);
                _toggleTrackInfo($(this));
            }).on('click', '.info_add button', function(e) { // 가사, 공유
                // 공유하기
                _toggleTrackSubInfo($(this));
            }).on('click', 'li.d-track>.btn_add', function(e) {
                // +(곡추가) 클릭
                var $el = $(this),
                    id = $el.closest('li.d-track').attr('data-id');

                core.PubSub.trigger('addMusic', {
                    id: id,
                    complete: function() {
                        // 곡이 추가될 때 버튼이 비활성화 되는데, 이때 포커스가 다시 최상단으로 이동해버리므로,
                        // 옆에 위치한 '...'버튼으로 포커스를 강제이동 시킨다.
                        $el.next('.btn_info').focus();
                    }
                });
            }).on('click', 'li.d-track>a', function(e) {
                // 곡리스트에서 곡제목 클릭
                var $el = $(this),
                    id = $el.closest('li.d-track').attr('data-id');

                e.preventDefault();
                core.PubSub.trigger('addMusic', {
                    id: id, // 추가될 곡 id
                    playId: id // 추가된 후에 재생할 곡의 id
                });
            });

            // 기존에 열려져 있던 추가정보를 닫는다.(추가정보, 가사, 공유하기)
            function _closeSubs(el) {
                $doc.find('ul.list .btn_info.on').prevAll('a')
                    .removeClass('on').end()
                    .not(el).removeClass('on').text(function() {
                    return $(this).text().replace(/닫기$/, '보기');
                });


                $doc.find('ul.list .info_add button.on').removeClass('on').attr('title', function() {
                    return ($(this).attr('title') || '').replace(/닫기$/, '보기');
                });
            }

            // 가사, 공유하기 의 서브박스 토글
            function _toggleTrackInfo($btn) {
                var isOpended = $btn.hasClass('on');
                $btn.toggleClass('on', !isOpended).text(function() {
                    return $btn.text().replace(isOpended ? /닫기$/ : /보기$/, isOpended ? '보기' : '닫기');
                });
                $btn.prevAll('a').toggleClass('on', !isOpended);
            }

            // 추가정보 토글
            function _toggleTrackSubInfo($btn) {
                var isOpended = $btn.hasClass('on');

                $btn.closest('ul').find('button.on').not($btn[0]).removeClass('on').attr('title', function() {
                    return ($(this).attr('title') || '').replace(/닫기$/, '보기');
                });

                $btn.toggleClass('on', !isOpended).attr('title', function() {
                    return ($btn.attr('title') || '').replace(isOpended ? /닫기$/ : /보기$/, isOpended ? '보기' : '닫기');
                });
            }
        },


        // 활성화된 탭에 들어있는
        // 곡들의 리뷰갯수를 조회해서 리뷰카운팅 영역에 반영
        // 60초마다, 그리고 각 탭이 활성화될 때 호출된다.
        syncReviewCount: (function() {
            // 이전에 호출한 ajax가 아직 도착안했을 때 강제로 중지시키기 위해 xhr 객체를 보관
            var lastXhr;
            return function() {
                // 아직 끝나지 호출이 있으면 강제중지 시킨다.
                if (lastXhr && lastXhr.readyState != 4) {
                    lastXhr.abort();
                }

                // 활성화된 탭에 들어있는 곡들의 리뷰갯수를 조회해서 UI에 반영
                var $activeTab = $('#d-player-wrap .d-tab-cont.d-active'),
                    seqs = $activeTab.find('ul.list>.d-track').map(function() {
                        return this.getAttribute('data-id');
                    }).get();

                if (!seqs.length) {
                    return;
                }

                lastXhr = $.ajax({
                    url: core.Env.get('emartMusicInfoUrl'),
                    data: {
                        'seq': core.isArray(seqs) ? seqs.join(',') : seqs
                    },
                    dataType: 'json'
                }).done(function(json) {
                    // 각 곡마다 리뷰갯수를 반영
                    core.each(json.tracks, function(item, i) {
                        $activeTab.find('ul.list>li[data-id="' + item.seq + '"] span.num').toggle(item.review_cnt > 0).html(item.review_cnt);
                    });
                });
            };
        })(),

        /**
         * id에 해당하는 요소의 리뷰카운트를 갱신
         * @param id
         * @param cnt
         */
        setReviewCount: function(id, cnt) {
            cnt = cnt | 0;
            $('ul.list>li[data-id="' + id + '"] span.num').toggle(cnt > 0).html(Math.min(cnt, 99));
        },

        /**
         * 토스트 표시
         * @param msg 메세지
         */
        showToast: function(msg) {
            var $div = $('#d-toast-box').hide();

            $div.html(msg).fadeIn();
            setTimeout(function() {
                $div.fadeOut();
            }, 1000);
        },

        // id에 해당하는 곡들의 추가버튼을 활성화/비활성화 처리
        enabledRows: function(id, is, $con) {
            var ids = [].concat(id);
            core.each(ids, function(id) {
                ($con || core.$doc).find('ul.list li.d-track[data-id="' + id + '"]>.btn_add').disabled(!is);
            });
        }
    };


    /**
     * 배열을 좀더 쉽게 관리하기 위한 배열래퍼
     * @class
     * @name axl.ArrayList
     * @extends axl.Base
     */
    var ArrayList = core.Base.extend( /**@lends axl.ArrayList# */ {
        $mixins: [core.Listener], // 해당 클래스에서 이벤트를 사용할 수 있도록 지정,
        $statics: {
            ON_ADDED: 'added',
            ON_REMOVED: 'removed',
            ON_REMOVEDALL: 'removedall'
        },
        defaults: {
            isShuffle: false,
            idAttribute: 'id',
            srcAttribute: 'src'
        },
        initialize: function(options) {
            var me = this;

            me.options = $.extend(true, {}, me.defaults, options);

            me.currentIndex = -1;

            // 내부 배열
            me.list = [];
        },
        /**
         * 새로운 요소 추가
         * @param {JSON} data 새로운 요소(id속성은 반드시 존재해야 한다).
         * @returns {Boolean}
         */
        add: function(data) {
            var me = this;

            if (!core.array.include(me.list, function(item) {
                // 이미 존재하는 요소는 추가하지 않는다.
                if (item.id === data.id) {
                    return true;
                }
            })) {
                // 요소 추가
                if (me.currentIndex < 0) {
                    me.currentIndex = 0;
                }
                me.list.push(data);
                me.trigger('added', data);
            }
            return false;
        },
        /**
         * 주어진 id를 갖는 요소 삭제
         * @param {String|Array} id 삭제할 요소의 id값
         */
        remove: function(ids) {
            var me = this;

            ids = core.isArray(ids) ? ids : [].concat(ids);
            core.each(ids, function(id) {
                core.array.remove(me.list, function(item) {
                    return (item.id + '' === id + '');
                }, function(removeIndex) {
                    if (me.size() > 0) {
                        if (removeIndex < me.currentIndex) {
                            me.currentIndex -= 1;
                        }
                        me.currentIndex = Math.min(me.size() - 1, me.currentIndex);
                    } else {
                        me.currentIndex = -1;
                    }
                    me.trigger('removed', {
                        id: id
                    });
                });
            });
            me.currentIndex = Math.min(me.currentIndex, me.list.length - 1) | 0;
        },

        removeAll: function() {
            this.list = [];
            this.currentIndex = -1;
            this.trigger('removedall');
        },

        /**
         * 현재 요소 반환
         * @param {String} id (Optional) 이 인자가 넘어오면 이 값으로 현재 선택된 값으로 설정
         * @returns {*}
         */
        current: function(id) {
            if (id) {
                this._setCurrentIndexById(id);
            }
            return this.at(this.list.length > 0 ? Math.max(0, this.currentIndex) : -1);
        },
        /**
         * id에 해당하는 항목의 인덱스를 현재 선택된 인덱스로 설정
         * @private
         * @param {String} id
         * @returns {Number}
         */
        _setCurrentIndexById: function(id) {
            var idx = 0;
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].id + '' === id + '') {
                    this.currentIndex = i | 0;
                    break;
                }
            }
        },

        /**
         * id에 해당하는 인덱스를 반환
         * @param {String} id
         * @returns {Number}
         */
        indexOf: function(id) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].id + '' === id + '') {
                    return i;
                }
            }
            return -1;
        },

        /**
         * 첫번째 요소 반환
         * @returns {*}
         */
        first: function() {
            return this.list[0];
        },
        /**
         * 마지막 요소 반환
         * @returns {*}
         */
        last: function() {
            return this.list[this.list.length - 1];
        },
        /**
         * 주어진 id를 갖는 요소가 존재하는지 체크
         * @param {String} id
         * @returns {*}
         */
        has: function(id) {
            var me = this;
            return core.array.include(me.list, function(item) {
                if (item.id + '' === id + '') {
                    return true;
                }
            });
        },

        /**
         * 현재 선택된 항목이 첫번째 요소인가
         * @returns {Boolean}
         */
        isFirst: function() {
            return this.currentIndex === 0;
        },

        /**
         * 현재 선택된 항목이 마지막 요소인가
         * @returns {Boolean}
         */
        isLast: function() {
            return this.currentIndex === this.list.length - 1;
        },

        /**
         * idx번째 요소를 반환
         * @param {Number} idx
         * @returns {*}
         */
        at: function(idx) {
            if (idx < 0 || idx >= this.list.length) {
                return null;
            }
            return this.list[idx];
        },

        /**
         * id에 해당하는 요소를 반환
         * @param {String} id
         * @returns {*}
         */
        get: function(id) {
            return this.find('id', id);
        },
        /**
         * 현재 배열의 반복함수
         * @param {Function} fn fn(value, index){}
         * @returns {*}
         */
        each: function(fn) {
            return core.each(this.list, fn);
        },
        /**
         * 다음 요소 반환
         * @returns {*}
         */
        next: function() {
            var idx = 0;
            if (this.options.isShuffle) {
                idx = Math.floor(Math.random() * this.list.length);
            } else {
                idx = this.currentIndex + 1 >= this.list.length ? 0 : this.currentIndex + 1;
            }
            this.setCurrentIndex(idx | 0);
            return this.current();
        },
        /**
         * 이전 요소 반환
         * @returns {*}
         */
        prev: function() {
            var idx = 0;
            if (this.options.isShuffle) {
                idx = Math.floor(Math.random() * this.list.length);
            } else {
                idx = this.currentIndex - 1 < 0 ? this.list.length - 1 : this.currentIndex - 1;
            }
            this.setCurrentIndex(idx | 0);
            return this.current();
        },
        /**
         * 배열의 요소에서 name이 value를 갖는 요소를 반환
         * @param {String} name 키명
         * @param {Mix} value 값
         * @returns {*}
         * @private
         * @example
         * find('id', 100)
         */
        find: function(name, value) {
            for (var i = -1, item; item = this.list[++i];) {
                if (item[name] + '' === value + '') {
                    return item;
                }
            }
            return null;
        },

        /**
         * 내부 배열을 새로운 배열로 교체
         * @param {Array} res
         */
        reset: function(res) {
            this.list = res;
        },

        /**
         * 내부 배열 요소들을 ids 순으로 재배치
         * @param {Array} ids id배열
         */
        sort: function(ids) {
            var res = [];
            core.each(ids, function(item, i) {
                res.push(this.get(item));
            }.bind(this));
            this.list = res;
            this.setCurrentIndex(Math.min(this.currentIndex, this.list.length - 1));
        },

        /**
         * idx로 현재 선택된 인덱스로 설정
         * @param {Number} idx 인덱스
         */
        setCurrentIndex: function(idx) {
            this.currentIndex = Math.max(0, Math.min(idx, this.list.length - 1));
        },

        /**
         * 내부배열의 크기를 반환
         * @returns {Number}
         */
        size: function() {
            return this.list.length;
        },

        /**
         * 내부 배열을 반환
         * @param {String} key 특정키의 값만 받고자 할 경우
         * @returns {Array}
         */
        getAll: function(key) {
            if (key) {
                var tmp = [];
                this.each(function(item) {
                    tmp.push(item[key]);
                });
                return tmp;
            }
            return this.list;
        }
    });


    /**
     * 진행바 컨트롤 클래스
     * @class
     * @name axl.ui.UISlideBar
     * @extends axl.ui.View
     */
    var UISlideBar = ui.View.extend( /**@lends axl.ui.UISlideBar# */ {
        name: 'SlideBar',
        defaults: {
            interval: 100,
            direction: 'horizontal', // 방향
            maxValue: 0, // 최대값
            minValue: 0, // 최소값
            distValue: 10, // 이동크기
            titleFormat: '{0}' // 타이틀 포맷
        },
        selectors: {
            bar: '.d-bar' // 바
        },
        /**
         * 생성자
         * @param {jQuery|Element|String} el
         * @param {JSON} options
         */
        initialize: function(el, options) {
            if (this.callParent(el, options) === false) {
                return;
            }

            var me = this;

            me.isHoriz = me.options.direction === 'horizontal'; // 방향
            me.sizeName = me.isHoriz ? 'width' : 'height'; // 사이즈명
            me.xyName = me.isHoriz ? 'X' : 'Y'; // 좌표방향명
            me.dirName = me.isHoriz ? 'left' : 'top'; // 방향명

            //me.conSize = me.$el[me.sizeName]();
            me.$bar.css(me.sizeName, 0).data('percent', 0).css('cursor', 'pointer').attr('title', '0'); // 타이틀
            me.$el.css('cursor', 'pointer');

            me._bindEvents();
        },
        /**
         * 이벤트 비인딩
         * @private
         */
        _bindEvents: function() {
            var me = this;

            // 바의 위치를 클릭한 위치로 이동
            me.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (me.$el.hasClass('disabled')) {
                    return;
                }

                var val = e['page' + me.xyName] - me.$el.offset()[me.dirName],
                    conSize = me.$el[me.sizeName](), // 트랙사이즈
                    per = ((me.isHoriz ? val : conSize - val) / conSize), // 퍼센테이지
                    newValue = (per * me.options.maxValue);

                me._trigger(newValue);
            });

            //me._bindBarSlide(); //
            // 모바일이 아닐 경우 키보드이벤트를 바인딩
            !isTouch && me._bindKeyboardEvents();
        },

        /**
         * 바에 드래그기능 바인딩
         */
        _bindBarSlide: function() {
            var me = this,
                start = 0,
                conSize = 0,
                timer = null;

            me.hammer = new Hammer(me.$bar[0]);
            me.hammer.on('dragstart', function(e) {
                if (me.options.maxValue <= 0 || me.$el.hasClass('disabled')) {
                    e.preventDefault();
                    return false;
                }
                // 드래그사 시작될 때 위치와 컨테이너 사이즈를 보관
                start = me.$bar.width();
                conSize = me.$el[me.sizeName]();
            });
            me.hammer.on('drag', function(e) {
                if (me.options.maxValue <= 0) {
                    return;
                }

                var val = e.gesture.deltaX + start,
                    per = (conSize - (conSize - val)) / conSize,
                    newValue = per * me.options.maxValue;

                me.setValue(newValue);

                clearTimeout(timer);
                timer = setTimeout(function() {
                    // 실시간으로 바뀌면 문제가 생길 소지가 있으므로 딜레이를 준다.(드래그가 끝난 후 0.3초동안 움직임이 없는 경우 이벤트를 날림)
                    me._trigger(newValue);
                }, 300);
            });
        },

        /**
         * 키보드 이벤트를 바인딩
         */
        _bindKeyboardEvents: function() {
            var me = this;

            if (!isTouch) {
                // 비터치기반 디바이스에서 키보드의 상하좌우 키로 바를 이동시킬 수 있도록 바인딩
                me.upKey = me.isHoriz ? 39 : 38; // 업키보드
                me.downKey = me.isHoriz ? 37 : 40; // 다운 키보드
                var lastTime = 0;

                me.on('keydown', function(e) {
                    if (e.keyCode === me.downKey || e.keyCode === me.upKey) { // <> 38:up, 40: down
                        e.stopPropagation();
                        e.preventDefault();

                        if (lastTime === 0) {
                            lastTime = +new Date;
                        }

                        // 키를 누른 상태가 유지되면, 0.3초마다 바를 이동
                        if ((+new Date) - lastTime < 200) {
                            return;
                        }

                        lastTime = +new Date;
                        me._moveBar(e.keyCode === me.downKey ? -1 : 1);
                    }
                }).on('keyup', function(e) {
                    if (e.keyCode === me.downKey || e.keyCode === me.upKey) {
                        e.stopPropagation();
                        e.preventDefault();

                        me._moveBar(e.keyCode === me.downKey ? -1 : 1);
                    }
                });
            }
        },

        /**
         * 값이 변경되었음을 날림
         * @param {Number} newValue
         */
        _trigger: function(newValue) {
            if (this.$el.hasClass('disabled')) {
                return;
            }

            var me = this,
                e = $.Event('valuechange');

            me.triggerHandler(e, {
                value: newValue
            });
            // 핸들러쪽에서 e.preventDefault()를 했을 경우 값변경을 취소
            if (e.isDefaultPrevented()) {
                return;
            }

            me.setValue(newValue);
        },

        /**
         * 바 이동
         * @param {Number} dir -1: 감소, 1: 증가
         * @private
         */
        _moveBar: function(dir) {
            var me = this,
                newValue = 0;

            if (dir < 0) {
                newValue = Math.max(0, me.value - me.options.distValue);
            } else {
                newValue = Math.min(me.options.maxValue, me.value + me.options.distValue);
            }

            me._trigger(newValue);
        },

        /**
         * 최대값 설정
         * @param {Number} newValue
         */
        setMaxValue: function(newValue) {
            var me = this;
            me.options.maxValue = newValue;
            if (newValue < me.value) {
                me.setValue(newValue);
            }
        },

        /**
         * 타이틀 변경
         * @param {String} value
         */
        setTitle: function(value) {
            var me = this;

            me.$bar[0].title = value;
        },

        /**
         * 값 설정
         * @param {Number} value
         */
        setValue: function(value) {
            var me = this,
                val;

            if (value < me.options.minValue || value > me.options.maxValue) {
                return;
            }

            me.value = value;
            if (me.options.maxValue === 0) {
                me.$bar[0].style[me.sizeName] = '0%';
                me.$bar.data('percent', 0);
            } else {
                me.$bar[0].style[me.sizeName] = (val = Math.min(100, ((value / me.options.maxValue) * 100))) + '%';
                me.$bar.data('percent', val);
            }
        }
    });

    /**
     * 메인의 곡리스트를 담당하는 클래스
     * @class
     * @name axl.ui.UITrackList
     * @extends axl.ui.View
     */
    var UITrackList = ui.View.extend( /** @lends axl.ui.UITrackList */ {
        name: 'TrackList',
        selectors: {
            trackTab: '.d-track-tab' // 탭버튼 클래스
        },

        /**
         * 생성자
         * @param {jQuery|Element|String} el
         * @param {JSON} options
         */
        initialize: function(el, options) {
            var me = this;
            if (me.callParent(el, options) === false) {
                return;
            }

            me._bindEvents();
            me.getList();
        },
        /**
         * 이벤트 비인딩
         * @private
         */
        _bindEvents: function() {
            var me = this;

            // 하단 버튼 숨김
            me.$trackTab.find('.tab_cont>.btn_play_control:last').addClass('none');

            // 전체 듣기
            me.$trackTab.on('tabchanged', function(e, data) {
                if (me._getCurrentTab().attr('data-loaded') !== 'true') {
                    me.getList();
                }
            });

            me.on('click', '.btn_more', function() {
                // 더보기
                me.getList({
                    more: true
                });
            }).on('click', '.list_play', function() {
                me.triggerHandler('showplaylist');
            }).on('click', '.all_play', function() {
                me.triggerHandler('playall', {
                    tracks: me.getListTracks()
                });
            });

        },

        // 현재 활성화된 탭
        _getCurrentTab: function() {
            return this.$trackTab.find('li.on');
        },

        // 현재 활성화된 리스트
        _getCurrentList: function() {
            return this.$trackTab.find('li.on ul.list');
        },

        // 현재 활성화된 리스트의 마지막 seq
        _getCurrentLastNum: function() {
            return this._getCurrentList().find('>li:last').attr('data-num') | 0;
        },

        // 현재 활성화된 리스트에 있는 트랙배열 반환(id만 존재)
        getListTracks: function() {
            var me = this,
                tracks = me._getCurrentList().find('.d-track').map(function() {
                    return $(this).attr('data-id');
                }).get();
            return tracks;
        },

        // 서버에서 리스트 조회
        getList: function(opts) {
            var me = this,
                $list = me._getCurrentList(),
                params = me._getCurrentTab().attr('data-params') || '';
            opts = opts || {};

            if (!opts.more) {
                // 리스트 초기에 로딩이미지 표시
                $list.html('<li class="list_loading"><span><span>로딩중</span></span></li>');
            }

            return $.ajax({
                url: axl.Env.get('emartMusicListList') + '?' + params + '&next_id=' + me._getCurrentLastNum(),
                cache: false,
                timeout: 15000
            }).done(function(html) {
                var curTab = me._getCurrentTab().attr('data-loaded', 'true');

                if (!opts.more) {
                    // 더보기가 아닐 경우 리스트 초기화
                    $list.empty();

                    if (!$.trim(html)) {
                        $list.html('<li style="height:200px;text-align:center;line-height:200px">목록이 없습니다.</li>');
                        curTab.find('.btn_more').addClass('none');
                        return;
                    }
                }

                var $lastLi = $list.append(html).find('>li:last'),
                    lastNum = $lastLi.attr('data-num') | 0,
                    totalCount = $lastLi.attr('data-total-count') | 0;

                // 5개 이상일 때 하단버튼 영역을 표시
                if (lastNum > 5) {
                    me._getCurrentTab().find('.btn_play_control:last').removeClass('none');
                }

                me.triggerHandler('loadedlist', {
                    totalCount: totalCount
                });
                if (lastNum >= totalCount) {
                    // 모든 항목을 가져왔으면 더보기를 숨긴다.
                    curTab.find('.btn_more').addClass('none');
                } else {
                    // 더보기 버튼에 현재까지 가져온 갯수와 총 갯수를 표시
                    curTab.find('.btn_more').removeClass('none')
                        .html('<span>더보기<span class="num">(' + lastNum + '/' + totalCount + ')</span></span>');
                }
            });
        },

        toggle: function(v) {
            this.$el.toggle(v);
        }
    });

    /**
     * 플레이리스트 클래스
     * @class
     * @name axl.ui.UIPlayList
     * @extends axl.ui.View
     */
    var UIPlayList = ui.View.extend( /** @lends axl.ui.UIPlayList */ {
        name: 'PlayList',
        selectors: {
            list: '>ul'
        },

        /**
         * 생성자
         * @param {jQuery|Element|String} el
         * @param {JSON} options
         */
        initialize: function(el, options) {
            var me = this;
            if (me.callParent(el, options) === false) {
                return;
            }

            // 트랙리스트 관리
            me.tracks = new ArrayList();

            // 리스트에 표시될 li요소의 템플릿 문자열
            me.tmplPlayRow = core.template(['<li class="d-track" data-id="<$=id$>">', '<a href="#" title="곡 재생하기" aria-describedby="d-toast-box"><span class="title"><span class="hide d-title"></span><em class="d-no">0</em><$=title$></span>', '<span class="artist"><$=artist$></span></a>', '<button type="button" class="btn_del">삭제</button>', '</li>'].join(''));

            me._bindEvents();
        },

        /**
         * 이벤트 비인딩
         * @private
         */
        _bindEvents: function() {
            var me = this;

            // 플레이리스트
            // 삭제하기
            me.$list.on('click', '.btn_del', function(e) {
                e.preventDefault();

                var $li = $(this).closest('li.d-track'),
                    id = $li.attr('data-id');

                me.remove(id);
                core.music.showToast('선택한 곡이 삭제되었습니다.');
            }).on('click', 'a', function(e) {
                // 곡제목을 클릭했을 때 selected 이벤트를 발생시킴
                e.preventDefault();
                me.triggerHandler('selected', {
                    id: $(this).closest('.d-track').attr('data-id')
                });
            });

            me.tracks.on('added', function(e, data) {
                // me.tracks에 곡이 추가되었을 때 dom에 새로운 li요소를 추가
                me._addRow(data);
                me.triggerHandler('addedtrack', data);
            }).on('removed', function(e, data) {
                // me.tracks에서 곡이 삭제되었을 때 dom에 있는 해당 li를 삭제
                me._removeRow(data.id);
                me.triggerHandler('removedtrack', {
                    id: data.id
                });
            })
        },

        /**
         * 새로운 LI를 생성해서 append
         * @param data
         * @private
         */
        _addRow: function(data) {
            var me = this;
            me.$list.append(me.tmplPlayRow(data));
            me._numberingRows();
        },

        /**
         * id에 해당하는 LI요소를 삭제
         * @param id
         * @private
         */
        _removeRow: function(id) {
            var me = this,
                $li = me.$list.find('li.d-track[data-id="' + id + '"]');

            $li.remove();
            me._numberingRows();
        },

        /**
         * this.tracks에 곡 추가
         * @param data
         * @returns {boolean}
         */
        add: function(data) {
            return this.tracks.add(data);
        },

        /**
         * this.tracks에서 id에 해당하는 항목을 삭제
         * @param id
         * @returns {*}
         */
        remove: function(id) {
            return this.tracks.remove(id);
        },

        /**
         * 순번을 다시 매김
         */
        _numberingRows: function() {
            this.$list.find('.d-no').each(function(i) {
                $(this).text(i + 1);
            });
        },

        /**
         * 리스트에 있는 트랙 항목들 반환
         */
        getTracks: function() {
            return this.tracks.getAll();
        },

        /**
         * 리스트에 주어진 트랙이 존재하는가
         * @param {String|JSON} track 트랙정보
         * @return {Boolean}
         */
        hasRow: function(track) {
            var id = typeof track === 'string' ? track : track.id;
            return this.tracks.has(id);
        },

        /**
         * id에 해당하는 row를 활성화
         * @param {String} id 트랙 id
         */
        activate: function(id) {
            (this.$activeRow || this.$list.find('>li.on')).removeClass('on').find('.d-title').html('');
            if (id) {
                this.$activeRow = this.$list.find('>li[data-id="' + id + '"]');
                this.$activeRow.activeItem('on').find('.d-title').html('재생 중 : ');
                return;
            }
        },
        /**
         * 전체 row를 삭제
         */
        removeAll: function() {
            var me = this,
                tracks = this.getTracks();
            core.each(this.tracks.list, function(item) {
                me.remove(item.id);
            });
            this.triggerHandler('removedalltrack', {
                tracks: tracks
            });
        },

        /**
         * this.tracks.getAll wrapper
         * @returns {Array|*}
         */
        getAll: function() {
            return this.tracks.getAll.apply(this.tracks, core.toArray(arguments));
        },

        /**
         * this.tracks.size wrapper
         * @returns {Number|*}
         */
        size: function() {
            return this.tracks.size();
        },

        /**
         * this.tracks.current wrapper
         * @returns {*}
         */
        current: function() {
            return this.tracks.current.apply(this.tracks, core.toArray(arguments));
        }
    });

    /**
     * 오디오 플레이어 클래스
     * @class
     * @name axl.ui.AudioPlayer
     * @extends axl.ui.View
     */
    var AudioPlayer = ui.View.extend( /** @lends axl.ui.AudioPlayer */ {
        name: 'AudioPlayer',
        defaults: {
            mediaType: 'audio/mp3', // 기본 미디어 타입
            idAttribute: 'id', // 트랙의 id명
            srcAttribute: 'src', // 트랙의 src명
            shuffle: false, // 섞기 여부
            loop: '', // 곡 반복
            alwaysShowHours: false, // 시간 표시 여부
            showTimecodeFrameCount: false, //
            framesPerSecond: 0.5, // 초당 프렘수
            startVolume: 0.5, // 기본 음량
            maxTrackCount: 50, // 플레이리스트에 추가할 수 있는 최대 갯수
            features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'volume', 'fullscreen'],
            success: function() {
                // 미디어객체가 성공적으로 생성됐을 실행할 콜백함수

            }
        },
        selectors: {
            timeTrack: '.d-timetrack', // 타임트랙
            timeBar: '.d-timebar', // 타임바
            time: '.d-time', // 타임표시 요소
            duration: '.d-duration', // 총시간 표시 요소
            lyricBox: '.info_txt', // 가사영역
            artistLink: '.info_add .artist', // 아티스트 링크
            movieLink: '.info_add .movie', // 동영상 링크
            lyricsToggleBtn: '.music_info .lyrics', // 가사펼치기 버튼
            shareLink: '.info_add .sns_wrap a', // 공유링크
            reviewLink: '.info_add a.review', // 리뷰버튼
            shareToggle: '.info_add button.share' // 공유박스 토글 버튼
        },
        /**
         *
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if (me.callParent(el, options) === false) {
                return;
            }

            // 가사영역 템플릿
            me.tmplTrackInfo = core.template(['<p><$=track.songwriter ? "작곡 : " + track.songwriter : ""$><$=track.songwriter && track.lyricist ? " / " : ""$><$=track.lyricist ?  "작사 : " + track.lyricist : ""$></p>', '<$ if(track.lyrics) { $>', '<p class="word"><$=track.lyrics.replace(/\\n/g, "<br>")$></p>', '<$ } else { $>', '<p class="word">등록된 가사가 없습니다.</p>', '<$ } $>'].join(''));

            me.playList = new UIPlayList(me.$('.list_wrap'));
            //////////////////////////////////////////////////////////////////////////////

            var id = 'media_' + nextIdx(),
                timer = setTimeout(function() {
                    alert("죄송합니다. 현재 사용하시는 브라우저에는 본 오디오기능을 사용하실 수 없습니다.\nHTML5 혹은 플래쉬플러그인을 지원하는 브라우저에서 사용하실 수 있습니다.");
                }, 10000); // 10초 내에 미디어객체가 생성이 안되면 메세지 출력

            // 페이지에 audio 객체 삽입
            me.$el.append('<audio id="' + id + '" type="audio/mp3" preload="auto" src="javascript:;" style="display:none;"></audio>');
            // media객체 생성
            new MediaElement(id, $.extend({}, me.options, {
                success: function(media, node) {
                    clearTimeout(timer);

                    me.media = media;
                    me.$media = $(media);

                    // 재생관련 버튼들을 활성화시킨다.
                    me.enables(false);
                    // 오디오 관련 이벤트를 바인딩
                    me._bindAudioUI();
                    // callback 실행
                    me.options.success.apply(me, arguments);
                    // 기본 음량 설정
                    me.setVolume(me.options.startVolume);
                    me.triggerHandler('success', {
                        media: media
                    });
                },
                error: function() {
                    me.triggerHandler('error');
                }
            }));
            ///////////////////////////////////////////////////////////////////////////////////////

            // 플레이어 UI를 재생모드로 초기화
            me.initPlayer();

            // 반복 여부
            if (me.options.loop === 'one') {
                // 한곡반복
                me.$('.d-loop').addClass('type2');
            } else if (me.options.loop === 'all') {
                // 전체반복
                me.$('.d-loop').addClass('on');
            }
        },

        debug: function(msg) {
            var me = this;
            if (!me.$debug) {
                me.$debug = $('#debug');
            }
            if (me.$debug.length === 0) {
                return;
            }

            var val = me.$debug[0].value;
            me.$debug[0].value = msg + "\n" + val;
        },

        /**
         * 미디어객체에서 발생하는 이벤트에 핸들러 설정하고 , 현재 클래스에서 바깥으로 이벤트를 던져줌
         * @private
         */
        _handleMedia: function() {
            var me = this;


            me.$media.on('pause volumechange ended loadeddata canplay seeked seeking waiting error playing loadedmetadata timeupdate ready', function(e) {
                switch (e.type) {
                    //case  'play':
                    case 'playing':
                        me._readyPlay();
                        me.triggerHandler(e.type, me.playList.current());
                        break;
                    case 'pause':
                        me._togglePlayButton(false);
                        me.triggerHandler(e.type, me.playList.current());
                        break;
                    case 'ended':
                        me.pause();

                        if (!me._checkNextPlay()) {
                            me.initPlayer();
                            me.triggerHandler(e.type, {});
                        }
                        break;
                    case 'timeupdate':
                        me._showTime();
                        // play후에,
                        // loadedmetadata, playing, canplay 상태에 도달했는데도 duration이 nan인 경우가 많아서
                        // timeupdate이벤트에서 duration이 유효값일 때까지 체크하여 총 시간을 표시한다.
                        me._showDuration();
                        break;
                    case 'canplay':
                        me.enables();
                        me.triggerHandler(e.type, me.playList.current());
                        break;
                    case 'waiting':
                        break;
                    case 'loadeddata':
                    case 'loadedmetadata':
                        break;
                    case 'error':
                        var msg = '';

                        switch (e.target.error.code) {
                            case e.target.error.MEDIA_ERR_ABORTED:
                                console.log(msg = 'You aborted the video playback.');
                                break;
                            case e.target.error.MEDIA_ERR_NETWORK:
                                console.log(msg = 'A network error caused the audio download to fail.');
                                break;
                            case e.target.error.MEDIA_ERR_DECODE:
                                console.log(msg = 'The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                                break;
                            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                console.log(msg = 'The video audio not be loaded, either because the server or network failed or because the format is not supported.');
                                break;
                            default:
                                console.log(msg = 'An unknown error occurred.');
                                break;
                        }

                        me.triggerHandler('error', {
                            code: e.target.error.code,
                            message: msg
                        });
                        break;
                }

                if (e.type !== 'timeupdate') {
                    me.debug('event: ' + e.type);
                    console.log('type:', e.type);
                }
                //me.triggerHandler(e.type, {media: me.media});
            });
        },

        /**
         * UI요소 내부에 있는 컨트롤들에 핸들러 설정
         * @private
         */
        _bindAudioUI: function() {
            var me = this;
            me._handleMedia();
            me._initSlidebars();

            // ios의 미디어센터에서 다음, 이전을 클릭할 때,
            // 이를 전달받아 적절히 처리해준다.
            axl.PubSub.on('notifyEmartMusicPrev', function() {
                if (me.playList.size() > 0) {
                    me.prev();
                }
            }).on('notifyEmartMusicNext', function() {
                if (me.playList.size() > 0) {
                    me.next();
                }
            });

            // 아티스트 링크, 동영상 링크 클릭시 비활성화 상태이면, 클릭이벤트를 무효화 시킨다.
            // a링크는 disabled가 안되기 때문에 스크립트단에서 무효화시켜야 됨.
            me.$artistLink.add(me.$movieLink).on('click', function(e) {
                if ($(this).hasClass('disabled')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            me.$lyricsToggleBtn.on('click', function(e) {
                e.preventDefault();
                var hasOn = me.$lyricsToggleBtn.toggleClass('on').hasClass('on');

                me.$lyricBox.toggleClass('on', hasOn);
                me.$lyricsToggleBtn.html(hasOn ? '가사 접기' : '가사 펼치기');
            });

            me.on('click', '.d-play', function(e) {
                // 재생 클릭
                e.preventDefault();
                var track = me.playList.current();
                if (!track) {
                    return;
                }
                if (me.currentSrc !== track.src) {
                    me.playByTrack(track);
                    return;
                }
                me.play();
            }).on('click', '.d-pause', function(e) {
                // 일시 정지
                e.preventDefault();
                me.pause();
            }).on('click', '.d-stop', function(e) {
                // 중지
                e.preventDefault();

                me.pause();
                me.setCurrentTime(0);
                me.triggerHandler('stop', {
                    media: me.media
                });
            }).on('click', '.d-prev', function(e) {
                // 이전 버튼
                e.preventDefault();
                me.prev();
            }).on('click', '.d-next', function(e) {
                // 다음 버튼
                e.preventDefault();
                me.next();
            }).on('click', '.d-loop', function(e) {
                // 반복 버튼
                e.preventDefault();

                var $el = $(this);
                if ($el.hasClass('on')) {
                    $el.removeClass('on').html('반복재생 없음');
                    me.options.loop = '';
                } else if ($el.hasClass('type2')) {
                    $el.replaceClass('type2', 'on').html('전체반복');
                    me.options.loop = 'all';
                } else {
                    $el.addClass('type2').html('한곡반복');
                    me.options.loop = 'one';
                }
            }).on('click', '.d-shuffle', function(e) {
                // 랜덤재생
                e.preventDefault();

                $(this).toggleClass('on', me.options.shuffle = (me.playList.tracks.options.isShuffle = !me.playList.tracks.options.isShuffle));
            });

            ////////////////////////////////////////////////////////////////////////////
            var enableTimer = null;
            me.playList.on('addedtrack', function(e, track) {
                clearTimeout(enableTimer);
                enableTimer = setTimeout(function() {
                    me.enables(true);
                }, 300);
            }).on('removedtrack', function(e, data) {
                console.log(me.playList.size());
                // 트랙이 삭제시
                if (me.playList.size() < 1) {
                    // 전체가 삭제됐을 때 초기화시킴
                    me.stop();
                    me.setSrc('');
                    me.initPlayer();
                } else {
                    me.enables(true);
                    if (data.id === (me.currentTrack || {}).id) {
                        if (me.isPlaying()) {
                            me.playByTrack(me.playList.tracks.current());
                        } else {
                            me.initPlayer();
                        }
                    }
                }
            }).on('selected', function(e, data) {
                // 클릭한 트랙으로 재생시키기
                e.preventDefault();
                console.log(data.id);
                me.playById(data.id);
            });

            me.on('ended error', function() {
                me.playList.activate(false);
            });

            // 공유박스 토글
            me.$shareToggle.click(function(e) {
                var $el = $(this);
                $el.toggleClass('on');
                $el.attr('title', $el.hasClass('on') ? ($el.attr('title') || '').replace(/보기$/, '닫기') : ($el.attr('title') || '').replace(/닫기$/, '보기'));
                e.stopPropagation();
            });
        },

        _initSlidebars: function() {
            var me = this,
                isPlaying = false;
            //////////////////////////////////////////////////////////////////////////////
            // 시간 진행바
            me.$timeTrack.addClass('d-control');
            me.timeCtrl = new UISlideBar(me.$timeTrack[0], {
                selectors: {
                    bar: '.d-timebar'
                }
            }).on('valuechange', function(e, data) {
                me.setCurrentTime(data.value);
            }).on('dragstart', function(e) {
                if (me.isPlaying()) {
                    isPlaying = true;
                    me.pause();
                } else {
                    isPlaying = false;
                }
            }).on('dragend', function() {
                if (isPlaying) {
                    me.play();
                }
            });

            //var delayTimeupdate;
            me.timeCtrl.setValue(0);
            me.timeCtrl.setMaxValue(0);

        },

        /**
         * 플레이어 초기화
         */
        initPlayer: function() {
            var me = this;

            me.currentSrc = undefined;
            me.enables(false);
            me.playList.activate();
            me._togglePlayButton(false);
            me._setTrackInfo({});
            me._initTime();

            me.$shareToggle.removeClass('on');
        },


        /**
         * 상단헤더에 있는 재생버튼을 클릭했을 때 호출됨
         */
        playStart: function() {
            var me = this;
            if (me.playList.size() === 0) {
                alert('추가된 곡이 없습니다.');
                return;
            }

            var track = me.playList.current();
            if (me.currentSrc !== track.src) {
                me.playByTrack(track);
                return;
            }
            me.play();
        },

        /**
         * 주요 기능버튼들의 활성화 여부 설정
         */
        enables: function(isEnabled) {
            var me = this;
            if (isEnabled === false && me.media && me.media.readState === me.media.HAVE_CURRENT_DATA && !me.media.paused) {
                me.stop();
                me.setCurrentTime(0);
            }

            var $controls = me.$('.player_wrap .d-control');
            $controls.disabled(isEnabled === false).filter('.d-prev, .d-next, .d-pause, .d-play').disabled(me.playList.size() < 1);
        },

        /**
         * 트랙정보 표시
         */
        _setTrackInfo: function(track) {
            var me = this,
                track = track || me.playList.current();

            if (!track) {
                track = {};
            }

            me._updateLyricBox(track);

            me.$artistLink.attr({
                'href': track.artist_url || 'javascript:;',
                'title': track.artist_url ? '새 창' : '아티스트가 없습니다.'
            })
                .disabled(!track.artist_url);

            me.$movieLink.attr({
                'href': track.youtube_url || 'javascript:;',
                'title': track.youtube_url ? '새 창' : '동영상이 없습니다.'
            })
                .disabled(!track.youtube_url)

            me.$shareLink.each(function() {
                if (track.seq) {
                    if ($(this).hasClass('d-facebook')) {
                        this.href = axl.getHost() + '/music/main.do?play_seq=' + track.seq;
                    } else {
                        this.href = track.music_file_url || 'javascript:;';
                    }
                } else {
                    this.href = 'javascript:;';
                }
            })
                .attr({
                'data-title': track.title || ''
            })
                .disabled(!track.music_file_url);

            me.$shareToggle.disabled(!track.music_file_url);

            me.$reviewLink.attr('href', track.seq ? core.Env.get('emartReviewUrl') + '?music_seq=' + track.seq : 'javascript:;').disabled(!track.seq);

            me.triggerHandler('changeTrack', track);
        },

        _updateLyricBox: function(track) {
            track || (track = {});

            var me = this,
                // 가사 크기(높이) 계산
                getHeightLyrics = function() {
                    var height = me.$lyricBox.css({
                        'overflow': 'auto',
                        'height': 'auto'
                    }).height();
                    me.$lyricBox.css({
                        'overflow': '',
                        'height': ''
                    });
                    return height;
                };

            // 가사가 있을 경우 펼침버튼 표시 ///
            me.$lyricBox.html(track.id ? me.tmplTrackInfo({
                track: track
            }) : '<p class="nodata">듣고 싶은 노래를 선택하세요. </p>');
            me.$lyricsToggleBtn.toggleClass('none', getHeightLyrics() <= 160);
            /////////////////////////////////////////
        },

        /**
         * 다음곡 재생
         * @private
         */
        _checkNextPlay: function() {
            var me = this;

            // 한곡 반복
            if (me.options.loop === 'one') {
                me.playByTrack(me.playList.current());
                return true;
            }

            // 전체 반복
            if (me.playList.tracks.isLast() && me.options.loop !== 'all') {
                me.playList.tracks.setCurrentIndex(0);
                return false;
            }

            me.next();
            return true;
        },

        /**
         * 재생버튼 토글링
         * @param isPlay
         * @private
         */
        _togglePlayButton: function(isPlay) {
            var me = this;

            if (isPlay) {
                me.$('.d-play').replaceClass('d-play btn_play', 'd-pause btn_stop').attr('title', '일시정지').html('일시정지');
            } else {
                me.$('.d-pause').replaceClass('d-pause btn_stop', 'd-play btn_play').attr('title', '재생').html('재생');
            }
            me.triggerHandler(isPlay ? 'audioplay' : 'audiopause')
        },

        /**
         * time를 00:00 형식으로 변환
         * @param {Number} time 시간
         */
        _generateTime: function(time) {
            var me = this;
            return time | 0 > 0 ? mejs.Utility.secondsToTimeCode(time,
            false,
            false,
            me.options.framesPerSecond || 25) : '00:00';
        },

        /**
         * 시간영역 초기화
         */
        _initTime: function() {
            var me = this;

            me.$time.html('00:00');
            me.$duration.html('00:00');

            me.timeCtrl.setValue(0);
            me.timeCtrl.setMaxValue(0);
        },

        /**
         * 로딩문구 표시
         */
        _showLoading: function() {
            var me = this;

            me.playList.activate();
            me._setTrackInfo({
                title: 'loading...'
            });
            me._initTime();
            me._togglePlayButton(false);
            clearTimeout(me.playTimer);
            me.playTimer = setTimeout(function() {
                axl.music.showToast('시간초과로 재생이 취소되었습니다.');
                me.initPlayer();
                me.stop();
            }, 60000);
        },

        /**
         * 재생 준비
         */
        _readyPlay: function() {
            var me = this,
                newTrack = me.playList.current();

            me._togglePlayButton(true);
            clearTimeout(me.playTimer);

            //if(me.currentTrack && me.currentTrack.id == newTrack.id) { return; }

            me._setTrackInfo(newTrack);
            me.playList.activate(newTrack.id);

            me.currentTrack = newTrack;
        },

        /**
         * 현재 시간 표시
         * @private
         */
        _showTime: function(time, force) {
            var me = this;

            // 1초마다 갱신되게끔...
            if (!me._lastShowTime) {
                me._lastShowTime = +new Date;
            }

            if (!force && (+new Date) - me._lastShowTime < 1000) {
                return;
            }

            me._lastShowTime = +new Date;
            time = typeof time === 'undefined' ? me.media.currentTime : time;
            time = me.currentSrc ? time : 0;

            me.timeCtrl.setValue(time);
            me.$time.html(me._generateTime(time));
        },

        /**
         * 총 시간 표시
         * @private
         */
        _showDuration: function(time) {
            var me = this;

            // 1초마다 갱신되게끔...
            if (!me._lastDurationTime) {
                me._lastDurationTime = +new Date;
            }

            if ((+new Date) - me._lastDurationTime < 1000) {
                return;
            }

            me._lastDurationTime = +new Date;

            // play후에,
            // loadedmetadata, playing, canplay 상태에 도달했는데도 duration이 nan인 경우가 많아서
            // timeupdate이벤트에서 duration이 유효값일 때까지 체크하여 총 시간을 표시한다.

            if (me.currentSrc && typeof time === 'undefined' && !isNaN(me.media.duration) && me.media.duration !== 6000 // 로딩전에 왜 6000 이 나오는지 모르겠음..;;;;;;;;;;;;;;;;;;;;;;
            &&
            me.media.duration > 1) { // 특정 디바이스에서 1초로 나오는 경우가 있음......;;;;;;;;;;;

                time = me.media.duration;
            } else {
                time = 0;
            }

            me.timeCtrl.setMaxValue(time);
            me.$duration.html(me._generateTime(time));
        },

        getMedia: function() {
            return this.media;
        },

        /**
         * id에 해당하는 트랙이 이미 존재하는가
         */
        hasTrack: function(id) {
            return this.playList.tracks.has(id);
        },

        isPlaying: function() {
            return !this.media.paused;
        },
        /**
         *
         * @param time
         * @param id
         */
        playById: function(id) {
            var track = this.playList.current(id);
            this.playByTrack(track);
        },
        /**
         *
         * @param track
         */
        playByTrack: function(track) {
            if (!track || !track.src) {
                this.triggerHandler('error', '[playById()] 선택하신 트랙이 리스트에 존재하지 않습니다.');
                return;
            }

            this.debug('-- playByTrack --');

            this.stop();
            this.setCurrentTime(0);
            this.setSrc(track.src);

            this._showLoading();

            this.navigate();
            //this.play(0);
            //this.pause(); // 모바일에서 play를 한번 호출했을 때 시작이 안되는 경우가 있어서 play, pause, play순으로 호출해야 한다..;;
            clearTimeout(this._playTimer);
            this._playTimer = setTimeout(function() {
                this.play();
            }.bind(this), 1000);
        },

        /**
         * 주어진 ids순으로 재정렬
         * @param {Array} ids
         */
        sort: function(ids) {
            this.playList.tracks.sort(ids);
        },

        /**
         * 주어진 ids에 해당하는 트랙 제거
         * @param {Array} ids
         */
        remove: function(ids) {
            var me = this;

            me.playList.remove(ids);
        },

        /**
         * src 설정
         * @param url
         */
        setSrc: function(url) {
            var me = this;

            if (me.media.pluginType === 'native' && !('oncanplay' in document.createElement('audio'))) {
                me.$media.on('progress.canplay', function() {
                    me.$media.triggerHandler('canplay');
                    me.$media.off('progress.canplay');
                });
            }

            //alert(url);
            me.currentSrc = url;
            me.media.setSrc(url);
        },

        /**
         * 로드
         */
        navigate: function() {
            this.media.load();
        },
        /**
         * 재생
         * @param time
         */
        play: function(time) {
            this.media.play(time);
        },

        /**
         * 일시정지
         */
        pause: function() {
            this.media.pause();
        },
        /**
         * 정지
         */
        stop: function() {
            try {
                this.media.stop();
            } catch (e) {
                this.media.pause();
            }
            try {
                this.setCurrentTime(0);
            } catch (e) {}
        },
        /**
         * 다음곡 재생
         */
        next: function() {
            var me = this,
                track = me.playList.tracks.next();

            me.pause();
            if (!track) {
                return;
            }

            me.playByTrack(track);

        },
        /**
         * 이전 곡 재생
         */
        prev: function() {
            var me = this,
                track = me.playList.tracks.prev();

            if (!track) {
                return;
            }

            me.playByTrack(track);
        },
        /**
         * 볼륨 설정
         * @param vol
         */
        setVolume: function(vol) {
            try {
                this.media.setVolume(vol);
            } catch (e) {}
        },
        /**
         * 음소거
         * @param muted
         */
        setMuted: function(muted) {
            this.media.setMuted(muted);
        },
        /**
         * 재생 위치 설정
         * @param time
         */
        setCurrentTime: function(time) {
            try {
                this.media.setCurrentTime(time);
            } catch (e) {}
        },

        /**
         * 트랙리스트를 담고 있는 배열객체를 반환
         * @return {JSON}
         */
        getTracks: function() {
            return this.playList.tracks;
        },

        getPlaylistTracks: function() {
            return this.playList.getAll() || [];
        },

        /**
         * 트랙 추가
         * @param {JSON} track 트랙정보
         */
        addTrack: function(track) {
            this._add(track);
        },

        /**
         * 다중 트랙 추가
         * @param {Array} tracks 트랙정보
         */
        addTracks: function(tracks) {
            var t = core.isArray(tracks) ? tracks : [].concat(tracks);

            core.each(t, function(track) {
                this._add(track);
            }.bind(this));
        },

        /**
         * 전체 삭제
         */
        removeAll: function() {
            this.playList.removeAll();
        },

        /**
         * 곡추가
         * @param data
         */
        _add: function(data) {
            if (this.playList.size() >= this.options.maxTrackCount) {
                alert('최대 50곡까지 추가하실 수 있습니다.');
                return;
            }

            if (!$.trim(data[this.options.idAttribute]) || !$.trim(data[this.options.srcAttribute])) {
                return;
            }
            if (!data['id']) {
                data['id'] = data[this.options.idAttribute];
            }
            if (!data['src']) {
                data['src'] = data[this.options.srcAttribute];
            }

            this.playList.add(data);
        },
        /**
         * 순서섞기
         */
        shuffle: function() {
            this.playList.tracks.shuffle();
        },

        /**
         *
         * @param v
         */
        toggle: function(v) {
            if (v && this.$shareToggle.hasClass('on')) {
                this.$shareToggle.trigger('click');
            }
            this.$el.toggle(v);
        }
    });

    /**
     * 해쉬를 이용한 히스토리 기능을 담당하는 모듈
     * 단, ios의 앱에서는 해쉬가 아닌 숨겨진 iframe으로 처리됨
     * (아이폰 앱인 경우 무조건 load 이벤트가 발생해야만 하단 히스토리 버튼이 활성화되기 때문.)
     */
    var Router = core.Base.extend({
        $statics: {
            routerIdx: 0
        },
        /**
         *
         * @param options
         */
        initialize: function(options) {
            var me = this;

            me.options = $.extend({
                link: 'a[data-ajax=true]',
                type: 'iframe' // hash, iframe, push
            }, options);

            me.cid = Router.routerIdx++;
            me.routeList = {};
            me._init();

            me._listeners = $(me);

            window['routerInstances_' + me.cid] = me;
        },
        /**
         * 이벤트 핸들러 등록
         * @param {Object} name 이벤트명
         * @param {Object} cb 핸들러
         */
        on: function() {
            var lsn = this._listeners;
            lsn.on.apply(lsn, arguments);
            return this;
        },

        /**
         * 한번만 실행할 이벤트 핸들러 등록
         * @param {Object} name 이벤트명
         * @param {Object} cb 핸들러
         */
        once: function() {
            var lsn = this._listeners;
            lsn.once.apply(lsn, arguments);
            return this;
        },

        /**
         * 이벤트 핸들러 삭제
         * @param {Object} name 삭제할 이벤트명
         * @param {Object} cb (Optional) 삭제할 핸들러. 이 인자가 없을 경우 name에 등록된 모든 핸들러를 삭제.
         */
        off: function() {
            var lsn = this._listeners;
            lsn.off.apply(lsn, arguments);
            return this;
        },

        /**
         * 이벤트 발생
         * @param {Object} name 발생시킬 이벤트명
         */
        trigger: function() {
            var lsn = this._listeners;
            lsn.trigger.apply(lsn, arguments);
            return this;
        },

        /**
         * 초기화 작업
         * @private
         */
        _init: function() {
            var me = this;

            if (me.options.type === 'iframe') {
                me.$ifrm = $('<iframe>').css({
                    display: 'none'
                }).attr({
                    'src': 'about:blank',
                    'tabindex': -1,
                    'title': '빈프레임입니다.'
                }).appendTo('body');
            } else if (me.options.type === 'hash') {
                $(window).on('hashchange', function() {
                    me.navigate(location.hash);
                });
            } else if (me.options.type === 'push') {

            }
        },
        /**
         * 해쉬 변경
         * @param url
         * @param target
         */
        hash: function(url) {
            var me = this;
            // get
            if (!arguments.length) {
                if (me.options.type === 'iframe') {
                    var params = core.uri.parseQuery(me.$ifrm.contents()[0].location.search);
                    return me._removeHash(params.route); //, 'history.html?route='+encodeURIComponent(url));
                } else if (me.options.type === 'hash') {
                    return me._removeHash(location.hash);
                } else if (me.options.type === 'push') {

                }
            }

            // set
            url = me._removeHash(url);
            if (me.options.type === 'iframe') {
                if (url === me.hash()) {
                    return;
                }
                me.$ifrm.attr('src', core.Env.get('emartMusicHistoryUrl') + '?route=' + encodeURIComponent(url) + '&cid=' + me.cid + '&t=' + (+new Date));
            } else if (me.options.type === 'hash') {
                location.hash = '#' + url;
            } else if (me.options.type === 'push') {

            }
        },

        /**
         * url에 존재하는 #문자열 삭제
         * @param url
         * @private
         */
        _removeHash: function(url) {
            return (url || '').replace(/^.*#/, '');
        },

        /**
         * 라우트 추가
         * @param url
         * @param handler
         */
        route: function(url, handler) {
            (this.routeList[url] || (this.routeList[url] = [])).push(handler);
        },

        /**
         * 다중 라우트 추가
         * @param list
         */
        routes: function(list) {
            var me = this;

            core.each(list, function(value, key) {
                me.route(key, value);
            });
        },

        /**
         * url를 파싱
         * @param path
         * @returns {{pathname: *, params: Object}}
         * @private
         */
        _parsePath: function(path) {
            var pairs = path.split('?'),
                pathname = pairs[0],
                search = pairs.length > 1 ? pairs[1] : '';

            return {
                pathname: pathname,
                params: core.uri.parseQuery(search)
            };
        },

        /**
         * url에 해당하는 라우트(url패턴으로 등록된 핸들러)를 실행(MobileAudioPlayer의 _bindRoute를 참고)
         * @param url
         * @param target
         * @private
         */
        navigate: function(url, options) {
            url = this._removeHash(url);
            console.log('##', url);
            var me = this,
                options = {},
                path = me._parsePath(url),
                pathname = path.pathname,
                params = {
                    url: url,
                    pathname: pathname,
                    params: path.params
                };

            me.hash(url);
            core.each(me.routeList, function(handlers, pattern) {
                var reg = new RegExp(pattern, 'ig');
                if (reg.test(pathname)) {
                    core.each(handlers, function(handler) {
                        handler.call(me, pathname, params);
                    });
                    if (options.trigger !== false) {
                        me.trigger('route:' + pathname, params);
                    }
                }
            });
        }
    });


    /**
     * 플레이어 모듈
     * @class
     * @name axl.ui.MobileAudioPlayer
     * @extend axl.ui.View
     */
    ui.MobileAudioPlayer = ui.View.extend( /** @lends axl.ui.MobileAudioPlayer */ {
        name: 'MobileAudioPlayer',
        selectors: {
            btnToggle: '.d-btn-toggle', // 플레이리스트, 트랙리스트 토글 버튼
            playInfo: '>div.play_info', // 재생 정보 영역
            headerTitle: '>div.play_info .music', // 제목
            headerArtist: '>div.play_info .artist', // 아티스트
            headerPlayBtn: '>div.play_info .btn_play', // 재생버튼
            musicCont: '.music_cont',
            playList: '.play_list'
        },
        defaults: {
            url: '',
            success: function() {}
        },
        /**
         * 생성자
         * @param {jquery|Element|String}
         * @param {JSON} options 옵션
         */
        initialize: function(el, options) {
            var me = this;
            if (me.callParent(el, options) === false) {
                return;
            }

            // 2초내에 오디오객체가 생성안되면 에러로 간주하고 모든 링크를 막아 버린다.
            var timer = setTimeout(function() {
                core.$doc.on('click', 'a', function(e) {
                    e.preventDefault();
                });
            }, 2000);

            me._init();

            new AudioPlayer(me.$('.play_list'), {
                success: function() {
                    clearTimeout(timer);
                    me.audioPlayer = this;

                    me.trackList = new UITrackList('.music_list');
                    me.musicRouter = new Router({
                        type: window.isIOS ? 'iframe' : 'hash'
                    });

                    me._bindEvents();
                    // 히스토리
                    me._bindRouter();
                    me.options.success.call(me);

                },
                idAttribute: 'seq',
                srcAttribute: 'music_file'
            });
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvents: function() {
            var me = this;

            core.PubSub.on('addMusic', function(e, data) {
                me.loadFromServer({
                    seq: core.isArray(data.id) ? data.id.join(',') : data.id,
                    play_seq: data.playId || ''
                }, {
                    async: false
                }).done(function(json) {
                    if (data.playId) {
                        me.audioPlayer.playById(data.playId);
                        me._scrollTop(function() {
                            me.musicRouter.hash('#_player');
                            me.$btnToggle.focus();
                            data.complete && data.complete();
                        });
                    } else {
                        axl.music.showToast('선택한 곡이 재생목록에 추가 되었습니다.');
                        data.complete && data.complete();
                    }
                });
            });

            me.trackList.on('showplaylist', function(e) {
                //재생목록 버튼 클릭
                me._scrollTop(function() {
                    me.musicRouter.hash('#_player');
                });
            }).on('playall', function(e, data) {
                var tracks = data.tracks;
                core.PubSub.trigger('addMusic', {
                    id: tracks.join(','),
                    playId: tracks[0],
                    complete: function() {
                        me.$btnToggle.focus();
                    }
                });
            }).on('loadedlist', function() {
                // 목록이 로드됐을 때
                core.music.enabledRows(me.audioPlayer.playList.getAll('id'), false, me.trackList.$el);
            });

            me.audioPlayer.on('click', '.d-loop', function() {
                // 반복여부를 쿠키에 저장
                core.Cookie.set('musicloop', me.audioPlayer.getOption('loop'));
            }).on('changeTrack', function(e, track) {
                me.$headerTitle.html(track.title ? '<span class="hide">현재 선택된 곡</span>' + track.title : me.audioPlayer.playList.size() > 0 ? '재생버튼을 클릭해 주세요.' : '재생할 곡이 없습니다.');
                me.$headerArtist.html(track.artist || '');
            }).on('audioplay audiopause', function(e) {
                var isPlay = e.type === 'audiopause';
                me.$headerPlayBtn.replaceClass(isPlay ? 'btn_stop' : 'btn_play', isPlay ? 'btn_play' : 'btn_stop')
                    .html(isPlay ? '재생' : '일시정지');
            });

            me.audioPlayer.playList.on('removedtrack addedtrack', function(e, data) {
                switch (e.type) {
                    case 'addedtrack':
                        if (me.audioPlayer.playList.size() === 1) {
                            me.$headerTitle.html('재생버튼을 클릭해 주세요.');
                            me.$headerPlayBtn.disabled(false);
                        }
                        // 비활성화
                        core.music.enabledRows(data.id, false);
                        // 쿠키에 추가
                        core.Cookie.addToArray('musictracks', data.id);
                        break;
                    case 'removedtrack':
                        if (me.audioPlayer.playList.size() === 0) {
                            me.$headerPlayBtn.disabled(true);
                        }
                        // 다시 활성화
                        core.music.enabledRows(data.id, true);
                        // 쿠키에서 제거
                        core.Cookie.removeToArray('musictracks', data.id);
                        break;
                }

            });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            me.$headerPlayBtn.on('click', function(e) {
                me.audioPlayer[me.$headerPlayBtn.hasClass('btn_stop') ? 'pause' : 'playStart']();
            });
        },

        /**
         * 라우트 등록
         * @private
         */
        _bindRouter: function() {
            var me = this,
                $tabConts = me.$('.d-tab-cont');

            me.musicRouter.routes({
                // #_main, #_player 와 같이 _로 시작하는 url에 대해서는, ajax를 호출하지 않고
                // 내부적으로 처리되도록 등록
                '^_': function(url, opts) {
                    switch (url) {
                        case '_main':
                            // /music/#_main
                            // 메인화면으로 전환
                            $('.music_navi a:eq(0)').parent().activeItem(); // 탭버튼
                            $tabConts.hide().eq(0).show(); // 탭컨텐츠
                            me.showPlayer(false); // 메인페이지
                            me.$musicCont.removeAttr('data-url'); // 히스토리 관련
                            break;
                        case '_player':
                            // /music/#_player
                            // 플레이어 화면으로 전환
                            me.showPlayer(true); // 플레이화면
                            // play_seq가 있으면 자동재생 수행
                            if (core.json.has(opts.params)) {
                                me.loadFromServer(opts.params);
                            }
                            break;
                    }
                },
                // 라우트가 일반 url주소형식이면 ajax를 호출하여 얻어진 html를 해당 엘리먼트에 삽입시킨다.
                '^[^_]': function(url) {
                    var $li = me.$('.music_navi a[href="#' + url + '"]').parent(),
                        index = $li.index(),
                        $newTab = $tabConts.eq(index);

                    // 현재 url 저장
                    me.$musicCont.attr('data-url', url);
                    // 현재 탭버튼에 해당하는 컨텐츠를 표시
                    function toggleTab() {
                        $tabConts.hide().removeClass('d-active'); // 기존활성탭을 숨긴다.
                        $newTab.show().addClass('d-active'); // 현재탭을 표시
                        $li.activeItem(); // 현재 탭을 활성화(on클래스 추가)
                    }

                    me.showPlayer(false);
                    if ($newTab.hasClass('d-loaded')) {
                        // 이미 로드된 탭이면, 바로 토글시킨다.
                        toggleTab();
                        core.music.syncReviewCount();
                    } else {
                        // 로드되지 않은 탭이면, ajax로 컨텐츠를 가져와 삽입한 후 토글시킨다.
                        $.ajax({
                            url: url,
                            showLoading: true
                        }).done(function(html) {
                            $newTab.addClass('d-loaded').html(html).buildUIControls();
                            toggleTab();
                            core.music.enabledRows(me.audioPlayer.playList.getAll('id'), false, $newTab);
                        });
                    }
                }
            });

            // 상단탭 클릭시
            me.$('.music_navi').on('click', 'a', function(e) {
                e.preventDefault();

                var $el = $(this),
                    href = $el.attr('href');

                me.musicRouter.hash(href);
            });

            // 메인, 재생목록 토글
            me.$btnToggle.on('click', function(e) {
                e.preventDefault();
                if (me.isPlaylist) {
                    me.musicRouter.hash(me.$musicCont.attr('data-url') || '#_main');
                } else {
                    me.musicRouter.hash('#_player');
                }
            });

            // 초기에 표시할 페이지
            me.musicRouter[!window.isIOS ? 'navigate' : 'hash'](location.hash || '#_main');
        },

        _init: function() {
            this.setTitle('Running...');
        },

        /**
         * 스크롤을 위로 이동
         * @param {Function} cb 위로 올라간후 실행할 콜백함수
         */
        _scrollTop: function(cb) {
            var isExec = false;
            $('html, body').stop().animate({
                scrollTop: 0
            }, 350, function() {
                if (!isExec) {
                    cb();
                    isExec = true;
                }
            });
        },

        /**
         * UI모드 토글
         * @param {Boolean} isPlaylist true: 플레이리스트 false: 트랙리스트
         */
        showPlayer: function(isPlaylist) {
            var me = this;

            me.isPlaylist = isPlaylist;
            // 플레이리스트 모드일 땐 배경을 깔아야 돼서 music_player클래스를 추가

            me.$musicCont.toggle(!isPlaylist);
            me.$playList.toggle(isPlaylist);

            me.$btnToggle.toggleClass('btn_back', isPlaylist)
                .attr('title', isPlaylist ? '이마트 뮤직 메인으로 이동' : '플레이어 목록으로 이동')
                .children()
                .text(isPlaylist ? '돌아가기' : '재생목록');
            $('#contents').toggleClass('music_player', isPlaylist);

            me.triggerHandler('togglePlayer', {
                isPlaylist: isPlaylist
            });
        },

        /**
         * 상단헤더부분의 타이블 변경
         * @param title
         */
        setTitle: function(title) {
            this.$headerTitle.html(title);
        },

        // 곡에 대한 정보를 서버에서 조회
        loadFromServer: function(params, ajaxOptions) {
            var me = this,
                opts = me.options;

            if (me.xhr) {
                me.xhr.abort();
            }

            return me.xhr = $.ajax($.extend({
                url: opts.url,
                type: opts.type || 'get',
                dataType: opts.dataType || 'json',
                data: params || {},
                timeout: 30000,
                async: false,
                showLoading: true
            }, ajaxOptions)).done(function(json) {
                var tracks = [];
                if (json.playTrack) {
                    // 자동재생 할 대상곡.
                    tracks = tracks.concat(json.playTrack);
                }

                // 쿠키에 있는 값을 추가
                tracks = tracks.concat(json.tracks);
                me.audioPlayer.addTracks(tracks);
            }).fail(function() {

                axl.music.showToast('죄송합니다.<br>알 수 없는 이유로 중단되었습니다.');

            });
        }
    });

    ui.setDefaults('AccordionList', {
        selectors: {
            list: "li",
            toggleClassTarget: "li",
            toggleButton: "h2>a",
            content: ".cont",
            closeButton: ".btn_border"
        }
    });

})(jQuery, window.axl, window.axl.ui);

$('html, body').scrollTop(0);
$(function() {

    setTimeout(function() {
        axl.music.init();
    });

    if (window.isApp && window.isAndroid) {
        // 안드로이드 앱에서 팝업을 띄웠다가 닫았을 때 메인화면이 하얗게 나오는 현상땜에
        // 화면 일부를 숨겼다가 표시하는 방식으로 해결함 :-(
        var $playInfo = $('.play_info');
        $('body').on('click', 'a.review', function(e) {
            setTimeout(function() {
                $playInfo.css('height', 59);
                setTimeout(function() {
                    $playInfo.css('height', '');
                });
            }, 1000);
        });
    }

    // 플레이어를 실행 /////////////////////////////////////////////////////////////////////////////
    var player = new axl.ui.MobileAudioPlayer($('#d-player-wrap'), {
        'url': axl.Env.get('emartMusicInfoUrl'), // 트랙정보 페이지의 url
        'success': function(e, data) {
            // 파라미터 & 쿠키에 있는 시퀀스를 조합해서 서버로부터 리스트를 조회
            var me = this,
                params = {},
                ckTracks = axl.Cookie.get('musictracks') || '';

            if (ckTracks) {
                // 쿠키에 있는 값을 조회
                params.seq = ckTracks.replace(/\|/g, ',');
            }

            // 서버에서 리스트 조회
            if (params.play_seq || params.seq) {
                me.loadFromServer(params);
            }

        }
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // 페이지를 빠져나갈 때 확인창을 띄워준다. //////////////////////////////////////////////////
    axl.$win.on('beforeunload', function() {
        if (player.audioPlayer.isPlaying()) {
            return "이마트 뮤직화면을 벗어나면 재생 음악이 정지됩니다.";
        }
    }).on('load', function() {
        setInterval(function() {
            axl.music.syncReviewCount();
        }, 60000); // 60초마다 리뷰갯수를 가져와서 ui에 반영
    });
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // 전역에서 사용할 수 있도록 window에 세팅해준다.
    window.player = axl.player = player;

});
