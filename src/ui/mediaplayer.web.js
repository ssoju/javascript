/*!
 * @author: 김승일
 * @email: comahead@gmail.com
 * @require: MediaElement(MIT License, http://mediaelementjs.com)
 */!(function($, core, ui, undefined) {
    "use strict";

    if (!$) {
        throw new Error('jQuery라이브러리를 포함시켜 주세요.');
    }
    if (!core) {
        throw new Error('emart라이브러리를 포함시켜 주세요.');
    }
    if (!mejs) {
        throw new Error('MediaElement 라이브러리를 포함시켜 주세요.');
    }

    var idx = 0, // 고유 시퀀스 용도
        nextIdx = function() {
            return idx++;
        },
        isTouch = core.isTouch;

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
            ON_REMOVED: 'removed'
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
                if (item.id + '' === data.id + '') {
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
            return core.each(this.tracks, fn);
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
         * @returns {Array}
         */
        getAll: function() {
            return this.list;
        },

        /**
         *
         * @param {Number} index1
         * @param {number} index2
         */
        insert: function(index, item) {
            this.list.splice(index, 0, item);
            this.triggerHandler('added', item);
        },
        /**
         *
         * @param {Number} from
         * @param {Number} to
         */
        move: function(from, to) {
            this.list.splice(to, 0, this.list.splice(from, 1)[0]);
            this.currentIndex = to;
        }
    });


    /**
     * 진행바 컨트롤 클래스
     * @class
     * @name axl.ui.SlideBar
     * @extends axl.ui.View
     */
    var SlideBar = ui.View.extend( /**@lends axl.ui.SlideBar# */ {
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
         * @param {Element|jQuery|String} el
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
            me.$bar.css(me.sizeName, 0).css('cursor', 'pointer').attr('title', '0'); // 타이틀
            me.$el.css('cursor', 'pointer');

            me._initEvents();
        },
        /**
         * 이벤트 비인딩
         * @private
         */
        _initEvents: function() {
            var me = this,
                pos;

            function getPos(e) {
                return {
                    x: core.isTouch ? e.touches[0].clientX : e.clientX,
                    y: core.isTouch ? e.touches[0].clientY : e.clientY
                };
            }

            // 바의 위치를 클릭한 위치로 이동
            me.on('mousedown touchstart', function(e) {
                pos = getPos(e);
            }).on('click', function(e) {
                e.preventDefault();
                var upPos = getPos(e);

                if (me.options.maxValue <= 0) {
                    return;
                }
                if (me.$el.hasClass('disabled')) {
                    return;
                }
                if (pos.x !== upPos.x || pos.y !== upPos.y) {
                    return;
                }

                var val = e['page' + me.xyName] - me.$el.offset()[me.dirName],
                    conSize = me.$el[me.sizeName](), // 트랙사이즈
                    per = ((me.isHoriz ? val : conSize - val) / conSize), // 퍼센테이지
                    newValue = (per * me.options.maxValue);

                me._setValue(newValue);
            });

            me._bindKeyboardEvents();
            me._bindDrag();
        },

        _bindDrag: function() {
            var me = this,
                $bar = me.$bar.children(),
                trackSize = me.$bar.parent().width(),
                left = 0,
                dragger;

            dragger = new ui.Dragger($bar);
            dragger.on('dragstart', function(e, data) {
                if (me.options.maxValue === 0) {
                    return;
                }
                left = me.$bar.width();
                me.$bar.addClass('d-dragging');
            }).on('dragmove', function(e, data) {
                if (me.options.maxValue === 0) {
                    return;
                }
                var x = data.x + left,
                    per = x / trackSize;
                if (x >= 0 && x <= trackSize) {
                    me.$bar.css('width', (per * 100) + '%');
                    me.triggerHandler('valuechange', {
                        value: me.options.maxValue * per
                    });
                }
            }).on('dragend', function(e, data) {
                if (me.options.maxValue === 0) {
                    return;
                }
                me.$bar.removeClass('d-dragging');
                me._setValue(me.$bar.width() / trackSize * me.options.maxValue);
            });
        },

        /**
         * 키보드 이벤트 바인딩
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

                        if (me.$el.hasClass('disabled')) {
                            return;
                        }

                        if (lastTime === 0) {
                            lastTime = +new Date;
                        }

                        // 키를 누른 상태가 유지되면, 0.2초마다 바를 이동
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

                        if (me.$el.hasClass('disabled')) {
                            return;
                        }

                        me._moveBar(e.keyCode === me.downKey ? -1 : 1);
                    }
                });
            }
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

            me._setValue(newValue);
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
         * title속성에 현재 값을 설정
         * @param {String} value
         */
        setTitle: function(value) {
            var me = this;

            me.$bar[0].title = value;
        },

        _setValue: function(newValue) {
            var me = this,
                e = $.Event('valuechanged');
            me.triggerHandler(e, {
                value: newValue
            });
            if (e.isDefaultPrevented()) {
                return;
            }
            me.setValue(newValue);
        },

        /**
         * 값 설정
         * @param {Number} value
         */
        setValue: function(value) {
            var me = this,
                val;

            if (value < me.options.minValue || value > me.options.maxValue || me.$bar.hasClass('d-dragging')) {
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
            me.setTitle(Math.round(val));
        }
    });

    /**
     * 플레이리스트 UI모듈
     * @class
     * @name axl.ui.PlayList
     * @extends axl.ui.View
     */
    var PlayList = ui.View.extend( /** @lends axl.ui.PlayList# */ {
        name: 'PlayList',
        selectors: {
            list: '.d-tracklist'
        },
        /**
         * 생성자
         * @param {Element|jQuery|String} el
         * @param {JSON} options
         */
        initialize: function(el, options) {
            var me = this;

            if (me.callParent(el, options) === false) {
                return;
            }

            me.tracks = new ArrayList();
            me.tracks.on('added', function(e, data) {
                // 트랙 추가 요청
                //me.addRow(data);
                me._add(data);
            }).on('removed', function(e, data) {
                //me.removeRow(data.id);
                me._remove(data.id);
            });

            // 트랙 클릭 시
            me.$list.on('click', 'a', function(e) {
                e.preventDefault();
                me.triggerHandler('selected', {
                    id: $(this).attr('data-id')
                });
            }).on('click', '.list_del', function(e) {
                var $li = $(this).closest('li[data-id]');
                if (!confirm("'" + $li.find('.tit').text() + "'을(를) 삭제하시겠습니까?")) {
                    return;
                }

                var item = $li.attr('data-id');
                me.tracks.remove(item);
            }).on('mouseenter mouseleave', 'li', function(e) {
                $(this).toggleClass('on', e.type === 'mouseenter');
            });

            me.on('click', '.d-removeall', function(e) {
                // 선택삭제
                e.preventDefault();
                var items = me.getCheckedList();
                if (items.length <= 0) {
                    alert('삭제할 곡을 체크해주세요.');
                    return;
                }

                if (!confirm('선택한 곡을 삭제하시겠습니까?')) {
                    return;
                }
                me.tracks.remove(items);
                me.$('.d-checkall').prop('checked', false);
            }).on('click', '.d-checkall', function(e) {
                e.stopPropagation();

                // 전체선택
                me.$list.find('input:checkbox').prop('checked', $(this).prop('checked'));
            });

            me.$list.sortable({
                items: '> li',
                axis: 'y',
                update: function(e, ui) {
                    var index = me.$list.find('>li').index(ui.item);
                    me.tracks.move(me.tracks.indexOf(ui.item.attr('data-id')), index);
                }
            });
        },

        /**
         * 체크된 곳들의 id들을 반환
         */
        getCheckedList: function() {
            var res = this.$el.find('.d-tracklist input:checkbox:checked').map(function() {
                return this.value;
            }).get();
            return res;
        },

        _remove: function(id) {
            this.removeRow(id);
            this.triggerHandler('removedtrack', {
                id: id
            });
        },

        _add: function(data) {
            this.addRow(data);
            this.triggerHandler('addedtrack', {
                id: data.id
            });
        },

        /**
         * 새로운 행 추가
         * @param data.id
         * @param data.src
         * @param data.title
         * @param data.artist
         * @param data.album
         * @private
         */
        addRow: function(data) {
            var me = this;

            me.$list.append(['<li class="d-track" data-id="' + data.id + '">' + '<input type="checkbox" name="" value="' + data.id + '" id="track-' + data.id + '" title="' + data.title + ' 곡 선택하기">', '<label for="track-' + data.id + '" class=""><span class="tit"><a href="#" data-id="' + data.id + '">' + data.title + '</a></span> - <span class="pd">' + data.artist + '</span></label>' + '<button class="list_del"><span class="none">곡 삭제하기</span></button>' + '</li>'].join(''));
        },

        /**
         * id에 해당하는 행 삭제
         * @param {String} id
         * @private
         */
        removeRow: function(id) {
            var me = this;

            me.$list.find('>.d-track[data-id="' + id + '"]').empty().remove();
        },

        /**
         * current id에 해당하는 행을 활성화
         * @param {Boolean} sel
         * @private
         */
        select: function(sel) {
            var me = this,
                track;
            if (sel === true && (track = me.tracks.current())) {
                me.$list.find('>.d-track[data-id="' + track.id + '"]').activeItem('ing');
            } else {
                me.$list.find('>.d-track').removeClass('ing');
            }
        }
    });

    /**
     * 오디오 플레이어 클래스
     * @class
     * @name axl.ui.EmartAudioPlayer
     * @extends axl.ui.View
     */
    var AudioPlayer = ui('EmartAudioPlayer', /**@lends axl.ui.EmartAudioPlayer*/ {
        bindjQuery: 'emartAudioPlayer',
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
            SlideBar: '.d-SlideBar', // 다운로드 진행바
            volumeTrack: '.d-volumetrack', // 볼륨트랙
            volumeBar: '.d-volumebar', // 볼륨바
            playlistLayer: '.d-playlistlayer', // 리스트 레이어
            titleBox: '.d-title-box' // 노래 제목 표시박스
        },
        /**
         * 생성자
         * @param {Element|jQuery|String} el
         * @param {JSON} options
         */
        initialize: function(el, options) {
            var me = this;

            if (me.callParent(el, options) === false) {
                return;
            }

            me.$('.d-control').disabled();
            me._createPlayList();
            me._createMedia();

            if (core.isTouch) {
                // 터치기반 디바이스에서는 볼륨조절이 불가능하므로 볼륨관련 컨트롤들은 숨긴다.
                me.$('.d-vol').hide();
            }
        },

        _createPlayList: function() {
            var me = this;

            // 플레이리스트 UI가 있다면
            me.playList = new PlayList(me.$playlistLayer);
            me.playList.on('selected', function(e, data) {
                // 클릭한 트랙으로 재생시키기
                e.preventDefault();
                me.playById(data.id);
            }).on('removedtrack', function(e, data) {
                // 트랙 삭제 요청
                if (me.playList.tracks.size() === 0) {
                    me.initPlayer();
                } else {
                    me.enables(true);

                    if (me.isPlaying()) {
                        if (me.playList.tracks.current().src != me.currentSrc) {
                            me.playByTrack(me.playList.tracks.current());
                        }
                    } else {
                        me._initTimeInfo();
                    }

                }
            });
        },

        /**
         * 미디어객체 생성
         * @private
         */
        _createMedia: function() {
            var me = this;

            if (me._initedMedia) {
                return;
            }
            me._initedMedia = true;

            var id = 'media_' + nextIdx(),
                timer = setTimeout(function() {
                    alert("죄송합니다. 현재 사용하시는 브라우저에는 본 오디오기능을 사용하실 수 없습니다.\nHTML5 혹은 플래쉬플러그인을 지원하는 브라우저에서 사용하실 수 있습니다.");
                }, 10000);

            me.enables(false);
            me.$el.append('<audio id="' + id + '" type="audio/mp3" preload="auto" src="javascript:;" style="display:none;" width="0" height="0"></audio>');

            new MediaElement(id, $.extend({}, me.options, {
                type: 'audio/mp3',
                pluginWidth: 0,
                pluginHeight: 0,
                plugins: ['flash' /*,'silverlight'*/ ],
                pluginPath: '/js/libs/',
                flashName: 'flashmediaelement.swf',
                silverlightName: 'silverlightmediaelement.xap',
                success: function(media, node) {
                    clearTimeout(timer);

                    me.media = media;
                    me.$media = $(media);

                    me._initEvents();
                    // callback 실행
                    me.options.success.apply(me.$el[0], arguments);
                    // 기본 음량 설정
                    me.setVolume(me.options.startVolume);
                    // 반복 여부
                    if (me.options.loop === 'one') {
                        me.$('.d-loop').addClass('one');
                    } else if (me.options.loop === 'all') {
                        me.$('.d-loop').addClass('on');
                    }

                    me.triggerHandler('success', {
                        media: media
                    });
                },
                error: function() {
                    me.triggerHandler('error');
                }
            }));
        },

        /**
         * 미디어객체에서 발생하는 이벤트에 핸들러 설정하고 , 현재 클래스에서 바깥으로 이벤트를 발생
         * @private
         */
        _handleMedia: function() {
            var me = this;

            me.$media.on('play pause volumechange ended loadeddata canplay seeked seeking error playing loadedmetadata timeupdate ready', function(e) {
                switch (e.type) {
                    //case  'play':
                    case 'playing':
                        me._togglePlayButton(true);
                        me._setTrackInfo(me.currentTrack = me.playList.tracks.current());
                        me._showDuration();
                        break;
                    case 'pause':
                        me._togglePlayButton(false);
                        break;
                    case 'ended':
                        me._togglePlayButton(false);
                        me._checkNextPlay();
                        break;
                    case 'timeupdate':
                        me._showTime();
                        break;
                    case 'canplay':
                        me.enables();
                        break;
                    case 'loadeddata':
                    case 'loadedmetadata':
                        me._showDuration();
                        break;
                    case 'error':
                        //me.enables(false);
                        switch (e.target.error.code) {
                            case e.target.error.MEDIA_ERR_ABORTED:
                                console.log('You aborted the video playback.');
                                break;
                            case e.target.error.MEDIA_ERR_NETWORK:
                                console.log('A network error caused the audio download to fail.');
                                break;
                            case e.target.error.MEDIA_ERR_DECODE:
                                console.log('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                                break;
                            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                console.log('The video audio not be loaded, either because the server or network failed or because the format is not supported.');
                                break;
                            default:
                                console.log('An unknown error occurred.');
                                break;
                        }
                        break;
                }

                if (e.type !== 'timeupdate') {
                    console.log('type:', e.type);
                }
                //me.triggerHandler(e.type, {media: me.media});
            });

            me.$media.on('playing', function() {
                // 재생시에 해당 항목 활성화
                me.playList.select(true);
            }).on('ended', function() {
                me.playList.select(false);
            });
        },

        /**
         * 해당 요소 내부에 있는 컨트롤들에 핸들러 설정
         * @private
         */
        _initEvents: function() {
            var me = this;

            me._handleMedia();

            me.on('click', '.d-play', function(e) {
                // 재생 클릭
                e.preventDefault();
                var track = me.playList.tracks.current();
                if (!track) {
                    return;
                }

                if (me.currentSrc != track.src) {
                    me.setSrc(track.src);
                    me.load();
                }
                me.play();
            }).on('click', '.d-pause', function(e) {
                // 일시 정지
                e.preventDefault();
                me.pause();
            }).on('click', '.d-stop', function(e) {
                // 중지
                e.preventDefault();

                me.stop();
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
            }).on('click', '.d-volumeup', function(e) {
                // 볼륨업 버튼
                e.preventDefault();
                me.setVolume(Math.min(1, me.media.volume + 0.1));
            }).on('click', '.d-volumedown', function(e) {
                // 볼륨다운 버튼
                e.preventDefault();
                me.setVolume(Math.max(0, me.media.volume - 0.1));
            }).on('click', '.d-loop', function(e) {
                // 반복 버튼
                e.preventDefault();

                var $el = $(this);
                if ($el.hasClass('on')) {
                    $el.removeClass('on');
                    me.options.loop = '';
                } else if ($el.hasClass('one')) {
                    $el.replaceClass('one', 'on');
                    me.options.loop = 'all';
                } else {
                    $el.addClass('one');
                    me.options.loop = 'one';
                }
            }).on('click', '.d-mute', function(e) {
                // 음소거 버튼
                e.preventDefault();

                me.setMuted(!me.media.muted);
            }).on('click', '.d-shuffle', function(e) {
                // 랜덤재생
                e.preventDefault();

                $(this).toggleClass('on', me.options.shuffle = (me.playList.tracks.options.isShuffle = !me.playList.tracks.options.isShuffle));
            });

            me._initProgress();

            ////////////////////////////////////////////////////////////////////////////
            // 트랙리스트 관리
            me.playList.on('addedtrack', function(e, data) {
                clearTimeout(me.trackTimer);

                // 곡추가
                !me.isPlaying() && me._setTrackInfo({
                    title: '총 ' + me.playList.tracks.size() + '곡이 있습니다.'
                });

                me.trackTimer = setTimeout(function() {
                    me.enables();
                }, 100);
            });
        },

        /**
         * 슬라이더바 빌드(타임바, 볼륨바)
         */
        _initProgress: function() {
            var me = this;
            //////////////////////////////////////////////////////////////////////////////
            // 시간 진행바
            me.$timeTrack.addClass('d-control');
            me.timeCtrl = new SlideBar(me.$timeTrack[0], {
                selectors: {
                    bar: '.d-timebar'
                }
            }).on('valuechanged', function(e, data) {
                me.setCurrentTime(data.value);
            });

            var delayTimeupdate;
            me.timeCtrl.setValue(0);
            me.$media.on('timeupdate ended', function(e) {
                switch (e.type) {
                    case 'timeupdate':
                        if (!delayTimeupdate) {
                            delayTimeupdate = +new Date;
                        }
                        if ((+new Date - delayTimeupdate) > 1000) {
                            var ct = me.currentSrc ? me.media.currentTime : 0,
                                txtTime = me._generateTime(ct);
                            me.timeCtrl.setTitle(txtTime);
                            me.timeCtrl.setValue(ct);
                            delayTimeupdate = +new Date;
                        }
                        break;
                    case 'ended':
                        me.timeCtrl.setValue(0);
                        me.$time.html('00:00');
                        break;
                }
            }).on('canplay loadedmetadata playing', function() {
                me.timeCtrl.setMaxValue(me.currentSrc ? me.media.duration : 0);
            });

            /////////////////////////////////////////////////////////////////////////////
            // 볼륨조절 바
            if (me.$volumeBar.length > 0) {
                if (mejs.MediaFeatures.hasTouch) {
                    me.$('[class^=d-vol]').hide();
                } else {
                    me.$volumeTrack.addClass('d-control');
                    me.volumeCtrl = new SlideBar(me.$volumeTrack[0], {
                        maxValue: 1,
                        distValue: 0.1,
                        value: me.options.startVolume,
                        selectors: {
                            bar: '.d-volumebar'
                        }
                    }).on('valuechange valuechanged', function(e, data) {
                        /*if (me.media.muted) {
                            e.preventDefault();
                            return;
                        }*/
                        me.setVolume(data.value);
                    });
                    me.volumeCtrl.setValue(me.options.startVolume);
                }
            }
        },

        /**
         * 곡이 재생시작할 때, 곡에 대한 정보를 표시
         */
        _setTrackInfo: function(track) {
            var me = this,
                track = track || me.playList.tracks.current();

            if (!track) {
                return;
            }

            var title = '';
            if (track.title) {
                title = track.title;
                if (track.artist) {
                    title += ' - ' + track.artist;
                }
            }

            me.$('.d-title').html(title || '재생할 곡이 없습니다. 곡을 선택해주세요.');
            me.$('.d-artist').html(track.artist || '');
            me.$('.d-lyricbox').html(track.lyrics ? track.lyrics.replace(/\r\n|\n/g, '<br>') : '가사가 없습니다.').parent().animate({
                scrollTop: 0
            });
            me.$('.d-control.down').attr('data-href', track.music_file_down);
        },


        /**
         * 플레이어 초기화
         */
        initPlayer: function() {
            var me = this;

            me._togglePlayButton(false);
            me._setTrackInfo({});
            me._initTimeInfo();
            me.stop();
            me.setSrc('');
            me.enables(false);
        },

        _initTimeInfo: function() {
            var me = this;
            me.timeCtrl.setValue(0);
            me.$time.html('00:00');
            me.timeCtrl.setMaxValue(0);
            me.$duration.html('00:00');
        },

        /**
         * 다음곡 재생
         * @private
         */
        _checkNextPlay: function() {
            var me = this;

            // 한곡 반복
            if (me.options.loop === 'one') {
                me.play(0);
                return;
            }

            // 전체 반복
            if (me.playList.tracks.isLast() && me.options.loop !== 'all') {
                return;
            }

            me.next();
        },

        /**
         * 재생버튼 토글링
         * @param isPlay
         * @private
         */
        _togglePlayButton: function(isPlay) {
            var me = this;

            if (isPlay) {
                me.$('.d-play').replaceClass('d-play play', 'd-pause pause').attr('title', '정지').html('정지');
            } else {
                me.$('.d-pause').replaceClass('d-pause pause', 'd-play play').attr('title', '재생').html('재생');
            }
        },

        /**
         * 미디어 시간을 00:00 형식으로 변환
         * @param {Number} time
         */
        _generateTime: function(time) {
            var me = this;

            return time | 0 > 0 ? mejs.Utility.secondsToTimeCode(time,
            false,
            false,
            me.options.framesPerSecond || 25) : '00:00';
        },

        /**
         * 현재 시간 표시
         * @private
         */
        _showTime: function() {
            var me = this;
            me.$time.html(me._generateTime(me.currentSrc ? me.media.currentTime : 0));
        },

        /**
         * 총 시간 표시
         * @private
         */
        _showDuration: function() {
            var me = this;

            me.$duration.html(me._generateTime(me.currentSrc ? me.media.duration : 0));
        },
        /**
         * 곡 데이타 반환
         */
        getTracks: function() {
            return this.playList.tracks;
        },

        getMedia: function() {
            return this.media;
        },

        /**
         * 컨트롤들을 활성/비활성화
         * @param {Boolean} isEnabled
         */
        enables: function(isEnabled) {
            var me = this;
            if (isEnabled === false && me.media && !me.media.paused) {
                me.setCurrentTime(0);
                me.pause();
            }

            me.$('.d-control').disabled(isEnabled === false);
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
            var track = this.playList.tracks.current(id);
            this.playByTrack(track);
        },
        /**
         *
         * @param track
         */
        playByTrack: function(track) {
            if (!track) {
                this.triggerHandler('error', '[playById()] 선택하신 트랙이 리스트에 존재하지 않습니다.');
                return;
            }

            this.pause();
            this.setSrc(track.src);
            this.load();
            this.play(0);
        },

        /**
         * ids순으로 정렬
         * @param {String|Array} ids
         */
        sort: function(ids) {
            this.playList.tracks.sort(ids);
        },

        /**
         * ids들을 삭제
         * @param {String|Array} ids
         */
        remove: function(ids) {
            var me = this;

            if (!core.isArray(ids)) {
                ids = [].concat(ids);
            }
            me.playList.tracks.remove(ids);

        },

        /**
         * src 설정
         * @param {String} url
         */
        setSrc: function(url) {
            var me = this;

            if (me.media.pluginType === 'native' && !('oncanplay' in document.createElement('audio'))) {
                me.$media.on('progress.canplay', function() {
                    me.$media.triggerHandler('canplay');
                    me.$media.off('progress.canplay');
                });
            }

            me.currentSrc = url;
            if (url) { // 캐쉬와 관련된 문제가 있어서 매번 새로 가져오게끔 시간값을 추가
                url = core.uri.addParam(url, {
                    _: +(new Date())
                });
            } else {
                me.pause();
            }
            me.media.setSrc(url);
        },

        /**
         * 로드
         */
        load: function() {
            this.media.load();
        },
        /**
         * 재생
         * @param {Number} time
         */
        play: function(time) {
            console.log('play', time);
            this.media.play(time);
        },

        /**
         * 일시정지
         */
        pause: function() {
            console.log('pause');
            this.media.pause();
        },
        /**
         * 정지
         */
        stop: function() {
            console.log('stop');
            try {
                //this.media.stop();
                this.setCurrentTime(0);
            } catch (e) {}
            this.media.pause();
        },
        /**
         * 볼륨 설정
         * @param {Number} vol
         */
        setVolume: function(vol) {
            try {
                this.media.setVolume(vol);
            } catch (e) {}
        },
        /**
         * 음소거
         * @param {Boolean} muted
         */
        setMuted: function(muted) {
            this.media.setMuted(muted);
        },
        /**
         * 재생 위치 설정
         * @param {Number} time
         */
        setCurrentTime: function(time) {
            this.media.setCurrentTime(time);
        },
        /**
         * 곡추가
         * @param {JSON} data
         */
        _add: function(data) {
            if (!$.trim(data[this.options.idAttribute]) || !$.trim(data[this.options.srcAttribute])) {
                return;
            }
            if (!data['id']) {
                data['id'] = data[this.options.idAttribute];
            }
            if (!data['src']) {
                data['src'] = data[this.options.srcAttribute];
            }

            this.playList.tracks.add(data);
        },

        /**
         * 곡 추가
         * @param {Array|JSON} ids
         */
        addTracks: function(ids) {
            var me = this;

            ids = core.isArray(ids) ? ids : [].concat(ids);
            core.each(ids, function(track) {
                me._add(track);
            });
        },

        /**
         * 다음곡 재생
         */
        next: function() {
            var me = this,
                track = me.playList.tracks.next();

            me.pause();
            me.setSrc(track.src);
            me.load();
            me.play(0);
        },
        /**
         * 이전 곡 재생
         */
        prev: function() {
            var me = this,
                track = me.playList.tracks.prev();

            me.pause();
            me.setSrc(track.src);
            me.load();
            me.play(0);
        },
        /**
         * 순서섞기
         */
        shuffle: function() {
            this.playList.tracks.shuffle();
        }
    });


    window.EmartAudioPlayer = AudioPlayer;
})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);
