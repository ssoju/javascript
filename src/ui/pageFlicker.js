define('ui/pageFlicker', ['jquery', 'vcui', 'helper/gesture', 'ui/smoothScroll', 'jquery.transit'], function ($, core, Gesture, SmoothScroll, Transit) {
    const cssRegex = /translate\((\d+)/i;

    var PageFlicker = core.ui('PageFlicker', {
        selectors: {
            navs: '.nav-item',
            flickContainer: '.flick-container',
            navWrap: '.nav .scroll-wrap'
        },
        initialize(el, options) {
            const self = this;

            if (self.supr(el, options) === false) {
                return;
            }

            self.links = self.$navs.map(function () {
                return $(this).find('a').attr('href');
            }).get();
            self.panelNodes = {};
            self.panelIndex = 0;

            self._load();
            self._bindEvents();
        },
        _bindEvents() {
            const self = this;
            const opt = self.options;
            const $fc = self.$flickContainer;
            let startX, wrapWidth;

            self.gesture = new Gesture('body');
            self.gesture.on('gesturestart gesturemove gestureend gesturecancel', function (e, data) {
                switch (e.type) {
                    case 'gesturestart':
                        console.log('start', data);
                        $fc.children().removeClass('hidden');
                        startX = core.css3.getTranslateXY($fc.get(0)).x;
                        wrapWidth = self.$el.width();
                        break;
                    case 'gesturemove':
                        $fc.css('x', startX + data.diff.x);
                        break;
                    default:
                        var diffX = data.diff.x;
                        var newX, dir;
                        if (80 < Math.abs(diffX)) {
                            if (diffX > 0) {
                                newX = startX + wrapWidth;
                                dir = 'right';
                            } else {
                                newX = startX - wrapWidth;
                                dir = 'left';
                            }

                            $fc.transition({
                                x: newX,
                                complete: function () {
                                    console.log('transitionEnd1');
                                    self._reposition(dir);
                                }
                            });
                        } else {
                            $fc.transition({
                                x: startX
                            });
                        }
                        break;
                }
            });

            self.navScroll = self.$navWrap.vcSmoothScroll({
                scrollX: true,
                eventPassthrough: 'vertical',
                resizeRefresh: true,
                momentum: false,
                snap: 'li'
            }).on('click', 'a', function (e) {
                e.preventDefault();

                var index = $(this).parent().index();

                self.panelIndex = index;
                self._load();
            }).vcSmoothScroll('instance');

        },
        _load() {
            const self = this;
            const $panels = self.$flickContainer.children();
            let url = self.links[self.panelIndex];

            self._fetch(0, self._getPrevUrl());
            self._fetch(1, url, function () {
                var $nav = self.$navs.eq(self.panelIndex);

                self.$navs.removeClass('on');
                $nav.addClass('on');
                self.navScroll.scrollToElement($nav.get(0), 120);
            });
            self._fetch(2, self._getNextUrl());
        },
        _fetch(index, url, callback) {
            const self = this;
            const $panel = self.$flickContainer.children().eq(index);
            callback = callback || function () {};

            if (self.panelNodes[url]) {
                var dom = document.createDocumentFragment();
                dom.appendChild(self.panelNodes[url]);
                $panel.data('url', url).empty().append(dom);
                callback();
            } else {
                $.ajax({
                    url: url
                }).done(function (html) {
                    var div = self.panelNodes[url] = document.createElement('div');

                    div.innerHTML = html;
                    $panel.empty().append(div);
                    $(div).find('script[type="text/javascript"]').remove();
                    callback();
                });
            }
        },
        _getPrevUrl() {
            const self = this;
            const index = self._getPrevIndex();
            return self.links[index];
        },
        _getNextUrl() {
            const self = this;
            const index = self._getNextIndex();
            return self.links[index];
        },
        _getPrevIndex() {
            const self = this;
            return self.panelIndex === 0 ? self.links.length - 1 : self.panelIndex - 1;
        },
        _getNextIndex() {
            const self = this;
            return self.panelIndex === self.links.length - 1 ? 0 : self.panelIndex + 1;
        },
        _reposition(dir) {
            const self = this,
                $fc = self.$flickContainer;
            let $panels = $fc.children();

            if (dir === 'right') {
                $fc.prepend($panels.last());
                self.panelIndex = self._getPrevIndex();
            } else {
                $fc.append($panels.first());
                self.panelIndex = self._getNextIndex();
            }

            self._load();

            $fc.css('x', 0);
            $panels = $fc.children();
            $panels.not(':eq(1)').addClass('hidden');

            window.scrollTo(0, 0);
        }
    });

    return PageFlicker;
});
