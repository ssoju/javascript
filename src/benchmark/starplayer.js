function OpenState() {}
OpenState.CLOSED = 0;
OpenState.OPENING = 1;
OpenState.OPENED = 2;
OpenState.CLOSING = 3;

function PlayState() {}
PlayState.STOPPED = 0;
PlayState.PLAYING = 1;
PlayState.PAUSED = 2;
PlayState.BUFFERING_STARTED = 3;
PlayState.BUFFERING_STOPPED = 4;
PlayState.COMPLETE = 5;

function StarPlayerError() {}
StarPlayerError.OPEN_FAILURE = 1000;
StarPlayerError.INVALID_MEDIA_TYPE = 1001;
StarPlayerError.DISK_FULL = 1002;
StarPlayerError.FILTER_NOT_INSTALLED = 1003;
StarPlayerError.FILTER_NOT_CONNECTED = 1004;
StarPlayerError.FILE_NOT_FOUND = 1005;
StarPlayerError.UNKNOWN = 1006;
StarPlayerError.MULTIPLE_CONNECTIONS = 1007;
StarPlayerError.BLOCKED_UID = 1008;
StarPlayerError.BLOCKED_IP = 1009;
StarPlayerError.BLOCKED_PID = 1010;

function WatermarkAlign() {}
WatermarkAlign.LEFT = 0;
WatermarkAlign.RIGHT = 2;
WatermarkAlign.CENTER = 1;
WatermarkAlign.TOP = 0;
WatermarkAlign.BOTTOM = 2;
WatermarkAlign.RANDOM = 3;

function SubTitle() {}
SubTitle.NONE = 0;
SubTitle.KOR = 1;
SubTitle.ENG = 2;
SubTitle.JAP = 4;
SubTitle.CHI = 8;

function ControllerMode() {}
ControllerMode.DEFAULT = 0;
ControllerMode.EMBEDED = 1;
var isAtLeastIE11 = !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/));
var isIE11 = !!(navigator.userAgent.match(/Trident/) && navigator.userAgent.match(/rv 11/));
var uagent = navigator.userAgent.toLocaleLowerCase();

function isIE() {
    if (uagent.indexOf("trident") != -1) {
        return true
    }
    return navigator.appName == "Microsoft Internet Explorer"
}

function attachIE11Event(g, e, f) {
    var a = /^function\s?([^\s(]*)/;
    var d = /\(\)|\([a-zA-Z1-9,\_\-\s]+\)/;
    var h = f.toString().match(d)[0];
    var c;
    try {
        c = document.createElement("script");
        c.setAttribute("for", g.id)
    } catch (b) {
        c = document.createElement('<script for="' + g.id + '">')
    }
    c.event = e + h;
    c.appendChild(document.createTextNode("player." + e + h + ";"));
    document.body.appendChild(c)
}

function StarPlayer_API(a) {
    var b = false;
    var d = -1;
    var c = -1;
    this.url = function() {
        return a.url
    };
    this.closeBrowser = function() {
        a.close_browser()
    };
    this.open_media = function(e, f) {
        a.open_media(e, f)
    };
    this.close_media = function() {
        a.close()
    };
    this.getDuration = function() {
        return a.duration
    };
    this.getCurrentPosition = function() {
        return a.current_position
    };
    this.setCurrentPosition = function(e) {
        a.current_position = e
    };
    this.getVolume = function() {
        return a.volume
    };
    this.setVolume = function(e) {
        a.volume = e
    };
    this.getMute = function() {
        return a.mute
    };
    this.setMute = function(e) {
        a.mute = e
    };
    this.getFullscreen = function() {
        return a.fullscreen
    };
    this.setFullscreen = function(e) {
        a.fullscreen = e
    };
    this.getRate = function() {
        return a.rate
    };
    this.setRate = function(e) {
        a.rate = e
    };
    this.getRepeat = function() {
        return a.repeat
    };
    this.setRepeat = function(e) {
        a.repeat = e
    };
    this.getRepeatStartTime = function() {
        return a.repeat_start_time
    };
    this.setRepeatStartTime = function(e) {
        a.repeat_start_time = e
    };
    this.getRepeatEndTime = function() {
        return a.repeat_end_time
    };
    this.setRepeatEndTime = function(e) {
        a.repeat_end_time = e
    };
    this.getPlayTime = function() {
        return a.play_time
    };
    this.initPlayTime = function() {
        a.init_play_time()
    };
    this.play = function() {
        a.play()
    };
    this.pause = function() {
        a.pause()
    };
    this.stop = function() {
        a.stop()
    };
    this.addEvent = function(e, f) {
        if (a.attachEvent) {
            a.attachEvent(e, f)
        } else {
            attachIE11Event(a, e, f)
        }
    };
    this.setOpenState = function(e) {
        d = e
    };
    this.getOpenState = function() {
        return d
    };
    this.setPlayState = function(e) {
        c = e
    };
    this.getPlayState = function() {
        return c
    };
    this.getTopmost = function() {
        return a.topmost
    };
    this.setTopmost = function(e) {
        a.topmost = e
    };
    this.getXHR = function() {
        return a.xml_http_request
    };
    this.getVisible = function() {
        return b
    };
    this.setVisible = function(e) {
        if (isIE()) {
            if (e) {
                a.style.position = "relative";
                a.style.left = "0px"
            } else {
                a.style.position = "absolute";
                a.style.left = "-9999999px"
            }
        } else {
            a.style.visibility = e ? "visible" : "hidden"
        }
        b = e
    };
    this.getVideoWidth = function() {
        return a.video_width
    };
    this.getVideoHeight = function() {
        return a.video_height
    };
    this.getBrightness = function() {
        return a.brightness
    };
    this.setBrightness = function(e) {
        a.brightness = e
    };
    this.getContrast = function() {
        return a.contrast
    };
    this.setContrast = function(e) {
        a.contrast = e
    };
    this.getSaturation = function() {
        return a.saturation
    };
    this.setSaturation = function(e) {
        a.saturation = e
    };
    this.getHue = function() {
        return a.hue
    };
    this.setHue = function(e) {
        a.hue = e
    };
    this.setCaption = function(e) {
        a.set_caption(e)
    };
    this.clearCaption = function() {
        a.set_caption(undefined)
    };
    this.callFunction = function(e) {
        return a.call_func(e)
    };
    this.captureFrame = function(e) {
        return a.capture_frame(e)
    };
    this.control_alpha_brain = function(f, e) {
        return a.control_alpha_brain(f, e)
    };
    this.getPID = function() {
        return a.pid
    };
    this.internetCheckConnection = function(e) {
        return a.is_internet_connection(e)
    };
    this.setTimelimit = function(e) {
        a.timelimit = e
    };
    this.getSSN = function() {
        return a.ssn
    };
    this.getMAC = function() {
        return a.mac_address
    };
    this.getTrack = function() {
        return a.track
    };
    this.setTrack = function(e) {
        a.track = e
    };
    this.getProgressRate = function() {
        return a.progress_rate
    };
    this.getStopPosition = function() {
        return a.stop_position
    };
    this.getSubtitle = function() {
        return a.subtitle
    };
    this.setSubtitle = function(e) {
        a.subtitle = e
    };
    this.getMaxBandwidth = function() {
        return a.max_bandwidth
    };
    this.getBandwidth = function() {
        return a.bandwidth
    };
    this.getBitrate = function() {
        return a.bitrate
    };
    this.getAvgFrameRate = function() {
        return a.avg_frame_rate
    };
    this.getTotalBytes = function() {
        return a.total_bytes
    };
    this.getReceivedBytes = function() {
        return a.received_bytes
    };
    this.setLogUrl = function(e) {
        a.custom_log_url = e
    };
    this.setLogExtraData = function(e) {
        a.custom_log_extra = e
    }
}

function installStarPlayer() {
    var a = "<object classid='CLSID:99277D5A-52B3-4B2E-AC38-B0065575FC55' width='0' height='0' codebase='" + STARPLAYER_URL + "#version=" + STARPLAYER_VERSION + "' ></object>";
    document.body.innerHTML += a
}

function StarPlayer(f, d, i) {
    var p = this;
    var c = f.id ? f.id : "__starplayer";
    var h = c + "_controller";
    var m;
    var e = 10;
    var g = false;
    var l = false;
    var b = null;
    var a = window.navigator.platform.toLowerCase() == "win64" && window.navigator.cpuClass.toLowerCase() == "x64";
    if (a) {
        STARPLAYER_URL = STARPLAYER64_URL;
        STARPLAYER_SETUP_URL = STARPLAYER64_SETUP_URL;
        STARPLAYER_VERSION = STARPLAYER64_VERSION
    }
    var n = a != true ? f.controllerUrl : f.controller64Url;

    function k(q) {
        return document.getElementById(q)
    }

    function o() {
        p.onInit = f.onInit;
        p.onOpenStateChange = f.onOpenStateChange;
        p.onPlayStateChange = f.onPlayStateChange;
        p.onKeyDown = f.onKeyDown;
        p.onKeyUp = f.onKeyUp;
        p.onClick = f.onClick;
        p.onMouseDown = f.onMouseDown;
        p.onMouseUp = f.onMouseUp;
        p.onMouseDbclick = f.onMouseDbclcik;
        p.onMouseWheel = f.onMouseWheel;
        p.onFullscreen = f.onFullscreen;
        p.onRateChange = f.onRateChange;
        p.onCustom = f.onCustom;
        p.onSubtitle = f.onSubtitle;
        if (!f.userId) {
            f.userId = "ANONYMOUS"
        } else {
            if (String(f.userId).replace(/ /g, "").length == 0) {
                f.userId = "ANONYMOUS"
            }
        }
        var v = 1;
        if (f.armode != undefined) {
            v = f.armode
        }
        if (f.watermarkTextSize) {
            var y = /.*%$/g;
            if (y.test(f.watermarkTextSize)) {
                f.watermarkTextSize = f.watermarkTextSize.replace(/%$/g, "")
            } else {
                f.watermarkTextSize = -f.watermarkTextSize
            }
        }
        if (typeof d.autoPlay == "undefined") {
            d.autoPlay = true
        }

        function z(K, J) {
            var H = STARPLAYER_VERSION.split(",");
            var G = K.split(J);

            function I(M) {
                var L = parseInt(G[M]);
                var N = parseInt(H[M]);
                if (L > N) {
                    return 1
                } else {
                    if (L == N) {
                        if (M == 3) {
                            return 0
                        } else {
                            return I(M + 1)
                        }
                    } else {
                        return -1
                    }
                }
            }
            return I(0)
        }

        function E() {
            try {
                var G = navigator.plugins.StarPlayer;
                if (!G) {
                    return false
                }
                if (z(G.description.split("/")[1], ".") == -1) {
                    return false
                }
                return true
            } catch (H) {
                return false
            }
        }

        function t() {
            k(f.videoContainer).innerHTML = "<table width='100%' height='100%' style='color:white;font-size:14px'><tr><td align='center' valign='middle'><p>스타플레이어를 구동하려면 <a style='color:#ff0000' href='" + STARPLAYER_SETUP_URL + "'>설치 프로그램을 다운로드</a>한 후 설치하여 주십시오.</p></td></tr></table>";
            setInterval(function() {
                navigator.plugins.refresh();
                if (E()) {
                    location.reload()
                }
            }, 1000)
        }

        function w() {
            try {
                var G = new ActiveXObject("StarPlayer.StarPlayerCtrl");
                if (!G) {
                    return false
                }
                G = null;
                return false
            } catch (H) {
                return false
            }
        }

        function D() {
            k(f.videoContainer).innerHTML = "<table width='100%' height='100%' style='color:white;font-size:14px'><tr><td align='center' valign='middle'><p>스타플레이어를 구동하려면 'StarPlayer' ActiveX 컨트롤을 설치하여 주십시오.</p><p>설치에 문제가 있으면 <a style='color:#ff0000' href='" + STARPLAYER_SETUP_URL + "'>설치 프로그램을 다운로드</a>한 후 설치하여 주십시오.</p></td></tr></table>";
            if (isAtLeastIE11) {
                setInterval(function() {
                    if (w()) {
                        location.reload()
                    }
                }, 1000)
            }
        }

        function s() {
            m = new StarPlayer_API(window.external);
            j()
        }

        function x(G) {
            var J = k(f.videoContainer).style.width;
            J = J != "" ? J : "100%";
            var I = k(f.videoContainer).style.height;
            I = I != "" ? I : "100%";
            var H = "<object style='position:absolute;left:-9999999px;' id='" + c + "' classid='CLSID:99277D5A-52B3-4B2E-AC38-B0065575FC55' width='" + J + "' height='" + I + " codebase='" + STARPLAYER_URL + "#version=" + STARPLAYER_VERSION + "' ><param name='config' value='" + STARPLAYER_CONFIG_URL + "' /><param name='controller' value='" + n + "' /><param name='user_id' value='" + f.userId + "' /><param name='time_limit' value='" + d.previewTime + "' /><param name='auto_play' value='" + d.autoPlay + "' /><param name='video_armode' value='" + v + "' /><param name='cpcode' value='" + f.cpcode + "' /><param name='controller_container_hwnd' value='" + G + "' /><param name='controller_params' value='" + f.controllerParams + "' /><param name='enable_block_messenger' value='" + f.blockMessenger + "' /><param name='enable_block_virtual_machine' value='" + f.blockVirtualMachine + "' /><param name='enable_dual_monitor' value='" + f.dualMonitor + "' /><param name='closed_caption_size' value='" + f.captionSize + "' /><param name='watermark_text' value='" + f.watermarkText + "' /><param name='watermark_text_color' value='" + f.watermarkTextColor + "' /><param name='watermark_text_size' value='" + f.watermarkTextSize + "' /><param name='watermark_horz_align' value='" + f.watermarkHorzAlign + "' /><param name='watermark_vert_align' value='" + f.watermarkVertAlign + "' /><param name='watermark_interval' value='" + f.watermarkInterval + "' /><param name='watermark_show_interval' value='" + f.watermarkShowInterval + "' /><param name='auto_progressive_download' value='" + f.auto_progressive_download + "' /><param name='marker' value='" + d.marker + "' /><param name='controller_mode' value='" + f.controllerMode + "' /><param name='custom_log_url' value='" + d.logUrl + "' /><param name='custom_log_extra' value='" + d.logExtraData + "' /></object>";
            k(f.videoContainer).innerHTML += H;
            if (f.visible != false) {
                k(c).style.position = "relative";
                k(c).style.left = "0px"
            }
            if (isAtLeastIE11) {
                if (k(c).object) {
                    m = new StarPlayer_API(k(c));
                    k(c).init();
                    j();
                    setTimeout(C, 10)
                } else {
                    D()
                }
            } else {
                k(c).onreadystatechange = function() {
                    if (this.object) {
                        m = new StarPlayer_API(k(c));
                        k(c).init();
                        j();
                        setTimeout(C, 10)
                    } else {
                        D()
                    }
                };
                if (k(c).object) {
                    k(c).onreadystatechange()
                }
            }
        }

        function A(G) {
            if (E()) {
                k(f.videoContainer).innerHTML += "<object style='visibility:hidden' id='" + c + "' width='100%' height='100%' type='application/x-starplayer' codebase='" + STARPLAYER_SETUP_URL + "#version=" + STARPLAYER_VERSION + "' ><param name='config' value='" + STARPLAYER_CONFIG_URL + "' /><param name='controller' value='" + n + "' /><param name='user_id' value='" + f.userId + "' /><param name='time_limit' value='" + d.previewTime + "' /><param name='auto_play' value='" + d.autoPlay + "' /><param name='video_armode' value='" + v + "' /><param name='cpcode' value='" + f.cpcode + "' /><param name='controller_container_hwnd' value='" + G + "' /><param name='controller_params' value='" + f.controllerParams + "' /><param name='enable_block_messenger' value='" + f.blockMessenger + "' /><param name='enable_block_virtual_machine' value='" + f.blockVirtualMachine + "' /><param name='enable_dual_monitor' value='" + f.dualMonitor + "' /><param name='closed_caption_size' value='" + f.captionSize + "' /><param name='watermark_text' value='" + f.watermarkText + "' /><param name='watermark_text_color' value='" + f.watermarkTextColor + "' /><param name='watermark_text_size' value='" + f.watermarkTextSize + "' /><param name='watermark_horz_align' value='" + f.watermarkHorzAlign + "' /><param name='watermark_vert_align' value='" + f.watermarkVertAlign + "' /><param name='watermark_interval' value='" + f.watermarkInterval + "' /><param name='watermark_show_interval' value='" + f.watermarkShowInterval + "' /><param name='auto_progressive_download' value='" + f.progressive_download + "' /><param name='marker' value='" + d.marker + "' /><param name='controller_mode' value='" + f.controllerMode + "' /><param name='custom_log_url' value='" + d.logUrl + "' /><param name='custom_log_extra' value='" + d.logExtraData + "' /></object>";
                if (f.visible != false) {
                    k(c).style.visibility = "visible"
                }
                m = new StarPlayer_API(k(c));
                j();
                setTimeout(C, 10)
            } else {
                t()
            }
        }

        function F(G) {
            if (d.blockMessenger && !f.blockMessenger) {
                f.blockMessenger = d.blockMessenger
            }
            if (isIE()) {
                x(G)
            } else {
                A(G)
            }
        }

        function C() {
            if (p.onInit) {
                p.onInit()
            }
            if (d.intro) {
                m.open_media(d.intro, null)
            } else {
                if (d.intro2) {
                    m.open_media(d.intro2, null)
                } else {
                    if (d.url) {
                        m.open_media(d.url, d.cc)
                    }
                }
            }
            g = true
        }

        function B() {
            var I = k(f.controllerContainer).style.width;
            I = I != "" ? I : "100%";
            var H = k(f.controllerContainer).style.height;
            H = H != "" ? H : "100%";
            k(f.controllerContainer).innerHTML = "<object style='position:absolute;left:-9999999px;' id='" + h + "' classid='CLSID:7A63FEE6-E174-4FBC-A064-875DB95594A6' width='" + I + "' height='" + H + "' codebase='" + STARPLAYER_URL + "#version=" + STARPLAYER_VERSION + "' ></object>";
            var G = k(h);
            if (isAtLeastIE11) {
                if (G.object) {
                    G.style.position = "relative";
                    G.style.left = "0px";
                    r()
                } else {
                    D()
                }
            } else {
                G.onreadystatechange = function() {
                    if (this.object) {
                        G.style.position = "relative";
                        G.style.left = "0px";
                        r()
                    } else {
                        D()
                    }
                };
                if (G.object) {
                    G.onreadystatechange()
                }
            }
        }

        function u() {
            if (E()) {
                k(f.controllerContainer).innerHTML = "<object id='" + h + "' type='application/x-starplayer' width='100%' height='100%'><param name='uimode' value='true' /></object>";
                r()
            } else {
                t()
            }
        }

        function q() {
            if (k(f.controllerContainer)) {
                if (isIE()) {
                    B()
                } else {
                    u()
                }
            } else {
                F(0)
            }
        }

        function r() {
            var G = k(h);
            if (G.HWND) {
                F(G.HWND)
            } else {
                var H = setInterval(function() {
                    if (G.HWND) {
                        clearInterval(H);
                        F(G.HWND)
                    }
                }, 1)
            }
        }
        k(f.videoContainer) ? q() : s()
    }
    if (i) {
        if (k(c) && k(h)) {
            return
        }
    }
    o();
    this.bindEvent = function(q, r) {
        var s = "_on_" + q;
        if (!p[s]) {
            p[s] = []
        }
        p[s].push(r)
    };
    this.open_state_change = function(r) {
        if (m.setOpenState) {
            m.setOpenState(r)
        }
        switch (r) {
            case OpenState.CLOSED:
                break;
            case OpenState.OPENING:
                break;
            case OpenState.OPENED:
                if (m.url() == d.url && d.startTime > 0) {
                    m.setCurrentPosition(d.startTime)
                }
                if (d.autoPlay) {
                    m.play()
                }
                break
        }
        if (p.onOpenStateChange) {
            p.onOpenStateChange(r)
        }
        if (p._on_open_state_change) {
            for (var q in p._on_open_state_change) {
                p._on_open_state_change[q](r)
            }
        }
    };
    this.play_state_change = function(r) {
        if (r != PlayState.COMPLETE) {
            if (m.setPlayState) {
                m.setPlayState(r)
            }
        }
        switch (r) {
            case PlayState.STOPPED:
                break;
            case PlayState.PLAYING:
                if (p.completeOutro) {
                    p.completeOutro = false;
                    if (d.intro) {
                        window.setTimeout(function() {
                            m.open_media(d.intro, null)
                        }, 0);
                        return
                    } else {
                        if (d.intro2) {
                            window.setTimeout(function() {
                                m.open_media(d.intro2, null)
                            }, 0);
                            return
                        } else {
                            if (d.url) {
                                window.setTimeout(function() {
                                    m.open_media(d.url, d.cc)
                                }, 0);
                                return
                            }
                        }
                    }
                }
                break;
            case PlayState.PAUSED:
                break;
            case PlayState.BUFFERING_STARTED:
                break;
            case PlayState.BUFFERING_STOPPED:
                break;
            case PlayState.COMPLETE:
                if (p.isIntroMovie()) {
                    if (d.intro2) {
                        window.setTimeout(function() {
                            m.open_media(d.intro2, null)
                        }, 0);
                        return
                    } else {
                        if (d.url) {
                            window.setTimeout(function() {
                                m.open_media(d.url, d.cc)
                            }, 0);
                            return
                        }
                    }
                } else {
                    if (p.isIntro2Movie()) {
                        if (d.url) {
                            window.setTimeout(function() {
                                m.open_media(d.url, d.cc)
                            }, 0);
                            return
                        }
                    } else {
                        if (p.isOutroMovie()) {
                            p.completeOutro = true
                        } else {
                            if (d.outro) {
                                window.setTimeout(function() {
                                    m.open_media(d.outro, null)
                                }, 0);
                                return
                            }
                        }
                    }
                }
                break
        }
        if (p.onPlayStateChange) {
            p.onPlayStateChange(r)
        }
        if (p._on_play_state_change) {
            for (var q in p._on_play_state_change) {
                p._on_play_state_change[q](r)
            }
        }
    };
    this.position_change = function(r) {
        if (p.onPositionChange) {
            p.onPositionChange(r)
        }
        if (p._on_position_change) {
            for (var q in p._on_position_change) {
                p._on_position_change[q](r)
            }
        }
    };
    this.position_change2 = function(q, s) {
        if (p.onPositionChange2) {
            p.onPositionChange2(q, s)
        }
        if (p._on_position_change2) {
            for (var r in p._on_position_change2) {
                p._on_position_change2[r](q, s)
            }
        }
    };
    this.volume_change = function(s, r) {
        if (p.onVolumeChange) {
            p.onVolumeChange(s, r)
        }
        if (p._on_volume_change) {
            for (var q in p._on_volume_change) {
                p._on_volume_change[q](s, r)
            }
        }
    };
    this.rate_change = function(r) {
        if (p.onRateChange) {
            p.onRateChange(r)
        }
        if (p._on_rate_change) {
            for (var q in p._on_rate_change) {
                p._on_rate_change[q](r)
            }
        }
    };
    this.repeat_change = function(r) {
        if (p.onRepeatChange) {
            p.onRepeatChange(r)
        }
        if (p._on_repeat_change) {
            for (var q in p._on_repeat_change) {
                p._on_repeat_change[q](r)
            }
        }
    };
    this.repeat_range_change = function(s, q) {
        if (p.onRepeatRangeChange) {
            p.onRepeatRangeChange(s, q)
        }
        if (p._on_repeat_range_change) {
            for (var r in p._on_repeat_range_change) {
                p._on_repeat_range_change[r](s, q)
            }
        }
    };
    this.update_time = function(r) {
        if (p._on_update_time) {
            for (var q in p._on_update_time) {
                p._on_update_time[q](r)
            }
        }
    };
    this.key_down = function(q) {
        if (p.onKeyDown && (!isIE() || p.getFullscreen())) {
            p.onKeyDown(q)
        }
    };
    this.key_up = function(q) {
        if (p.onKeyUp) {
            p.onKeyUp(q)
        }
    };
    this.mouse_down = function(q, r) {
        if (p.onMouseDown) {
            p.onMouseDown(q, r)
        }
    };
    this.mouse_up = function(q, r) {
        if (p.onMouseUp) {
            p.onMouseUp(q, r)
        }
        if (p.onClick) {
            p.onClick(q, r)
        }
    };
    this.mouse_dbclick = function(q, r) {
        if (p.onMouseDbclick) {
            p.onMouseDbclick(q, r)
        }
    };
    this.mouse_wheel = function(q, s, r) {
        if (p.mouseWheelHandler) {
            p.mouseWheelHandler(q, s, r)
        }
    };
    this.error = function(q) {
        if (q >= 1000) {
            if (p.isIntroMovie()) {
                if (d.intro2) {
                    m.open_media(d.intro2, null)
                } else {
                    if (d.url) {
                        m.open_media(d.url, d.cc)
                    }
                }
                return true
            } else {
                if (p.isIntro2Movie()) {
                    m.open_media(d.url, d.cc);
                    return true
                }
            }
            p.setVisible(true)
        }
        if (p.onError) {
            p.onError(q)
        }
        if (p._on_error) {
            for (var r in p._on_error) {
                p._on_error[r](q)
            }
        }
    };
    this.close = function() {
        if (p.onClose) {
            if (!p.onClose()) {
                m.closeBrowser()
            }
        } else {
            m.closeBrowser()
        }
    };
    this.destroy = function() {
        if (p.onDestroy) {
            p.onDestroy()
        }
        if (p._on_destroy) {
            for (var q in p._on_destroy) {
                p._on_destroy[q]()
            }
        }
    };
    this.marker = function(x, w, r, y, t, u, s, q) {
        if (p.onMarker) {
            p.onMarker(x, w, r, y, t, u, s, q)
        }
        if (p._on_marker) {
            for (var v in p._on_marker) {
                p._on_marker[v](x, w, r, y, t, u, s, q)
            }
        }
    };
    this.custom = function(r, s) {
        if (p.onCustom) {
            p.onCustom(r, s)
        }
        if (p._on_custom) {
            for (var q in p._on_custom) {
                p._on_custom[q](r, s)
            }
        }
    };
    this.subtitle = function(s, r) {
        if (p.onSubtitle) {
            p.onSubtitle(s, r)
        }
        if (p._on_subtitle) {
            for (var q in p._on_subtitle) {
                p._on_subtitle[q](s, r)
            }
        }
    };

    function j() {
        m.addEvent("open_state_change", function(q) {
            p.open_state_change(q)
        });
        m.addEvent("play_state_change", function(q) {
            p.play_state_change(q)
        });
        m.addEvent("position_change", function(q) {
            p.position_change(q)
        });
        m.addEvent("position_change2", function(q, r) {
            p.position_change2(q, r)
        });
        m.addEvent("volume_change", function(r, q) {
            p.volume_change(r, q)
        });
        m.addEvent("rate_change", function(q) {
            p.rate_change(q)
        });
        m.addEvent("repeat_change", function(q) {
            p.repeat_change(q)
        });
        m.addEvent("repeat_range_change", function(r, q) {
            p.repeat_range_change(r, q)
        });
        m.addEvent("update_time", function(q) {
            p.update_time(q)
        });
        m.addEvent("key_down", function(q) {
            p.key_down(q)
        });
        m.addEvent("key_up", function(q) {
            p.key_up(q)
        });
        m.addEvent("mouse_down", function(q, r) {
            p.mouse_down(q, r)
        });
        m.addEvent("mouse_up", function(q, r) {
            p.mouse_up(q, r)
        });
        m.addEvent("mouse_dbclick", function(q, r) {
            p.mouse_dbclick(q, r)
        });
        m.addEvent("mouse_wheel", function(q, s, r) {
            p.mouse_wheel(q, s, r)
        });
        m.addEvent("error", function(q) {
            p.error(q)
        });
        m.addEvent("close", function() {
            p.close()
        });
        m.addEvent("destroy", function() {
            p.destroy()
        });
        m.addEvent("marker", function(x, s, w, r, q, v, u, t) {
            p.marker(x, s, w, r, q, v, u, t)
        });
        m.addEvent("custom", function(q, r) {
            p.custom(q, r)
        });
        m.addEvent("subtitle", function(r, q) {
            p.subtitle(r, q)
        })
    }
    this.closeBrowser = function() {
        m.closeBrowser()
    };
    this.open_media = function(q) {
        d = q;
        if (typeof d.previewTime != "undefined") {
            m.setTimelimit(d.previewTime)
        }
        if (typeof d.autoPlay == "undefined") {
            d.autoPlay = true
        }
        if (g) {
            if (d.intro) {
                m.open_media(d.intro)
            } else {
                if (d.intro2) {
                    m.open_media(d.intro2)
                } else {
                    m.open_media(d.url, d.cc)
                }
            }
        }
        if (typeof d.logUrl != "undefined") {
            m.setLogUrl(d.logUrl)
        }
        if (typeof d.logExtraData != "undefined") {
            m.setLogExtraData(d.logExtraData)
        }
    };
    this.close_media = function() {
        if (m.close_media) {
            m.close_media()
        }
    };
    this.getDuration = function() {
        return m.getDuration()
    };
    this.getCurrentPosition = function() {
        return m.getCurrentPosition()
    };
    this.setCurrentPosition = function(q) {
        if (q > m.getDuration()) {
            q = 0
        }
        m.setCurrentPosition(q)
    };
    this.getVolume = function() {
        return m.getVolume()
    };
    this.setVolume = function(q) {
        if (q > 1) {
            q = 1
        } else {
            if (q < 0) {
                q = 0
            }
        }
        m.setVolume(q)
    };
    this.getMute = function() {
        return m.getMute()
    };
    this.setMute = function(q) {
        m.setMute(q)
    };
    this.getFullscreen = function() {
        return m.getFullscreen()
    };
    this.setFullscreen = function(q) {
        if (p.onFullscreen) {
            if (p.onFullscreen(q)) {
                m.setFullscreen(q)
            }
        } else {
            m.setFullscreen(q)
        }
    };
    this.getRate = function() {
        return m.getRate()
    };
    this.setRate = function(q) {
        if (q > 2) {
            q = 2
        }
        if (q < 0.5) {
            q = 0.5
        }
        m.setRate(q)
    };
    this.getRepeat = function() {
        return m.getRepeat()
    };
    this.setRepeat = function(q) {
        m.setRepeat(q)
    };
    this.getRepeatStartTime = function() {
        return m.getRepeatStartTime()
    };
    this.setRepeatStartTime = function(q) {
        m.setRepeatStartTime(q)
    };
    this.getRepeatEndTime = function() {
        return m.getRepeatEndTime()
    };
    this.setRepeatEndTime = function(q) {
        m.setRepeatEndTime(q)
    };
    this.getPlayTime = function() {
        return m.getPlayTime()
    };
    this.initPlayTime = function() {
        return m.initPlayTime()
    };
    this.play = function() {
        m.play()
    };
    this.pause = function() {
        m.pause()
    };
    this.stop = function() {
        m.stop()
    };
    this.addEventListener2 = function(r, q) {
        if (r == StarPlayer.OpenStateChangeEvent) {
            m.onOpenStateChange = q
        } else {
            if (r == StarPlayer.PlayStateChangeEvent) {
                m.onPlayStateChange = q
            } else {
                if (r == StarPlayer.KeyDownEvent) {
                    m.onKeyDown = q
                } else {
                    if (r == StarPlayer.KeyUpEvent) {
                        m.onKeyUp = q
                    } else {
                        if (r == StarPlayer.MouseDownEvent) {
                            m.onMouseDown = q
                        } else {
                            if (r == StarPlayer.MouseUpEvent) {
                                m.onMouseUp = q
                            } else {
                                if (r == StarPlayer.MouseDbclickEvent) {
                                    m.onMouseDbclick = q
                                } else {
                                    if (r == StarPlayer.MouseWheelEvent) {
                                        m.mouseWheelHandler = q
                                    } else {
                                        if (r == StarPlayer.ClickEvent) {
                                            m.onClick = q
                                        } else {
                                            if (r == StarPlayer.FullscreenEvent) {
                                                m.onFullscreen = q
                                            } else {
                                                if (r == StarPlayer.RateChangeEvent) {
                                                    m.onRateChange = q
                                                } else {
                                                    if (r == StarPlayer.DestroyEvent) {
                                                        m.onDestroy = q
                                                    } else {
                                                        if (r == StarPlayer.MarkerEvent) {
                                                            m.onMarker = q
                                                        } else {
                                                            if (r == StarPlayer.PositionChange) {
                                                                m.onPositionChange = q
                                                            } else {
                                                                if (r == StarPlayer.PositionChange2) {
                                                                    m.onPositionChange2 = q
                                                                } else {
                                                                    if (r == StarPlayer.CustomEvent) {
                                                                        m.onCustom = q
                                                                    } else {
                                                                        if (r == StarPlayer.Subtitle) {
                                                                            m.onSubtitle = q
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    this.getOpenState = function() {
        return m.getOpenState()
    };
    this.getPlayState = function() {
        return m.getPlayState()
    };
    this.backward = function(q) {
        var r = m.getCurrentPosition() - (q ? q : e);
        if (r < 0) {
            r = 0
        }
        m.setCurrentPosition(r)
    };
    this.forward = function(q) {
        var r = m.getCurrentPosition() + (q ? q : e);
        if (r > m.getDuration()) {
            r = m.getDuration()
        }
        m.setCurrentPosition(r)
    };
    this.getStep = function() {
        return e
    };
    this.setStep = function(q) {
        e = q
    };
    this.isIntroMovie = function() {
        return d.url != d.intro && d.url != d.intro2 && m.url() == d.intro
    };
    this.isIntro2Movie = function() {
        return d.url != d.intro && d.url != d.intro2 && m.url() == d.intro2
    };
    this.isOutroMovie = function() {
        return d.url != d.outro && m.url() == d.outro
    };
    this.getTopmost = function() {
        return m.getTopmost()
    };
    this.setTopmost = function(q) {
        m.setTopmost(q)
    };
    this.getXHR = function() {
        return m.getXHR()
    };
    this.setVisible = function(q) {
        m.setVisible(q)
    };
    this.getVideoWidth = function() {
        return m.getVideoWidth()
    };
    this.getVideoHeight = function() {
        return m.getVideoHeight()
    };
    this.getBrightness = function() {
        return m.getBrightness()
    };
    this.setBrightness = function(q) {
        m.setBrightness(q)
    };
    this.getContrast = function() {
        return m.getContrast()
    };
    this.setContrast = function(q) {
        m.setContrast(q)
    };
    this.getSaturation = function() {
        return m.saturation
    };
    this.setSaturation = function(q) {
        m.setSaturation(q)
    };
    this.getHue = function() {
        return m.getHue()
    };
    this.setHue = function(q) {
        m.setHue(q)
    };
    this.getBlockMessenger = function() {
        return d.blockMessenger
    };
    this.setCaption = function(q) {
        m.setCaption(q)
    };
    this.clearCaption = function() {
        m.clearCaption()
    };
    this.callFunction = function(q) {
        return m.callFunction(q)
    };
    this.captureFrame = function(q) {
        return m.captureFrame(q)
    };
    this.getAlphaBrain = function() {
        function q() {
            var s = 1;
            var r = 4;
            var t = 40;
            this.initialize = function() {
                s = 1;
                r = 4;
                t = 40
            };
            this.start = function(u) {
                m.control_alpha_brain("AB_Start", u ? u : [s, r, t].join("/"))
            };
            this.stop = function() {
                m.control_alpha_brain("AB_Stop", "")
            };
            this.func = function(u) {
                s = u;
                m.control_alpha_brain("AB_Function", u.toString())
            };
            this.soundUp = function(u) {
                if (r + u > 20) {
                    return
                }
                r += u;
                m.control_alpha_brain("AB_Sound_up", u.toString())
            };
            this.soundDown = function(u) {
                if (r - u < 0) {
                    return
                }
                r -= u;
                m.control_alpha_brain("AB_Sound_down", u.toString())
            };
            this.volumeUp = function(u) {
                if (t + u > 100) {
                    return
                }
                t += u;
                m.control_alpha_brain("AB_Volume_up", u.toString())
            };
            this.volumeDown = function(u) {
                if (t - u < 0) {
                    return
                }
                t -= u;
                m.control_alpha_brain("AB_Volume_down", u.toString())
            };
            this.volumeMute = function() {
                m.control_alpha_brain("AB_Volume_Mute", "")
            }
        }
        if (!b) {
            b = new q()
        }
        return b
    };
    this.getPID = function() {
        return m.getPID()
    };
    this.getSessionId = function() {
        if (m.sessionid) {
            return m.sessionid()
        } else {
            return ""
        }
    };
    this.internetCheckConnection = function(q) {
        if (m.internetCheckConnection) {
            return m.internetCheckConnection(q)
        }
        return true
    };
    this.getSSN = function() {
        return m.getSSN()
    };
    this.getMAC = function() {
        return m.getMAC()
    };
    this.getTrack = function() {
        return m.getTrack()
    };
    this.setTrack = function(q) {
        m.setTrack(q)
    };
    this.getProgressRate = function() {
        return m.getProgressRate()
    };
    this.getStopPosition = function() {
        return m.getStopPosition()
    };
    this.getSubtitle = function() {
        return m.getSubtitle()
    };
    this.setSubtitle = function(q) {
        m.setSubtitle(q)
    };
    this.getMaxBandwidth = function() {
        return m.getMaxBandwidth()
    };
    this.getBandwidth = function() {
        return m.getBandwidth()
    };
    this.getBitrate = function() {
        return m.getBitrate()
    };
    this.getAvgFrameRate = function() {
        return m.getAvgFrameRate()
    };
    this.getTotalBytes = function() {
        return m.getTotalBytes()
    };
    this.getReceivedBytes = function() {
        return m.getReceivedBytes()
    }
}
StarPlayer.OpenStateChangeEvent = "Event.OpenStateChange";
StarPlayer.PlayStateChangeEvent = "Event.PlayStateChange";
StarPlayer.ClickEvent = "Event.Click";
StarPlayer.KeyDownEvent = "Event.KeyDown";
StarPlayer.KeyUpEvent = "Event.KeyUp";
StarPlayer.MouseDownEvent = "Event.MouseDown";
StarPlayer.MouseUpEvent = "Event.MouseDown";
StarPlayer.MouseDbclickEvent = "Event.MouseDbclick";
StarPlayer.MouseWheelEvent = "Event.MouseWheel";
StarPlayer.FullscreenEvent = "Event.Fullscreen";
StarPlayer.RateChangeEvent = "Event.RateChage";
StarPlayer.DestroyEvent = "Event.Destroy";
StarPlayer.MarkerEvent = "Event.Marker";
StarPlayer.PositionChange = "Event.PositionChange";
StarPlayer.PositionChange2 = "Event.PositionChange2";
StarPlayer.CustomEvent = "Event.Custom";
StarPlayer.Subtitle = "Event.Subtitle";
