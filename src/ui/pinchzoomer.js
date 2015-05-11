/*!
 * @author 김부윤, 김승일
 * @email booyoonkim@vi-nyl.com, comahead@vi-nyl.com
 * @description
 */
(function($, core, ui, undefined) {
    "use strict";
    var $win = $(window),
        $doc = $(document);

    /**
     * ...
     * @class
     * @name common.ui.PinchZoomer
     * @extends common.ui.View
     */
    ui('PinchZoomer', /**@lends common.ui.PinchZoomer# */{
        $statics: /**@lends common.ui.PinchZoomer */{

        },

        defaults:{
            step: 4,
            noneClass:"none"
        },

        selectors: {
            content : ".d-content"
        },

        /**
         * 생성자
         * @param {jquery} el target element jquery
         * @param {number} options.step 확대 단계
         * @param {string} options.noneClass display none 처리하는  클래스 네임
         * @param {object} options.selectors dom selector
         */
        initialize: function(el, options) {
            var me = this;
            if( me.supr(el, options) === false ) { return; }

            me.minWidth;
            me.minHeight;
            this.maxWidth = parseInt(this.$content.attr("data-width"), 10);
            this.maxHeight = parseInt(this.$content.attr("data-height"), 10);
            me.currentStep;
            me.currentIndex = 0;

            me._bindResizeEvent();
            me._setPinchEvent();
        },

        /**
         * 콘텐츠 초기화
         */
        initContent: function(index){
            var me = this;
            if(arguments.length > 0) {
                me.currentIndex = index;
            }
            me._setContentSize();
            me._storeStepSizes();
            me.setDefaultSize()
        },

        /**
         * 화면 해상도에 맞추어 콘텐츠 사이즈 정보 저장
         */
        _setContentSize: function(){
            //가로 세로 높이
            var winHeight = $win.height();
            var winWidth = $win.width();
            var $img = this.$content.children().eq(this.currentIndex);
            var imgWidth = 0;
            var imgHeight = 0;

            if($img.data('width')){
                imgWidth = $img.data('width');
                imgHeight = $img.data('height');
            } else {
                $img.data('width', imgWidth = $img[0].width);
                $img.data('height', imgHeight = $img[0].height);
            }

            this.isVert = (imgWidth / imgHeight) < (winWidth / winHeight);
            if(this.isVert){
                this.rate = imgWidth / imgHeight;
                this.minWidth  = winHeight * this.rate;
                this.minHeight = winHeight;
            } else { // 윈도창이 넓을때
                this.rate = imgHeight / imgWidth;
                this.minWidth = winWidth;
                this.minHeight = winWidth * this.rate;
            }

            this.$content.css({
                'left': 0,
                'top': 0,
                'width': this.minWidth,
                'height': this.minHeight
            });
            this.currentStep = 0;
        },

        /**
         * 단계별로 확대 사이즈 정보 저장
         */
        _storeStepSizes: function(){
            this.stepData = [];

            var wid = (this.maxWidth - this.minWidth)/(this.options.step-1);
            var hei = (this.maxHeight - this.minHeight)/(this.options.step-1);
            for( var i=0; i<this.options.step; i++ ){
                var stepWid = 0,
                    stepHei = 0;

                if(this.isVert){
                    stepHei = Math.round(this.minHeight+Math.round(hei*i));
                    stepWid = stepHei * this.rate;
                } else {
                    stepWid = Math.round(this.minWidth+Math.round(wid*i));
                    stepHei = stepWid * this.rate;
                }

                this.stepData[i] = {
                    wid : stepWid,
                    hei : stepHei
                }
            }
        },

        /**
         * 리사이즈 이벤트 바인딩
         */
        _bindResizeEvent:function(){
            var timerID;
            var me = this;
            $(window).on("resize", function(){
                clearTimeout( timerID );
                timerID = setTimeout(function(){
                    me.initContent();
                }, 200 );
            });
        },

        /**
         * 현재 콘텐츠의 확대 단계 반환 함수
         * @return {number} 현재 확대 단계
         */
        _getCurrentStep: function(){
            var currentWid = Math.round(this.$content.width());
            var currentStep;
            for( var len=this.stepData.length, i=len-1; i>=0; i-- ){
                var wid = this.stepData[i].wid;
                if( currentWid <= wid ){
                    currentStep = i;
                }
            }

            return currentStep;
        },

        /**
         * pinch 이벤트 관련 처리
         */
        _setPinchEvent: function(){
            var me = this;
            var stateOn = false;
            var scaleOriginX, scaleOriginY;
            var originX, originY;
            var startWidth;
            var startHeight;
            var startTop;
            var startLeft;
            var $field02 = $(".field02");

            var isDragEnable;
            this.$content.on("touchstart", function(e){
                e.preventDefault();
                startTop = parseInt(me.$content.css("top"), 10);
                startLeft = parseInt(me.$content.css("left"), 10);
                if( e.originalEvent.targetTouches.length == 1 ){
                    isDragEnable = true;
                }else{
                    isDragEnable = false;
                }

                if(e.originalEvent && e.originalEvent.targetTouches && e.originalEvent.targetTouches.length > 1){

                    stateOn = true;
                    startWidth = me.$content.width();
                    startHeight = me.$content.height();

                    var finger01, finger02;
                    finger01 = e.originalEvent.targetTouches[0];
                    finger02 = e.originalEvent.targetTouches[1];
                    scaleOriginX = (finger01.pageX + finger02.pageX)*0.5;
                    scaleOriginY = (finger01.pageY + finger02.pageY)*0.5;
                    var offset01 = me._getOffsetPosition( finger01, me.$content );
                    var offset02 = me._getOffsetPosition( finger02, me.$content );
                    var x = (offset01.x + offset02.x)*0.5;
                    var y = (offset01.y + offset02.y)*0.5;
                    originX = x/me.$content.width();
                    originY = y/me.$content.height();
                }
            });

            this.$content.on("touchend touchcancel", function(e){
                stateOn = false;
            });

            var pinchTimer;
            Hammer( this.$content.get(0) ).on("pinch", function(event){

                if( stateOn ){
                    var s = event.gesture.scale;
                    var wid = startWidth*s;
                    var hei = startHeight*s;


                    var size = me._getContentSize({
                        width: wid,
                        height: hei
                    });

                    var x = scaleOriginX - Math.round(size.width*originX);
                    var y = scaleOriginY - Math.round(size.height*originY);

                    me.$content.css({
                        width: size.width,
                        height: size.height,
                        top : y,
                        left: x
                    });

                    me._setPosition();
                    clearTimeout(pinchTimer);
                    pinchTimer = setTimeout(function(){
                        me.triggerHandler('zoomed', {step: me.currentStep = me._getCurrentStep()});
                    }, 200);

                }
            });

            var c = 0;
            Hammer( this.$content.get(0) ).on("drag", function(event){
                if( event.gesture.touches.length != 1 || !isDragEnable ){return}
                $(".field01").html("move"+(c++)+"  ");
                me.$content.css({
                    top : startTop+event.gesture.deltaY,
                    left: startLeft+(event.gesture.deltaX)
                });
                me._setPosition();
            });
        },

        /**
         * 콘텐츠 기본 사이즈로 설정
         * @param {object} pos 기준점
         */
        setDefaultSize: function(pos){
            pos = pos || {"perX": 0, "perY":0};
            this.setSize(0, pos);
        },

        /**
         * 콘텐츠 원본 사이즈로 설정
         * @param {object} pos 기준점
         */
        setOriginalSize: function( pos ){
            this.setSize(this.options.step-1, pos);
        },

        /**
         * 현재 콘텐츠 사이즈 반환
         * @return {object} 사이즈 정보
         */
        _getContentSize: function( data ){
            if(this.isVert){
                if( data.height < this.minHeight ){
                    data.height = this.minHeight;
                }else if( data.height > this.maxHeight ){
                    data.height = this.maxHeight;
                }
                data.width = data.height * this.rate;
            } else {
                if( data.width < this.minWidth ){
                    data.width = this.minWidth;
                }else if( data.width > this.maxWidth ){
                    data.width = this.maxWidth;
                }
                data.height = data.width * this.rate;
            }

            return data;
        },

        /**
         * 콘텐츠 사이즈 설정
         * @param {number} 사이즈 단계
         * @param {object} 기준점
         */
        setSize: function( step, pos ){
            var me = this,
                data = this.stepData[step];

            this.headerWid = data.wid;
            this.headerHei = data.hei;
            this.currentStep = step;

            var me = this;
            me.pos = me._getLimitPosition();

            if( pos != undefined ){
                var top = Math.min(0, -Math.round(data.hei*pos.perY));
                top = Math.max(top, -data.hei);

                var left = Math.min(0, Math.round((data.wid*pos.perX)*-1));
                left = Math.max(left, -data.wid);

                this.$content.css({
                    "width": data.wid,
                    "height": data.hei,
                    "top": top,
                    "left": left
                });
                me._setPosition();
                me.triggerHandler('zoomed', {step: me.currentStep});
            }else{
                this.$content.stop().animate({"width": data.wid, "height": data.hei}, {
                    duration: 500,
                    //easing: "easeOutQuad",
                    step: function( now, tween ){
                        if( tween.prop == "height" ){
                            me._setPosition()
                        }
                    },
                    complete: function(){
                        me.triggerHandler('zoomed', {step: me.currentStep});
                    }
                });
            }
        },

        /**
         * 콘텐츠 포지션 설정
         */
        _setPosition: function(){
            this.pos = this._getLimitPosition();
            var contHei = this.$content.height(),
                winWHei = $(window).height();
            var top, left;
            var contTop = parseInt(this.$content.css("top"));
            if( contHei < winWHei ){
                //height가 윈도우보다 작을때 top값 중앙 고정
                top = Math.round((winWHei-contHei)*0.5);
                this.$content.css("top", top);
            }else if( contHei >= winWHei && contTop > this.pos.minTop ){
                this.$content.css("top", this.pos.minTop);
            }else if(contTop  < this.pos.limitTop){
                this.$content.css("top",  this.pos.limitTop);
            }

            var contWid = this.$content.width(),
                winWid = $(window).width();
            var contLeft = parseInt(this.$content.css("left"));
            if( contWid < winWid ){
                //width가 윈도우보다 작을때 left값 중앙 고정
                var left = Math.round((winWid-contWid)*0.5);
                this.$content.css("left",left);
            }else if( contLeft > this.pos.minLeft){
                this.$content.css("left",  this.pos.minLeft);
            }else if( contLeft  < this.pos.limitLeft){
                this.$content.css("left",  this.pos.limitLeft);
            }
        },

        /**
         * 콘텐츠 offset 좌표 반환
         * @return {object} 좌표
         */
        _getOffsetPosition: function( touch, $target ){
            return {
                x: touch.pageX - $target.position().left,
                y: touch.pageY- $target.position().top
            }
        },

        /**
         * 콘텐츠 최소, 최대 좌표 정보 반환
         * @return {object} 좌표
         */
        _getLimitPosition: function(){
            var winHei = $(window).height(),
                winWid = $(window).width();
            var contHei = this.$content.height(),
                contWid = this.$content.width();

            var minTop = 0,
                minLeft = 0;

            if( contHei < winHei ){
                minTop = (winHei - contHei)*0.5;
            }

            if( contWid < winWid ){
                minLeft = (winWid - contWid)*0.5;
            }

            return {
                minTop: minTop,
                minLeft: minLeft,
                limitTop:  (contHei-winHei)*-1,
                limitLeft: (contWid-winWid)*-1
            }
        },

        /**
         * 콘텐츠 확대
         */
        zoomIn: function(){
            var step = this.currentStep;
            step = step + 1;
            if( step > this.options.step-1 ){
                step = this.options.step-1;
            }
            this.setSize( step );
        },

        /**
         * 콘텐츠 축소
         */
        zoomOut: function(){
            var step = this.currentStep;
            step = step - 1;
            if( step < 0  ){
                step = 0;
            }
            this.setSize( step );
        },

        isFirstStep: function() {
            return this.currentStep === 0;
        },

        isLastStep: function() {
            return this.currentStep === (this.options.step - 1);
        }
    });


    /**
     * @class
     * @description 페이징 기능이 있는 모바일 이미지 뷰어
     * @name common.ui.MultiPageImageViewer
     */
    ui('MultiPageImageViewer', /**@lends common.ui.MultiPageImageViewer */{
        $statics: /**@lends common.ui.MultiPageImageViewer */{},
        defaults:{
            expandStep: 3,
            noneClass: "none",
            onClass: "on",
            disableClass: "disabled",
            highDepthClass: "high_depth",
            loadingEl: ""
        },

        selectors: {
            plusButton : ".d-plus",
            minusButton : ".d-minus",
            list: ".d-content img",
            content: ".d-content",
            totalPageField: ".d-total-page",
            currentPageField: ".d-current-page",
            nextBtn: ".d-next",
            prevBtn: ".d-prev",
            controlContain: ".d-viewer-ui"
        },

        events: {},


        /**
         * 생성자
         * @param {jquery} el target element jquery
         * @param {number} options.expandStep 확대 단계
         * @param {string} options.onClass 상태 변경 클래스 네임
         * @param {string} options.noneClass display none 처리하는  클래스 네임
         * @param {string} options.disableClass disable 표기 클래스 네임
         * @param {string} options.highDepthClass 뎁스 처리 클래스 네임
         * @param {jquery} options.loadingEl 로딩바 element jquery
         * @param {object} options.selectors dom selector
         */
        initialize: function(el, options) {
            if( this.supr(el, options) === false ) { return; }
            this.$loading =  $('.loading');
            this.pinchZoomer;
            this.currentIndex;
            this.totalPage = this.$list.length;
            this.$totalPageField.html(this.totalPage);
            this.contentAry = [];
            this.isDisable = false;
            this._createPinchZoomer();
            this.setContent(0);
            this._bindNewspaperAdEvent();
        },

        /**
         * ui.PinchZoomer 생성
         * @param {jquery} target content jquery
         */
        _createPinchZoomer: function( $contain ){
            this.pinchZoomer = new ui.PinchZoomer( this.$el, {
                selectors:{
                    content: this.selectors.content
                },

                noneClass:"none",
                step: this.options.expandStep
            });
        },

        /**
         * 콘텐츠 설정
         * @param {number} index 노출할 콘텐츠 index
         */
        setContent: function( index ){
            if( this.currentIndex == index ){return}
            this.currentIndex = index;
            var $target = this.$list.eq(index);
            if( $target.attr("data-loaded") ){
                this._changeContentAct(index);
            }else{
                this._showLoading();
                var src = $target.attr("data-src");
                $target.attr("src", src);
                $target.load(function(){
                    $target.attr("data-loaded", "true");
                    this._hideLoading();
                    this._changeContentAct(index);
                }.bind(this));
            }
        },

        /**
         * 콘텐츠 변경
         * @param {number} index 노출할 콘텐츠 index
         */
        _changeContentAct: function(index){
            this._showContent( index );
            this._setPageButton( index );
            this._setPageData(index);
        },

        /**
         * 콘텐츠 노출 animate 실행
         * @param {number} index 노출할 콘텐츠 index
         */
        _showContent: function(index){
            this.pinchZoomer.initContent(index);
            var $target = this.$list.eq(index);
            this.$list.addClass(this.options.noneClass);
            $target.removeClass(this.options.noneClass).css("opacity", 0);
            $target.stop().animate({opacity: 1}, 500);
        },

        /**
         * 페이지 정보 설정
         * @param {number} index 현재 페이지
         */
        _setPageData: function(index){
            index++;
            this.$currentPageField.html(index);
        },

        /**
         * 페이지 버튼 상태 설정
         * @param {number} index 현재 페이지
         */
        _setPageButton: function( index ){
            if( this.totalPage == 1 ){
                this.$prevBtn.disabled();
                this.$nextBtn.disabled();
                return;
            }

            this.$nextBtn.disabled(false);
            this.$prevBtn.disabled(false);

            if( index == 0 ){
                this.$prevBtn.disabled();
            }else if( index == this.totalPage-1 ){
                this.$nextBtn.disabled();
            }
        },

        /**
         * 로딩바 노출
         */
        _showLoading: function(){
            this.$loading.removeClass(this.options.noneClass);
        },

        /**
         * 로딩바 감춤
         */
        _hideLoading: function(){
            this.$loading.addClass(this.options.noneClass);
        },

        /**
         * 이벤트 바인딩
         */
        _bindNewspaperAdEvent: function(){
            var me = this;

            var hammer = Hammer( this.$el.get(0) );
            // tab이벤트시 툴바 토글
            hammer.on("tap", function(event){
                if( $(event.target).closest(me.selectors.controlContain).length != 0 ){
                    return;
                }

                if( me.$controlContain.hasClass(me.options.noneClass) ){
                    me.$controlContain.removeClass(me.options.noneClass);
                    if(window.isApp){
                        common.app.cmd('hidden_gallery_toolbar', 'hidden=');
                    }
                }else{
                    me.$controlContain.addClass(me.options.noneClass);
                    if(window.isApp){
                        common.app.cmd('hidden_gallery_toolbar', 'hidden=true');
                    }
                }
            });

            hammer.on('swipeleft', function() {
                if(me.pinchZoomer.isFirstStep()){
                    me.$nextBtn.trigger('click');
                }
            });
            hammer.on('swiperight', function(){
                if(me.pinchZoomer.isFirstStep()){
                    me.$prevBtn.trigger('click');
                }
            });

            // 다음버튼
            this.$el.on( "click", ".d-next", function(e){
                e.preventDefault();
                if( me.isDisable || (me.currentIndex+1)>=me.totalPage ){ return }
                me.setContent (  me.currentIndex+1 );
            });

            // 이전버튼
            this.$el.on( "click", this.selectors.prevBtn, function(e){
                e.preventDefault();
                if( me.isDisable || me.currentIndex <= 0){ return }
                me.setContent( me.currentIndex-1 );
            });

            // 확대 버튼
            this.$el.on( "click", this.selectors.plusButton, function(){
                me.pinchZoomer.zoomIn();
            });

            // 축소 버튼
            this.$el.on( "click", this.selectors.minusButton, function(){
                me.pinchZoomer.zoomOut();
            });

            // 두손가락으로 핀치할 경우
            me.pinchZoomer.on('zoomed', function(e, data) {
                me.$plusButton.disabled(me.pinchZoomer.isLastStep());
                me.$minusButton.disabled(me.pinchZoomer.isFirstStep());
            });
        }
    });

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);