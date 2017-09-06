(function(f, d, c) {
    var b = f(window)
      , e = f(document)
      , h = d.isMobileMode();
    var g = d.ui("MainTabBanner", {
        bindjQuery: "mainTabBanner",
        defaults: {
            isGesture: false,
            isAuto: false,
            indexFirst: 0,
            idx: 0,
            directType: "left",
            tRelay: 1000,
            rRelay: 800
        },
        selectors: {
            container: ".ui_content_container",
            container_item: ".ui_content_item",
            tabButton: ".ui_tab_banner_button",
            tabContent: ".ui_tab_banner_content",
            autoButton: ".ui_tab_auto_rolling",
            bannerContent: ".ui_single_banner_content > ul > li",
            bannerButton: ".btn_slide_ri,.btn_slide_lf",
            bannerButtonRight: ".btn_slide_ri",
            bannerButtonLeft: ".btn_slide_lf",
            bannerNav: ".ui_single_banner_indi",
            bannerAuto: ".btn_playstop,.btn_rl"
        },
        initialize: function(k, j) {
            var l = this;
            if (l.supr(k, j) === false) {
                return
            }
            l.$bannerContent.css({
                left: "-100%",
                visibility: "hidden"
            }).eq(l.options.idx).css({
                left: "-0%",
                visibility: "visible"
            });
            l._bind()
        },
        _bind: function() {
            var q = this;
            var m = q.options.isGesture;
            var n = q.options.isAuto;
            var l = q.directType;
            var r = q.options.idx = q.options.indexFirst;
            var p = q.$bannerContent.length;
            var k;
            function o() {
                k = setTimeout(o, q.options.tRelay);
                r = q._gesture(r, "next")
            }
            function j() {
                clearTimeout(k)
            }
            if (m === true) {}
            if (n) {
                q.$bannerAuto.removeClass("play").addClass("stop");
                o();
                q.$bannerAuto.on("click", function(s) {
                    if (f(this).is(".play")) {
                        o();
                        f(this).removeClass("play").addClass("stop")
                    } else {
                        if (f(this).is(".stop")) {
                            j();
                            f(this).removeClass("stop").addClass("play")
                        }
                    }
                    return false
                })
            } else {
                q.$bannerAuto.removeClass("stop").addClass("play");
                j()
            }
            q.$bannerButton.find("a,button").off("click").on("click", function(t) {
                if (f(this).is(".prev")) {
                    var s = r;
                    if (q.$bannerContent.eq(r - 1).length) {
                        r--
                    } else {
                        r = p - 1
                    }
                    var u = r;
                    q._banner(s, u, "prev");
                    q._navgation(u)
                }
                if (f(this).is(".next")) {
                    var s = r;
                    if (q.$bannerContent.eq(r + 1).length) {
                        r++
                    } else {
                        r = 0
                    }
                    var u = r;
                    q._banner(s, u, "next");
                    q._navgation(u)
                }
            });
            q.$bannerNav.find(".btn_indi,.indi").on("click", function() {
                var t = f(this).index();
                var s = r;
                var u = t;
                r = t;
                f(this).addClass("on");
                q._banner(s, u);
                q._navgation(u);
                return false
            })
        },
        _autoPlay: function(n, k, m) {
            var l = this;
            var j = m;
            if (k === true) {
                setTimeout("me._autoPlay(timer,ch,tr)", m)
            }
            if (k === false) {
                clearTimeout(n)
            }
            return n
        },
        _gesture: function(j, o) {
            var l = this;
            var m = l.$bannerContent.length;
            if (o == "prev") {
                var k = j;
                if (l.$bannerContent.eq(j - 1).length) {
                    j--
                } else {
                    j = m - 1
                }
                var n = j
            }
            if (o == "next") {
                var k = j;
                if (l.$bannerContent.eq(j + 1).length) {
                    j++
                } else {
                    j = 0
                }
                var n = j
            }
            l._banner(k, n, o);
            l._navgation(n);
            return j
        },
        _banner: function(j, l, m) {
            var k = this;
            if (m == "next") {
                k.$bannerContent.eq(j).css({
                    left: "0%"
                }).stop(true).animate({
                    left: "-100%"
                }, k.options.rRelay, function() {
                    k.$bannerContent.eq(j).css({
                        visibility: "hidden"
                    })
                });
                k.$bannerContent.eq(l).css({
                    left: "100%",
                    visibility: "visible"
                }).show(0).stop().animate({
                    left: "0%"
                }, k.options.rRelay)
            } else {
                if (m == "prev") {
                    k.$bannerContent.eq(j).css({
                        left: "0%"
                    }).stop(true).animate({
                        left: "100%"
                    }, k.options.rRelay, function() {
                        k.$bannerContent.eq(j).css({
                            visibility: "hidden"
                        })
                    });
                    k.$bannerContent.eq(l).css({
                        left: "-100%",
                        visibility: "visible"
                    }).show(0).stop().animate({
                        left: "0%"
                    }, k.options.rRelay)
                } else {
                    if (j < l) {
                        console.log("<");
                        k.$bannerContent.eq(j).css({
                            left: "0%"
                        }).stop(true).animate({
                            left: "-100%"
                        }, k.options.rRelay, function() {
                            k.$bannerContent.eq(j).css({
                                visibility: "hidden"
                            })
                        });
                        k.$bannerContent.eq(l).css({
                            left: "100%",
                            visibility: "visible"
                        }).show(0).stop().animate({
                            left: "0%"
                        }, k.options.rRelay)
                    }
                    if (j > l) {
                        console.log(">");
                        k.$bannerContent.eq(j).css({
                            left: "0%"
                        }).stop(true).animate({
                            left: "100%"
                        }, k.options.rRelay, function() {
                            k.$bannerContent.eq(j).css({
                                visibility: "hidden"
                            })
                        });
                        k.$bannerContent.eq(l).css({
                            left: "-100%",
                            visibility: "visible"
                        }).show(0).stop().animate({
                            left: "0%"
                        }, k.options.rRelay)
                    }
                }
            }
        },
        _navgation: function(j) {
            var k = this;
            k.$bannerNav.find(".indi").removeClass("on");
            k.$bannerNav.find(".indi").eq(j).addClass("on")
        },
        _playbutton: function(j) {
            var k = this;
            if (k.$bannerNav.find(k.selectors.bannerAuto).length) {
                if (k.$bannerNav.find(k.selectors.bannerAuto).index() == 0) {
                    j = j - 1
                } else {
                    if (k.$bannerNav.children().length - 1 == k.$bannerNav.find(k.selectors.bannerAuto).index()) {
                        j = j
                    }
                }
            } else {
                j = j
            }
            return j
        }
    });
    var i = d.ui("MainNumCard", {
        bindjQuery: "mainNumCard",
        defaults: {
            isGesture: false,
            indexFirst: 0,
            idx: 0,
            idxOld: 0,
            idxNew: 0,
            directType: "left"
        },
        selectors: {
            tabButton: ".indi_wrap",
            autoButton: ".ui_tab_auto_rolling",
            bannerContent: ".ui_number_card_detail > ul > li",
            bannerButton: ".btns",
            bannerButtonRight: ".next",
            bannerButtonLeft: ".prev",
            bannerNav: ".indi_wrap"
        },
        initialize: function(k, j) {
            var l = this;
            if (l.supr(k, j) === false) {
                return
            }
            l.$bannerContent.hide(0).eq(l.defaults.idx).show(0);
            l._bind()
        },
        _bind: function() {
            var k = this;
            var n = k.options.isGesture;
            var m = k.directType;
            var j = k.defaults.idx = k.defaults.indexFirst;
            var l = k.$bannerContent.length;
            if (n) {
                k.$bannerContent.swipeGesture({
                    direction: m == "left" ? "horizontal" : "vertical"
                }).on("swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel", function(p, o) {
                    console.log(p.type);
                    if (p.type == "swipegesturemove") {
                        k.$bannerContent.css("left", o.diff.x + "px")
                    }
                })
            }
            k.$bannerButton.children().off("click").on("click", function() {
                if (f(this).is(".prev")) {
                    var o = j;
                    if (k.$bannerContent.eq(j - 1).length) {
                        j--
                    } else {
                        j = l - 1
                    }
                    var p = j;
                    k._banner(o, p, "prev");
                    k._navgation(p)
                }
                if (f(this).is(".next")) {
                    var o = j;
                    if (k.$bannerContent.eq(j + 1).length) {
                        j++
                    } else {
                        j = 0
                    }
                    var p = j;
                    k._banner(o, p, "next");
                    k._navgation(p)
                }
                console.log(o, p)
            });
            k.$tabButton.children().off("click").on("click", function() {
                var p = f(this).index();
                var o = j;
                var q = p;
                j = p;
                console.log(j);
                k._banner(o, q);
                k._navgation(q);
                console.log(o, q, k.idx)
            })
        },
        _banner: function(j, l, m) {
            var k = this;
            console.log(j, l, m);
            if (m == "next") {
                k.$bannerContent.eq(j).css({
                    left: "0%"
                }).animate({
                    left: "-100%"
                }, function() {
                    k.$bannerContent.eq(j).hide()
                });
                k.$bannerContent.eq(l).css({
                    left: "100%"
                }).show(0).animate({
                    left: "0%"
                })
            } else {
                if (m == "prev") {
                    k.$bannerContent.eq(j).css({
                        left: "0%"
                    }).stop().animate({
                        left: "100%"
                    }, function() {
                        k.$bannerContent.eq(j).hide()
                    });
                    k.$bannerContent.eq(l).css({
                        left: "-100%"
                    }).show(0).animate({
                        left: "0%"
                    })
                } else {
                    if (j < l) {
                        k.$bannerContent.eq(j).css({
                            left: "0%"
                        }).stop().animate({
                            left: "-100%"
                        }, function() {
                            k.$bannerContent.eq(j).hide()
                        });
                        k.$bannerContent.eq(l).css({
                            left: "100%"
                        }).show(0).animate({
                            left: "0%"
                        })
                    }
                    if (j > l) {
                        k.$bannerContent.eq(j).css({
                            left: "0%"
                        }).stop().animate({
                            left: "100%"
                        }, function() {
                            k.$bannerContent.eq(j).hide()
                        });
                        k.$bannerContent.eq(l).css({
                            left: "-100%"
                        }).show(0).animate({
                            left: "0%"
                        })
                    }
                }
            }
        },
        _navgation: function(j) {
            var k = this;
            k.$bannerNav.children().removeClass("on");
            k.$bannerNav.children().eq(j).addClass("on")
        }
    });
    var a = d.ui("MainNumCard2", {
        bindjQuery: "mainNumCard2",
        defaults: {
            isAuto: true,
            duration: 1000,
            autoRollingTime: 5000
        },
        selectors: {
            indiWrap: ".numcard_indi",
            listWrap: ".ui_numcard_list",
            listWrapFront: ".ui_numcard_list_front",
            autoButton: ".btn_numcard"
        },
        initialize: function(k, j) {
            var l = this;
            if (l.supr(k, j) === false) {
                return
            }
            l.isAnimate = false;
            l.currentIdx = 0;
            l.maxIdx = l.$listWrap.find("li").length - 1;
            l._layout()
        },
        _layout: function() {
            var j = this;
            j.$listWrap.css("z-index", 10).find("li").css("position", "absolute");
            j.$listWrapFront.css("z-index", 20).find("li").css("position", "absolute");
            j.$indiWrap.css("z-index", 30);
            j.nextIdx = (j.currentIdx == j.maxIdx ? 0 : j.currentIdx + 1);
            j.prevIdx = (j.currentIdx == 0 ? j.maxIdx : j.currentIdx - 1);
            j.$listWrap.find("li").eq(j.currentIdx).addClass("current").attr("aria-hidden", "false").show().siblings().hide().attr("aria-hidden", "true");
            j.$listWrapFront.find("li").hide().eq(j.currentIdx).show();
            j.$listWrapFront.find("li").eq(j.prevIdx).css({
                left: "-100%"
            }).show();
            j.$listWrapFront.find("li").eq(j.nextIdx).css({
                left: "100%"
            }).show();
            j.$listWrap.find("li").eq(j.prevIdx).css({
                opacity: 0
            }).show();
            j.$listWrap.find("li").eq(j.nextIdx).css({
                opacity: 0
            }).show();
            j.$indiWrap.find("ul > li.on").find("a").attr("title", "선택됨").parent().siblings().find("a").attr("title", "미선택됨");
            j.$indiWrap.find(".ui_page_total").text(j.maxIdx + 1);
            j._bind()
        },
        _bind: function() {
            var j = this;
            j.$el.on("touchstart", function(k) {
                k.stopPropagation()
            });
            j.$el.swipeGesture().on("swipegesturestart swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel", function(n, m) {
                var k = j.$el.width();
                j.nextIdx = (j.currentIdx == j.maxIdx ? 0 : j.currentIdx + 1);
                j.prevIdx = (j.currentIdx == 0 ? j.maxIdx : j.currentIdx - 1);
                n.stopPropagation();
                if (j.isAnimate) {
                    return false
                }
                if (n.type === "swipegesturestart") {} else {
                    if (n.type === "swipegestureleft") {
                        clearInterval(j._timer);
                        j.isAnimate = true;
                        j.$listWrap.find("li").removeClass("current").eq(j.currentIdx).attr("aria-hidden", "true").animate({
                            opacity: 0
                        }, j.options.duration, function() {
                            f(this).hide()
                        });
                        j.$listWrap.find("li").eq(j.nextIdx).show().attr("aria-hidden", "false").animate({
                            opacity: 1
                        }, j.options.duration, function() {
                            f(this).addClass("current")
                        });
                        j.$listWrapFront.find("li").attr("aria-hidden", "true").removeClass("current").eq(j.currentIdx).animate({
                            left: "-100%"
                        }, j.options.duration);
                        j.$listWrapFront.find("li").eq(j.nextIdx).animate({
                            left: 0
                        }, j.options.duration, function() {
                            j.currentIdx = j.nextIdx;
                            j.transitionEnd();
                            j.isAnimate = false;
                            if (j.options.isAuto) {
                                j.setTimer()
                            }
                        })
                    } else {
                        if (n.type === "swipegestureright") {
                            clearInterval(j._timer);
                            j.isAnimate = true;
                            j.$listWrap.find("li").removeClass("current").eq(j.currentIdx).attr("aria-hidden", "true").animate({
                                opacity: 0
                            }, j.options.duration, function() {
                                f(this).hide()
                            });
                            j.$listWrap.find("li").eq(j.prevIdx).show().attr("aria-hidden", "false").animate({
                                opacity: 1
                            }, j.options.duration, function() {
                                f(this).addClass("current")
                            });
                            j.$listWrapFront.find("li").attr("aria-hidden", "true").removeClass("current").eq(j.currentIdx).animate({
                                left: "100%"
                            }, j.options.duration);
                            j.$listWrapFront.find("li").eq(j.prevIdx).animate({
                                left: 0
                            }, j.options.duration, function() {
                                j.currentIdx = j.prevIdx;
                                j.transitionEnd();
                                j.isAnimate = false;
                                if (j.options.isAuto) {
                                    j.setTimer()
                                }
                            })
                        } else {
                            if (n.type === "swipegesturemove") {
                                clearInterval(j._timer);
                                if (!j.isAnimate && k > Math.abs(m.diff.x)) {
                                    var l = Math.abs(m.diff.x) / k * 100 / 100;
                                    if (m.diff.x > 0) {
                                        j.$listWrapFront.find("li").eq(j.currentIdx).css({
                                            left: m.diff.x
                                        });
                                        j.$listWrapFront.find("li").eq(j.prevIdx).css({
                                            left: -k + m.diff.x
                                        });
                                        j.$listWrap.find("li").eq(j.currentIdx).css("opacity", 1 - l);
                                        j.$listWrap.find("li").eq(j.prevIdx).show().css("opacity", l)
                                    } else {
                                        j.$listWrapFront.find("li").eq(j.currentIdx).css({
                                            left: m.diff.x
                                        });
                                        j.$listWrapFront.find("li").eq(j.nextIdx).css({
                                            left: k + m.diff.x
                                        });
                                        j.$listWrap.find("li").eq(j.currentIdx).css("opacity", 1 - l);
                                        j.$listWrap.find("li").eq(j.nextIdx).show().css("opacity", l)
                                    }
                                }
                            } else {
                                if (n.type === "swipegestureend") {} else {
                                    if (n.type === "swipegesturecancel") {
                                        if (m.diff.x > 0) {
                                            j.$listWrapFront.find("li").eq(j.currentIdx).animate({
                                                left: 0
                                            }, 200);
                                            j.$listWrapFront.find("li").eq(j.prevIdx).animate({
                                                left: -k
                                            }, 200);
                                            j.$listWrap.find("li").eq(j.currentIdx).animate({
                                                opacity: 1
                                            }, 200);
                                            j.$listWrap.find("li").eq(j.prevIdx).animate({
                                                opacity: 0
                                            }, 200)
                                        } else {
                                            j.$listWrapFront.find("li").eq(j.currentIdx).animate({
                                                left: 0
                                            }, 200);
                                            j.$listWrapFront.find("li").eq(j.nextIdx).animate({
                                                left: k
                                            }, 200);
                                            j.$listWrap.find("li").eq(j.currentIdx).animate({
                                                opacity: 1
                                            }, 200);
                                            j.$listWrap.find("li").eq(j.nextIdx).animate({
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
            j.$indiWrap.find("ul > li").on("click", "a", function(k) {
                k.preventDefault();
                j.selectContent(f(this).parent().index())
            });
            j.$autoButton.on("click", function(k) {
                k.preventDefault();
                clearInterval(j._timer);
                if (f(this).hasClass("stop")) {
                    j.options.isAuto = false;
                    f(this).hide().siblings().show()
                } else {
                    j.options.isAuto = true;
                    f(this).hide().siblings().show();
                    j.setTimer()
                }
            });
            if (j.options.isAuto) {
                j.setTimer()
            }
        },
        selectContent: function(j) {
            var k = this;
            if (k.isAnimate) {
                return false
            }
            k.isAnimate = true;
            clearInterval(k._timer);
            k.$listWrap.find("li").eq(k.currentIdx).animate({
                opacity: 0
            }, k.options.duration, function() {
                f(this).hide()
            });
            k.$listWrap.find("li").eq(j).css("opacity", 0).show().animate({
                opacity: 1
            }, k.options.duration, function() {
                f(this).addClass("current").attr("aria-hidden", "false").siblings().removeClass("current").attr("aria-hidden", "true")
            });
            k.$listWrapFront.find("li").removeClass("current").attr("aria-hidden", "true").eq(k.currentIdx).animate({
                left: (j > k.currentIdx ? "-100%" : "100%")
            }, k.options.duration);
            k.$listWrapFront.find("li").eq(j).css("left", (j > k.currentIdx ? "100%" : "-100%")).show().animate({
                left: 0
            }, k.options.duration, function() {
                k.currentIdx = j;
                k.transitionEnd();
                k.isAnimate = false;
                if (k.options.isAuto) {
                    k.setTimer()
                }
            })
        },
        transitionEnd: function() {
            var j = this;
            if (j.currentIdx < 2) {
                j.$indiWrap.addClass("black")
            } else {
                j.$indiWrap.removeClass("black")
            }
            j.nextIdx = (j.currentIdx == j.maxIdx ? 0 : j.currentIdx + 1);
            j.prevIdx = (j.currentIdx == 0 ? j.maxIdx : j.currentIdx - 1);
            j.$listWrapFront.find("li").eq(j.currentIdx).addClass("current").attr("aria-hidden", "fasle").siblings().hide();
            j.$listWrapFront.find("li").eq(j.nextIdx).css("left", "100%").show();
            j.$listWrapFront.find("li").eq(j.prevIdx).css("left", "-100%").show();
            j.$indiWrap.find("ul > li").removeClass("on").find("a").attr("title", "미선택됨").parent().eq(j.currentIdx).addClass("on").find("a").attr("title", "선택됨");
            j.$indiWrap.find(".ui_page_index").text(j.currentIdx + 1)
        },
        setTimer: function() {
            var j = this;
            j._timer = null;
            clearInterval(j._timer);
            j._timer = setInterval(function() {
                j.$el.trigger("swipegestureleft")
            }, j.options.autoRollingTime)
        }
    })
}
)(jQuery, window[LIB_NAME]);
