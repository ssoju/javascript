/*! 
 * @author scui.module.Sharer.js
 * @email 김승일(comahead@vi-nyl.com)
 * @create 2014-11-25 
 * @license MIT License
 */
(function(e, a) {
    var g = a.$doc
      , f = window
      , c = encodeURIComponent;
    var b = {
        PC: 1,
        MOBILE: 2,
        APP: 4
    };
    var d = {
        types: {
            facebook: {
                name: "페이스북",
                metaPrefix: "og",
                support: b.PC | b.MOBILE,
                size: [500, 300],
                baseUrl: "https://www.facebook.com/sharer.php?",
                makeParam: function(h) {
                    h.url = a.uri.addParam(h.url, {
                        _t: +new Date
                    });
                    return "u=" + c(h.url)
                }
            },
            twitter: {
                name: "트위터",
                metaPrefix: "twitter",
                support: b.PC | b.MOBILE,
                size: [550, 300],
                baseUrl: "https://twitter.com/intent/tweet?",
                makeParam: function(j) {
                    j.desc = j.desc || "";
                    var i = 140 - j.url.length - 6
                      , h = j.title + " - " + j.desc;
                    h = h.length > i ? h.substr(0, i) + "..." : h;
                    return "text=" + c(h + " " + j.url)
                }
            },
            kakaotalk: {
                name: "카카오톡",
                support: b.APP | b.MOBILE,
                metaPrefix: "og",
                size: [550, 300],
                baseUrl: "",
                makeParam: function(h) {
                    return {
                        msg: h.title + "\n" + (h.desc || ""),
                        desc: h.desc,
                        url: h.url,
                        image: h.image,
                        appid: "common store",
                        appver: "0.1",
                        type: "link",
                        appname: "삼성카드"
                    }
                }
            },
            kakaostory: {
                name: "카카오스토리",
                support: b.APP | b.MOBILE,
                metaPrefix: "og",
                size: [530, 480],
                baseUrl: "https://story.kakao.com/share?",
                makeParam: function(h) {
                    return "url=" + c(h.url) + (h.image && "&image=" + c(h.image)) + (h.title && "&title=" + c(h.title))
                }
            },
            line: {
                name: "라인",
                support: b.APP | b.MOBILE,
                baseUrl: "line://msg/text/",
                store: {
                    android: {
                        intentPrefix: "intent://msg/text/",
                        intentSuffix: "#Intent;scheme=line;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=jp.naver.line.android;end"
                    },
                    ios: "http://itunes.apple.com/jp/app/line/id443904275"
                },
                makeParam: function(h) {
                    return ""
                }
            },
            googleplus: {
                name: "구글플러스",
                support: b.PC | b.MOBILE,
                baseUrl: "https://plus.google.com/share?",
                makeParam: function(h) {
                    return "url=" + c(h.title + " " + h.url)
                }
            },
            pinterest: {
                name: "핀터레스트",
                detects: b.PC | b.MOBILE,
                size: [740, 300],
                baseUrl: "https://www.pinterest.com/pin/create/button/?",
                makeParam: function(h) {
                    return "url=" + c(h.url) + "&media=" + c(h.image) + "&description=" + c(h.desc)
                }
            }
        },
        _send: function(j, k) {
            var h = this.types[j];
            if (!h) {
                return
            }
            k.url = (k.url + "").replace(/#$/g, "");
            k.title = k.title || document.title;
            switch (j) {
            case "facebook":
            case "twitter":
            case "pinterest":
                window.open(h.baseUrl + h.makeParam(k), "", "menubar=no,height=" + h.size[1] + ", width=" + h.size[0]).focus();
                break;
            case "kakaotalk":
                var i = "";
                i = k.image;
                if (i.indexOf("http") == -1) {
                    i = "https:" + i
                }
                Kakao.Link.sendTalkLink({
                    label: k.title + "\n" + k.desc,
                    image: {
                        src: i,
                        width: "1189",
                        height: "621"
                    },
                    webButton: {
                        text: "삼성카드",
                        url: k.url
                    },
                    webLink: {
                        text: "삼성카드",
                        url: k.url
                    }
                });
                break;
            case "kakaostory":
                Kakao.Story.share({
                    url: k.url,
                    text: k.title
                });
                break
            }
        },
        _getMetaContent: function(h) {
            return e('head meta[property="' + h + '"], head meta[name="' + h + '"]').eq(0).attr("content")
        },
        _getMetaInfo: function(j, k) {
            var i = e(j), h, n, m, l;
            h = (i.attr("href") || "").replace(/^#/, "") || i.attr("data-url") || location.href;
            n = i.attr("data-title") || (k && this._getMetaContent(k + ":title")) || this._getMetaContent("title") || document.title;
            m = i.attr("data-desc") || (k && this._getMetaContent(k + ":description")) || this._getMetaContent("description") || "";
            l = i.attr("data-image") || (k && this._getMetaContent(k + ":image")) || this._getMetaContent("image") || "https:" + scard.env.staticUrl + "/images/personal/samsung.jpg";
            return {
                url: h,
                title: n,
                desc: m,
                image: l
            }
        },
        share: function(j, i) {
            i || (i = $el.attr("data-sns"));
            if (!i || !d.types[i]) {
                alert("공유할 SNS타입을 지정해주세요.");
                return
            }
            var h = this._getMetaInfo(j, d.types[i].metaPrefix);
            d._send(i, h)
        },
        init: function() {
            var h = this;
            if (h.inited) {
                return
            }
            h.inited = true;
            e(document).on("click.sns", ".sns_facebook, .sns_twitter, .sns_kakaotalk, .sns_kakaostory", function(j) {
                var i = this.className.match(/sns_([a-z]+)/);
                if (!i || i.length < 1) {
                    return
                }
                j.preventDefault();
                h.share(this, i[1])
            })
        }
    };
    scui.module.Sharer = d;
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return d
        })
    }
}
)(jQuery, window[LIB_NAME]);
