/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @created 2013-03-12
 */;
(function($, core, undefined) {

    core.ui('Masonry', {
            defaults: {
                itemWidth: 310,
                space: 18,
                scrollLoad: false,
                itemSelector: 'div.ui_item'
            },
            initialize: function(el, options) {
                var me = this;
                if (me.supr(el, options) === false) {
                    return;
                }

                core.uitl.lazyLoadImage(me.$('img')).done(function() {
                    me.init();
                    me._configure();
                    me.update();
                });
            },
            
            init: function() {
                var me = this,
                    timer = null,
                    timer2 = null,
                    getDocHeight = core.util.getDocHeight;
                var listIndex = 1;

                var ajaxDone = false;
                me.$el.bind('ajaxDone', function() {
                    ajaxDone = true;
                })

                me.$('button.more').bind('click.masonry', function() {
                    //nextId = $("#scrollArtists").find('div>ul>li').last().attr('data-nextId');
                    var start = me.$el.find(me.options.itemSelector).length;
                    clearInterval(timer2);
                    timer2 = setInterval(function() {
                        if (ajaxDone) {
                            me.update(start);
                            listIndex++;
                            ajaxDone = false;
                            clearInterval(timer2);
                        }
                    }, 100);
                })

                // 스크롤을 내릴때 새로 추가된 노드에 대해서 재배치
                me.options.scrollLoad && $(window).on('scroll.masonry', function() {
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        var clientHeight = $(this).height(),
                            scrollTop = $(this).scrollTop(),
                            docHeight = getDocHeight();

                        if (docHeight - 100 < clientHeight + scrollTop) {
                            me.update(me.$el.find(me.options.itemSelector).length);
                        }
                    }, 400);
                });
            },
            _configure: function() {
                var me = this,
                    opts = me.options;

                me._width = me.$el.width(); // 컨테이너 너비
                me._itemWidth = opts.itemWidth + opts.space; // 아이템 너비
                me._colCount = Math.ceil(me._width / me._itemWidth); // 열 갯수

                me._colsHeight = [];
                for (var i = 0; i < me._colCount; i++) {
                    me._colsHeight[i] = 0;
                }
            },
            // 렬 중에서 가장 짧은 렬 반환
            _getMinCol: function() {
                var heights = this._colsHeight,
                    col = 0;
                for (var i = 0, len = heights.length; i < len; i++) {
                    if (heights[i] < heights[col]) {
                        col = i;
                    }
                }
                return col;
            },

            // 렬 중에서 가장 긴 렬 반환
            _getMaxCol: function() {
                var heights = this._colsHeight,
                    col = 0;
                for (var i = 0, len = heights.length; i < len; i++) {
                    if (heights[i] > heights[col]) {
                        col = i;
                    }
                }
                return col;
            },

            update: function(start) {
                start = start || 0;

                var me = this,
                    space = me.options.space,
                    boxes = me.$el.find(me.options.itemSelector).filter(function(i) {
                        return i >= start;
                    });

                me.$el.css('visibility', 'hidden').show();

                boxes.each(function(i) {
                    var $this = $(this),
                        thisWidth = $this.width(),
                        thisHeight = $this.height(),
                        isBigItem = thisWidth > me._itemWidth,
                        col, top;

                    col = me._getMinCol(); // 젤 짧은 렬 검색
                    top = me._colsHeight[col];

                    // 두칸짜리이고 전체너비를 초과하는 경우에, 다음 행에 표시
                    if (isBigItem) {
                        if (col === me._colCount - 1) {
                            col = 0;
                        }

                        if (me._colsHeight.length > col) {
                            top = Math.max(me._colsHeight[col], me._colsHeight[col + 1]);
                            me._colsHeight[col + 1] = top + thisHeight + space;
                        }
                    }
                    me._colsHeight[col] = top + thisHeight + space;

                    // 배치
                    $this.css({
                        'top': top,
                        'left': col * me._itemWidth
                    });
                });

                col = me._getMaxCol(me._colsHeight);
                me.$el.css({
                    'height': me._colsHeight[col] - space,
                    'visibility': ''
                });
                boxes.fadeIn();
            }
        });


})(jQuery, window[LIB_NAME]);
