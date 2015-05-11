/*!
 * @author 김승일
 * @email comahead@gmail.com
 * @description 네이버 지도 헬퍼
 */
(function($, core, undefined) {
    "use strict";
    if(typeof nhn === 'undefined') {
        throw new Error('네이버 지도API를 포함시켜 주세요.');
    }

    /*
     point : Coord // 지도 중심점의 좌표
     zoom : Number // 지도의 축척 레벨
     boundary : Array // 지도 생성 시 주어진 array 에 있는 점이 모두 보일 수 있도록 지도를 초기화한다.
     boundaryOffset : Number // boundary로 지도를 초기화 할 때 지도 전체에서 제외되는 영역의 크기.
     enableWheelZoom : Boolean // 마우스 휠 동작으로 지도를 확대/축소할지 여부
     enableDragPan : Boolean // 마우스로 끌어서 지도를 이동할지 여부
     enableDblClickZoom : Boolean // 더블클릭으로 지도를 확대할지 여부
     mapMode : Number // 지도 모드(0 : 일반 지도, 1 : 겹침 지도, 2 : 위성 지도)
     activateTrafficMap : Boolean // 실시간 교통 활성화 여부
     activateBicycleMap : Boolean // 자전거 지도 활성화 여부
     minMaxLevel : Array // 지도의 최소/최대 축척 레벨
     size : Size // 지도의 크기
     detectCoveredMarker : Boolean // 겹쳐 있는 마커를 클릭했을 때 겹친 마커 목록 표시 여부
     */

    var _map = nhn.api.map;

    /**
     * @class
     * @name axl.ui.NaverMap
     * @extends axl.ui.View
     */
    var NaverMap = core.ui('NaverMap', /** @lends axl.ui.NaverMap */{
        defaults: {
            icon: { // 지점아이콘
                src: 'http://static.naver.com/maps2/icons/pin_spot2.png',
                size: [28, 37],
                offset: [14, 37]
            },
            map: { // naver map api 옵션
                defaultPoint: [37.5675451, 126.9773356],    // 기본 위치
                zoom : 12,                                  // 초기 줌
                enableWheelZoom : true,                     // 마우스 휠 지원 여부
                enableDragPan : true,                       // 드래그 지원 여부
                enableDblClickZoom : false,                 // 더블클릭시 확대 기능 지원 여부
                mapMode : 0,                                // 0: 지도 1: 위성사진
                minMaxLevel : [ 1, 14 ]                     // 최소/최대 줌
            },
            infoWindow: { // 지점 정보레이어 마크업
                show: true,
                tmpl: '<div id="info<$-storeId$>" class="d-map-info" style="border:1px solid black;width:100px;height:20px;background:#fff;cursor:default;">'+
                '<$=storeId$>: <a href="aa.html?id=<$=storeId$>" target="_blank"><$=title$></a> <a href="#" class="d-close">X</a>'+
                '</div>',
                position: {right : 5, top : 20} // 상대위치
            },
            showZoomControl: true, // 줌컨트롤 표시 여부
            zoomControlPos: {	// 줌컨트롤의 위치
                top: 10,
                left: 10
            }
        },
        /**
         * 생성자
         * @param {Element|jQuery|String} 엘리먼트
         * @param {Object} options 옵션
         */
        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false) { return; }

            me.list = [];

            me._createMap();
            me._bindMapEvents();

        },

        /**
         * 네이버지도 생성
         */
        _createMap: function() {
            var me = this,
                opts = me.options;

            _map.setDefaultPoint('LatLng');
            // 지도 생성
            me.map = new _map.Map(me.$el[0], $.extend({
                    size: new _map.Size(me.$el.width(), me.$el.height())
                },
                opts.map
            ));

            // 지점아이콘 생성
            me.icon =  new _map.Icon(opts.icon.src,
                new _map.Size(opts.icon.size[0], opts.icon.size[1]),
                new _map.Size(opts.icon.offset[0], opts.icon.offset[1]));

            // 라벨 생성
            me.label = new _map.MarkerLabel(); // - 마커 라벨 선언.
            me.map.addOverlay(me.label); // - 마커 라벨 지도에 추가. 기본은 라벨이 보이지 않는 상태로 추가됨.

            // 정보 레이어 생성
            if(opts.infoWindow.show) {
                me.infoWindow = new _map.InfoWindow();
                me.map.addOverlay(me.infoWindow);
                me.infoTmpl = core.template(opts.infoWindow.tmpl);
            }

            // 줌컨트롤 생성
            if(opts.showZoomControl) {
                var oSlider = new _map.ZoomControl();
                me.map.addControl(oSlider);
                oSlider.setPosition(opts.zoomControlPos);
            }

        },

        /**
         * 이벤트 바인딩
         */
        _bindMapEvents: function() {
            var me = this,
                opts = me.options;

            me.map.attach('mouseenter', function(oCustomEvent) {
                var oTarget = oCustomEvent.target;
                // 마커위에 마우스 올라간거면
                if (oTarget instanceof _map.Marker) {
                    var oMarker = oTarget;
                    ////me.infoWindow.setVisible(false);
                    me.label.setVisible(true, oMarker); // - 특정 마커를 지정하여 해당 마커의 title을 보여준다.

                    if(core.browser.isTouch){
                        me.map.setCenter(oMarker.getPoint(), {useEffect: true});
                    }
                }
            });

            me.map.attach('mouseleave', function(oCustomEvent) {
                var oTarget = oCustomEvent.target;
                // 마커위에서 마우스 나간거면
                if (oTarget instanceof _map.Marker) {
                    me.label.setVisible(false);
                }
            });

            if(opts.infoWindow.show) {
                me.infoWindow.attach('changeVisible', function(oCustomEvent) {
                    if (oCustomEvent.visible) {
                        me.label.setVisible(false);
                    }
                });

                me.$el.on('click', '.d-map-info .d-close', function(e) {
                    e.preventDefault();
                    me.infoWindow.setVisible(false);
                });
            }

            me.map.attach('click', function(oCustomEvent) {
                var oPoint = oCustomEvent.point;
                // 클릭했을 때 중심점 이동
                me.map.setCenter(oPoint, {useEffect: true});
                /*
                 var oTarget = oCustomEvent.target;

                 // 마커를 클릭했을 때.
                 if (oTarget instanceof _map.Marker) {
                 // 겹침 마커를 클릭했을 때.
                 //if (oCustomEvent.clickCoveredMarker) {
                 //		return;
                 //}
                 if(opts.infoWindow.show) {
                 if(me.infoWindow.getVisible()) {
                 me.infoWindow.setVisible(false);
                 }

                 var data = me.find({'oMarker': oTarget});
                 if(!data){ return; }
                 if(me.currstoreId === data.storeId) {
                 me.currstoreId = undefined;
                 return;
                 }

                 me.currstoreId = data.storeId;
                 me.infoWindow.setContent(me.infoTmpl(data));
                 me.infoWindow.setPoint(oTarget.getPoint());
                 me.infoWindow.setVisible(true);
                 me.infoWindow.setPosition(me.options.infoWindow.position);
                 me.infoWindow.autoPosition();
                 }

                 me.triggerHandler('clickedmarker', data);
                 } else {
                 if(me.infoWindow.getVisible()) {
                 me.infoWindow.setVisible(false);
                 }
                 }
                 */
            });
        },

        /**
         * 지점정보 검색
         * @param {Object} obj 검색할 지점정보
         */
        find: function(obj) {
            var me = this,
                i = 0,
                code = 'var res = false; for(var i = 0; i < list.length; i++) { if(';
            core.each(obj, function(v, k) {
                if(i++ > 0) { code += ' && '; }
                code += 'obj.'+k+' === list[i].'+k;
            });
            code += '){ res = list[i]; break; }} return res;';

            var fn = new Function('obj', 'list', code);
            return fn(obj, me.list);
        },

        /**
         * 지도사이즈 설정
         * @param {Object} size.height 높이
         * @param {Object} size.width 너비
         */
        setSize: function(size) {
            this.map.setSize(new _map.Size(size.width, size.height));
            this.$el.css({
                maxHeight: size.height,
                height: size.height
            });
        },

        /**
         * 지정한 좌표로 중심을 이동
         * @param {Object} oPoint.x x좌표
         * @param {Object} oPoint.y y좌표
         */
        setCenter: function(oPoint) {
            if(!(oPoint instanceof _map.LatLng)) {
                oPoint = new _map.LatLng(oPoint.x, oPoint.y);
            }
            this.map.setCenter(oPoint, {useEffect: true});
        },

        /**
         * 지정한 지점id에 해당하는 지점을 중심으로 이동
         * @param {string} id 지점 id
         */
        setCenterById: function(id) {
            var item = this.find({storeId: id});
            if(!item) { return; }
            this.setCenter({x:x, y:y});
        },

        /**
         * 기존에 추가된 지점마커들을 제거
         */
        clearOverlay: function() {
            var me = this;
            core.each(me.list, function(v, i) {
                me.map.removeOverlay(me.list[i].oMarker);
                me.list[i].oMarker = null;
            });
            me.list = [];
            //me.map.clearOverlay()
        },

        /**
         * 다중 지점마커 추가
         * @param {Array} list 지점정보 배열
         */
        addMarkers: function(list) {
            core.each(list, function(item) {
                this.addMarker(item);
            }.bind(this));
        },

        /**
         * 지점마커 추가
         * @param {Object} item 지점정보
         */
        addMarker: function(item) {
            if(this.find({x: item.x, y: item.y})) { return; }

            var me = this,
                oPoint = new _map.LatLng(item.x, item.y),
                oMarker = new _map.Marker(me.icon, { title : item.title  });

            item.oMarker = oMarker;
            me.list.push(item);
            oMarker.setPoint(oPoint);
            me.map.addOverlay(oMarker);
            if(me.list.length === 1) {
                me.map.setCenter(oPoint);
            }
        },

        /**
         * 마커들을 리셋
         */
        resetMarkers: function(list) {
            this.clearOverlay();
            this.addMarkers(list);
        },

        release: function() {
            var me = this;

            me.clearOverlay();
            me.supr();
        }

    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return NaverMap;
        });
    }

})(jQuery, window[LIB_NAME]);