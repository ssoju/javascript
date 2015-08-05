/*!
 * @mdule coma.ui.ResponseCarousel
 * @author comahead@vi-nyl.com(����� å��)
 */
(function ($, core) {
    "use strict";

    if (core.ui.ResponseCarousel){ return; }

    var $win = $(window),
        $doc = $(document),
        css3 = core.css3;

    /**
     * ������ Carousel
     */
    var ResponseCarousel = core.ui('ResponseCarousel', {
        bindjQuery: 'responseCarousel',
        defaults: {
            autoPlay: false,    // �ڵ� �����̵� ����
            interval: 5000,     // �ڵ� �����̵� ����
            duration: 300,      // �ִϸ��̼� �ð�
            addHeight: 110      //
        },
        selectors: {
            con: '.banner_list',        // �����̳�
            items: '.banner_list>li',   // ������
            indiCon: '.bnr_control'     // �ε������� �ڽ�
        },
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            me.pageIndex = 0;       // ���� ������ �ε���
            me.totalPage = 0;       // �� ������ ��
            me.totalCount = me.$items.length;       // �� ����
            me.perCount = 0;

            me.$items.eq(0).find('img').onImgLoaded(function() {

                me.isImgLoaded = true;
                me.perCount = me._perCount();
                me._bindEvents();
                me._refresh();
                me._createIndicator();

                me.$el.css({position: 'relative'});
                me.$con.css({
                    'left': 0,
                    'position': 'absolute'
                });
                me.$items.each(function (i) {
                    $(this).attr('data-index', i);
                });
                me.$con.css('visibility', '');
                me._hideOuter();
                me.options.autoPlay && me.play();
            });

        },
        _bindEvents: function () {
            var me = this;

            // �ε������� ����
            $win.on('changemediasize.' + me.cid, function (e) {
                var data = core.ui.mediaInfo;
                me.perCount = me._perCount(data.mode);
                me._createIndicator();
            });

            // UI ���ġ
            $win.on('resize.' + me.cid, function () {
                me._refresh();
            }).on('resizeend.' + me.cid, function (e) {
                me._refresh();
                me._createIndicator();
                me.moveIndex(Math.min(me.pageIndex, me.totalPage - 1), false);
            });

            // �ε������� Ŭ���� �ش� �������� �����̵�
            me.$indiCon.on('click', 'a', function (e) {
                e.preventDefault();
                var index = $(this).parent().index();
                me.moveIndex(index);
            });

            var isAutoPlay;
            // hate IE
            me.on('mousedown selectstart', function(e) {
                e.preventDefault();
            });
            // �ڵ� ��� ����� ��, ���콺�� �ö���� �Ͻ������� ���� ��Ű�� ������ ������Ų��.
            me.options.autoPlay && me.on('mouseenter touchstart mouseleave touchend touchcancel', function(e) {
                switch(e.type) {
                    case 'mouseenter':
                    case 'touchstart':
                        if(me.playTimer){
                            isAutoPlay = true;
                            me.stop();
                        } else {
                            isAutoPlay = false;
                        }
                        break;
                    case 'mouseleave':
                    case 'touchstart':
                    case 'touchend':
                        if(isAutoPlay === true) {
                            me.play();
                        }
                        break;
                }
            });

            var startLeft, currLeft;
            // �������� ���ε�
            me.$con.gesture().on('gesturestart gesturemove gestureend gesturecancel', function (e, data) {
                switch(e.type) {
                    case 'gesturestart':
                        startLeft = css3.position(me.$con).x; //parseInt(me.$con.css('left'), 10);
                        break;
                    case 'gesturemove':
                        var limit = me.conWidth - me.totalWidth;
                        currLeft = (startLeft + data.diff.x);
                        if (currLeft > 0) {
                            currLeft = currLeft/3;
                        } else if (currLeft < limit) {
                            currLeft = currLeft + Math.abs(limit);
                            currLeft = limit + (currLeft / 3);
                        }
                        me.move(currLeft, false);
                        break;
                    case 'gestureend':
                    case 'gesturecancel':
                        var index;
                        if (data.direction === 'left') {
                            index = Math.ceil(Math.abs(currLeft) / me.conWidth);
                            me.moveIndex(index);
                        } else if (data.direction === 'right') {
                            index = Math.floor(Math.abs(currLeft) / me.conWidth);
                            me.moveIndex(index);
                        } else {
                            me.moveIndex(me.pageIndex);
                        }
                        break;
                }
            });
        },
        /**
         * �ε������� ����
         * @private
         */
        _createIndicator: function () {
            var me = this,
                html = '';

            for (var i = 0; i < me.totalPage; i++) {
                html += '<span class="' + (i === me.pageIndex ? 'on' : '') + '">' +
                    '<a href="#"><span class="hide">'+(i === me.pageIndex ? '����������' : '')+'</span>' + (i + 1) + '</a></span>';
            }
            me.$indiCon.html(html);
        },
        /**
         * ���
         */
        play: function() {
            var me = this;

            if(me.playTimer){ return; }
            me.playTimer = setInterval(function() {
                me.next();
            }, me.options.interval);
        },
        /**
         * ����
         */
        stop: function() {
            var me = this;
            clearInterval(me.playTimer);
            me.playTimer = null;
        },
        /**
         * ����
         */
        next: function () {
            var me = this,
                index = me.pageIndex + 1;
            if (index >= me.totalPage) {
                index = 0;
            }
            me.moveIndex(index);
        },
        /**
         * ����
         */
        prev: function () {
            var me = this,
                index = me.pageIndex - 1;
            if (index < 0) {
                index = me.totalPage - 1;
            }
            me.moveIndex(index);
        },
        /**
         * ������ �̵�
         * @param newIndex �̵��� ������ �ε���
         * @param isAni �ִϸ��̼� ���� ����
         */
        moveIndex: function (newIndex, isAni) {
            var me = this;

            if (/*me.isAnimate
                 || */me.conWidth > me.totalWidth) {
                me.move(0, false);
                return;
            }

            if (newIndex < 0){ newIndex = 0; }
            if (newIndex >= me.totalPage) { newIndex = me.totalPage - 1; }

            me.pageIndex = newIndex;
            var newLeft = newIndex * (me.itemWidth * me.perCount);
            if (newLeft > me.totalWidth - me.conWidth) {
                newLeft = me.totalWidth - me.conWidth;
            }

            me.isAnimate = true;
            ////me.$items.css('display', '');
            me.move(-newLeft, isAni);
        },

        /**
         * �����̵�
         * @function
         * @param newLeft �̵��� ��ġ
         * @param isAni �ִϸ��̼� ���� ����
         */
        move: css3.support ? function (newLeft, isAni) {
            var me = this;
            css3.move(me.$con, newLeft, 0, isAni !== false ? me.options.duration / 1000 : 0, function (){
                me._transitionEnd();
            });
        } : function (newLeft, isAni) {
            var me = this;
            if (isAni !== false) {
                me.$con.stop().animate({left: newLeft}, me.options.duration, function () {
                    me._transitionEnd();
                });
            } else {
                me.$con.stop().css('left', newLeft);
            }

        },
        /**
         * �����̵尡 ������ �� ����
         * @private
         */
        _transitionEnd: function () {
            var me = this;

            me.isAnimate = false;
            //me._hideOuter(-newLeft);
            me.$indiCon.children().removeClass('on').find('span.hide').html('').end()
                .eq(me.pageIndex).addClass('on').find('span.hide').html('���� ������');
        },
        /**
         * ���ÿ��� �ۿ� ��Ŀ���� �Ȱ����� �ϱ� ���� ����
         * @param conLeft
         * @private
         */
        _hideOuter: function(conLeft) {
            return;

            var me = this;
            if(!conLeft) {
                conLeft = parseInt(me.$con.css('left'), 10);
            }
            conLeft = Math.abs(conLeft);
            me.$items.filter(function(){
                var $el = $(this),
                    left = parseInt($el.css('left'), 10) - conLeft;
                return !(left >= 0 && left < me.conWidth);
            }).css('display', 'none');
        },
        /**
         * �ػ󵵿� ���� � ǥ������ ���
         * @returns {number}
         * @private
         */
        _perCount: function() {
            var me = this;

            me.$items.eq(0).css('width', '');

            return Math.round(me.$el.width() / me.$items.eq(0).width());
        },
        /**
         * ���� UI���� ġ���� �ٽ� ���
         * @private
         */
        _refresh: function () {
            var me = this;

            if(!me.isImgLoaded){ return; }

            me.conWidth = me.$el.width();
            me.itemWidth = Math.floor(me.conWidth / me.perCount);
            me.itemHeight = me.$items.eq(0).height();
            me.totalPage = Math.ceil(me.totalCount / me.perCount);
            me.totalWidth = (me.itemWidth * me.totalCount);

            me.$items.stop().css('width', me.itemWidth).each(function (i) {
                var left = (me.itemWidth) * i;
                me.$items.eq(i).css('left', left);// + me.conWidth);
            });

            me.$el.css({
                height: me.itemHeight + me.options.addHeight
            });
        },
        release: function () {
            var me = this;

            me.supr();
            $win.off('.' + me.cid);
            me.$indiCon.off();
            me.$con.off();
        }
    });

})(jQuery, window[LIB_NAME]);
