/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 멜론 프레임웍
 */
;(function($, WEBSVC, PBPGN, undefined) {
	var Class = WEBSVC.Class,
		View = PBPGN.View,
		arrUtil = WEBSVC.array;

	WEBSVC.define('PBPGN.Tiles', function() {

		// 피드 타일 클래스---
		var Tiles = Class({
			$extend: View,
			name: 'tiles',
			defaults: {
				itemWidth: 310,
				space: 18,
				scrollLoad: false,
				itemSelector: 'div.wrap_feed_cntt'
			},
			initialize: function(el, options) {
				var me = this;
				if(me.supr(el, options) === false) { return; }

				/* 140609_수정 */
				var imgLen = $(me.options.itemSelector).find('.feed_thumb img').length;

				if ($(me.options.itemSelector).find('.feed_thumb img').length == 0) {
					me.init();
					me._configure();
					me.update();
				}else {
					/* 141203_modify */
					$(me.options.itemSelector).find('.feed_thumb img').load(function() {
						feed.imgAjaxLen++;
						if (imgLen == feed.imgAjaxLen) {
							me.init();
							me._configure();
							me.update();
						};
					})
					/* //141203_modify */
				};
				/* //140609_수정 */
			},
			// 기본작업 140127_수정
			init: function() {
				var me = this,
					timer = null,
					timer2 = null,
					getDocHeight = WEBSVC.util.getDocHeight;
				var listIndex = 1;

				var ajaxDone = false;
				me.$el.bind('ajaxDone',function(){ ajaxDone = true;})

				//더보기 클릭시 레이아웃 재정렬 140127_추가
				$('#conts > button.more').bind('click.tiles',function(){
					//nextId = $("#scrollArtists").find('div>ul>li').last().attr('data-nextId');
					var start = me.$el.find(me.options.itemSelector).length;
					clearInterval(timer2);
					timer2 = setInterval(function() {
						if(ajaxDone){
							me.update(start);
							listIndex++;
							ajaxDone = false;
							clearInterval(timer2);
						}
					},100);
				})

				// 스크롤을 내릴때 새로 추가된 노드에 대해서 재배치
				me.options.scrollLoad && $(window).on('scroll.tiles', function() {
					clearTimeout(timer);
					timer = setTimeout(function() {
						var clientHeight = $(this).height(),
							scrollTop = $(this).scrollTop(),
							docHeight =getDocHeight();

						if(docHeight - 100 < clientHeight + scrollTop) {
							me.update(me.$el.find(me.options.itemSelector).length);
						}
					}, 400);
				});
			},
			_configure: function() {
				var me = this,
					opts = me.options;

				me._width = me.$el.width();		// 컨테이너 너비
				me._itemWidth = opts.itemWidth + opts.space;	// 아이템 너비
				me._colCount = Math.ceil(me._width / me._itemWidth);	// 열 갯수

				me._colsHeight = [];
				for(var i = 0; i < me._colCount; i++){ me._colsHeight[i] = 0; }
			},
			// 렬 중에서 가장 짧은 렬 반환
			_getMinCol: function(){
				var heights = this._colsHeight, col = 0;
				for(var i = 0, len = heights.length; i < len; i++) {
					if(heights[i] < heights[col]){ col = i; }
				}
				return col;
			},

			// 렬 중에서 가장 긴 렬 반환
			_getMaxCol: function(){
				var heights = this._colsHeight, col = 0;
				for(var i = 0, len = heights.length; i < len; i++) {
					if(heights[i] > heights[col]){ col = i; }
				}
				return col;
			},

			update: function(start) {
				start = start || 0;

				var me = this,
					space = me.options.space,
					boxes = me.$el.find(me.options.itemSelector).filter(function(i){ return i >= start; });

				me.$el.css('visibility', 'hidden').show();

				boxes.each(function(i){
					var $this = $(this),
						thisWidth = $this.width(),
						thisHeight = $this.height(),
						isBigItem = thisWidth > me._itemWidth,
						col, top;

					col = me._getMinCol(); // 젤 짧은 렬 검색
					top = me._colsHeight[col];

					// 두칸짜리이고 전체너비를 초과하는 경우에, 다음 행에 표시
					if(isBigItem){
						if(col === me._colCount - 1){
							col = 0;
						}

						if(me._colsHeight.length > col){
							top = Math.max(me._colsHeight[col], me._colsHeight[col + 1]);
							me._colsHeight[col + 1] = top + thisHeight + space;
						}
					}
					me._colsHeight[col] = top + thisHeight + space;

					// 배치
					$this.css({'top': top, 'left': col * me._itemWidth});
				});

				col = me._getMaxCol(me._colsHeight);
				me.$el.css({'height': me._colsHeight[col] - space, 'visibility': ''});
				boxes.fadeIn();
			}
		});

		WEBSVC.bindjQuery(Tiles, 'tiles');
		return Tiles;
	});


})(jQuery, MELON.WEBSVC, MELON.PBPGN);

// START : 131125_추가, 131125_수정
$(function(){
	var WEBSVC = MELON.WEBSVC;

	if(isMelonLogin()) {
		$("button#btn_feed_setting").show();
	}

	/* ********************************************************************************
	* 상단 아티스트더보기 리스트 피드:팬더보기 / 투데이 ( '▶' : 클릭 시),
	* @author	한병기
	* @param	data-artist-menuId	: 화면 ID
	* 			sender_ids			: , 형태
	* 			sender_names		: , 형태 삭제-140818
	* 			sender_img_urls		: , 형태 삭제-140818
	* @since	2013.11.27	기능수정
	* @since	2014.08.19	더보기 기능 수정
	******************************************************************************** */
	var xhr = null;
	$(document).on('beforeshow.dropdown', 'div.wrap_feed div.d_fan', function(e) {
		var	$dlg = $(this)
		,	$btn = $dlg.data('opener')
		,	menuId = $btn.attr('data-artist-menuId')
		,	senderIds = $btn.attr('sender-ids')
		,	artistIds = $btn.attr('data-artistIds-no')
		,	popupType = $btn.attr('data-layer-type');

		if(popupType == "popupsmall") return;

		// 처음 한번만 로드함

		if($dlg.data('isLoaded') === true){ return; }
		$dlg.data('isLoaded', true);

		if (!menuId) {
			alert('버튼에 data-artist-menuId 속성을 넣어주세요.');
			e.preventDefault();
			return;
		}

		if (!senderIds && !artistIds) {
			alert('버튼에 \n[피드]일 경우 : sender_ids  속성을 \n[오늘의 업데이트]일 경우 : data-artistIds-no 속성을 넣어주세요.');
			e.preventDefault();
			return;
		}

		$dlg.find('div.list_atist_small').css({
			textAlign: 'center',
			lineHeight: '352px'
		}).html('조회 중입니다.');

		xhr && xhr.abort();
		if(!artistIds) {
			xhr = $.ajax({
				url: '/feed/loadArtistListLayer.htm'
					,	data: {menuId: menuId, senderIds : senderIds}
			}).done(function(html) {
				$dlg.find('div.list_atist_small').css({
					textAlign: '',
					lineHeight: ''
				}).html(html);
			});
		} else {
			xhr = $.ajax({
				url: '/artistplus/listArtistFanLikeLayer.htm'
					,	data: {menuId: menuId, artistids : artistIds}
			}).done(function(html) {
				$dlg.find('div.l_cntt').css({
					textAlign: '',
					lineHeight: ''
				}).html(html);
			});
		}
	});

	/* ********************************************************************************
	* 피드별 아티스트의 피드받지 않기-140819
	* @author	한병기
	* @param	data-sernderIds	:	해당 피드의 아티스트- ,형태
	* @since
	******************************************************************************** */
	$(document).on('beforeshow.dropdown', 'div.wrap_feed div.d_news', function(e) {
		var $dlg = $(this)
		,	$btn = $dlg.data('opener')
		,	senderIds = $btn.attr('data-sernderIds');

		// 처음 한번만 로드함
		if($dlg.data('isLoaded') === true){ return; }
		$dlg.data('isLoaded', true);

		$dlg.find('div.list_atist_small').css({
			textAlign: 'center',
			lineHeight: '352px'
		}).html('조회 중입니다.');

		xhr && xhr.abort();
		xhr = $.ajax({
			url: '/feed/informArtistCheckNewsBlock.htm'
			,data : {senderIds : senderIds}
		}).done(function(html) {
			$dlg.find('div.list_atist_small').css({
				textAlign: '',
				lineHeight: ''
			}).html(html);
		});
	});
	/* //140813_add */

	/* ********************************************************************************
	* 상단 아티스트별 피드 설정
	* @author	한병기
	* @since	2013.11.27	기능수정
	******************************************************************************** */
	$(document).on('modalshown.newsfeed', 'div#d_feed_setting', function(e) {
		var orderType = "BLOCK_ARTIST";
		var nextId = "";

		//var orderType = "UPDT_DATE";
		var $dlg = $(this),
			$btn = $dlg.data('opener');

		$dlg.find('div.list_estbl_atist').css({
			textAlign: 'center',
			lineHeight: '352px'
		}).html('조회 중입니다.');

		xhr && xhr.abort();
		xhr = $.ajax({
			url: '/feed/feedArtistList.htm'	// 131128_수정
			,data :{nextId : nextId, orderType: orderType}
		}).done(function(html) {
			$dlg.find('div.list_estbl_atist').css({
				textAlign: '',
				lineHeight: ''
			}).html(html);

			//피드 안받기 한 아티스트가 없을 경우
			var ctn = $("#scrollArtists").find('div>ul>li').length;
			if(ctn == 0) {
				$("#scrollArtists").height(227);
				$("#scrollArtists").addClass("no_result");
				$("#btnArtistMore").hide();
			} else {
				$("#scrollArtists").removeClass("mt10");
				$("#scrollArtists").removeClass("no_result");
				$("#btnArtistMore").show();
			}

			nextId = $("#scrollArtists").find('div>ul>li').last().attr('data-nextId');
			if(nextId == "" || typeof nextId == "undefined") {
				$("#btnArtistMore").addClass('disabled').attr('disabled','disabled');
			} else {
				$("#btnArtistMore").removeClass('disabled').removeAttr('disabled');
			}

			//140402_추가
			/*
			$dlg.find('.more').click(function () {
				nextId = $("#scrollArtists").find('div>ul>li').last().attr('data-nextId');
				if(nextId == "") {
					WEBSVC.alert2('더보기 할 아티스트가 없습니다.',{opener :$dlg, removeOnClose:true, overlayNotClose:true})
					return;
				}
				$dlg.find('div.list_estbl_atist ul').append(html.replace(/<(\/?)ul>/gi,""));
				$dlg.find('div.list_estbl_atist').scrollTop(0);
			});
			*/

			// 141028 - 이중 이벤트 바인딩에 대한 언바인드 처리 추가.
			$dlg.find('div.list_estbl_atist').unbind('click');
			$dlg.find('div.list_estbl_atist').on('click','.btn_feednone2',function() {
				/* 140625_추가 */
				var artistNo = $(this).attr('data-artistnews-no');
				var $btn = $(this);

				$.post('/feed/newsBlockSender.json', {sendrKey:artistNo, type:"on"}, function(data) {
					if(data.errorCode == "member") {
						WEBSVC.alert2('예상치 못한 이유로 작업이 중간되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true})
					} else {
						if(data.rtnMap.BLOCKYN == "N") {
							$(".d_artist_news a[data-artistnews-no='"+artistNo+"']").removeClass('on');
							$("*[data-artistnews-no='"+artistNo+"']").removeClass('on').attr('title', '피드 안받기');
							$btn.addClass('disabled').attr('disabled','disabled');

							// 141028 - 이름순 정렬이기 때문에 피드 받기 처리가 되면 아래의 처리를 별도로 해준다.
							var nextIdStr = $("#scrollArtists").find('div>ul>li').last().attr('data-nextId');
							try{
								var nextId = Number(nextIdStr);
								if(nextId != 0){
									$("#scrollArtists").find('div>ul>li').last().attr('data-nextid', nextId-1);
								}else{
									$("#scrollArtists").find('div>ul>li').last().attr('data-nextid', '');
								}
							}catch(e){

							}


						}
					}
				});
			});
		});
	});

	/* ********************************************************************************
	* 아티스트별피드 설정 더보기 버튼
	******************************************************************************** */
	$(document).on("click", "#btnArtistMore", function() {
		$btn = $(this);
		var nextId = $("#scrollArtists").find('div>ul>li').last().attr('data-nextId');

		if(nextId == "" || typeof nextId == "undefined" ) {
			WEBSVC.alert2('더보기 할 아티스트가 없습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true})
			return;
		}
		$.ajax({
			url: '/feed/feedArtistList.htm'
			,data : {nextId : nextId , orderType : "BLOCK_ARTIST" }
		}).done(function(html) {
			$("#scrollArtists").find('div>ul').append(html.replace(/<(\/?)ul>/gi,""));
			//$btn.find('div.list_estbl_atist ul').append(html.replace(/<(\/?)ul>/gi,""));
			//$btn.find('div.list_estbl_atist').scrollTop(0);
		});
	});

	$(document).mouseHover('.wrap_feed_cntt');
});
// END : 131125_추가, 131125_수정
