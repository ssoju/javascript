/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @date 2012-02-03
 * @description 멜론 프레임웍
 */
!(function($, WEBSVC, PBPGN, undefined) {
	var Class = WEBSVC.Class,
		stringUtil = WEBSVC.string,
		numberUtil = WEBSVC.number,
		$doc = $(document),
		$win = $(window);


})(jQuery, MELON.WEBSVC, MELON.PBPGN);

$(function(){
	"use strict";

	var WEBSVC = MELON.WEBSVC,
		PBPGN = MELON.PBPGN,
		Class = WEBSVC.Class,
		serverTime = MELON.WEBSVC.date.format(new Date(), "yyyy:MM:dd hh:mm:ss");



// 최신앨범 ///////////////////////////////////////////////////////////////////////////////////
	var albumMe = $('#conts>div.new_album');
	var resultHtml;

	/* 140429_수정 */
	WEBSVC.define('PBPGN.NewAlbumSlider', function() {
		/**
		 * 메인 최신 앨범 토글 슬라이더
		 * @class
		 * @name MELON.PBPGN.NewAlbumSlider
		 */
		var NewAlbumSlider = Class({
			name: 'NewAlbumSlider',
			$extend: PBPGN.View,
			$statics: {
				ON_CHANGED: 'togglesliderchanged'
			},
			defaults: {
				selectedIndex: 0,
				selectEvent: 'click'
			},
			selectors: {
				tabs: 'span.wrap_btn>a',
				contents: 'ul.sub_list',
				nowpages: 'span.page_num>strong',
				totalpages: null
			},

			/**
			 * 생성자
			 * @param {jQuery|Element|String} el 대상 엘리먼트
			 * @param {JSON} options
			 */
			initialize: function(el, options) {
				var me = this;
				if(me.supr(el, options) === false) { return; }

				me.nowpage = 0;
				me.maxpage =15;
				me.prevIdx = 0;
				me.$totalpages.html(me.maxpage+1);

				if ( me.maxpage === 0 ) {
					me.$tabs.addClass('disabled');
				} else {
					me.$tabs.eq(0).addClass('disabled');
				}

				me.on(me.options.selectEvent, me.options.selectors.tabs, function(e) {
					e.preventDefault();
					var meThis = $(this),
						btnThis = this,
						tabJump = false;
					if(meThis.hasClass('disabled') || albumMe.find('div.list_wrap > ul >li').is(':animated')) return;
					me.select(me.nowpage,btnThis,tabJump);
				});
			},

			/**
			 * index에 해당하는 컨텐츠 표시
			 * @param {Number} index 인덱스
			 */
			/* 140610_수정 */
			select: function(index,selectOpt,tabJump) {
				var me = this,
					$tabs = me.$tabs,
					$contents = me.$contents;

				/* 140905_modify */
				if($(selectOpt).parent().is('.on')){return false;}
				me.nowpage = index;
				var itemIdx = 0,
					ulCont,
					opValue,
					itemCont,
					ulIdx,
					selectOpt = selectOpt,
					tabJump = tabJump,
					ulWidth = albumMe.find('div.list_wrap').width(),
					itemList = albumMe.find('>div > ul > li'),
					currItemLen,
					pagePlus;
				/* //140905_modify */

				for(var i = 0; i < albumMe.find('div.list_wrap > ul').length; i++) {
					if (albumMe.find('div.list_wrap > ul').eq(i).is(':visible')) {
						ulIdx = i;
					}
				}
				if (albumMe.find('div.list_wrap > ul').is(':animated')) {
					return;
				};
				albumMe.find('div.list_wrap').css('overflow','hidden');
				if (tabJump == false ) {
					if ( me.$tabs.index($(selectOpt)) === 0 && me.nowpage > 0) {
						if(me.nowpage%3 == 1 && me.nowpage !== 1){
							itemList.removeClass('on');
							itemList.eq((me.nowpage-1)/3-1).addClass('on');
							me.nowpage = me.nowpage - 1;
							currItemLen = albumMe.find('div.list_wrap > ul').length;
							if (me.nowpage == 3) {
								pagePlus = me.nowpage-3;
							}else {
								pagePlus = me.nowpage-2;
							};
							for(var i = pagePlus; i<me.nowpage+1 ; i++ ){
								resultHtml.eq(i).appendTo(albumMe.find('div.list_wrap'))
							}
						}else{
							me.nowpage = me.nowpage - 1;
						}
						albumMe.find('div.list_wrap > ul').eq(ulIdx).animate({'left' : ulWidth},1000,'easeOutQuart',function() {
							$(this).css('left',0).hide();
						});
						if (ulIdx == 0) {
							ulIdx = albumMe.find('div.list_wrap > ul').length;
						};
						albumMe.find('div.list_wrap > ul').eq(ulIdx-1).show().css('left',-ulWidth).animate({'left' : 0},1000,'easeOutQuart',function() {
							if(me.nowpage%3 == 0){
								for (var i = 0; i < currItemLen; i++) {
									albumMe.find('div.list_wrap > ul').eq(i).addClass('remove');
								};
								albumMe.find('div.list_wrap > ul.remove').removeClass('remove').remove();
							};
							albumMe.find('div.list_wrap').css('overflow','');
						});
					} else if ( me.$tabs.index($(selectOpt)) === 1 && me.nowpage < me.maxpage) {
						me.nowpage = me.nowpage + 1;
						if(me.nowpage%3 == 1 && me.nowpage !== 1){
							itemList.removeClass('on');
							itemList.eq((me.nowpage-1)/3).addClass('on');
							currItemLen = albumMe.find('div.list_wrap > ul').length;
							for(var i = me.nowpage; i<me.nowpage+3 ; i++ ){
								resultHtml.eq(i).appendTo(albumMe.find('div.list_wrap'))
							}
						}
						albumMe.find('div.list_wrap > ul').eq(ulIdx).animate({'left' : -ulWidth},1000,'easeOutQuart',function() {
							$(this).css('left',0).hide();
						});
						albumMe.find('div.list_wrap > ul').eq(ulIdx+1).show().css('left',ulWidth).animate({'left' : 0},1000,'easeOutQuart',function() {
							if(me.nowpage%3 == 1 && me.nowpage !== 1){
								for (var i = 0; i < currItemLen; i++) {
									albumMe.find('div.list_wrap > ul').eq(i).addClass('remove');
								};
								albumMe.find('div.list_wrap > ul.remove').removeClass('remove').remove();
							};
							albumMe.find('div.list_wrap').css('overflow','');
						});
					}
				}else {
					var ulCateOn = albumMe.find('ul.new_album_cate li.on').index()*3;
					$(selectOpt).parent().addClass('on').siblings().removeClass('on');
					currItemLen = albumMe.find('div.list_wrap > ul').length;
					if (me.nowpage == 0) {
						pagePlus = me.nowpage;
					}else {
						pagePlus = me.nowpage + 1;
					};
					for(var i = pagePlus; i<me.nowpage + 4 ; i++ ){
						resultHtml.eq(i).appendTo(albumMe.find('div.list_wrap'))
					}
					if (ulCateOn < me.nowpage) {
						albumMe.find('div.list_wrap > ul').eq(ulIdx).animate({'left' : -ulWidth},1000,'easeOutQuart',function() {
							$(this).css('left',0).hide();
						});
						albumMe.find('div.list_wrap > ul').eq(currItemLen).show().css('left',ulWidth).animate({'left' : 0},1000,'easeOutQuart',function() {
							for (var i = 0; i < currItemLen; i++) {
								albumMe.find('div.list_wrap > ul').eq(i).addClass('remove');
							};
							albumMe.find('div.list_wrap > ul.remove').removeClass('remove').remove();
							albumMe.find('div.list_wrap').css('overflow','');
						});
					}else {
						albumMe.find('div.list_wrap > ul').eq(ulIdx).animate({'left' : ulWidth},1000,'easeOutQuart',function() {
							$(this).css('left',0).hide();
						});
						albumMe.find('div.list_wrap > ul').eq(currItemLen).show().css('left',-ulWidth).animate({'left' : 0},1000,'easeOutQuart',function() {
							for (var i = 0; i < currItemLen; i++) {
								albumMe.find('div.list_wrap > ul').eq(i).addClass('remove');
							};
							albumMe.find('div.list_wrap > ul.remove').removeClass('remove').remove();
							albumMe.find('div.list_wrap').css('overflow','');
						});
					};
				}
				me._toggleButtons(tabJump);

				me.trigger(NewAlbumSlider.ON_CHANGED, [index]); // 이벤트를 날림.
			},
			events : {
				'click >ul>li>a':function(e){	// 전체/가요/POP/OST/J-POP
					e.preventDefault();
					var me = this,
						item = e.target,
						idx = $(item).parent().index()*3,
						tabJump = true;

					if(albumMe.find('div.list_wrap > ul').is(':animated')) return;

					me.select(idx,item,tabJump);
				}
			},
			/* //140612_수정 */

			/**
			 * 이전/다음 버튼 활성화 토글링
			 * @private
			 */
			_toggleButtons: function(tabJump){
				/* 140624 수정 */
				var me = this;
				if ( me.maxpage === 0 ) {
					me.$tabs.addClass('disabled');
				} else if ( me.nowpage === 0 ) {
					me.$tabs.eq(0).addClass('disabled');
					me.$tabs.eq(1).removeClass('disabled');
				} else if(me.nowpage === me.maxpage){
					me.$tabs.eq(0).removeClass('disabled');
					me.$tabs.eq(1).addClass('disabled');
				} else {
					me.$tabs.removeClass('disabled');
				}
				/* //140624 수정 */

				/* 140612_추가 */
				if (tabJump) {
					if (me.nowpage !== 0) {
						me.nowpage = me.nowpage + 1;
					}
				};
				/* //140612_추가 */
				me.$nowpages.html( me.nowpage+1 );

				// 최신 앨범 다중 아티스트
				WEBELLIPSIS.ellipsis("checkEllipsis","new_album_artist",118);
				WEBELLIPSIS.ellipsis("checkEllipsis","new_album_overlay_artist",118);
			},

			/**
			 * 컨텐츠가 변경됐을 경우, 갱신
			 * @example
			 * $('div.slider').toggleSlider('update');
			 */
			update: function(){
				var me = this;

				me.$contents = me.$el.find(me.options.selectors.contents);
				me.$contents.hide().first().show();

				me.nowpage = 0;
				me.maxpage = me.$contents.size() - 1;
				me.$nowpages[0].innerHTML = me.nowpage + 1;
				me.$totalpages.html(me.maxpage+1);

				me.select(me.nowpage);
			}
		})

		WEBSVC.bindjQuery(NewAlbumSlider, 'newAlbumSlider');
		return NewAlbumSlider;
	});
	/* //140429_수정 */
	//최신앨범 정보 ajax로 한번만 호출후 resultHtml에 데이터 저장
	$.ajax({
		url: '/main/new_album_list.htm',
		data: {}
	}).done(function( html ) {

		var page = 0;
		resultHtml = $(html).find('>ul');
		var viewHtml = {};
		//albumMe.find('div.list_wrap').html(html)

		albumMe.find('>div').newAlbumSlider({
				type:'count-on'
			}).end()	// 리스트박스
			.on('mouseenter focusin mouseleave focusout', 'dd.img', function(e) {
				// 오버레이
				var $a = $(this).find('>.thum');
				/* 140703_수정 */
				switch(e.type) {
				case 'mouseenter':
				case 'focusin':
					if ($a.next().is(':animated')) {
						return false;
					};

					$a.next().fadeIn('fast');
					$(this).parent().find('dd.singer').hide();
					break;
				case 'mouseleave':
				case 'focusout':
					albumMe.find('.l_popup').hideLayer();
					$a.next().hide();
					$(this).parent().find('dd.singer').show();
					break;
				}
				/* //140703_수정 */
		});
		/* 140701_추가 */
		var marqeeInterval;
		albumMe.find('>div').on('mouseenter focusin mouseleave focusout', 'span.album_cont', function(e) {/*141008_modify*/
			var albumName = $(this),
				albumTitCont = albumName.find('.title_wrap'),
				albumTit = albumName.find('.title'),
				albumNameClone,
				beforeWidth = albumName.width(),
				afterWidth,
				marqeeDiv = 40;

			albumTit.removeClass('title_ellipsis');
			afterWidth = albumTit.width();
			albumNameClone = albumTit.clone();

			switch(e.type) {
			case 'mouseenter':
			case 'focusin':
				if (albumTitCont.is(':animated')) {
					return;
				};
				if (beforeWidth < afterWidth) {
					albumTitCont.css({
						'width'  : 10000,
						'text-align' : 'left'
					});
					if (albumTit.length < 2) {
						albumTitCont.append(albumNameClone);
					};
					albumTit.css('padding-right',marqeeDiv);
					marqeeInterval = setInterval(function() {
						if (albumTitCont.is(':animated')) {
							return;
						};
						albumTitCont.stop().animate({
							'margin-left' : -(afterWidth+marqeeDiv)
						},(afterWidth+marqeeDiv)*20,'linear',function() {
							$(this).css('margin-left',0);
						});
					},100);
				};

				break;
			case 'mouseleave':
			case 'focusout':
				if (beforeWidth < afterWidth) {
					albumTitCont.stop().css({
						'width'  : 'auto',
						'text-align' : 'center',
						'margin-left' : 0
					});
					albumTit.eq(1).remove();
					albumTit.css('padding-right',0);
				};
				clearInterval(marqeeInterval);
				albumTit.addClass('title_ellipsis');
				break;
			}
		});
		/* //140701_추가 */
	});

	/////////////////////////////////////////////////////////////////////////////////////////////////////

	// 이벤트 //////////////////////////////////////////////////////////////////////////////////////////
	/* 140701_수정 */
	var eventUrl = '/main/event_list_logout.htm';
	if(isMelonLogin()){
		if (getProdName() != ""){
			eventUrl = "/main/event_list_paid.htm";
		} else {
			eventUrl = "/main/event_list_free.htm";
		}
	}
	$.ajax({
		url: eventUrl,
		data: {}
	}).done(function( html ) {
		var eventCont = document.createElement('div');
		eventCont.innerHTML = html;
		$('.event').append($(eventCont).find('#eventList').html());
		$('.event .event_default').hide();
		$('.event').rollingBanner({
			interval: 4000,
	        duration: 1000,
			container: '.event_list',
			containerArea:'width',
	        containerAreaN :236,
			item: '> .event_list > a',
			position: 'left',
			posRange: 236,
			fadeUse: false,
			easingOpt: 'easeOutQuart',
			autoPlay: 'true',
			random: false
		});
		/* //140701_수정 */
		//////////////////////////////////////////////////////////////////////////////////////////////////////

		// 프로모션 ///////////////////////////////////////////////////////////////////////////////////////////
		/* 140701_수정 */
		$('.promotion_wrap').append($(eventCont).find('#promotionList').html());
		$('.promotion_wrap .promotion_default').hide();
		$('.promotion_wrap').rollingBanner({
			interval: 4000,
	        duration: 1000,
			container: 'ul',
			containerArea:'width',
	        containerAreaN :280,
			item: 'ul li',
			position: 'left',
			posRange: 0,
			fadeUse: true,
			easingOpt: 'swing',
			autoPlay: 'false',
			random: false
		});

		// 메인 띠 배너 ///////////////////////////////////////////////////////////////////////////////////////////
		var tieBaner = $(eventCont).find('#tieBaner').html();
		if('' != tieBaner && tieBaner.indexOf("wrap_main_banner") > -1){
			$('.id_wrap').after(tieBaner);
		}

	});
	/* //140701_수정 */

	//////////////////////////////////////////////////////////////////////////////////////////////////////

	// 멜론차트: 무조건 새로 가져온다 ///////////////////////////////////////////////////////////////
	$('#conts>div.chart').on('click', '.d_link', function(e){
		e.preventDefault();

		var $btn = $(this),
			link = $btn.is('a') ? $btn.attr('href') : $btn.attr('data-href');	// a: href, button:data-href

		/* 140917_del
		$.ajax({
			url: link, // //'main_layout_n_chart_ajax.html',
			data: {}
		}).done(function( html ) {
			$btn.closest('li').activeRow('on').find('div.list_wrap').html( html );
		});
		*/

		/* 140917_add */
		$btn.closest('li').activeRow('on');
		if ($btn.hasClass('artist')) {
			var artistIds = $('div.chart div.typeArtist li.rank_item div.rank_info').map(function() { return $(this).attr('data-arist-no'); }).get();
			var artistNames = $('div.chart div.typeArtist li.rank_item div.rank_info').map(function() { return $(this).attr('data-arist-name'); }).get();

			$.ajax({
				url: '/main/artist_fan_list.htm',
				data: {'artistIds' : artistIds.join(), 'artistNames' : artistNames.join()}
			}).done(function( html ) {
				var fanItem = $btn.closest('li').find('.d_artist_list > li');
				for (var i = 0; i < fanItem.length; i++) {
					fanItem.eq(i).find('.rank_cntt').append($(html).children().eq(i));
				};
			});
		} else if($btn.hasClass('pop')){
			WEBELLIPSIS.ellipsis("checkEllipsisPopRecmd","pop_recmd_artist",55);
			WEBELLIPSIS.ellipsis("checkEllipsisPopChart","pop_chart_artist",131);
		} else {
			WEBELLIPSIS.ellipsis("checkEllipsisRealtimeRecmd","realtime_recmd_artist",55);
			WEBELLIPSIS.ellipsis("checkEllipsisRealtimeChart","realtime_chart_artist",131);
		};
		/* //140917_add */
	})
	.on('mouseenter','.list_wrap li.rank_item',function(e){
		$(this).addClass('active').siblings().removeClass('active');
	});//140530_;추가
	/* 140530_삭제
	.on('mouseleave','.list_wrap ul',function(e) {
		$(this).find('li.rank_item').eq(0).addClass('active').siblings().removeClass('active');
	});
	 */
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	//많이 봤어요 ////////////////////////////////////////////////////////////////////////////////////////
	$('#conts>div.hot_issue').toggleSlider({
			type:'count-on',
			random: 'true',//140728_추가
			selectors: {
				contents: 'ul.sub_list',
				nowpages: 'span.page_num>strong',
				totalpages: 'span.page_num>span'
			}
		})
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	// 새로 나왔어요 /////////////////////////////////////////////////////////////
	$('#conts>div.new_conts').on('click', '> div.section_na a', function(e){
		e.preventDefault();

		var $btn = $(this),
			link = $btn.is('a') ? $btn.attr('href') : $btn.attr('data-href');	// a: href, button:data-href

		$.ajax({
			url: link, // //'main_layout_n_chart_ajax.html',
			data: {}
		}).done(function( html ) {
			$btn.closest('div.new_conts').find('div.list_wrap').html( html );
			$btn.closest('li').activeRow('on');
		});
	});
	/////////////////////////////////////////////////////////////////////////////////////////////////////

	//이건 어때요 ////////////////////////////////////////////////////////////////////////////////////////
	$('#conts>div.recm_conts').toggleSlider({
			type:'count-on',
			selectors: {
				contents: 'ul.sub_list',
				nowpages: 'span.page_num>strong',
				totalpages: 'span.page_num>span'
			}
		})
	/////////////////////////////////////////////////////////////////////////////////////////////////////
    WEBSVC.ArtistList.init();  // 팬맺기

	// 최신 앨범 다중 아티스트
	WEBELLIPSIS.ellipsis("checkEllipsis","new_album_artist",118);
	WEBELLIPSIS.ellipsis("checkEllipsis","new_album_overlay_artist",118);

	// 멜론 차트 다중 아티스트

	WEBELLIPSIS.ellipsis("checkEllipsisRealtimeRecmd","realtime_recmd_artist",55);
	WEBELLIPSIS.ellipsis("checkEllipsisRealtimeChart","realtime_chart_artist",131);

    /* 140613_추가 */
    //메인 팝업
    var mainPop;
	var layerBanerUrl = "/main/layer_baner_logout.htm";
	if(isMelonLogin()){
		if (getProdName() != ""){
			layerBanerUrl = "/main/layer_baner_paid.htm";
		} else {
			layerBanerUrl = "/main/layer_baner_free.htm";
		}
	}
	$.ajax({
		url: layerBanerUrl
	}).done(function(html) {
		$(document).on('limitpopup', function() {
			if ($(html).find('div').is('.d_main_pop1')) {
				$(html).find('.d_main_pop1').appendTo('body');// 1단 레이어
			} else if ($(html).find('div').is('.d_main_pop2')) {
				$(html).find('.d_main_pop2').appendTo('body');//2단 레이어
			} else {
				return;
			};
		});
		setTimeout(function() {
			// cookie set
		$("#mainPop").timeLimitSet({ cookieId:'mainPop',selectors:{closebtn:'.input_checkbox', checkbox:''} });
		},1);

		// cookie Get
		PBPGN.TimeLimitPopup.init({
			cookieId:"mainPop"
			,serverTime: new Date()
			,limitType:"day"
		});

		$("#mainPop .btn_base").click(function() {
			$("#mainPop").hide();
		});
	});
	/* //140613_추가 */

	/* 141030_modify mma baner 롤링 및 ajax 생중계 종료 후 삭제 */
	/*
	if ($('div').hasClass('mma_banner')) {
		$.ajax({
			url: 'mmaVoteAjax.htm',
			data: {}
		}).done(function( html ) {
			$('.mma_banner #voteNum').append($(html).find('#voteNum').html());
			$('.mma_banner #artistRank').append($(html).find('#artistRank').html());

			var mmaItem = $('.mma_artist_list .mma_artist'),
				mmaArtistIndex = 0,
				mmaArtistLen = mmaItem.length;
			setInterval(function() {
				var nextIndex = (mmaArtistIndex + 1 <= mmaArtistLen - 1 ? mmaArtistIndex + 1 : 0),
					$curr = mmaItem.eq(mmaArtistIndex),
					$next = mmaItem.eq(nextIndex).css({'display': ''});
				$curr.animate({'opacity':0},{
					duration: 1000,
					step: function(now, fx) {
						$curr.find('p').css('opacity' , now);
						$next.css('opacity' , 1 - now);
						$next.find('p').css({
							'left':330,
							'opacity':0
						});
					},
					complete: function(){
						$curr.hide().css({
							'opacity' : 1
						});
						$next.find('p').animate({
							'left':231,
							'opacity':1
						},500);
					}
				});
				mmaArtistIndex = nextIndex;
			}, 5000);
		});

		if (!$('.mma_banner p').hasClass('d_vote_time')) {return};
		var voteTimeCount = function () {
			var voteTime = new Date(),
				voteEnd = $('.mma_banner .d_vote_time').attr('data-time').split(/[-: ]/),
				voteEndTime = new Date(voteEnd[0], voteEnd[1]-1, voteEnd[2], voteEnd[3], voteEnd[4], voteEnd[5]),
				sec,min,hour,day;
			sec = parseInt(voteEndTime.getTime() - voteTime.getTime()) / 1000;
			day = parseInt(sec/60/60/24);
			sec = (sec - (day * 60 * 60 * 24));
			hour = parseInt(sec/60/60);
			sec = (sec - (hour*60*60));
			min = parseInt(sec/60);
			sec = parseInt(sec-(min*60));

			if(day<10){ day = "0"+day };
			if(hour<10){ hour = "0"+hour };
			if(min<10){ min = "0"+min };
			if(sec<10){ sec = "0"+sec };

			$('.d_vote_time span').eq(0).text(day);
			$('.d_vote_time span').eq(1).text(hour);
			$('.d_vote_time span').eq(2).text(min);
			$('.d_vote_time span').eq(3).text(sec);
		}
		voteTimeCount();
		window.setInterval(function() {
			voteTimeCount();
		},1000);
	};
	*/
	/* //141030_modify */
});
