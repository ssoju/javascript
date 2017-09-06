/*!
 * @author banner.js
 * @email odyseek@vi-nyl.com
 * @create 2015-01-08
 * @license MIT License
 */
(function(g, e, d) {
    var c = g(window)
      , h = e.browser
      , l = h.isMobile
      , o = e.css3;
    var f = "";
    var j = navigator.userAgent;
    if (j.indexOf("Chrome") > -1 || j.indexOf("Safari") > -1) {
        f = "-webkit-"
    } else {
        if (j.indexOf("Opera") > -1) {
            f = "-o-"
        } else {
            if (j.indexOf("Firefox") > -1) {
                f = "-moz-"
            } else {
                if (j.indexOf("MSIE") > -1) {
                    f = "-ms-"
                }
            }
        }
    }
    var m = e.ui("Banner", {
        bindjQuery: "banner",
        $statics: {
            ON_BANNER_CHANGED: "bannerchange"
        },
        defaults: {
            easing: "easeInOutQuart",
            buttonType: "disabled",
            slideType: "page",
            mobileType: "multi",
            selectedIndex: 0,
            setWebWide: 3,
            setWeb1024: 3,
            setWeb1023: 2,
            setMobile: 1,
            threshold: 75,
            isAutoRolling: false,
            rollingTime: 5000,
            slideTime: 300,
            cardPercent: 0.8,
            hideNextItem: false,
            supportTablet: false
        },
        events: {},
        selectors: {
            content: ".ui_banner_content",
            dim: ".ui_banner_dim",
            btnPrev: ".ui_banner_prev",
            btnNext: ".ui_banner_next",
            indi: ".ui_banner_indi",
            autoButton: ".ui_auto_rolling"
        },
        initialize: function(t, s) {
            var u = this;
            if (u.supr(t, s) === false) {
                return u.release()
            }
            u.contentWidth = 0;
            u.left = 0;
            u.outerWidth = 0;
            u.isAnimation = true;
            u.leftRatio = 0;
            u.maxCount = u.$content.find("> ul > li").size();
            u.nowIndex = u.options.selectedIndex;
            u.isAuto = u.options.isAutoRolling;
            u.isRolling = u.options.isAutoRolling;
            u.timer = null;
            u.hideNextItem = u.options.hideNextItem;
            u.cardPercent = u.options.cardPercent;
            if (u.options.slideType === "page") {
                u.$indi.on("click", ">.indi", function(w) {
                    w.preventDefault();
                    var v = 0;
                    if (u.isAnimation && g(w.currentTarget).index() !== u.nowIndex) {
                        if (u.nowIndex < g(w.currentTarget).index()) {
                            v = g(w.currentTarget).index() - u.nowIndex;
                            u.setAnimate(u.contentWidth * v, "right")
                        } else {
                            v = u.nowIndex - g(w.currentTarget).index();
                            u.setAnimate(-(u.contentWidth * v), "left")
                        }
                        u.nowIndex = g(w.currentTarget).index();
                        u._setIndi()
                    }
                })
            } else {
                u.$indi.hide()
            }
            u.$content.closest(".ajax_sec").find(".box_banner_paging").html("(" + (u.nowIndex + 1) + "/" + u.maxCount + ")");
            var r;
            c.on("resizeend." + u.cid, function(w, v) {
                u.setContent();
                u._setLine("next")
            }).on("changemediasize." + u.cid, r = function(w) {
                var v = e.ui.mediaInfo;
                u.$btnPrev.show();
                u.$btnNext.show();
                if (l && !u.options.supportTablet) {
                    u.count = u.options.setMobile;
                    u.percent = (!u.hideNextItem && u.count === 1 && u.options.mobileType === "multi") ? u.cardPercent : 1;
                    u.$dim.show();
                    u._toggleButtons(false)
                } else {
                    switch (v.mode) {
                    case "wide":
                        u.count = u.options.setWebWide;
                        u.percent = 1;
                        u.$dim.hide();
                        u._toggleButtons(false);
                        u._setButtonHide();
                        break;
                    case "w1280":
                        u.count = u.options.setWeb1024;
                        u.percent = 1;
                        u.$dim.hide();
                        u._toggleButtons(false);
                        u._setButtonHide();
                        break;
                    case "w1024":
                        u.count = u.options.setWeb1023;
                        u.percent = 1;
                        u.$dim.hide();
                        u._toggleButtons(false);
                        break;
                    case "w768":
                    case "w376":
                        u.count = u.options.setMobile;
                        u.percent = (!u.hideNextItem && u.count === 1 && u.options.mobileType === "multi") ? u.cardPercent : 1;
                        u.$dim.show();
                        u._toggleButtons(false);
                        break
                    }
                }
            }
            );
            r();
            scui.util.waitImageLoad(u.$content.find("img"), true).done(function() {
                u.$content.find("ul").show();
                u.setContent();
                u._setLine("next")
            });
            u.$content.swipeGesture({
                swipe: function(w, x) {
                    var y, z, v;
                    if (!u.isAnimation) {
                        return false
                    }
                    switch (w) {
                    case "start":
                        u.left = u.$content.scrollLeft();
                        break;
                    case "move":
                        y = x.direction;
                        z = Math.abs(x.diff.x);
                        v = u.itemWidth;
                        if (Math.abs(z) >= v) {
                            u.isAnimation = true;
                            return false
                        }
                        if (y === "left" || y === "right") {
                            u.$content.scrollLeft((y === "left") ? u.left + z : u.left - z)
                        }
                        break;
                    case "end":
                    case "cancel":
                        y = x.direction;
                        z = Math.abs(x.diff.x);
                        if (y === "left" || y === "right") {
                            if (u.options.threshold < z) {
                                u._setLine(y)
                            } else {
                                y = (y === "left") ? "right" : "left";
                                u._setLine(y, "return")
                            }
                        } else {
                            u._setLine("left")
                        }
                        break
                    }
                }
            });
            u.$btnPrev.on("click", function(v) {
                u.setAnimate(-u.contentWidth, "left")
            });
            u.$btnNext.on("click", function(v) {
                u.setAnimate(u.contentWidth, "right")
            });
            u.$autoButton.on("click", function() {
                g(this).hasClass("stop") ? g(this).replaceClass("stop", "play").find("span.hide").html("자동 롤링 시작하기") : g(this).replaceClass("play", "stop").find("span.hide").html("자동 롤링 멈추기");
                u.setRolling({
                    isPlay: g(this).hasClass("stop")
                })
            });
            u._toggleButtons()
        },
        setAnimate: function(t, r) {
            var s = this;
            if (s.isAnimation) {
                s.isAnimation = false;
                s.left = s.$content.scrollLeft();
                if (r === "left" && s.left === 0) {
                    s.left = s.$content.prop("scrollWidth") - s.$content.width()
                } else {
                    if (r === "right" && parseInt(s.left / 10, 10) * 10 === parseInt((s.$content.prop("scrollWidth") - s.$content.width()) / 10, 10) * 10) {
                        s.left = 0
                    } else {
                        s.left = (s.left + t <= 0) ? 0 : ((s.left + t > s.outerWidth - s.contentWidth) ? s.outerWidth - s.contentWidth : s.left + t)
                    }
                }
                if (r === "left") {
                    s.nowIndex = (s.nowIndex - 1 < 0) ? s.maxCount - 1 : s.nowIndex - 1
                } else {
                    s.nowIndex = (s.nowIndex + 1 > s.maxCount - 1) ? 0 : s.nowIndex + 1
                }
                s.aniTime = s.contentWidth * 0.8;
                s.aniTime = s.aniTime < s.options.slideTime ? s.options.slideTime : s.aniTime;
                s.$content.animate({
                    scrollLeft: s.left
                }, {
                    duration: s.aniTime,
                    easing: s.options.easing,
                    complete: function() {
                        s.isAnimation = true;
                        s.leftRatio = s.$content.scrollLeft() / s.outerWidth;
                        s._toggleButtons(true);
                        s._setIndi();
                        if (s.isAuto && s.isRolling) {
                            s.setTimer()
                        }
                    }
                })
            }
        },
        setContent: function() {
            var r = this
              , s = [];
            if (r.count === 0) {
                r.outerWidth = 0;
                r.$content.find("> ul > li").css("width", "");
                r.$content.css({
                    height: ""
                }).find("ul").css({
                    width: "",
                    paddingLeft: "",
                    paddingRight: "",
                    position: ""
                });
                r._toggleButtons(false);
                r.$el.css({
                    visibility: ""
                })
            } else {
                r.outerWidth = 0;
                r.itemWidth = Math.round(r.$content.width() / r.count * r.percent);
                if (r.hideNextItem) {
                    if (r.$content.width() > r.itemWidth * r.maxCount - 5) {
                        r.$btnPrev.hide();
                        r.$btnNext.hide();
                        r.$content.css({
                            width: "100%"
                        });
                        r.itemWidth = Math.round(r.$content.width() / r.count * r.percent)
                    }
                }
                r.paddingWidth = (r.percent === 1) ? 0 : Math.round(r.$content.width() / r.count * ((1 - r.percent) / 2));
                s = [];
                r.$content.find("> ul > li").css("width", r.itemWidth);
                r.$content.find("> ul > li").each(function(t) {
                    r.outerWidth += g(this).outerWidth();
                    if (r.$el.parent().hasClass("certify_card_slide") == false) {
                        s.push(g(this).outerHeight(true))
                    }
                });
                r.outerHeight = e.array.max(s);
                r.$content.css({
                    height: r.outerHeight
                }).find("ul").css({
                    width: r.outerWidth,
                    paddingLeft: r.paddingWidth,
                    paddingRight: r.paddingWidth,
                    position: "relative"
                }).end().scrollLeft(r.outerWidth * r.leftRatio);
                r.$dim.css({
                    width: r.paddingWidth,
                    height: r.$el.height(),
                    top: 0
                }).eq(0).css({
                    left: 0,
                    right: ""
                }).end().eq(1).css({
                    left: "",
                    right: 0
                });
                if (r.options.slideType === "page") {
                    r.contentWidth = r.$content.find("li").outerWidth() * Math.floor(r.$content.width() / r.$content.find("li").outerWidth())
                } else {
                    r.contentWidth = r.$content.find("li").outerWidth()
                }
                if (r.isAuto && r.isRolling) {
                    r.setTimer()
                }
                r._toggleButtons(false);
                r.$el.css({
                    visibility: ""
                })
            }
        },
        _setIndi: function() {
            var r = this;
            r.$indi.find(">.indi").removeClass("on").eq(r.nowIndex).addClass("on");
            r.$content.closest(".ajax_sec").find(".box_banner_paging").html("(" + (r.nowIndex + 1) + "/" + r.maxCount + ")")
        },
        _setLine: function(v, r) {
            var t = this, s, u;
            if (t.isAnimation) {
                u = t.$content.scrollLeft() % t.itemWidth;
                switch (v) {
                case "right":
                    s = "-=" + u;
                    break;
                case "mid":
                    s = t.left;
                    break;
                case "left":
                default:
                    s = "+=" + (t.itemWidth - u);
                    break
                }
                if (u > 1) {
                    t.isAnimation = false;
                    t.$content.animate({
                        scrollLeft: s
                    }, 300, function() {
                        if (r === "return") {
                            t.isAnimation = true;
                            return false
                        }
                        t.leftRatio = t.$content.scrollLeft() / t.outerWidth;
                        if (t.left !== t.$content.scrollLeft()) {
                            if (v === "left") {
                                t.nowIndex = (t.nowIndex + 1 > t.maxCount - 1) ? 0 : t.nowIndex + 1
                            } else {
                                t.nowIndex = (t.nowIndex - 1 < 0) ? t.maxCount - 1 : t.nowIndex - 1
                            }
                            t._setIndi()
                        }
                        t._toggleButtons();
                        if (t.isAuto && t.isRolling) {
                            t.setTimer()
                        }
                        t.isAnimation = true
                    })
                }
            }
        },
        _toggleButtons: function(t) {
            var s = this
              , u = s.$content.prop("scrollLeft")
              , r = s.options.buttonType;
            if (r === "disabled" || r === "multi") {
                s.$btnPrev.disabled(false);
                s.$btnNext.disabled(false);
                if (u === 0) {
                    s.$btnPrev.disabled(true);
                    t && s.$btnNext.focus()
                }
                if (u + 5 > s.$content.prop("scrollWidth") - s.$content.width()) {
                    s.$btnNext.disabled(true);
                    t && s.$btnPrev.focus()
                }
            } else {
                if (r === "none") {
                    s.$btnPrev.toggle(u !== 0);
                    s.$btnNext.toggle(u !== s.$content.prop("scrollWidth") - s.$content.width());
                    if (!s.$btnPrev.is(":visible")) {
                        t && s.$btnNext.focus()
                    }
                    if (!s.$btnNext.is(":visible")) {
                        t && s.$btnPrev.focus()
                    }
                }
            }
        },
        _setButtonHide: function() {
            var r = this;
            if (r.options.buttonType === "multi" && r.count === r.options.setWebWide && r.options.setWebWide >= r.maxCount) {
                r.$btnPrev.hide();
                r.$btnNext.hide()
            }
        },
        setRolling: function(s) {
            var r = this;
            r.isRolling = s.isPlay;
            if (r.isAuto && r.isRolling) {
                r.setTimer()
            } else {
                clearTimeout(r.timer);
                r.timer = null
            }
        },
        setTimer: function() {
            var r = this;
            clearTimeout(r.timer);
            r.timer = null;
            r.timer = setTimeout(function() {
                if (r.isAnimation) {
                    r.setAnimate(r.contentWidth, "right")
                }
            }, r.options.rollingTime)
        },
        update: function() {
            var r = this;
            r.contentWidth = 0;
            r.left = 0;
            r.outerWidth = 0;
            r.isAnimation = true;
            r.leftRatio = 0;
            r.maxCount = r.$content.find("> ul > li").size();
            r.nowIndex = r.options.selectedIndex;
            r.isAuto = r.options.isAutoRolling;
            r.isRolling = r.options.isAutoRolling;
            r.timer = null;
            scui.util.waitImageLoad(r.$content.find("img"), true).done(function() {
                r.$content.find("ul").show();
                r.setContent();
                r._setLine("next")
            })
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return m
        })
    }
    var q = e.ui("SingleBanner", {
        bindjQuery: "singleBanner",
        $statics: {
            ON_BANNER_CHANGED: "singleBannerchange"
        },
        defaults: {
            easing: "easeOutQuart",
            rollingTime: 3000,
            slideTime: 100,
            isOverRolling: false,
            isCss3: false,
            isAutoRolling: false,
            buttonType: "always",
            buttonPosition: "content",
            selectedIndex: 0,
            isRandom: false,
            heightFlexible: false,
            removeClass: "",
            directType: "left",
            isGesture: true,
            gestureTime: 500,
            fixHeight: -1
        },
        selectors: {
            content: ".ui_single_banner_content",
            btnPrev: ".ui_single_banner_prev",
            btnNext: ".ui_single_banner_next",
            indi: ".ui_single_banner_indi",
            visualImage: ".ui_image_center",
            autoButton: ""
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return t.release()
            }
            t._init();
            t._bindResize();
            if (t.maxCount === 0) {
                t._controlHide()
            } else {
                t._controlShow();
                t._bind()
            }
        },
        _init: function() {
            var r = this;
            r.$ul = r.$content.find("> ul");
            r.$li = r.$ul.find("> li");
            r.maxCount = r.$li.size() - 1;
            r.contentWidth = 100;
            r.timer = null;
            r.isAuto = (r.maxCount === 0) ? false : r.options.isAutoRolling;
            r.isRolling = (r.maxCount === 0) ? false : r.options.isAutoRolling;
            r.isAnimation = true;
            r.isPlay = true;
            r.fixHeight = r.options.fixHeight;
            r.directType = r.options.directType;
            r.isGesture = r.options.isGesture;
            if (r.directType == "left") {
                r.$ul.css("width", "100%")
            } else {
                r.$ul.css("height", "100%")
            }
            if (r.$indi.parent().attr("id") == "card_list_rec" || r.$indi.parent().attr("id") == "card_list_new") {
                r.isPlay = false
            }
            if (r.maxCount > 0) {
                r.setContent(false)
            }
            if (r.isAuto && r.isRolling) {
                r.setTimer()
            }
        },
        _controlHide: function() {
            var r = this;
            r.$btnPrev.css("visibility", "hidden");
            r.$btnNext.css("visibility", "hidden");
            r.$autoButton.css("visibility", "hidden");
            r.$indi.css("visibility", "hidden");
            r.$el.addClass("one")
        },
        _controlShow: function() {
            var r = this;
            r.$btnPrev.css("visibility", "");
            r.$btnNext.css("visibility", "");
            r.$indi.css("visibility", "");
            r.$el.removeClass("one")
        },
        _bindResize: function() {
            var r = this;
            c.on("changemediasize." + r.cid + " resizeend." + r.cid, r.fnc = function(t, s) {
                scui.util.waitImageLoad(r.$content.find("img:visible"), true).done(function() {
                    var u = [];
                    r.$li.each(function() {
                        u.push(g(this).height())
                    });
                    r.$content.css({
                        height: r.fixHeight > 0 ? r.fixHeight : scui.array.max(u)
                    });
                    r.setButtonTop()
                });
                if (r.directType == "left") {
                    r.$li.stop(true, true).css({
                        position: "absolute",
                        top: "0px"
                    })
                } else {
                    r.$li.stop(true, true).css({
                        position: "absolute",
                        left: "0px"
                    })
                }
                r.setVisualImage()
            }
            );
            r.fnc()
        },
        _bind: function() {
            var r = this;
            var s = r.directType;
            var t = r.isGesture;
            r.$el.swipeGesture({
                direction: s == "left" ? "horizontal" : "vertical"
            }).on("swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel", function(x, w) {
                var y;
                var u;
                if (!t) {
                    return
                }
                x.stopPropagation();
                if (x.type === "swipegestureleft" || x.type === "swipegesturedown") {
                    if (r.$ul.find("li:animated").length > 0) {
                        return false
                    }
                    if (r.isAnimation) {
                        r.isAnimation = false;
                        r.newIndex = (r.nowIndex + 1 > r.maxCount) ? 0 : r.nowIndex + 1;
                        r.selectContent(r.newIndex, "NEXT", true)
                    }
                } else {
                    if (x.type === "swipegestureright" || x.type === "swipegestureup") {
                        if (r.$ul.find("li:animated").length > 0) {
                            return false
                        }
                        if (r.isAnimation) {
                            r.isAnimation = false;
                            r.newIndex = (r.nowIndex - 1) < 0 ? r.maxCount : r.nowIndex - 1;
                            r.selectContent(r.newIndex, "PREV", true)
                        }
                    } else {
                        if (x.type === "swipegesturemove") {
                            r.isAnimation = false;
                            if (r.$ul.find("li:animated").length > 0) {
                                r.isAnimation = true;
                                return false
                            }
                            y = s == "left" ? w.diff.x : w.diff.y;
                            u = s == "left" ? r.$content.width() : r.$content.height();
                            if (Math.abs(y) >= u) {
                                r.isAnimation = true;
                                return false
                            }
                            r.$li.eq(r.nowIndex).css(s, y + "px");
                            var v = s == "left" ? Number(r.$li.eq(r.nowIndex).width()) : Number(r.$li.eq(r.nowIndex).height());
                            if (y > 0) {
                                if (r.nowIndex == 0) {
                                    r.$li.eq(r.maxCount).css(s, -v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                    r.$li.eq(r.maxCount).css("visibility", "");
                                    if (r.maxCount > 1) {
                                        r.$li.eq(r.nowIndex + 1).css(s, v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                        r.$li.eq(r.nowIndex + 1).css("visibility", "")
                                    }
                                } else {
                                    r.$li.eq(r.nowIndex - 1).css(s, -v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                    r.$li.eq(r.nowIndex - 1).css("visibility", "");
                                    if (r.maxCount > 1) {
                                        r.$li.eq(r.nowIndex + 1).css(s, v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                        r.$li.eq(r.nowIndex + 1).css("visibility", "")
                                    }
                                }
                            } else {
                                if (r.nowIndex == r.maxCount) {
                                    r.$li.eq(0).css(s, v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                    r.$li.eq(0).css("visibility", "");
                                    if (r.maxCount > 1) {
                                        r.$li.eq(r.nowIndex - 1).css(s, -v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                        r.$li.eq(r.nowIndex - 1).css("visibility", "")
                                    }
                                } else {
                                    r.$li.eq(r.nowIndex + 1).css(s, v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                    r.$li.eq(r.nowIndex + 1).css("visibility", "");
                                    if (r.maxCount > 1) {
                                        r.$li.eq(r.nowIndex - 1).css(s, -v + r.$li.eq(r.nowIndex).position()[s] + "px");
                                        r.$li.eq(r.nowIndex - 1).css("visibility", "")
                                    }
                                }
                            }
                            r.isAnimation = true
                        } else {
                            if (x.type === "swipegesturecancel") {
                                y = s == "left" ? w.diff.x : w.diff.y;
                                if (y > 0) {
                                    if (r.nowIndex == 0) {
                                        if (s == "left") {
                                            r.$li.eq(r.maxCount).stop(true).animate({
                                                left: -100 + "%",
                                                visibility: ""
                                            }, 500)
                                        } else {
                                            r.$li.eq(r.maxCount).stop(true).animate({
                                                top: -100 + "%",
                                                visibility: ""
                                            }, 500)
                                        }
                                    } else {
                                        if (s == "left") {
                                            r.$li.eq(r.nowIndex - 1).stop(true).animate({
                                                left: -100 + "%",
                                                visibility: ""
                                            }, 500)
                                        } else {
                                            r.$li.eq(r.nowIndex - 1).stop(true).animate({
                                                top: -100 + "%",
                                                visibility: ""
                                            }, 500)
                                        }
                                    }
                                } else {
                                    if (r.nowIndex == r.maxCount) {
                                        if (s == "left") {
                                            r.$li.eq(0).stop(true).animate({
                                                left: 100 + "%",
                                                visibility: ""
                                            }, 500)
                                        } else {
                                            r.$li.eq(0).stop(true).animate({
                                                top: 100 + "%",
                                                visibility: ""
                                            }, 500)
                                        }
                                    } else {
                                        if (s == "left") {
                                            r.$li.eq(r.nowIndex + 1).stop(true).animate({
                                                left: 100 + "%",
                                                visibility: ""
                                            }, 500)
                                        } else {
                                            r.$li.eq(r.nowIndex + 1).stop(true).animate({
                                                top: 100 + "%",
                                                visibility: ""
                                            }, 500)
                                        }
                                    }
                                }
                                if (s == "left") {
                                    r.$li.eq(r.nowIndex).animate({
                                        left: 0 + "%",
                                        visibility: ""
                                    }, 500)
                                } else {
                                    r.$li.eq(r.nowIndex).animate({
                                        top: 0 + "%",
                                        visibility: ""
                                    }, 500)
                                }
                            } else {
                                if (x.type === "swipegestureend") {
                                    r.isAnimation = true
                                }
                            }
                        }
                    }
                }
            }).on("mouseenter mouseleave focusin focusout", function(u) {
                switch (u.type) {
                case "mouseenter":
                case "focusin":
                    break;
                case "mouseleave":
                case "focusout":
                    break
                }
            });
            r.$indi.on("click." + r.cid, "> .indi", function(v) {
                v.preventDefault();
                var u = r.$indi.find("> .indi").index(g(this));
                if (r.isAnimation && u !== r.nowIndex) {
                    r.isAnimation = false;
                    r.newIndex = u;
                    r.$li.eq(r.newIndex).css({
                        left: ((r.newIndex < r.nowIndex) ? -100 : 100) + "%"
                    });
                    r.selectContent(r.newIndex, (r.newIndex < r.nowIndex) ? "PREV" : "NEXT")
                }
            });
            r.$indi.find("> * > .indi").on("click", function(v) {
                v.preventDefault();
                var u = g(this).index();
                if (r.isAnimation && u !== r.nowIndex) {
                    r.isAnimation = false;
                    r.newIndex = u;
                    r.$li.eq(r.newIndex).css({
                        left: ((r.newIndex < r.nowIndex) ? -100 : 100) + "%"
                    });
                    r.selectContent(r.newIndex, (r.newIndex < r.nowIndex) ? "PREV" : "NEXT")
                }
            });
            r.$btnPrev.on("click." + r.cid, function(u) {
                u.preventDefault();
                if (r.isAnimation) {
                    r.isAnimation = false;
                    r.newIndex = (r.nowIndex - 1) < 0 ? r.maxCount : r.nowIndex - 1;
                    r.$li.css(s, "-300%").eq(r.nowIndex).css(s, "0%").end().eq(r.newIndex).css(s, "-100%");
                    r.selectContent(r.newIndex, "PREV")
                }
            });
            r.$btnNext.on("click." + r.cid, function(u) {
                u.preventDefault();
                if (r.isAnimation) {
                    r.isAnimation = false;
                    r.newIndex = (r.nowIndex + 1 > r.maxCount) ? 0 : r.nowIndex + 1;
                    r.$li.css(s, "-300%").eq(r.nowIndex).css(s, "0%").end().eq(r.newIndex).css(s, "100%");
                    r.selectContent(r.newIndex, "NEXT")
                }
            });
            r.$ul.on(o.transitionEnd, function(u) {
                r.$li.eq(r.newIndex).css(s, "0%").siblings().css(s, "300%");
                o.move(g(this), 0, 0, 0);
                r._transitionEnd()
            });
            r.$autoButton && r.$autoButton.on("click", function(u) {
                u.preventDefault();
                g(this).hasClass("stop") ? g(this).replaceClass("stop", "play").find("span.hide").html("자동 롤링 시작하기") : g(this).replaceClass("play", "stop").find("span.hide").html("자동 롤링 멈추기");
                r.setRolling({
                    isPlay: g(this).hasClass("stop"),
                    isTab: false
                });
                if (g(this).hasClass("play")) {
                    clearTimeout(r.timer)
                } else {
                    r.isAnimation = true
                }
            })
        },
        setContent: function() {
            var r = this;
            var s = r.directType;
            r.nowIndex = (r.options.selectedIndex === "last") ? r.maxCount : r.options.selectedIndex;
            r.leftPosition = 0;
            scui.util.waitImageLoad(r.$content.find("img:visible"), true).done(function() {
                var t = [];
                r.$li.each(function() {
                    t.push(g(this).height())
                });
                r.$content.css({
                    height: r.fixHeight > 0 ? r.fixHeight : scui.array.max(t)
                });
                if (s == "left") {
                    r.$li.stop(true, true).css({
                        position: "absolute",
                        top: "0px",
                        left: "-300%"
                    }).eq(r.nowIndex).css({
                        left: "0%"
                    })
                } else {
                    r.$li.stop(true, true).css({
                        position: "absolute",
                        top: "-300%",
                        left: "0px"
                    }).eq(r.nowIndex).css({
                        top: "0%"
                    })
                }
                r.$indi.find(".indi").removeClass("on").eq(r.nowIndex).addClass("on");
                r.$li.eq(r.nowIndex).css("visibility", "").siblings().css("visibility", "hidden");
                r._setButton();
                r.$li.each(function() {
                    g(this).css(s, (g(this).index() - r.nowIndex) * 100 + "%")
                });
                if (r.nowIndex == 0) {
                    r.$li.eq(r.maxCount).css(s, r.maxCount > 1 ? "-100%" : "100%")
                }
                if (r.nowIndex == r.maxCount) {
                    r.$li.eq(0).css(s, "100%")
                }
            })
        },
        selectContent: function(s, w, u) {
            var t = this, r = t.$li.eq(t.newIndex).parent().parent().find("ul").index(t.$li.eq(t.newIndex).parent()), v, x;
            var y = u == d ? false : u;
            clearTimeout(t.timer);
            t.$indi.find(".indi").removeClass("on").eq(t.newIndex).addClass("on");
            if (t.options.heightFlexible) {
                t.$content.stop(true, true).animate({
                    height: t.$li.eq(t.newIndex).height()
                }, t.options.slideTime)
            }
            x = t.directType == "left" ? t.$li.eq(t.newIndex).width() * 0.5 : t.$li.eq(t.newIndex).height() * 0.5;
            x = x != t.options.slideTime ? t.options.slideTime : x;
            x = y ? t.options.gestureTime : x;
            t.$el.trigger("slidebefore", {
                parentIndex: r,
                index: t.newIndex
            });
            if (t.$li.eq(t.newIndex).data("indiClass")) {
                t.$indi.removeClass(t.options.removeClass).addClass(t.$li.eq(t.newIndex).data("indiClass"))
            }
            t._transition({
                parentIndex: r,
                index: t.newIndex,
                aniTime: x,
                direction: w,
                isDrag: y
            })
        },
        _transition: function(t) {
            var r = this
              , u = t.aniTime / 1000;
            var s = r.directType;
            if (o.support && r.options.isCss3 && !t.isDrag) {
                r.$li.css("visibility", "").eq(r.nowIndex).css(s, "0%").end().eq(r.newIndex).css(s, (t.direction === "NEXT" ? "" : "-") + "100%");
                setTimeout(function() {
                    r.transData = t;
                    o.style(r.$ul, "", 0, "cubic-bezier(0.550, 0.055, 0.675, 0.190)");
                    o.move(r.$li.eq(r.nowIndex).parent(), (t.direction === "NEXT" ? "-" : "") + "100%", 0, u)
                }, 50)
            } else {
                if (t.direction === "PREV") {
                    r[s] = 100
                } else {
                    r[s] = -100
                }
                if (s == "left") {
                    r.$li.stop(true, true).eq(r.nowIndex).animate({
                        left: r[s] + "%"
                    }, {
                        duration: t.aniTime,
                        easing: r.options.easing
                    }).end().eq(t.index).css("visibility", "").animate({
                        left: 0 + "%"
                    }, {
                        duration: t.aniTime,
                        easing: r.options.easing,
                        complete: function() {
                            r.transData = t;
                            r._transitionEnd()
                        }
                    })
                } else {
                    r.$li.stop(true, true).eq(r.nowIndex).animate({
                        top: r[s] + "%"
                    }, {
                        duration: t.aniTime,
                        easing: r.options.easing
                    }).end().eq(t.index).css("visibility", "").animate({
                        top: 0 + "%"
                    }, {
                        duration: t.aniTime,
                        easing: r.options.easing,
                        complete: function() {
                            r.transData = t;
                            r._transitionEnd()
                        }
                    })
                }
            }
        },
        _transitionEnd: function() {
            var r = this;
            var s = r.directType;
            r.nowIndex = r.newIndex;
            r.$li.eq(r.nowIndex).siblings().css("visibility", "hidden");
            r._setButton(true);
            r.$el.trigger("slideafter", {
                parentIndex: r.transData.parentIndex,
                index: r.newIndex
            });
            r.$li.each(function() {
                g(this).css(s, (g(this).index() - r.nowIndex) * 100 + "%")
            });
            if (r.nowIndex == 0) {
                r.$li.eq(r.maxCount).css(s, r.maxCount > 1 ? "-100%" : "100%")
            }
            if (r.nowIndex == r.maxCount) {
                r.$li.eq(0).css(s, "100%")
            }
            r.isAnimation = true;
            if (r.isAuto && r.isRolling) {
                r.setTimer()
            }
        },
        setVisualImage: function(r) {
            var s = this;
            scui.util.waitImageLoad(s.$visualImage.find("img:visible"), true).done(function() {
                var t = Math.ceil((s.$visualImage.width() - s.$visualImage.find("img:visible").width()) / 2);
                s.$visualImage.find("img:visible").css({
                    left: t
                });
                r && s.$li.eq(0).css("visibility", "").siblings().css("visibility", "hidden")
            })
        },
        setButtonTop: function() {
            var r = this, s;
            if (r.options.buttonPosition === "image") {
                s = Math.ceil((r.$content.find("img:visible").height() - r.$btnPrev.height()) / 2);
                r.$btnPrev.css({
                    marginTop: 0,
                    top: s
                });
                r.$btnNext.css({
                    marginTop: 0,
                    top: s
                })
            } else {
                if (r.options.buttonPosition === "content") {
                    s = Math.ceil((r.$content.height() - r.$btnPrev.height()) / 2);
                    r.$btnPrev.css({
                        marginTop: 0,
                        top: s
                    });
                    r.$btnNext.css({
                        marginTop: 0,
                        top: s
                    })
                }
            }
        },
        setRolling: function(s) {
            var r = this;
            clearTimeout(r.timer);
            r.isRolling = (r.maxCount === 0) ? false : s.isPlay;
            r.setButtonTop();
            if (r.isAuto && r.isRolling) {
                s.isTab && r.setContent();
                r.setTimer()
            } else {
                clearTimeout(r.timer);
                r.timer = null
            }
        },
        setTimer: function() {
            var r = this;
            r.timer = null;
            clearTimeout(r.timer);
            if (r.isPlay && r.isAnimation) {
                r.timer = setTimeout(function() {
                    r.isAnimation = false;
                    r.newIndex = (r.nowIndex + 1 > r.maxCount) ? 0 : r.nowIndex + 1;
                    r.selectContent(r.newIndex, "NEXT")
                }, r.options.rollingTime)
            }
        },
        setHeight: function() {
            var r = this;
            r.$content.stop(true, true).css({
                height: r.$li.eq(r.nowIndex).height()
            });
            r.setButtonTop()
        },
        setTab: function(r) {
            var t = this
              , s = t.$li.index(t.$ul.eq(r).find("li:first"))
              , u = (s < t.nowIndex) ? "PREV" : "NEXT";
            if (t.isAnimation && s !== t.nowIndex) {
                t.isAnimation = false;
                t.newIndex = s;
                t.selectContent(t.newIndex, (t.newIndex < t.nowIndex) ? "PREV" : "NEXT")
            }
        },
        _setButton: function(s) {
            var r = this;
            if (r.maxCount === 0) {
                r.$btnPrev.hide();
                r.$btnNext.hide();
                r.$indi.hide()
            } else {
                r.$btnPrev.show();
                r.$btnNext.show();
                r.$indi.show();
                if (r.options.buttonType === "disabled") {
                    r.$btnPrev.removeClass("disable").prop("disabled", false);
                    r.$btnNext.removeClass("disable").prop("disabled", false);
                    if (r.nowIndex === 0) {
                        r.$btnPrev.addClass("disable").prop("disabled", true);
                        s && r.$btnNext.focus()
                    }
                    if (r.nowIndex === r.maxCount) {
                        r.$btnNext.addClass("disable").prop("disabled", true);
                        s && r.$btnPrev.focus()
                    }
                    r.$li.eq(r.nowIndex).data("year") && r._setButtonText()
                } else {
                    if (r.options.buttonType === "none") {
                        r.$btnPrev.show();
                        r.$btnNext.show();
                        if (r.nowIndex === 0) {
                            r.$btnPrev.hide();
                            s && r.$btnNext.focus()
                        }
                        if (r.nowIndex === r.maxCount) {
                            r.$btnNext.hide();
                            s && r.$btnPrev.focus()
                        }
                        r.$li.eq(r.nowIndex).data("year") && r._setButtonText()
                    }
                }
            }
        },
        _setButtonText: function(s) {
            var r = this;
            r.$btnPrev.find(".year").html(r.$li.eq(r.nowIndex - 1).data("year")).end().find(".muns").html(r.$li.eq(r.nowIndex - 1).data("month"));
            r.$btnNext.find(".year").html(r.$li.eq(r.nowIndex + 1).data("year")).end().find(".muns").html(r.$li.eq(r.nowIndex + 1).data("month"))
        },
        selectedIndex: function() {
            var r = this;
            return r.nowIndex
        },
        selectedCount: function() {
            var r = this;
            return r.maxCount
        },
        update: function() {
            var r = this;
            r.updateSelectors();
            r.$ul = r.$content.find("> ul");
            r.$li = r.$ul.find("> li");
            r.nowIndex = 0;
            r.maxCount = r.$li.size() - 1;
            r.contentWidth = 100;
            r.timer = null;
            r.isAuto = (r.maxCount === 0) ? false : r.options.isAutoRolling;
            r.isRolling = (r.maxCount === 0) ? false : r.options.isAutoRolling;
            r.isAnimation = true;
            r.isPlay = true;
            r.setContent(false)
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return q
        })
    }
    var p = e.ui("TabBanner", {
        bindjQuery: "tabBanner",
        $statics: {
            ON_BANNER_CHANGED: "tabBannerchange"
        },
        defaults: {
            slideTime: 300,
            selectedIndex: 0,
            buttonPosition: "content",
            isPlay: true,
            isRandom: false,
            gestureTime: 500
        },
        events: {},
        selectors: {
            tabButton: ".ui_tab_banner_button",
            tabContent: ".ui_tab_banner_content",
            autoButton: ".ui_tab_auto_rolling,.ui_tab_auto_rolling > a"
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return t.release()
            }
            if (t.options.isRandom) {
                t.options.selectedIndex = Math.floor((Math.random() * t.$tabContent.find("li").length))
            }
            t._init();
            t._bind()
        },
        _init: function() {
            var r = this;
            r.index = r.options.selectedIndex
        },
        _bind: function() {
            var s = this
              , r = s.$el.find(".ui_tab_banner_content");
            r.on("touchstart", function(u) {
                u.stopPropagation()
            });
            var t = s.$tabContent.scSingleBanner({
                selectedIndex: s.options.selectedIndex,
                isAutoRolling: true,
                buttonPosition: s.options.buttonPosition,
                slideTime: s.options.slideTime,
                selectors: {
                    autoButton: s.selectors.autoButton
                }
            }).scSingleBanner("setRolling", {
                isPlay: s.options.isPlay,
                isTab: true
            }).eq(s.index).scSingleBanner("setRolling", {
                isPlay: true,
                isTab: true
            })
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return p
        })
    }
    var b = e.ui("CardPromotion", {
        bindjQuery: "cardPromotion",
        $statics: {
            ON_BANNER_CHANGED: "tabBannerchange"
        },
        defaults: {
            slideTime: 1000,
            selectedIndex: 0,
            buttonPosition: "content",
            isPlay: false,
            elCelCount: 4,
            defaultIdx: 1000,
            elMaxWidth: 400,
            elMinWidth: 148,
            elContentWidth: 1134,
            elRadio: 0.4,
            infoItemName: ".big_cont",
            startPos: 0,
            cardWidthAuto: 300
        },
        events: {},
        selectors: {
            tabButton: ".ui_tab_banner_button",
            tabContent: ".ui_tab_banner_content",
            cardItems: ".ui_tab_banner_content li",
            autoButton: ".ui_tab_auto_rolling,.ui_tab_auto_rolling > a"
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return t.release()
            }
            t._init();
            t._bind()
        },
        _init: function() {
            var r = this;
            r.index = r.options.selectedIndex;
            r.$cardItems.each(function() {
                g(this).find(".card_box").each(function(s, u) {
                    var t = g(u).find(" > a, > .md_card");
                    r.options.cardWidthAuto = (r.options.elContentWidth - r.options.elMaxWidth) / (r.$cardItems.length);
                    t.parent().css({
                        position: "absolute"
                    });
                    t.css(f + "transform-origin", "0");
                    t.css(f + "transform", "scale(" + r.options.elRadio + ")");
                    t.find(".big_cont").css("opacity", 0)
                })
            })
        },
        _bind: function() {
            var s = this
              , r = s.$el.find(".ui_tab_banner_content");
            r.on("touchstart", function(u) {
                u.stopPropagation()
            });
            var t = s.$tabContent.scSingleBanner({
                isAutoRolling: false,
                buttonType: "disabled",
                buttonPosition: s.options.buttonPosition,
                slideTime: s.options.slideTime,
                selectors: {
                    autoButton: s.selectors.autoButton
                }
            }).scSingleBanner("setRolling", {
                isPlay: false,
                isTab: false
            }).eq(s.index).scSingleBanner("setRolling", {
                isPlay: false,
                isTab: false
            });
            var s = this;
            s.$cardItems.on("mouseenter mouseleave", "> div.card_box > a, > div.card_box > .md_card", function(w) {
                w.preventDefault();
                var v = g(w.currentTarget).parent();
                var u = g(w.currentTarget).parent().parent();
                if (w.type == "mouseenter") {
                    s._activeItem(u.index(), v.index(), true)
                } else {
                    if (w.type == "mouseleave") {
                        s._activeItem(u.index(), s.options.defaultIdx, true)
                    }
                }
            });
            s.$el.find(".ui_item_btn").on("click", function(B) {
                B.preventDefault();
                var C = this;
                var A = g(this);
                var w = g(g(this).data("target"));
                var D = g(this).offset();
                var E = D.top + g(this).height();
                var x = D.left - w.width() / 2 - g(this).width();
                w.css({
                    top: E + 10,
                    left: x
                });
                w.fadeIn(500, function() {
                    w.find(":focusable").first().focus()
                });
                s.$cardItems.off("mouseenter mouseleave", "> div.card_box > a, > div.card_box > .md_card");
                if (g(this).closest(".module_box")) {
                    var u = g(this).closest(".module_box").offset().left;
                    var z = g(this).closest(".module_box").width();
                    if (x < u) {
                        x = u + 10;
                        w.css({
                            top: E + 10,
                            left: x
                        });
                        var F = parseInt(D.left) - parseInt(w.find(".ico_tooltip").offset().left);
                        w.find(".ico_tooltip").css("left", w.find(".ico_tooltip").position().left + F)
                    } else {
                        if (x > u && (x + w.outerWidth()) > (u + z)) {
                            var v = parseInt(x + w.outerWidth()) - parseInt(u + z - 10);
                            var y = parseInt(x) - v;
                            w.css({
                                top: E + 10,
                                left: y
                            })
                        }
                    }
                    var F = parseInt(D.left) - parseInt(w.find(".ico_tooltip").offset().left);
                    w.find(".ico_tooltip").css("left", w.find(".ico_tooltip").position().left + F);
                    c.off("scroll." + s.mid).on("scroll." + s.mid, function() {
                        w.css({
                            top: g(C).offset().top + g(C).height() + 10
                        })
                    });
                    c.off("resizeend." + s.mid).on("resizeend." + s.mid, function() {
                        g(C).trigger("click")
                    })
                }
                w.find(".ui_item_close").off().on("click", function() {
                    g(this).closest(".ui_item_layer").hide();
                    g(this).closest(".ui_item_layer").find(".ico_tooltip").css("left", "50%");
                    A.focus();
                    s.$cardItems.on("mouseenter mouseleave", "> div.card_box > a, > div.card_box > .md_card", function(I) {
                        I.preventDefault();
                        var H = g(I.currentTarget).parent();
                        var G = g(I.currentTarget).parent().parent();
                        if (I.type == "mouseenter") {
                            s._activeItem(G.index(), H.index(), true)
                        } else {
                            if (I.type == "mouseleave") {
                                s._activeItem(G.index(), s.options.defaultIdx, true)
                            }
                        }
                    })
                })
            })
        },
        _activeItem: function(u, r, x) {
            var t = this;
            var s = 0
              , w = 0;
            var v = (r > 3) ? (t.options.elContentWidth / (t.options.elCelCount)) : (t.options.elContentWidth - t.options.elMaxWidth) / (t.options.elCelCount);
            t.$cardItems.eq(u).find(">.card_box").each(function(y, B) {
                if (r < y) {
                    w = t.options.elMaxWidth
                } else {
                    w = 0
                }
                s = v * y + w + t.options.startPos;
                var A = g(B)
                  , z = A.find(" > a, > .md_card");
                if (y == r) {
                    A.css("width", "400px");
                    z.css("display", "inline-block");
                    A.find(".big_img").css("width", t.options.elMaxWidth + "px");
                    A.css("z-index", 1);
                    if (x) {
                        A.find(t.options.infoItemName).clearQueue().stop().animate({
                            opacity: 1
                        }, {
                            step: function(D, E) {
                                var C = parseFloat(t.options.elRadio) + parseFloat(parseFloat(1 - t.options.elRadio) * D);
                                z.css(f + "transform", "scale(" + C + ")");
                                A.find(".big_img>.card_id").css({
                                    opacity: 0
                                });
                                A.find(".big_cont").css({
                                    opacity: 1
                                })
                            },
                            duration: 350,
                            easing: "easeOutQuad"
                        }, 350, function() {
                            z.css(f + "transform", "scale(1)")
                        })
                    } else {
                        A.find(t.options.infoItemName).find(" > a, > .md_card").css(f + "transform", "scale(1)");
                        A.find(t.options.infoItemName).find(".big_img>.card_id").css({
                            opacity: 1
                        });
                        A.find(t.options.infoItemName).find(".big_cont").css({
                            opacity: 0
                        })
                    }
                } else {
                    A.css("z-index", 0);
                    if (x) {
                        A.find(t.options.infoItemName).clearQueue().stop().animate({
                            opacity: 0
                        }, {
                            step: function(D, E) {
                                var C = parseFloat(t.options.elRadio) + parseFloat(parseFloat(1 - t.options.elRadio) * D);
                                z.css(f + "transform", "scale(" + C + ")");
                                A.find(".big_img>.card_id").css({
                                    opacity: 1
                                });
                                A.find(".big_cont").css({
                                    opacity: 0
                                })
                            },
                            duration: 350,
                            easing: "easeOutQuad"
                        }, 350)
                    } else {
                        A.find(t.options.infoItemName).find(" > a, > .md_card").css(f + "transform", "scale(" + t.options.elRadio + ")");
                        A.find(".big_img>.card_id").css({
                            opacity: 1
                        });
                        A.find(".big_cont").css({
                            opacity: 0
                        })
                    }
                }
                if (x) {
                    if (y == r) {
                        s = s - 20
                    }
                    A.clearQueue().stop().animate({
                        left: s
                    }, {
                        duration: 350,
                        easing: "easeOutQuad"
                    }, 350)
                } else {
                    A.clearQueue().stop().animate({
                        left: s
                    })
                }
            })
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return b
        })
    }
    var n = e.ui("MainSlider", {
        bindjQuery: "mainSlider",
        defaults: {
            height: "100%",
            width: "100%",
            aniType: 1,
            isRandom: true,
            isAutoRolling: true,
            autoDelayTime: 8000,
            duration: 1200
        },
        selectors: {
            visualWrap: ".ui_visual_wrap",
            items: ".visual_item",
            itemBg: ".ui_item_bg",
            infoWrap: ".info_wrap",
            indi: ".ui_indi",
            thumbWrap: ".ui_thumb_wrap",
            btnPrev: ".prev",
            btnNext: ".next",
            indiBar: ".ui_indi > .ui_current_bar"
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return
            }
            t.nowIndex = 0;
            t.isAnimation = false;
            t._layout()
        },
        _layout: function() {
            var s = this
              , r = 0;
            s.maxIndex = s.$items.length - 1;
            s.$indi.find("li").css("width", 100 / (s.$items.length + 1) + "%");
            s.$thumbWrap.find("li").css("width", 100 / (s.$items.length + 1) + "%");
            s.$el.animate({
                opacity: 1
            }, 1000, function() {
                if (s.options.isRandom) {
                    r = Math.floor((Math.random() * s.$items.length))
                }
                s.nowIndex = r;
                s.$items.eq(r).addClass("current").siblings().css("visibility", "hidden").attr("tabindex", "-1");
                s.doneTimer = null;
                clearTimeout(s.doneTimer);
                s.doneTimer = setTimeout(function() {
                    s.$items.eq(r).addClass("done")
                }, 3000);
                if (s.maxIndex > 0) {
                    s.thumbWrapHeight = 32;
                    s.$thumbWrap.find("li").css({
                        height: s.thumbWrapHeight
                    });
                    s.$indi.animate({
                        opacity: 1
                    }, 500);
                    s._bindEvent();
                    setTimeout(function() {
                        s.$indi.find("li").each(function(t) {
                            setTimeout(function() {
                                if (!s.$thumbWrap.find("li").eq(t).hasClass("btn_event_more")) {
                                    s.$thumbWrap.find("li").eq(t).css("top", -s.thumbWrapHeight).addClass("on")
                                }
                            }, t * 300)
                        });
                        s.$indi.find("li").each(function(t) {
                            setTimeout(function() {
                                if (!s.$thumbWrap.find("li").eq(t).hasClass("btn_event_more")) {
                                    s.$thumbWrap.find("li").eq(t).css("top", 0).removeClass("on")
                                }
                            }, s.$indi.find("li").length * 60 + t * 300)
                        })
                    }, 1500);
                    s.$btnPrev.show();
                    s.$btnNext.show()
                }
            })
        },
        _bindEvent: function() {
            var s = this;
            var t = null
              , r = false;
            c.on("resizeend." + s.cid, function() {
                s.selectIndi(s.nowIndex)
            });
            c.trigger("resizeend." + s.cid);
            s.ishover = false;
            s.hoverTimer = null;
            s.$el.swipeGesture().on("swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel", function(y, x) {
                var z;
                var u;
                y.stopPropagation();
                if (y.type === "swipegestureleft") {
                    if (!s.isAnimation) {
                        var w = (s.nowIndex == s.maxIndex) ? 0 : s.nowIndex + 1;
                        s.selectContent(w)
                    }
                } else {
                    if (y.type === "swipegestureright") {
                        if (!s.isAnimation) {
                            var v = (s.nowIndex == 0) ? s.maxIndex : s.nowIndex - 1;
                            s.selectContent(v)
                        }
                    } else {
                        if (y.type === "swipegestureend") {}
                    }
                }
            }).on("mouseenter mouseleave focusin focusout", function(u) {});
            s.$btnPrev.on("click", function(v) {
                v.preventDefault();
                if (s.isAnimation) {
                    return false
                }
                var u = (s.nowIndex == 0) ? s.maxIndex : s.nowIndex - 1;
                s.selectContent(u)
            });
            s.$btnNext.on("click", function(v) {
                v.preventDefault();
                if (s.isAnimation) {
                    return false
                }
                var u = (s.nowIndex == s.maxIndex) ? 0 : s.nowIndex + 1;
                s.selectContent(u)
            });
            s.$indi.find("li").on("click", function(u) {
                u.preventDefault();
                if (g(this).index() === 0 || s.isAnimation || s.nowIndex === (g(this).index() - 1) || g(this).hasClass("btn_event_more")) {
                    return false
                }
                s.selectContent(g(this).index() - 1)
            });
            s.$thumbWrap.find("li").on("click", function(u) {
                u.preventDefault();
                if (s.isAnimation || g(this).index() === s.nowIndex || g(this).hasClass("btn_event_more")) {
                    return false
                }
                s.selectContent(g(this).index())
            });
            s.$thumbWrap.find("li").on("mouseenter mouseleave", function(v) {
                var u = this;
                if (g(this).hasClass("btn_event_more")) {
                    return false
                }
                if (v.type === "mouseenter") {
                    g(u).css({
                        top: -s.thumbWrapHeight
                    }).addClass("on")
                } else {
                    g(u).css({
                        top: 0
                    }).removeClass("on")
                }
            });
            s.$indiBar.siblings().on("mouseenter mouseleave", function(w) {
                var v = this;
                if (g(this).hasClass("btn_event_more")) {
                    return false
                }
                w.stopPropagation();
                if (w.type === "mouseenter") {
                    var u = (g(v).index() == 0 ? s.nowIndex : g(v).index() - 1);
                    s.$thumbWrap.find("li").eq(u).css({
                        top: -s.thumbWrapHeight
                    }).addClass("on")
                } else {
                    var u = (g(v).index() == 0 ? s.nowIndex : g(v).index() - 1);
                    s.$thumbWrap.find("li").eq(u).css({
                        top: 0
                    }).removeClass("on")
                }
            });
            if (s.options.isAutoRolling) {
                s.setTimer();
                s.$el.find(".btn_wrap > button.btn_play").hide().siblings().show()
            } else {
                s.$el.find(".btn_wrap > button.btn_stop").hide().siblings().show()
            }
            s.$el.find(".btn_wrap > button").on("click", function() {
                if (g(this).hasClass("btn_play")) {
                    s.setTimer();
                    g(this).hide().siblings("button").show()
                } else {
                    clearTimeout(s.timer);
                    g(this).hide().siblings("button").show()
                }
            })
        },
        selectContent: function(r) {
            var s = this;
            s.isAnimation = true;
            clearTimeout(s.timer);
            clearTimeout(s.doneTimer);
            s.$items.eq(r).addClass("current").css("visibility", "");
            s.$items.eq(r).siblings().removeClass("current").removeClass("done").css("visibility", "hidden");
            s.selectIndi(r);
            s.nowIndex = r;
            setTimeout(function() {
                s.isAnimation = false;
                if (s.options.isAutoRolling) {
                    s.setTimer()
                }
                s.$items.eq(r).removeAttr("tabindex").siblings().attr("tabindex", "-1")
            }, 2000);
            s.doneTimer = setTimeout(function() {
                s.$items.eq(s.nowIndex).addClass("done")
            }, 3000)
        },
        selectIndi: function(r) {
            var s = this;
            s.$indi.find("li").removeClass("on");
            s.$indiBar.show();
            scui.css3.move(s.$indiBar, s.$indiBar.width() * r, 0, 1, function() {
                s.$indiBar.hide();
                s.$indi.find("li").eq(s.nowIndex + 1).addClass("on")
            })
        },
        setTimer: function() {
            var s = this, r;
            clearTimeout(s.timer);
            s.timer = null;
            s.timer = setTimeout(function() {
                if (!s.isAnimation) {
                    r = (s.nowIndex + 1 > s.maxIndex) ? 0 : s.nowIndex + 1;
                    s.selectContent(r)
                }
            }, s.options.autoDelayTime)
        },
        setAutoRolling: function(r) {
            var s = this;
            if (r) {
                s.setTimer()
            } else {
                clearTimeout(s.timer);
                s.timer = null
            }
        },
        _imgloaded: function(v, u, w) {
            var s = 0;
            var r = null;
            for (var t = 1; t <= u; t++) {
                r = new Image();
                r.onload = function() {
                    s++;
                    if (s == u) {
                        w()
                    }
                }
                ;
                r.src = v + t + ".png"
            }
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return n
        })
    }
    var i = e.ui("MainSlider_mobile", {
        bindjQuery: "mainSlider_mobile",
        defaults: {
            height: "100%",
            width: "100%",
            aniType: 2,
            isRandom: true,
            isAutoRolling: true,
            autoDelayTime: 4000,
            duration: 1500,
            easing: ""
        },
        selectors: {
            backPannel: ".ui_mainslider_mobile_back > li",
            frontPannel: ".ui_mainslider_mobile_front > li",
            indiWrap: ".ui_mainslider_mobile_indi",
            indi: ".ui_mainslider_mobile_indi > span > a",
            autoBtn: ".ui_auto_rolling",
            btnNext: ".ui_btn_next",
            btnPrev: ".ui_btn_prev",
            indiPageNo: ".ui_indi_page_no",
            indiPageTotal: ".ui_indi_page_total"
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return
            }
            t.nowIndex = 0;
            t.isAnimation = false;
            t._layout()
        },
        _layout: function() {
            var s = this
              , r = 0;
            s.maxIndex = s.$backPannel.length - 1;
            if (s.options.isRandom) {
                s.nowIndex = Math.floor((Math.random() * s.$backPannel.length))
            }
            if (s.options.aniType === 1) {
                s.$backPannel.eq(s.nowIndex).addClass("current").siblings().removeClass("current");
                s.$frontPannel.eq(s.nowIndex).addClass("current").siblings().removeClass("current");
                s._setPaging();
                if (s.maxIndex > 0) {
                    s.$indi.eq(s.nowIndex).addClass("on").siblings().removeClass("on");
                    s.$frontPannel.css("opacity", 1);
                    s.$btnNext.parent().show();
                    s.$btnPrev.parent().show();
                    s._bindEvent()
                } else {
                    s.$indiWrap.hide()
                }
            } else {
                s.$el.addClass("type2");
                s.$backPannel.eq(s.nowIndex).addClass("current").siblings().removeClass("current");
                s.$frontPannel.eq(s.nowIndex).addClass("current").siblings().removeClass("current");
                s.$el.animate({
                    opacity: 1
                }, 1000);
                s._setPaging();
                if (s.maxIndex > 0) {
                    s.$indi.eq(s.nowIndex).addClass("on").siblings().removeClass("on");
                    s.$frontPannel.css("opacity", 1);
                    s.$btnNext.parent().show();
                    s.$btnPrev.parent().show();
                    s._bindEvent()
                } else {
                    s.$indiWrap.hide()
                }
                s.$backPannel.eq(s.nowIndex).addClass("done")
            }
            s.$backPannel.eq(s.nowIndex).attr("aria-hidden", "false").siblings().attr("aria-hidden", "true");
            s.$frontPannel.eq(s.nowIndex).attr("aria-hidden", "false").siblings().attr("aria-hidden", "true");
            s.$el.animate({
                opacity: 1
            }, 1000)
        },
        _bindEvent: function() {
            var r = this;
            r.$el.swipeGesture().on("swipegesturestart swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel", function(x, w) {
                var s = r.$el.width();
                var v = (r.nowIndex == r.maxIndex ? 0 : r.nowIndex + 1);
                var t = (r.nowIndex == 0 ? r.maxIndex : r.nowIndex - 1);
                x.stopPropagation();
                if (x.type === "swipegesturestart") {
                    clearTimeout(r.timer)
                } else {
                    if (x.type === "swipegestureleft") {
                        if (!r.isAnimation) {
                            r.selectContent(v, "LEFT")
                        }
                    } else {
                        if (x.type === "swipegestureright") {
                            if (!r.isAnimation) {
                                r.selectContent(t, "RIGHT")
                            }
                        } else {
                            if (x.type === "swipegesturemove") {
                                if (!r.isAnimation && s > Math.abs(w.diff.x)) {
                                    if (r.options.aniType === 1) {
                                        r.$frontPannel.eq(t).css({
                                            opacity: 1,
                                            left: -s + w.diff.x
                                        });
                                        r.$frontPannel.eq(v).css({
                                            opacity: 1,
                                            left: s + w.diff.x
                                        });
                                        r.$frontPannel.eq(r.nowIndex).css("left", w.diff.x);
                                        var u = (100 - (Math.abs(w.diff.x) / s * 100)) / 100;
                                        var y = 0.514 + (2 - u) / 2;
                                        r.$backPannel.eq(r.nowIndex).css({
                                            opacity: u
                                        }).find(".visual_bg").css(scui.css3.transform, "scale(" + y + ")");
                                        if (w.diff.x > 0) {
                                            r.$backPannel.eq(t).css("opacity", 1 - u)
                                        } else {
                                            r.$backPannel.eq(v).css("opacity", 1 - u)
                                        }
                                    } else {
                                        r.$frontPannel.eq(t).css({
                                            opacity: 1,
                                            left: -s + w.diff.x
                                        });
                                        r.$frontPannel.eq(v).css({
                                            opacity: 1,
                                            left: s + w.diff.x
                                        });
                                        r.$frontPannel.eq(r.nowIndex).css("left", w.diff.x)
                                    }
                                }
                            } else {
                                if (x.type === "swipegestureend") {
                                    if (r.options.isAutoRolling) {
                                        r.setTimer()
                                    }
                                } else {
                                    if (x.type === "swipegesturecancel") {
                                        if (r.options.isAutoRolling) {
                                            r.setTimer()
                                        }
                                        r.$frontPannel.eq(t).css({
                                            left: "-100%"
                                        });
                                        r.$frontPannel.eq(v).css({
                                            left: "100%"
                                        });
                                        r.$frontPannel.eq(r.nowIndex).animate({
                                            left: 0
                                        }, 200);
                                        if (r.options.aniType === 1) {
                                            r.$backPannel.eq(r.nowIndex).animate({
                                                opacity: 1
                                            }, {
                                                duration: 200,
                                                step: function(z) {
                                                    var A = 0.514 + (2 - z) / 2;
                                                    r.$backPannel.eq(r.nowIndex).find(".visual_bg").css(scui.css3.transform, "scale(" + A + ")")
                                                },
                                                complete: function() {
                                                    r.$backPannel.eq(r.nowIndex).find(".visual_bg").css(scui.css3.transform, "scale(1)")
                                                }
                                            }).siblings().animate({
                                                opacity: 0
                                            }, 200)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (r.options.isAutoRolling) {
                r.setTimer()
            }
            r.$indi.on("click", function(t) {
                t.preventDefault();
                var s = g(this).index();
                if (!r.isAnimation && s != r.nowIndex) {
                    r.$frontPannel.eq(s).css({
                        left: (s > r.nowIndex ? "100%" : "-100%")
                    });
                    r.selectContent(g(this).index(), (s > r.nowIndex ? "LEFT" : "RIGHT"))
                }
            });
            r.$btnNext.on("click", function(s) {
                s.preventDefault();
                if (!r.isAnimation) {
                    r.$el.trigger("swipegestureleft")
                }
            });
            r.$btnPrev.on("click", function(s) {
                s.preventDefault();
                if (!r.isAnimation) {
                    r.$el.trigger("swipegestureright")
                }
            });
            r.$autoBtn.on("click", function(s) {
                s.preventDefault();
                if (g(this).hasClass("stop")) {
                    g(this).removeClass("stop").addClass("play");
                    clearTimeout(r.timer);
                    r.options.isAutoRolling = false;
                    g(this).find(".hide").text("시작")
                } else {
                    g(this).removeClass("play").addClass("stop");
                    r.options.isAutoRolling = true;
                    r.setTimer();
                    g(this).find(".hide").text("정지")
                }
            })
        },
        selectContent: function(r, s) {
            var t = this;
            t.isAnimation = true;
            clearTimeout(t.timer);
            t.selectIndi(r);
            if (t.options.aniType === 1) {
                t.$backPannel.eq(r).animate({
                    opacity: 1
                }, t.options.duration);
                t.$backPannel.eq(t.nowIndex).animate({
                    opacity: 0
                }, {
                    duration: t.options.duration,
                    step: function(u) {
                        var v = 0.514 + (2 - u) / 2;
                        t.$backPannel.eq(t.nowIndex).find(".visual_bg").css(scui.css3.transform, "scale(" + v + ")")
                    }
                });
                t.$frontPannel.eq(t.nowIndex).animate({
                    left: (s === "LEFT" ? "-100%" : "100%")
                }, {
                    duration: t.options.duration,
                    easing: t.options.easing,
                    complete: function() {}
                });
                t.$frontPannel.eq(r).animate({
                    left: 0
                }, {
                    duration: t.options.duration,
                    easing: t.options.easing,
                    complete: function() {
                        t.nowIndex = r;
                        t.isAnimation = false;
                        t._setPaging();
                        var v = (t.nowIndex == t.maxIndex ? 0 : t.nowIndex + 1);
                        var u = (t.nowIndex == 0 ? t.maxIndex : t.nowIndex - 1);
                        t.$frontPannel.eq(v).css("left", "100%");
                        t.$frontPannel.eq(u).css("left", "-100%");
                        t.$backPannel.find(".visual_bg").css(scui.css3.transform, "scale(1)");
                        if (t.options.isAutoRolling) {
                            t.setTimer()
                        }
                    }
                })
            } else {
                t.$backPannel.removeClass("done").removeClass("current").eq(r).addClass("current");
                t.$frontPannel.eq(t.nowIndex).animate({
                    left: (s === "LEFT" ? "-100%" : "100%")
                }, {
                    duration: t.options.duration,
                    easing: t.options.easing,
                    complete: function() {}
                });
                t.$frontPannel.eq(r).animate({
                    left: 0
                }, {
                    duration: t.options.duration,
                    easing: t.options.easing,
                    complete: function() {
                        t.nowIndex = r;
                        t._setPaging();
                        var v = (t.nowIndex == t.maxIndex ? 0 : t.nowIndex + 1);
                        var u = (t.nowIndex == 0 ? t.maxIndex : t.nowIndex - 1);
                        t.$frontPannel.eq(v).css("left", "100%");
                        t.$frontPannel.eq(u).css("left", "-100%");
                        t.$frontPannel.removeClass("current").eq(r).addClass("current");
                        t.$backPannel.eq(t.nowIndex).addClass("done");
                        t.isAnimation = false;
                        if (t.options.isAutoRolling) {
                            t.setTimer()
                        }
                    }
                });
                t.$backPannel.removeAttr("aria-hidden").eq(r).attr("aria-hidden", "false").siblings().attr("aria-hidden", "true");
                t.$frontPannel.removeAttr("aria-hidden").eq(r).attr("aria-hidden", "false").siblings().attr("aria-hidden", "true")
            }
        },
        selectIndi: function(r) {
            var s = this;
            s.$indi.removeClass("on").eq(r).addClass("on")
        },
        setTimer: function() {
            var s = this, r;
            clearTimeout(s.timer);
            s.timer = null;
            s.timer = setTimeout(function() {
                if (!s.isAnimation) {
                    var t = (s.nowIndex == s.maxIndex ? 0 : s.nowIndex + 1);
                    s.$frontPannel.eq(t).css("left", "100%");
                    s.$el.trigger("swipegestureleft")
                }
            }, s.options.autoDelayTime)
        },
        _setPaging: function() {
            var r = this;
            r.$indiPageNo.text(r.nowIndex + 1);
            r.$indiPageTotal.text(r.maxIndex + 1)
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return i
        })
    }
    var k = e.ui("InfiniteBanner", {
        bindjQuery: "infiniteBanner",
        $statics: {
            ON_BANNER_CHANGED: "bannerchange"
        },
        defaults: {
            easing: "easeInOutQuart",
            afterMotion: null
        },
        events: {},
        selectors: {
            swipeLi: "li",
            imgArea: ".img_area",
            txtArea: ".txt_area",
            btnNext: ".ui_prev",
            btnPrev: ".ui_next"
        },
        motionSet: {
            direct1: {
                before: function() {
                    var s = g(".img_area");
                    var r = s.eq(0).children().stop();
                    r.eq(3).css({
                        top: "300px"
                    })
                },
                after: function() {
                    var v = this;
                    var u = g(".img_area");
                    var s = u.eq(0).children().stop();
                    var t = 0;
                    var r = v.isMobile;
                    s.eq(2).show();
                    s.eq(3).css({
                        top: "300px"
                    }).show().delay(t).animate({
                        top: (r == false ? "229px" : "175px")
                    }, 700, "easeOutBack");
                    s.eq(0).show();
                    s.eq(1).show();
                    g(".ui_swipe_content").css("overflow", "hidden")
                }
            },
            direct2: {
                before: function() {
                    var s = g(".img_area");
                    var r = s.eq(1).children().stop();
                    r.eq(3).css({
                        top: "300px"
                    })
                },
                after: function() {
                    var v = this;
                    var u = g(".img_area");
                    var s = u.eq(1).children().stop();
                    var t = 0;
                    var r = v.isMobile;
                    s.eq(2).show();
                    s.eq(3).css({
                        top: "300px"
                    }).show().delay(t).animate({
                        top: (r == false ? "224px" : "171px")
                    }, 700, "easeOutBack");
                    s.eq(0).show();
                    s.eq(1).show();
                    g(".ui_swipe_content").css("overflow", "hidden")
                }
            },
            finance1: {
                before: function() {
                    var s = g(".img_area");
                    var r = s.eq(0).children().stop();
                    r.eq(3).css({
                        top: "300px"
                    })
                },
                after: function() {
                    var v = this;
                    var u = g(".img_area");
                    var s = u.eq(0).children().stop();
                    var t = 0;
                    var r = v.isMobile;
                    s.eq(2).show();
                    s.eq(3).css({
                        top: "300px"
                    }).show().delay(t).animate({
                        top: (r == false ? "247px" : "185px")
                    }, 700, "easeOutBack");
                    s.eq(0).show();
                    s.eq(1).show();
                    g(".ui_swipe_content").css("overflow", "hidden")
                }
            },
            finance2: {
                before: function() {},
                after: function() {
                    var u = this;
                    var t = g(".img_area");
                    var r = t.eq(1).children().stop();
                    var s = 0;
                    r.eq(2).show();
                    r.eq(1).show();
                    r.eq(0).show()
                }
            },
            finance3: {
                before: function() {
                    var s = g(".img_area");
                    var r = s.eq(2).children().stop();
                    r.eq(3).css({
                        top: "300px"
                    })
                },
                after: function() {
                    var v = this;
                    var u = g(".img_area");
                    var s = u.eq(2).children().stop();
                    var t = 0;
                    var r = v.isMobile;
                    s.eq(2).show();
                    s.eq(0).show();
                    s.eq(1).show();
                    s.eq(3).css({
                        top: "300px"
                    }).show().delay(t).animate({
                        top: (r == false ? "241px" : "183px")
                    }, 700, "easeOutBack")
                }
            },
            phone1: {
                before: function() {},
                after: function() {
                    var t = g(".img_area");
                    var r = t.eq(0).children().stop();
                    var s = 0;
                    r.eq(2).show();
                    r.eq(0).show();
                    r.eq(1).show()
                }
            },
            phone2: {
                before: function() {
                    var s = g(".img_area");
                    var r = s.eq(1).children().stop();
                    r.eq(3).css({
                        top: "300px"
                    })
                },
                after: function() {
                    var v = this;
                    var u = g(".img_area");
                    var s = u.eq(1).children().stop();
                    var t = 0;
                    var r = v.isMobile;
                    s.eq(2).show();
                    s.eq(0).show();
                    s.eq(1).show();
                    s.eq(3).css({
                        top: "300px"
                    }).show().delay(t).animate({
                        top: (r == false ? "233px" : "177px")
                    }, 700, "easeOutBack")
                }
            },
            phone3: {
                before: function() {
                    var s = g(".img_area");
                    var r = s.eq(2).children().stop();
                    r.eq(3).css({
                        top: "300px"
                    })
                },
                after: function() {
                    var v = this;
                    var u = g(".img_area");
                    var s = u.eq(2).children().stop();
                    var t = 0;
                    var r = v.isMobile;
                    s.eq(2).show();
                    s.eq(0).show();
                    s.eq(1).show();
                    s.eq(3).css({
                        top: "300px"
                    }).show().delay(t).animate({
                        top: (r == false ? "241px" : "184px")
                    }, 700, "easeOutBack")
                }
            }
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return t.release()
            }
            t.conW = Number(t.$swipeLi.eq(0).width());
            t.timer = null;
            t.maxCount = t.$swipeLi.size() - 1;
            t.prev = t.maxCount,
            t.index = 0;
            t.next = 1;
            t.isAnimate = false;
            t.isAuto = true;
            t.isMobile = scui.isMobileMode();
            t.distance,
            t.touchStart,
            t.touchEnd,
            t.firstTouchX;
            t.$el.css({
                overflow: "hidden"
            });
            if (t.options.afterMotion) {
                t.runMotion("after", 500)
            }
            t.interval(1);
            t._bindEvent();
            t.$btnNext.on("click", function() {
                clearTimeout(t.timer);
                if (!t.isAnimate) {
                    t.setAnimate("right", 500)
                }
            });
            t.$btnPrev.on("click", function() {
                clearTimeout(t.timer);
                if (!t.isAnimate) {
                    t.setAnimate("left", 500)
                }
            })
        },
        interval: function() {
            var r = this;
            if (r.isAuto) {
                r.timer = setTimeout(function() {
                    r.$swipeLi.eq(r.index).css("left", 0).end().eq(r.next).css("left", "100%");
                    r.setAnimate("left", 500)
                }, 2900)
            }
        },
        runMotion: function(r, t) {
            var s = this;
            s.$imgArea.show();
            s.$txtArea.show();
            if (s.options.afterMotion) {
                s.motionSet[s.options.afterMotion + (s.index + 1)][r].call(s)
            }
            s.isAuto = true;
            setTimeout(function() {
                s.isAnimate = false
            }, t + 100)
        },
        setAnimate: function(z, s) {
            var x = this;
            var u = x.$imgArea;
            var w = x.$txtArea;
            var v = x.index;
            var t = x.maxCount;
            var r = x.$swipeLi;
            var A = false;
            x.isAnimate = true;
            if (z == "left") {
                var y = w.eq(x.index).animate({
                    left: (x.isMobile == false ? "40%" : "20%"),
                    opacity: 0
                }, {
                    duration: s,
                    complete: function() {
                        w.eq(x.index).css("opacity", 1);
                        ++x.index;
                        x.index = (x.index > x.maxCount ? 0 : x.index);
                        x.runMotion("before", s);
                        r.stop(true, true).hide().eq(x.index).show().queue(function() {
                            w.stop(true, true).eq(x.index).css({
                                left: "60%"
                            }).animate({
                                left: "50%"
                            }, {
                                duration: (s > 500 ? 500 : s),
                                progress: function(C, B, D) {
                                    if (B > 0 && A == false) {
                                        A = true;
                                        x.runMotion("after", s)
                                    }
                                },
                                complete: function() {
                                    x.isAnimate = false;
                                    x.interval()
                                }
                            })
                        })
                    }
                })
            } else {
                if (z == "right") {
                    var y = w.eq(x.index).animate({
                        left: (x.isMobile == false ? "60%" : "60%"),
                        opacity: 0
                    }, {
                        duration: s,
                        complete: function() {
                            w.eq(x.index).css("opacity", 1);
                            --x.index;
                            x.index = (x.index < 0 ? x.maxCount : x.index);
                            x.runMotion("before", s);
                            r.stop(true, true).hide().eq(x.index).show().queue(function() {
                                w.stop(true, true).eq(x.index).css({
                                    left: "40%"
                                }).show().animate({
                                    left: "50%",
                                    opacity: 1
                                }, {
                                    duration: (s > 500 ? 500 : s),
                                    progress: function(C, B, D) {
                                        if (B > 0 && A == false) {
                                            A = true;
                                            x.runMotion("after", s)
                                        }
                                    },
                                    complete: function() {
                                        x.isAnimate = false;
                                        x.interval()
                                    }
                                })
                            })
                        }
                    })
                }
            }
        },
        _bindEvent: function() {
            var s = this;
            var r = 0;
            s.$el.swipeGesture({
                direction: "horizontal",
                threshold: 10
            }).on("swipegestureleft swipegestureright swipegesturestart swipegestureend swipegesturemove swipegesturecancel", function(y, x) {
                y.stopPropagation();
                clearTimeout(s.timer);
                s.timer = null;
                switch (y.type) {
                case "swipegestureleft":
                    if (s.isAnimate) {
                        s.isAnimate = false;
                        s.next = (s.index + 1 > s.maxCount) ? 0 : s.index + 1;
                        s.setAnimate("left", (500 / Math.abs(s.distance)) * 50)
                    }
                    break;
                case "swipegestureright":
                    if (s.isAnimate) {
                        s.isAnimate = false;
                        s.next = (s.index - 1) < 0 ? s.maxCount : s.index - 1;
                        s.setAnimate("right", (500 / Math.abs(s.distance)) * 50)
                    }
                    break;
                case "swipegesturestart":
                    s.touchStart = y.timeStamp;
                    s.firstTouchX = x.x;
                    r = s.$txtArea.eq(s.index).css("left", "50%").position().left;
                    s.isAnimate = true;
                    break;
                case "swipegestureend":
                    s.isAnimate = true;
                    s.touchEnd = y.timeStamp;
                    break;
                case "swipegesturemove":
                    s.distance = x.diff.x;
                    var w = r + s.distance;
                    var u = (s.distance < 0 ? "left" : "right");
                    var v = (s.isMobile == false ? (s.distance < -200 || s.distance > 170) : (s.distance < -100 || s.distance > 80));
                    s.$txtArea.eq(s.index).css({
                        left: (w) + "px"
                    });
                    s.$txtArea.eq(s.index)[(v == true ? "hide" : "show")]();
                    var t = 1;
                    if (s.isMobile == false) {
                        t = (u == "left" ? (170 - Math.abs(s.distance)) / 100 : (170 - Math.abs(s.distance)) / 100)
                    } else {
                        t = (u == "left" ? (80 - Math.abs(s.distance)) / 100 : (80 - Math.abs(s.distance)) / 100)
                    }
                    s.$txtArea.eq(s.index).css("opacity", t);
                    break;
                case "swipegesturecancel":
                    s.distance = x.diff.x;
                    s.$imgArea.eq(s.index).show();
                    s.$txtArea.eq(s.index).animate({
                        left: "50%",
                        opacity: 1
                    }, {
                        duration: 500,
                        complete: function() {
                            s.interval();
                            s.isAnimate = false
                        }
                    });
                    break
                }
            }).on("mousedown touchstart", function(v) {
                var u = this;
                var t = g(v.target);
                if (u.isMobile == true && t.attr("type") != "button") {
                    v.preventDefault()
                }
                if (u.isMobile == false) {
                    v.preventDefault()
                }
                v.stopPropagation()
            })
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return k
        })
    }
    var a = e.ui("CardBanner", {
        bindjQuery: "CardBanner",
        defaults: {
            onStart: 0,
            isAutoRolling: true,
            autoDelayTime: 2000
        },
        selectors: {
            item: ".ui_single_banner_content ul>li",
            btnPrev: ".ui_single_banner_prev",
            btnNext: ".ui_single_banner_next",
            autoButton: ".ui_tab_auto_rolling2"
        },
        initialize: function(s, r) {
            var t = this;
            if (t.supr(s, r) === false) {
                return t.release()
            }
            t.nowIndex = (t.options.onStart > 0) ? t.options.onStart : 0;
            t.isStart = true;
            t.onInterval = null;
            t.dirSet = "right";
            t.totalItem = t.$item.length;
            t.isAnimation = false;
            t.itemWidth = t.$item.outerWidth();
            t.setup();
            if (t.options.isAutoRolling) {
                t.setTimer()
            } else {
                t.$autoButton.hide()
            }
        },
        layout: function() {
            var r = this;
            r.itemWidth = r.$item.outerWidth();
            if (r.isStart) {
                r.$item.stop().css({
                    opacity: 0
                });
                r.$item.animate({
                    opacity: 1
                }, 100)
            }
            r.selectContent(r.nowIndex)
        },
        rolling: function() {
            var s = this
              , r = s.nowIndex;
            if (s.dirSet === "left") {
                if (r == 0) {
                    r = s.totalItem - 1
                } else {
                    r--
                }
            } else {
                if (r >= s.totalItem - 1) {
                    r = 0
                } else {
                    r++
                }
            }
            s.selectContent(r);
            s.nowIndex = r
        },
        setTimer: function() {
            var r = this;
            r.onClear();
            r.onInterval = setInterval(function() {
                r.rolling()
            }, r.options.autoDelayTime)
        },
        setup: function() {
            var r = this;
            r.bindEvent();
            r.layout();
            g(window).on("resize", scui.delayRun(function() {
                r.layout()
            }, 500))
        },
        onClear: function() {
            var r = this;
            clearInterval(r.onInterval)
        },
        bindEvent: function() {
            var r = this;
            r.$btnPrev.on("click", function(s) {
                s.preventDefault();
                if (!l) {
                    r.onClear()
                }
                if (r.isAnimation) {
                    return false
                }
                r.dirSet = "left";
                r.rolling()
            });
            r.$btnNext.on("click", function(s) {
                s.preventDefault();
                if (!l) {
                    r.onClear()
                }
                if (r.isAnimation) {
                    return false
                }
                r.dirSet = "right";
                r.rolling()
            });
            r.$autoButton.on("click", function() {
                if (r.options.isAutoRolling) {
                    r.onClear();
                    r.$autoButton.removeClass("stop").addClass("play");
                    r.options.isAutoRolling = false
                } else {
                    if (l) {
                        r.setTimer()
                    }
                    r.$autoButton.removeClass("play").addClass("stop");
                    r.options.isAutoRolling = true
                }
            });
            r.$el.on("mouseenter mouseleave touchstart touchend", function(s) {
                switch (s.type) {
                case "mouseenter":
                    if (l) {
                        return
                    }
                    r.onClear();
                    break;
                case "mouseleave":
                    if (l) {
                        return
                    }
                    if (r.options.isAutoRolling) {
                        r.setTimer()
                    }
                    break;
                case "touchstart":
                    r.onClear();
                    break;
                case "touchend":
                    if (r.options.isAutoRolling) {
                        r.setTimer()
                    }
                    break
                }
            });
            r.$item.find("a.txt_link").on("focusin", function() {
                var s = g(this).parents("li").index();
                r.onClear();
                r.$item.css({
                    left: 0 + "%",
                    "z-index": 2
                });
                r.$item.eq(s).css({
                    left: 0 + "%",
                    "z-index": 3
                });
                r.$item.eq(s).find(".em_txt").css({
                    left: 0 + "%",
                    top: 0
                });
                r.$item.eq(s).find(".link_go").css({
                    left: 0 + "%",
                    top: 0
                })
            });
            if (!l) {
                return
            }
            r.$el.swipeGesture().on("swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel", function(u, t) {
                var v;
                var s;
                u.stopPropagation();
                if (u.type === "swipegesturestart") {
                    r.onClear()
                } else {
                    if (u.type === "swipegestureleft") {
                        if (r.isAnimation) {
                            return false
                        }
                        r.dirSet = "left";
                        r.rolling()
                    } else {
                        if (u.type === "swipegestureright") {
                            if (r.isAnimation) {
                                return false
                            }
                            r.dirSet = "right";
                            r.rolling()
                        } else {
                            if (u.type === "swipegestureend") {
                                r.setTimer()
                            }
                        }
                    }
                }
            })
        },
        selectContent: function(r) {
            var s = this;
            s.$item.each(function(t) {
                if (s.nowIndex > t) {
                    s.$item.eq(t).css({
                        left: -s.itemWidth,
                        "z-index": 2
                    })
                } else {
                    if (s.nowIndex === t) {
                        s.$item.eq(t).css({
                            left: 0,
                            "z-index": 3
                        })
                    } else {
                        s.$item.eq(t).css({
                            left: s.itemWidth,
                            "z-index": 2
                        })
                    }
                }
            });
            if (!s.isStart) {
                if (s.nowIndex === r) {
                    return
                }
                s.itemAnimate(r)
            } else {
                s.$item.stop().animate({
                    opacity: 1
                }, 100)
            }
            s.nowIndex = r;
            s.isStart = false
        },
        _animeteComplete: function(r) {
            var s = this;
            s.$item.eq(r).stop().css({
                left: s.itemWidth,
                "z-index": -1
            });
            s.$item.eq(r).find(".em_txt").removeClass("off").css({
                left: 0 + "%",
                top: 0,
                "box-shadow": ""
            });
            s.$item.eq(r).find(".link_go").removeClass("off").css({
                left: 0 + "%",
                top: 0
            });
            s.isAnimation = false
        },
        itemAnimate: function(r) {
            var u = this
              , t = r;
            u.isAnimation = true;
            if (u.dirSet === "left") {
                var s = (r === u.totalItem - 1) ? 0 : r + 1;
                u.$item.eq(s).stop().css({
                    left: 0,
                    "z-index": 3
                });
                u.$item.eq(s).find(".em_txt").animate({
                    left: -1 + "%"
                }, 10, function() {
                    g(this).addClass("off")
                }).animate({
                    left: -100 + "%"
                }, 900);
                u.$item.eq(s).find(".link_go").animate({
                    left: 1 + "%"
                }, 10, function() {
                    g(this).addClass("off")
                }).animate({
                    left: 100 + "%"
                }, 900, function() {
                    u._animeteComplete(s)
                });
                u.$item.eq(r).stop().css({
                    left: 0,
                    "z-index": 2,
                    opacity: 1
                })
            } else {
                var s = (r === u.totalItem) ? 0 : r - 1;
                u.$item.eq(s).stop().css({
                    left: 0,
                    "z-index": 3
                });
                u.$item.eq(s).find(".em_txt").animate({
                    left: -1 + "%"
                }, 10, function() {
                    g(this).addClass("off")
                }).animate({
                    left: -100 + "%"
                }, 900);
                u.$item.eq(s).find(".link_go").animate({
                    left: 1 + "%"
                }, 10, function() {
                    g(this).addClass("off")
                }).animate({
                    left: 100 + "%"
                }, 900, function() {
                    u._animeteComplete(s)
                });
                u.$item.eq(r).stop().css({
                    left: 0,
                    "z-index": 2,
                    opacity: 1
                })
            }
        }
    });
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return a
        })
    }
}
)(jQuery, window[LIB_NAME]);
