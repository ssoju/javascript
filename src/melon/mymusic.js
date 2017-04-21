/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 멜론 프레임웍
 */
(function($, WEBSVC, PBPGN, undefined) {
	"use strict";
	// 메뉴에 해당하는 모듈 구현 부분

	var Class = WEBSVC.Class,
	$win = $(window),
	$doc = $(document);

	/*!
	 * @author 강태진
	 * @email odyseek@vi-nyl.com
	 * @description 커버이미지 설정 관련
	 */
	WEBSVC.define('WEBSVC.MyMusic.CoverImage', function(){
		var CoverImage = Class(/** @lends MELON.PBPGN.CoverImage# */{
			name: 'CoverImage',
			$extend: MELON.PBPGN.View,
			/* 140616_수정 */
            defaults: {
                target       : {},
                width        : 0,
                height       : 0,
                observer     : false,
                startX       : 0,
                startY       : 0,
                prevX        : 0,
                prevY        : 0,
                checkTime    : "",
                uploadResult : [],
                success      : {},
                path         : "",
                imgScroll    : true
            },
            /* //140616_수정 */

			/**
			 * 생성자
			 * @param {jQuery|Element|String} el 대상 엘리먼트
			 * @param {JSON} options
			 */
			initialize: function(el, options) {
				var me = this,
					thisObj=null;
				if(me.supr(el, options) === false) { return; }
				thisObj = me.$el;
				me.width = me.options.width;			// 이미지 width
				me.height = me.options.height;			// 이미지 height
				me.maxHeight = thisObj.height() - me.height;

				thisObj.css({
					"background-image":"url('"+me.options.path+"')",
					"background-position":"0px 0px"
				});

				thisObj.mousedown(function(e) {
					me.getPosition();
					me.prevX = e.screenX;
					me.prevY = e.screenY;
					thisObj.css({"cursor" : "n-resize"});
					/* 140616_수정 */
                    if (me.imgScroll) {
                        me.observer = true;
                    }else {
                        me.observer = false;
                    };
                    /* //140616_수정 */
				});

				thisObj.mousemove(function(e){
					if(!me.observer) return false;
					var x = 0;
					var y = me.startY - ( me.prevY - e.screenY );

					if ( me.maxHeight > y ) {
						y = me.maxHeight;
					} else if ( y > 0 ) {
						y = 0;
					}

					$(this).css({
						"background-position" : (x+"px "+y+"px")
					});
				});

				$("body").mouseup(function(e) {
					thisObj.css({"cursor" : ""});
					me.getPosition();
					me.observer =false;
				});
			},

			/**
			 * index에 해당하는 컨텐츠 표시
			 * @param {Number} index 인덱스
			 */
			getPosition : function() {
				var me = this,
					thisObj=this.$el;
				if ( thisObj.css("background-position") === undefined ) {
					var pos = [];
					pos[0] = thisObj.css("background-position-x");
					pos[1] = thisObj.css("background-position-y");
				} else {
					var pos = thisObj.css("background-position").split(" ");
				}
				me.startX = parseInt(pos[0]);
				me.startY = parseInt(pos[1]);
			},

			disableSelection : function() {
				var me = this,
					thisObj=this.$el;
				// IE
				if ( typeof this.target.onselectstart !== 'undefined' ) {
					this.target.onselectstart = function(){
						return false;
					};
				} else if ( typeof this.target.style.MozUserSelect !== 'undefined' ) {
					this.target.style.MozUserSelect = 'none';
				}
			},

			positionY : function() {
				var me = this,
					thisObj = me.$el;
				if ( thisObj.css("background-position") === undefined ) {
					var pos = [];
					pos[0] = thisObj.css("background-position-x");
					pos[1] = thisObj.css("background-position-y");
				} else {
					var pos = thisObj.css("background-position").split(" ");
				}
				return pos[1];
			},

			update : function(opts) {
				var me = this,
					thisObj=this.$el;

				me.path = opts.path;
				me.height = opts.height;
				me.maxHeight = thisObj.height() - me.height;

				/* 140616_수정 */
				$('<img src="'+ me.path +'" alt="">').prependTo(thisObj).hide();
				thisObj.find('img').load(function() {
                    if (228 > thisObj.find('img').height()) {
                        me.imgScroll = false;
                        me.height = thisObj.find('img').height();
                        me.maxHeight = thisObj.height() - me.height;
                        $('#mypageImgCoverHeight').val(me.height);
                    }else {
                        me.imgScroll = true;
                        if(me.height > thisObj.find('img').height()){
                        	me.height = thisObj.find('img').height();
                        	me.maxHeight = thisObj.height() - me.height;
                        	$('#mypageImgCoverHeight').val(me.height);
                        }
                    };
                    thisObj.find('img').remove();
                });
                /* //140616_수정 */

				thisObj.css({
					"background-image":"url('"+me.path+"')",
					"background-position":"0px 0px"
				});
			}

		});

		WEBSVC.bindjQuery(CoverImage, 'coverImage');  // 이 부분을 실행하면 $(..).tabs()로도 호출이 가능해진다.
		return CoverImage;
	});

	PBPGN.MonthCalendar.prototype.defaults.getTitle = function(type, year, month) {
		switch(type){
		case 'active':
			return month+'월'+this.options.title;
		case 'normal':
			return month+'월 '+this.options.title+' - 페이지 이동';
		case 'before':
		case 'after':
			return '(집계된 데이타가 없습니다.)';
		}
		return '';
	};

	// 선물레이어 뛰우기
	WEBSVC.define('WEBSVC.MyMusic', function() {
		SEND_USER_NAME : ""						//메세지 발송정보
		MEMBERKEY : ""								//메세지 발송정보
		TARGET_USER_MKEY : ""					//메세지 발송정보
		GIFT_NO : ""
		PROD_ID : ""
		PRESENT_GBN : ""
		return {
			checkGift: function(id) {
				var nName = WEBSVC.MyMusic.SEND_USER_NAME;
				var mkey = WEBSVC.MyMusic.MEMBERKEY;
				var tMKeys = WEBSVC.MyMusic.TARGET_USER_MKEY;
				var pNo = WEBSVC.MyMusic.GIFT_NO;
				var pId = WEBSVC.MyMusic.PROD_ID;
				var tGbn = WEBSVC.MyMusic.PRESENT_GBN;
				$.ajax({
					url: '/mymusic/messagepresent/popup/mymusicpresent_receivePopup.htm',
					data: {
						giftNo: pNo
					}
					}).done(function(html){
					var $modal = $(html.replace(/\n|\r/g, "")).appendTo('body');
					$("#nickName").text(nName);
					$modal.modal({
						clone: false,
						removeOnClose: true,
						on: {
							// 모달창 생성시 실행
							created: function(){
								if($modal.data('inited') === true) { return; }
								$modal.data('inited', true);

								var $txt = $modal.find('.gift_answr');
								// 직접 입력 처리
								$modal.find('select').on('change', function(){
									$txt.parent()[this.value === 'input' ? 'show' : 'hide']();
									$modal.modal('center');
								});
								// 입력글자 수 처리
								$txt.textControl({
									counting: true,
									countType: 'char',
									limit: 160,
									limitTarget: '.text_size'
								});
							},
							ok: function(){
								var cont = "";
								// 확인 눌렀을 때 처리
								var chkOpt = $("#gift2 option:selected").val();

								if($("#gift2 option:selected").val()=="input"){
									cont = $('#d_message').val();
								}else{
									cont = $("#gift2 option:selected").text();
								}

								if(cont.length < 1){
									alert("메시지를 입력해 주세요.");
									return false;
								}

								 var checkProhibit = false ;
				   				    if(cont.length > 0){
						                $.ajax({
						                     type : "POST",
						                      url  : "/mymusic/common/mymusiccommon_checkRestrictWord.json" ,
						                     async : false,
						                     data : {inputStr : encodeURIComponent(cont)},
						                     success : function(result){
						                            if(result.result == true){
						                                alert( "작성하신 글 중 "+result.message+ "은 금칙어 입니다. 수정 후 등록해주세요." );
						                                checkProhibit = true;
						                           }
						                     }
						                });

						                if(checkProhibit){
						                      return false;
						                }
					            }

								//alert("메시지를 입력해 주세요.");
								$.get("/mymusic/messagepresent/popup/mymusicpresent_insertReceivePopup.json",{mesgCont : cont,	memberkey : mkey, targetMemberKeys:tMKeys, giftNo : pNo, chkOpt : chkOpt 						// 메제시 전달 대상
									},function(data){

									}).done(function(data){
										if(data.msgChk == -501){
						                    alert( "작성하신 글 중 "+data.message+ "은 금칙어 입니다. 수정 후 등록해주세요." );
						                    return false;
					                    }
										if(data.RESULT == "1"){
											alert("메시지가 친구에게 전달 되었습니다.");
											//location.href="/mymusic/messagepresent/mymusicpresent_list.htm";
											if(tGbn == 0){//선물 일 경우 상세 이동
												location.href="/mymusic/messagepresent/mymusicpresent_receiveDetailTiket.htm?memberkey="+mkey+"&giftNo="+pNo+"&prodId="+pId+"&listType=receiveTab&cancelChk=Y";
											}else{//곡 일 경우 상세 이동
												location.href="/mymusic/messagepresent/mymusicpresent_receiveDetailSongList.htm?memberkey="+mkey+"&giftNo="+pNo+"&listType=receiveTab&cancelChk=Y";
											}
										}else{
											alert("메시지 전달 실패하였습니다.");
											//location.href="/mymusic/messagepresent/mymusicpresent_list.htm";
											if(tGbn == 0){//선물 일 경우 상세 이동
												location.href="/mymusic/messagepresent/mymusicpresent_receiveDetailTiket.htm?memberkey="+mkey+"&giftNo="+pNo+"&prodId="+pId+"&listType=receiveTab&cancelChk=Y";
											}else{//곡 일 경우 상세 이동
												location.href="/mymusic/messagepresent/mymusicpresent_receiveDetailSongList.htm?memberkey="+mkey+"&giftNo="+pNo+"&listType=receiveTab&cancelChk=Y";
											}
										}
									});
							},//ok end
							cancel: function(){
								//location.href="/mymusic/messagepresent/mymusicpresent_list.htm";
								if(tGbn == 0){//선물 일 경우 상세 이동
									location.href="/mymusic/messagepresent/mymusicpresent_receiveDetailTiket.htm?memberkey="+mkey+"&giftNo="+pNo+"&prodId="+pId+"&listType=receiveTab&cancelChk=Y";
								}else{//곡 일 경우 상세 이동
									location.href="/mymusic/messagepresent/mymusicpresent_receiveDetailSongList.htm?memberkey="+mkey+"&giftNo="+pNo+"&listType=receiveTab&cancelChk=Y";
								}
							}
						}
					});

					$('select.d_selectbox').selectbox();

				}); // ajax
			}
		}
	});

	WEBSVC.define('WEBSVC.MyMusic.SendSongMessage', function(){
		var URL_ADDFRIEND_POPUP = 'mymusic/friend/mymusicfriend_listFriend.htm';

		return {
			// 선물메세지 보내기 팝업
			init: function(){

				(function() {
					var $btnEmo = $('#d_btn_emo'),
						$layerEmo = $('#d_layer_emo'),
						$hiddenEmo = $('#d_hidden_emo');

					// 아이콘
					$layerEmo.on('click', 'button', function(e) {
						var $btn = $(this);

						$btnEmo.html($btn.html()).attr('title', $btn.attr('title'))[0].className = this.className;
						$hiddenEmo.val($btn.attr('data-value'));
						$layerEmo.hideLayer();
					});
				}());


				// 메세지 입력창
				$('#d_message').textControl({
					counting: true,
					limit: 80,
					limitTarget: '#d_text_count'
				});

				(function(){
					var $tab = $('#d_music_tab').tabs({type: 'parent-on'}),
						tmplRow = WEBSVC.template($('#d_song_row').html()),
						tabModes = ['recent', 'like', 'search'],
						tabMode = tabModes[$tab.find('>li.on').index() < 0 ? 0 : $tab.find('>li.on').index()],
						$kwd = $('#d_kwd'),
						$activeTable = $tab.find('li.on tbody'),
						$rightTable = $('#d_right_list tbody'),
						isLoading = false, // ajax 로딩 플래그
						lastIds = { // 더보기인 경우 다음목록를 가져올때 기준키
							'recent': 0,
							'like': 0,
							'search': 0
						}; // 검색어


					// 오른쪽에 곡 추가
					function addSong($tr) {
						var val = $tr.find('input:checkbox').val();
						if($rightTable.find('input:checkbox[value=' + val + ']').length > 0) {
							return;
						}

						if($rightTable.find('tr.d_added').length >= 10) {
							alert('최대 10곡까지 추가할 수 있습니다.');
							return false;
						}

						var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added'),
							$cols = $row.find('td');

						$cols.eq(0).find('input:checkbox').prop('checked', false);
						$cols.eq(2).find('div.d_layer').hideLayer().find('span[class^=bullet]').attr('class', 'bullet_vertical');
						$cols.eq(3).remove();
						$cols.eq(4).find('button').attr('title', function(){ return (this.title||'').replace(/추가$/, '삭제'); })
							.replaceClass('add_music', 'delt_music').children().text('삭제');
						$rightTable.append($row).trigger('addedlistchanged', ['added', $row]);
					}

					// 오른쪽에서 곡 삭제
					function removeSong($tr) {
						$tr.remove();
						$rightTable.trigger('addedlistchanged', ['removed'])
					}

					// 곡리스트 조회
					function loadSong(more) {
						if(isLoading) { return; }

						if(tabMode === 'search' && $kwd.trimVal() === '') {
							alert('검색어를 입력해주세요.');
							$kwd.focus();
							return;
						}

						var href = '',
							params = {};

						switch(tabMode){
						case 'recent':
							href=$tab.find('li.list1>a').attr('href');
							break;
						case 'like':
							href=$tab.find('li.list2 div.song_sort a.on').attr('href');
							break;
						case 'search':
							href=$tab.find('li.list3 div.song_sort a.on').attr('href');
							break;
						}

						isLoading = true;
						if(more) {
							params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
						}
						if(tabMode === 'search'){
							params.kwd = $kwd.trimVal();
						}

						$.ajax({
							url: href,
							data: params,
							dataType: 'json'
						}).done(function(json) {
							if(json.result) {
								// 더보기 모드 여부
								if(!more){
									$activeTable.empty();

									if(json.data.length === 0) {
										$activeTable.find('tr.d_no_rows').show();
									} else {
										$activeTable.find('tr.d_no_rows').hide();
									}
								}

								lastIds[tabMode] = json.lastId; // 더보기할 때 필요한 기준키(예: 페이지, 인덱스키 등)
								for(var i = 0, len = json.data.length; i < len; i++) {
									 if(tabMode === 'search'){
										 json.data[i].highlightTitle = (json.data[i].title||'').replace(params.kwd, '<em>' + params.kwd + '</em>');
									 } else {
										 json.data[i].highlightTitle = json.data[i].title;
									 }
									$activeTable.append(tmplRow(json.data[i]));
								}
							}
						}).fail(function(){
							// error
						}).always(function(){
							isLoading = false;
						});
					}

					// 체크된 row 활성화
					$('div.chic_music_cont').on('click', 'tbody input:checkbox', function(e) {
						e.stopPropagation();
						var $this = $(this);
						$this.trigger('changed');
					}).on('changed', 'div.song_list tbody input:checkbox', function(e) {
						var $this = $(this);
						$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('active');
					});

					// 탭을 선택시 활성화된 테이블로 교체
					$tab.on('selected', function(e, index) {
						switch(index){
						case 0: tabMode = 'recent'; break;
						case 1: tabMode = 'like'; break;
						case 2: tabMode = 'search'; break;
						}

						$activeTable = $('#d_music_tab li.on tbody');
						if(index < 2){ // 검색창은 바로 조회되면 안됨
							loadSong();
						}
					});

					$kwd.on('keyup', function(e) {
						if(e.keyCode === 13){
							$('#d_btn_search').triggerHandler('click');
						}
					});

					// 검색버튼
					$('#d_btn_search').on('click', function() {
						$(this).closest('div.song_wrap').find('div.song_sort a.on').click();
					});


					// 친구삭제
					$('ul.frend_list').on('click', 'li>button', function() {
						if($(this).closest('ul').find('li').length === 1) {
							$('p.frend_ynlk.d_nofriend').show();
							$('ul.frend_list').hide();
						}
						$(this).closest('li').remove();
					});

					// 선물하기 팝업
					$('#d_btn_gift').on('click', function(){
						window.open(URL_ADDFRIEND_POPUP, '', 'app_,width=816,height=640, scrollbars=no');
					});

					// row에 있는 +, - 클릭시
					$('div.chic_music_cont').on('click', 'button.add_music:not(.disabled), button.delt_music:not(.disabled)', function(){
						var $this = $(this);
						if($this.hasClass('add_music')) {
							addSong($this.closest('tr'));
						} else {
							removeSong($this.closest('tr'));
						}
					});

					// >, 추가버튼
					$('div.chic_music_cont').on('click', 'button.d_move_right', function() {
						var $items = $activeTable.find('input:checkbox:checked');
						if($items.length === 0) {
							alert('선택된 항목이 없습니다.');
							return;
						}

						$items.each(function(){
							if(addSong($(this).closest('tr')) === false){
								return false;
							}
						});
					});

					// <, 삭제 버튼
					$('div.chic_music_cont').on('click', 'button.d_remove_right', function() {
						var $items = $rightTable.find('input:checkbox:checked');
						if($items.length === 0) {
							alert('선택된 항목이 없습니다.');
							return;
						}
						$items.each(function(){
							removeSong($(this).closest('tr'));
						});
					});

					// 맨위로버튼
					$('div.view_more button.top').on('click', function() {
						$(this).closest('div.song_wrap').find('div.song_list').animate({'scrollTop': 0}, 'fast');
					});

					// 더보기
					$('button.d_get_more').on('click', function() {
						loadSong(true);
					});

					//
					$tab.on('click', 'div.song_sort a', function(e) {
						e.preventDefault();
						if(tabMode === 'search' && $kwd.trimVal() === '') {
							alert('검색어를 입력해주세요.');
							$kwd.focus();
							return;
						}

						$(this).siblings().removeClass('on').end().addClass('on');
						loadSong();
					});

					$rightTable.on('addedlistchanged', function(){
						var count = $rightTable.find('tr.d_added').length;
						$('#d_added_count').html(count);

						if(count > 0) {
							$rightTable.find('tr.d_no_rows').hide();
						} else {
							$rightTable.find('tr.d_no_rows').show();
						}
					});

					loadSong();
				})();
			},

			// 친구찾기 팝업
			initFriend: function() {
				var tabMode = 'friends', // or search
					isLoading = false,
					$addedFriends = $('#d_added_friends tbody'),
					$kwd = $('#d_kwd'),
					$tab = $('#d_tab'),
					tmplRow = WEBSVC.template($('#d_friend_row').html()),
					tmplSearchRow = WEBSVC.template($('#d_search_row').html()),
					lastIds = {
						'friend': 0,
						'search': 0
					};

				function getActiveList() {
					return $('#d_tab li.on tbody');
				};

				// 이미 추가된 항목인지 체크
				function isAddedFriend(friendId) {
					return $addedFriends.find('input:checkbox[value=' + friendId + ']').length > 0;
				}


				// 친구 추가
				function addFriend($oritr) {
					var count = 0;
					if((count = $addedFriends.find('tr.d_added').length) >= 10) {
						alert('최대 10까지 선택하실 수 있습니다.');
						return false;
					}

					var val = $oritr.find('input:checkbox').val(), $tr;
					if(isAddedFriend(val)) { return; }

					var name = $oritr.find('input.d_name').val(),
						$row = $(['<tr class="d_added"><td class="t_center"><div class="wrap"><input type="checkbox" value="'+val+'" title="'+name+' 선택" /></div>',
									'</td><td><div class="wrap">'+$oritr.find('a.user_image').html(),
									'<span class="user_nicnm" title="'+name+'"><a href="member.do?id='+val+'" title="'+name+' - 새창" target="_blank">'+name+'</a></span>',
									'</div></td><td class="t_center"><div class="wrap">',
									'<button type="button" class="delt_music" title="'+name+' - 삭제"><span>삭제</span></button>',
									'</div></td></tr>'].join(''));

					$addedFriends.append($row).trigger('addedlistchanged', ['added', $row]);
				}

				// 친구 삭제
				function removeFriend($tr) {
					$tr.remove();
					$addedFriends.trigger('addedlistchanged', ['removed']);
				}

				// 리스트 조회
				function loadFriend(more) {
					if(isLoading) { return; }

					var params = {},
						href = '';
					if(tabMode === 'search'){
						if($kwd.trimVal() === '') {
							alert('검색어를 입력해주세요.');
							$kwd.focus();
							return;
						}
						href = $tab.find('div.song_sort a.on').attr('href');
						params.kwd = $kwd.trimVal();
					} else {
						href = $tab.find('>li.list1>a').attr('href');
					}
					if(more){
						params.lastId = lastIds[tabMode];
					}

					isLoading = true;
					$.ajax({
						url: href,
						data: params,
						method: 'post',
						dataType: 'json'
					}).done(function(json) {
						if(!json.result) {
							alert(json.errorMessage);
							return;
						}

						var $list = getActiveList();
						$list.find('tr.data_ynlk').hide();
						if(!more) {
							$list.empty();
						}
						lastIds[tabMode] = json.lastId;
						// 만약 JSON에 HTML를 담아서 보내줄수 있으면 그냥 $list.append(json.html) 식으로 넣기만 하면 됩니다.
						if(tabMode === 'search') {
							tmplRow = tmplSearchRow;
						}

						for(var i = 0, len = json.data.length; i < len; i++) {
							if(tabMode === 'search') {
								json.data[i].highlightNickName = (json.data[i].nickName||'').replace(params.kwd, '<em>'+params.kwd+'</em>');
							}

							$list.append(tmplRow(json.data[i]));
						}
					}).fail(function(){
						// error

					}).always(function(){
						isLoading = false;
					});
				}

				// 탭기능 적용
				$tab.tabs({
					type: 'parent-on',
					onSelected: function(e, index) {
						switch(index) {
						case 0:
							tabMode = 'friends';
							$('div.add_frend')[0].className = 'add_frend';
							loadFriend();
							break;
						case 1:
							tabMode = 'search';
							$('div.add_frend')[0].className = 'add_frend frend_serch serch_data_ynlk'; break;
						}
					}
				});

				// 각 항목의 추가버튼
				$('div.add_frend').on('click', '.add_music:not(.disabled)', function() {
					addFriend($(this).closest('tr'));
				}).on('click', '.delt_music', function() {
					removeFriend($(this).closest('tr'));
				});

				// 맨위로버튼
				$('div.view_more button.top').on('click', function() {
					$(this).closest('div.song_wrap').find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 추가하기 버튼
				$('button.d_add_friends').on('click', function(){
					var $table = getActiveList(),
						$items = $table.find('input:checkbox:checked');

					if($items.length === 0) {
						alert('선택된 항목이 없습니다.');
						return;
					}

					$items.each(function() {
						if(addFriend($(this).closest('tr')) === false) {
							return false;
						}
					});
				});

				// 삭제하기 버튼
				$('button.d_delete_friends').on('click', function(){
					var $items = $addedFriends.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('선택된 항목이 없습니다.');
						return;
					}
					$items.each(function() {
						removeFriend($(this).closest('tr'));
					});
				});

				// 더보기
				$('button.d_get_more').on('click', function() {
					loadFriend(true);
				});

				$kwd.on('keyup', function(e) {
					if(e.keyCode === 13){
						$('button.d_btn_search').triggerHandler('click');
					}
				});

				// 검색
				$('button.d_btn_search').on('click', function() {
					$('#d_tab li.list2').find('div.song_sort a:eq(0)').triggerHandler('click');
				});

				// 검색탭 내의 소팅 링크
				$('#d_tab li.list2').find('div.song_sort a').on('click', function(e) {
					e.preventDefault();
					if(tabMode === 'search' && $kwd.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwd.focus();
						return;
					}
					$(this).activeRow('on');
					loadFriend();
				});

				// 하단 확인버튼
				$('#d_btn_add').on('click', function() {
					var $items = $addedFriends.find('tr.d_added');
					var SendSongMessage = opener.MELON.WEBSVC.MyMusic.SendSongMessage;
					$items.each(function() {
						var $tr = $(this),
							no = $tr.find('input:checkbox').val(),
							name = $tr.find('span.user_nicnm').text();

						SendSongMessage.addFriend(no, name);
					});
					self.close();
				});

				// 체크된 row 활성화
				$('div.add_frend_cont').on('click', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.trigger('changed');
				}).on('changed', 'div.song_list tbody input:checkbox', function(e) {
					e.stopPropagation();

					var $this = $(this);
					$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('active');
				});

				// 오른쪽에 변화가 있을 때 카운팅 표시
				$addedFriends.on('addedlistchanged', function(e, type, $tr) {
					var cnt = $addedFriends.find('tr.d_added').length;

					if(cnt > 0) {
						$addedFriends.find('tr.data_ynlk').hide();
					} else {
						$addedFriends.find('tr.data_ynlk').show();
					}

					$('#d_added_friends_count em').html(cnt);
				});

				loadFriend();
			},
			addFriend: function(no, name) {
				var $friendBox = $('ul.frend_list');
				if($friendBox.find('input[value='+no+']').length > 0) {
					return;
				}

				$('p.frend_ynlk.d_nofriend').hide();
				$('ul.frend_list').show();

				var html = '<li><span class="none">친구 닉네임</span><span class="frend_name" title="'+name+'"><input type="hidden" name="friend_no" value="'+no+'" />'+name+'</span><button type="button" title="'+name+' - 삭제"><span class="none">삭제</span><span></span></button></li>';
				$friendBox.append($(html));
			}
		};
	});

	WEBSVC.define('WEBSVC.Mypage.AddFriend', function(){
		return {
			init: function() {

				var me = this,
					$con = $('div.add_frend'),
					$tab = $('#d_tab'),
					$addedCount = $('#d_added_count'),
					$addedTable = $('#d_added_table tbody'),
					$activeTab = $tab.find('>li.on'),
					$activeTable = $activeTab.find('tbody'),
					$kwdInput = $('#d_kwd'),
					tabModes = ['recent', 'friend', 'search', 'mobile'],
					tabMode = tabModes[0],
					tmplRow = WEBSVC.template($('#d_friend_row').html()),
					tmplSearchRow = WEBSVC.template($('#d_search_row').html()),
					isLoading = false,
					include = WEBSVC.array.include,
					addedFriendData = [],
					lastIds = {
						'recent': 0,
						'friend': 0,
						'search': 0
					};

				// 이미 추가된 항목인지 체크
				function isAddedFriend(friendId) {
					return $addedTable.find('input:checkbox[value=' + friendId + ']').length > 0;
				}


				// 친구 추가
				function addFriend($oritr) {
					var count = 0;
					if((count = $addedTable.find('tr.d_added').length) >= 10) {
						alert('최대 10까지 선택하실 수 있습니다.');
						return false;
					}

					var val = $oritr.find('input:checkbox').val(), $tr;
					if(isAddedFriend(val)) { return; }

					// 131023_수정
					var name = $oritr.find('input.d_name').val(),
						$row = $(['<tr class="d_added"><td class="t_center"><div class="wrap">',
									'<input type="checkbox" value="'+val+'" title="'+name+' 선택" /></div>',
									'</td><td><div class="wrap"><a href="member.do?id='+val+'" class="user_image" title="'+name+' 이미지">'+$oritr.find('a.user_image').html()+'</a>\r\n',
									'<span class="user_nicnm" title="'+name+'"><a href="member.do?id='+val+'" title="'+name+' - 새창" target="_blank">'+name+'</a></span>',
									'</div></td><td class="t_center"><div class="wrap">',
									'<button type="button" class="delt_music" title="'+name+' - 삭제"><span>삭제</span></button>',
									'</div></td></tr>'].join(''));
					// 131023_수정

					disableAddedRow($oritr);
					$addedTable.append($row).trigger('addedlistchanged', ['added', val, $row]);
				}

				// 휴대폰 추가
				function addMobileFriend() {
					if($addedTable.find('tr.d_added').length >= 10) {
						alert('최대 10까지 선택하실 수 있습니다.');
						return false;
					}

					var $td = $activeTab.find('td.hp_insert'),
						$mb = $td.find('input.d_mobile_no'),
						mb = $mb.val();

					if(!/^(?:010|011|016|017|018|019)[\d]{7,8}$/.test(mb)){
						alert('휴대폰 번호가 잘못 되었습니다.');
						$mb.focus();
						return;
					}

					if($addedTable.find('input:checkbox[value='+mb+']').length>0) {
						alert('이미 추가된 번호입니다.');
						$mb.focus();
						return;
					}

					// 131023_수정
					var $row = $(['<tr class="d_added"><td class="t_center"><div class="wrap">',
									'<input type="checkbox" value="'+mb+'" title="'+mb+' 선택" /></div>',
									'</td><td><div class="wrap"><span class="user_image">&nbsp;</span>\r\n',
									'<span class="user_nicnm" title="'+mb+'">'+mb+'</span>',
									'</div></td><td class="t_center"><div class="wrap">',
									'<button type="button" class="delt_music" title="'+mb+' - 삭제"><span>삭제</span></button>',
									'</div></td></tr>'].join(''));
					// 131023_수정
					$addedTable.append($row).trigger('addedlistchanged', ['added', mb. $row]);
					$mb.val('');
				}

				// 친구 삭제
				function removeFriend($tr) {
					var val = $tr.find('input:checkbox').val();

					$tr.remove();
					$addedTable.trigger('addedlistchanged', ['removed', val]);
				}

				// 테이블 활성화
				function enableTable(b) {
					$activeTable.find('tr:not(.d_no_data)')[b ? 'noop' : 'remove']();
					$activeTable.find('tr.d_no_data')[b ? 'hide' : 'show']();
					$activeTab.find('button.more').prop('disabled', !b)[b ? 'removeClass' : 'addClass']('disabled');
				}

				// 리스트 조회
				function loadFriend(more) {
					if(isLoading) { return; }

					var params = {},
						href = '';
					if(tabMode === 'search'){
						href = $activeTab.find('div.song_sort a.on').attr('href');
						params.kwd = $kwdInput.trimVal();
					} else {
						href = $activeTab.find('>a').attr('href');
					}

					if(more){
						// 더보기 일 경우, 다음목록의 조건키를 넘김
						params.lastId = lastIds[tabMode];
					} else {
						// 더보기가 아닐 경우, 이전에 있던 tr를 모두 제거
						$activeTable.find('tr:not(d_no_data)').remove();
					}

					isLoading = true;
					setTimeout(function(){ $activeTable.find('tr.d_waiting').show(); }, 26);

					$.ajax({
						url: href,
						data: params,
						method: 'post',
						dataType: 'json'
					}).done(function(json) {
						if(!json.result) {
							alert(json.errorMessage);
							return;
						}
						var tmpl = tmplRow,
							$row;

						// 만약 JSON에 HTML를 담아서 보내줄수 있으면 그냥 $list.append(json.html) 식으로 넣기만 하면 됩니다.
						if(json.data && json.data.length) {
							lastIds[tabMode] = json.lastId;

							enableTable(true);

							if(tabMode === 'search') { tmpl = tmplSearchRow; }
							for(var i = 0, len = json.data.length; i < len; i++) {
								if(tabMode === 'search') {
									json.data[i].highlightNickName = (json.data[i].nickName||'').replace(params.kwd, '<em>'+params.kwd+'</em>');
								}
								$row = $(tmpl(json.data[i]).replace(/\n|\r/g, ''));
								// 이미 추가된거면 비활성화 시킨다.
								if(include(addedFriendData, json.data[i].memberId, false)){
									disableAddedRow($row);
								}
								$activeTable.append($row);
							}
						} else {
							enableTable(false);
						}

					}).fail(function(){
						// error
						enableTable(false);
					}).always(function(){
						$activeTable.find('tr.d_waiting').hide();
						isLoading = false;
					});
				}

				function disableAddedRow($row, b) {
					//b = b !== false;
					//$row[b ? 'addClass' : 'removeClass']('disabled').find('input, button').prop('disabled', b)[b ? 'addClass' : 'removeClass']('disabled');
				}

				// 탭기능
				$tab.tabs({
					type: 'parent-on',
					onSelected: function(e, index) {
						tabMode = tabModes[index];
						$activeTab = $tab.find('>li.on');
						$activeTable = $tab.find('>li.on tbody');

						switch(index) {
						case 0:
						case 1:
							loadFriend();
							break;
						}
					}
				});

				// 각 row별 추가버튼
				$con.on('click', '.add_music:not(.disabled)', function() {
					addFriend($(this).closest('tr'));
				}).on('click', '.delt_music', function() {
					removeFriend($(this).closest('tr'));
				});


				// 추가하기 버튼
				$con.on('click', 'button.d_add', function(){
					if(tabMode === 'mobile') {
						addMobileFriend();
						return;
					}
					var $items = $activeTable.find('input:checkbox:checked');

					if($items.length === 0) {
						alert('선택된 항목이 없습니다.');
						return;
					}

					$items.each(function() {
						if(addFriend($(this).closest('tr')) === false) {
							return false;
						}
					});
				});

				// 삭제하기 버튼
				$con.on('click', 'button.d_remove', function(){
					var $items = $addedTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('선택된 항목이 없습니다.');
						return;
					}
					$items.each(function() {
						removeFriend($(this).closest('tr'));
					});
				});

				// 더보기
				$con.on('click', 'button.more', function() {
					if(tabMode === 'mobile'){ return; }
					loadFriend(true);
				});

				// 맨위로버튼
				$con.on('click', 'button.top', function() {
					if(tabMode === 'mobile'){ return; }
					$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 검색어 입력칸에서 엔터키를 눌렀을 때
				$kwdInput.on('keyup', function(e) {
					if(e.keyCode === 13){
						$('#d_btn_search').triggerHandler('click');
					}
				});

				// 검색 버튼
				$('#d_btn_search').on('click', function() {
					$activeTab.find('div.song_sort a:eq(0)').trigger('click');
				});

				// 검색탭 내의 소팅 링크
				$con.on('click', 'li.list3 div.song_sort a', function(e) {
					e.preventDefault();
					if($kwdInput.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwdInput.focus();
						return;
					}

					$(this).activeRow('on');
					loadFriend();
				});

				// 체크된 row 활성화
				$con.on('click', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.trigger('changed');
				}).on('changed', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('check');
				});

				// 오른쪽에 변화가 있을 때 카운팅 표시
				$addedTable.on('addedlistchanged', function(e, type, val) {
					var $rows = $addedTable.find('tr.d_added'),
						cnt = $rows.length;

					if(cnt > 0) {
						$addedTable.find('tr.d_no_data').hide();
					} else {
						$addedTable.find('tr.d_no_data').show();
					}
					// 값을 갖고 있다가 왼쪽 리스트에서 해당 row를 비활성화 처리
					addedFriendData = [];
					$rows.find('input:checkbox').each(function(){
						addedFriendData.push(this.value);
					});
					$addedCount.html(cnt);

					if(type === 'removed'){
						disableAddedRow($con.find('tbody input:checkbox[value='+val+']').closest('tr'), false);
					}
				});

				// 부모페이지에 친구 추가
				$('#d_btn_add').on('click', function() {

					var $items = $addedTable.find('tr.d_added'),
						addedFriends = [];
					if($items.length === 0) {
						alert('선택된 친구가 없습니다.');
						return;
					}

					$items.each(function() {
						var $tr = $(this),
							no = $tr.find('input:checkbox').val(),
							name = $tr.find('span.user_nicnm').text();

						addedFriends.push({
							friendNo: no,
							nickName: name
						});
					});
					opener.MELON.WEBSVC.PubSub.trigger('addfriends.mypage', [addedFriends]);
					self.close();
				});

				loadFriend();
			},

			openPopup: function(url) {
				WEBSVC.util.openPopup(url, 834, 640);
			}
		}
	});

	WEBSVC.define('WEBSVC.Mypage.AddSong', function(){
		return {
			init: function(){

				var $con = $('div.chic_music_cont'),
					$tab = $con.find('div.music_tab>ul').tabs({type: 'parent-on'}),
					$kwdInput = $('#d_kwd'),
					$activeTab = $tab.find('>li.on'),
					$activeTable = $activeTab.find('tbody'),
					$addedTable = $('#d_added_table tbody'),
					//20131031 hmh tmplRow 사용안함
//					tmplRow = WEBSVC.template($('#d_song_row').html().replace(/\n|\r/g, '')),
					tabMode = 'recent',
					isLoading = false, // ajax 로딩 플래그
					lastIds = { // 더보기인 경우 다음목록를 가져올때 기준키
						'recent': 0,
						'like': 0,
						'search': 0
					}; // 검색어
				//20131031 hmh chrome에서 인식못하는 관계로 lastId추가
				var lastId;
				// 오른쪽에 곡 추가
				function addSong($tr) {
					var val = $tr.find('input:checkbox').val();
					if($addedTable.find('input:checkbox[value=' + val + ']').length > 0) {
						return;
					}

					if($addedTable.find('tr.d_added').length > 50) {
						alert('최대 50곡까지 추가할 수 있습니다.');
						return false;
					}

					var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added'),
					$cols = $row.children('td'); // 131023_수정 : jquery 버그

					$cols.eq(0).find('input:checkbox').prop('checked', false);
					$cols.eq(2).find('div.d_layer').hideLayer();
					$cols.eq(3).remove();
					$cols.eq(4).find('button').attr('title', function(){ return (this.title||'').replace(/추가$/, '삭제'); })
						.replaceClass('add_music', 'delt_music').children().text('삭제');

					$addedTable.append($row).trigger('addedlistchanged', ['added', $row]);
				}

				// 오른쪽에서 곡 삭제
				function removeSong($tr) {
					$tr.remove();
					$addedTable.trigger('addedlistchanged', ['removed'])
				}

				// 곡리스트 조회
				function loadSong(more) {
					if(isLoading) { return; }

					var href = '',
						params = {};

					switch(tabMode){
					case 'recent':
						href=$tab.find('>li:eq(0)>a').attr('href');
						break;
					case 'like':
						href=$tab.find('>li:eq(1) div.song_sort a.on').attr('href');
						break;
					case 'search':
						href=$tab.find('>li:eq(2) div.song_sort a.on').attr('href');
						break;
					}
					isLoading = true;
					if(tabMode === 'search'){
						params.kwd = $kwdInput.trimVal();
					} else if(tabMode === 'like'){
						params.type = $activeTab.find('select').val();
					}

					if(!more){
						$activeTable.find('tr.d_item').remove();
						$activeTable.find('tr.d_no_data').hide();
						tabMode === 'search'&&$activeTable.find('tr.d_loading').show();
					} else {
						params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
						lastId = lastIds[tabMode];
					}
					$.ajax({
						url: href,
						data: params
					//20131031 hmh json타입에서 htm 으로 변경
					/*,
						dataType: 'json'
					}).done(function(json) {
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
						if(json.RESULT) {
							// 더보기 모드 여부
							if(!more){
								$activeTable.find('tr:not(.d_no_data)').remove();
							}

							lastIds[tabMode] = json.LASTID; // 더보기할 때 필요한 기준키(예: 페이지, 인덱스키 등)
							if(json.SONGLIST.length) {
								for(var i = 0, len = json.SONGLIST.length; i < len; i++) {
									var htm = "";
									var song = json.SONGLIST[i];
									htm = "<tr class='d_item'>" +
										"<td class='t_center'>" +
										"<div class='wrap'>" +
										"<input type='checkbox' title='"+song.SONGNAMEWEBLIST+" 선택' name='SONGID' value='"+song.SONGID+"' ";
											if(song.SVCAVAAILFLG < 2){
												htm = htm+"disabled='disabled'";
											}
										htm = htm+"/>"+
										"</div>" +
										"</td>" +
										"<td>" +
											"<div class='td_wrap'>" +
												"<div class='song_func'>" +
													"<button type='button' class='btn_icon_small play";
													if(song.SVCAVAAILFLG > 2){
														htm = htm+"disabled ";
													}
													htm = htm+"' title='"+song.SONGNAMEWEBLIST+" 재생 - 새창'><span>재생</span></button>" +
												"</div>" +
												"<div class='songname'>" +
													"<strong class='none'>"+song.SONGNAMEWEBLIST+"</strong>";
													if(song.SVCAVAAILFLG > 2){
														htm = htm+"<span>"+song.SONGNAMEWEBLIST+"</span>";
													}else{
														htm = htm+"<a href='song.do?song_no=${song.SONGID}' class='";
														if(song.SVCAVAAILFLG > 2){
															htm = htm+"disabled";
														}
														htm = htm+"' title='"+song.SONGNAMEWEBLIST+" 재생 - 새창'>"+song.SONGNAMEWEBLIST+"</a>";
													}
													htm = htm+"</div>" +
											"</div>" +
										"</td>" +
										"<td class='d_artist'>" +
											"<div class='wrap'>" +
												"<span class='ellipsis' style='width:50px;'>" +
													"<a href='artist.do?artistId='"+song.ARTISTIDBASKET+"' title='"+song.ARTISTNAMEBASKET+" - 새창' target='_blank' class='fc_mgray'>"+song.ARTISTNAMEBASKET+"</a>" +
												"</span>" +
											"</div>" +
										"</td>" +
										"<td>" +
											"<div class='wrap'>" +
												"<span class='ellipsis' style='width:50px;'>" +
													"<a href='album.do?albumId='"+song.ALBUMID+"' title='"+song.ALBUMNAMEWEBLIST+" - 새창' target='_blank' class='fc_mgray'>"+song.ALBUMNAMEWEBLIST+"</a>" +
												"</span>" +
											"</div>" +
										"</td>" +
										"<td class='t_center'>" +
											"<div class='wrap'>" +
												"<button type='button' class='add_music ";
												if(song.SVCAVAAILFLG > 2){
													htm = htm+"disabled";
												}
												htm = htm+"title='"+song.SONGNAMEWEBLIST+" - 곡 추가'><span>추가</span></button>" +
											"</div>" +
										"</td>" +
									"</tr>" ;
									$activeTable.append(htm);
								}
							} else {
								$activeTable.find('tr.d_no_data').show();
							}
							if(!json.HASMORE){
								$('button.more').hide();
							}else{
								$('button.more').show();
							}
						}*/
					}).done(function(html) {
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
						// 더보기 모드 여부
						if(!more){
							$activeTable.find('tr:not(.d_no_data)').remove();
						}
						$activeTable.append(html);
						//numbering();

						// 다음 목록을 가져오기 위한 기준키를 보관
						if($activeTable.find('tr:last input.d_last_id').val() != undefined){
							lastId = parseInt($activeTable.find('tr:last input.d_last_id').val());
							lastIds[tabMode] = lastId;
						}
						var isHasMore = $activeTable.find('tr:last input.isHasMore').val();
						if(lastId < 1){
							$('button.btn_move').prop('disabled', true).addClass('disabled');
						}
						if(isHasMore!='true') {
							$('button.more').hide();
						}else{
							$('button.more').show();
						}
					}).fail(function(){
						// error
					}).always(function(){
						isLoading = false;
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					});
				}

				// 탭을 선택시 활성화된 테이블로 교체
				$tab.on('selected', function(e, index) {
					switch(index){
					case 0: tabMode = 'recent'; break;
					case 1: tabMode = 'like'; break;
					case 2: tabMode = 'search'; break;
					}

					$activeTab = $tab.find('>li.on');
					$activeTable = $activeTab.find('tbody');
					if(index < 2){ // 검색창은 바로 조회되면 안됨
						loadSong();
					}
				});

				// 체크된 row 활성화
				$con.on('click', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.trigger('changed');
				}).on('changed', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('active');
				});

				$kwdInput.on('keyup', function(e) {
					if(e.keyCode === 13){
						$('#d_btn_search').triggerHandler('click');
					}
				});

				// 검색버튼
				$('#d_btn_search').on('click', function() {
					$activeTab.find('div.song_sort a.on').click();
				});

				// row에 있는 +, - 클릭시
				$con.on('click', 'button.add_music, button.delt_music', function(){
					var $this = $(this);
					if($this.hasClass('disabled')) {
						return;
					}

					if($this.hasClass('add_music')) {
						addSong($this.closest('tr'));
					} else {
						removeSong($this.closest('tr'));
					}
				});

				// >, 추가버튼
				$con.on('click', 'button.d_add', function() {
					var $items = $activeTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('선택된 항목이 없습니다.');
						return;
					}

					$items.each(function(){
						if(addSong($(this).closest('tr')) === false){
							return false;
						}
					});
				});

				// <, 삭제 버튼
				$con.on('click', 'button.d_remove', function() {
					var $items = $addedTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('선택된 항목이 없습니다.');
						return;
					}

					$items.each(function(){
						removeSong($(this).closest('tr'));
					});
				});

				// 맨위로버튼
				$con.on('click', 'button.top', function() {
					$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 더보기
				$con.on('click', 'button.more', function() {
					loadSong(true);
				});

				// 윗/아래 버튼들
				$con.on('click', 'button.btn_move', function(){
					var $btn = $(this),
						$rows = $addedTable.find('tr:has(input:checked)');

					if($rows.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}

					if($btn.hasClass('up')) { // 위로
						$rows.each(function(){
							var $row = $(this);

							if($row.prev('tr:has(input:checked)').length > 0) { return; }
							$row.insertBefore($row.prev('tr:not(.d_no_data)'));
						});
					} else if($btn.hasClass('down')){ // 아래로
						Array.prototype.reverse.call($rows).each(function(){
							var $row = $(this);

							if($row.next('tr:has(input:checked)').length > 0) { return; }
							$row.insertAfter($row.next());
						});
					} else if($btn.hasClass('top')){ // 맨 위로
						$addedTable.find('tr.d_no_data').after($rows);
					} else if($btn.hasClass('bottom')){ // 맨 아래로
						$addedTable.append($rows);
					}
				});

				//
				$con.on('click', 'div.song_sort a', function(e) {
					e.preventDefault();

					if(tabMode === 'search' && $kwdInput.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwdInput.focus();
						return;
					}

					$(this).activeRow('on');
					loadSong();
				});

				$addedTable.on('addedlistchanged', function(){
					var count = $addedTable.find('tr.d_added').length;
					$('#d_added_count').html(count);

					if(count > 0) {
						$addedTable.find('tr.d_no_rows').hide();
					} else {
						$addedTable.find('tr.d_no_rows').show();
					}
				});

				$('#d_ok').on('click', function(){
					var $rows = $addedTable.find('tr.d_added'),
						data = [];

					if($rows.length === 0){
						alert('선택된 곡이 없습니다.');
						return;
					}

					$rows.each(function(){
						data.push($(this).find('input[name=SONGID]').val());
					})

					opener.MELON.WEBSVC.PubSub.trigger('addsongs.mypage', [data]);
					self.close();
				});

				loadSong();

			},

			openPopup: function(url){
				WEBSVC.util.openPopup(url,  834, 640);
			}
		}
	});

	//20131031 kbc 음악메세지 보내기(메세지,친구팝업,곡팝업 관련)
	WEBSVC.define('WEBSVC.Mypage.SendMessage', function(){
		var URL_ADDFRIEND_POPUP = 'mymusicmessage_listFriend.htm';
		var pocCode = "";
		var pocCodeChk = getCookie("MPS");
		var melonPlayerChk = "MELONPLAYER";
		if(pocCodeChk != null && pocCodeChk.match("^" + melonPlayerChk) == melonPlayerChk){
			pocCode = "WP42";
		}

		return {
			// 선물메세지 보내기 팝업
			init: function(){
				// 메세지 입력창
				$('#d_message').textControl({
					counting: true,
					countType: 'char',
					limit: 160,
					limitTarget: '#d_text_count'
				});
			},

			initAddSong: function(menuId){
				var $con = $('div.chic_music_cont'),
					$tab = $con.find('div.music_tab>ul').tabs({type: 'parent-on'}),
					$kwdInput = $('#d_kwd'),
					$activeTab = $tab.find('>li.on'),
					$activeTable = $activeTab.find('tbody'),
					$addedTable = $('#d_added_table tbody'),
					$kwd = $('div.serch_frend input'),		// 검색어
					tabMode = 'recent',
					isLoading = false, // ajax 로딩 플래그
					lastIds = { // 더보기인 경우 다음목록를 가져올때 기준키
						'recent': 0,
						'like': 0,
						'search': 0
					}; // 검색어
				var lastId;

				// 오른쪽에 곡 추가
				function addSong($tr) {
					var val = $tr.find('input:checkbox').val();
					if($addedTable.find('input:checkbox[value=' + val + ']').length > 0) {
						return;
					}

					if($addedTable.find('tr.d_added').length >= 10) {
						alert('10곡까지 추가 가능합니다.');
						return false;
					}

					var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added'),
					$cols = $row.children('td'); // 131023_수정 : jquery 버그
					//$cols = $row.find('td');

					$cols.eq(0).find('input:checkbox').prop('checked', false);
					var strSong = $row.find('td:eq(1)').find('a').html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
					$cols.eq(1).find('a').html(strSong);
					$cols.eq(2).find('div.d_layer').hideLayer();
					$cols.eq(2).find('a').each(function(){
						var strArtist = $(this).html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
						$(this).html(strArtist);
					});
					$cols.eq(3).remove();
					$cols.eq(4).find('button').attr('title', function(){ return (this.title||'').replace(/추가$/, '삭제'); })
						.replaceClass('add_music', 'delt_music').children().text('삭제');

					$addedTable.append($row).trigger('addedlistchanged', ['added', $row]);
				}

				// 오른쪽에서 곡 삭제
				function removeSong($tr) {
					$tr.remove();
					$addedTable.trigger('addedlistchanged', ['removed'])
				}

				// 곡리스트 조회
				function loadSong(more) {
					if(isLoading) { return; }
					$con.find('.d_checkall').attr("checked",false);
					var href = '',
						params = {};

					switch(tabMode){
					case 'recent':
						href=$tab.find('>li:eq(0)>a').attr('href');
						break;
					case 'like':
						href=$tab.find('>li:eq(1) div.song_sort a.on').attr('href');
						break;
					case 'search':
						href=$tab.find('>li:eq(2) div.song_sort a.on').attr('href');
						params.sort = $activeTab.find('div.song_sort>*.on').attr('data-sort');
						params.kwd = encodeURIComponent($kwd.trimVal());
						break;
					}
					isLoading = true;
					if(tabMode === 'search'){
						params.kwd = $kwdInput.trimVal();
					} else if(tabMode === 'like'){
						params.filter = $activeTab.find('select').val();
					}

					if(!more){
						$activeTable.find('tr.d_item').remove();
						//$activeTable.find('tr.d_no_data').hide();
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					} else {
						params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
						lastId = lastIds[tabMode];
					}

					if(tabMode == 'like' && $('#likeSongArtist').find('option').length == 1){
						$.ajax({
							url: '/mymusic/common/mymusiccommon_listSongArtist.json',
							data: params,
							dataType: 'json'
						}).done(function(json) {
							if(json.artistListCount > 0){
								var artistList = json.artistList;
								var jobstr = '';
								var jobjson = '';
								for(var i=0; i < artistList.length; i++) {
									jobstr=JSON.stringify(artistList[i])
									jobjson=JSON.parse(jobstr)
									$('#likeSongArtist').append('<option value=\"'+jobjson.ARTISTID+'\">'+jobjson.ARTISTNAMEWEBLIST+'</option>');
								}
							}
						});
					}

					$.ajax({
						url: href,
						data: params
						,beforeSend: function(){ $activeTab.find('.loading_wrap').show(); }// 140221 add
						//,dataType: 'json'
					}).done(function(html) {
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
						// 더보기 모드 여부
						if(!more){
							$activeTable.find('tr:not(.d_no_data)').remove();
						}
						if(tabMode === 'search'){
							$activeTab.find('.loading_wrap').show(); // 140221 add
						}
						$activeTable.append(html);
						if(tabMode === 'search'){
							$activeTab.find('.loading_wrap').hide(); // 140221 add
						}
						if($activeTable.find('tr').length > 1){
							$activeTable.find('tr.d_no_data').hide();
						}else{
							$activeTable.find('tr.d_no_data').show();
							if(tabMode == "search"){
								$activeTable.find('#songNone').text('검색 결과가 없습니다.');
							}
						}

						//numbering();
						//lastId = 0;
						// 다음 목록을 가져오기 위한 기준키를 보관
						if($activeTable.find('tr:last input.d_last_id').val() != undefined){
							lastId = parseInt($activeTable.find('tr:last input.d_last_id').val());
							lastIds[tabMode] = lastId;
						}
						var isHasMore = $activeTable.find('tr:last input.isHasMore').val();
						if(lastId < 1){
							$('button.btn_move').prop('disabled', true).addClass('disabled');
						}
						if(isHasMore!='true') {
							$('button.more').hide();
						}else{
							$('button.more').show();
						}
					}).fail(function(){
						// error
					}).always(function(){
						isLoading = false;
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					});
				}

				// 탭을 선택시 활성화된 테이블로 교체
				$tab.on('selected', function(e, index) {
					$con.find('.d_checkall').attr("checked",false);
					$con.find('.a_checkall').attr("checked",false);
					switch(index){
					case 0: tabMode = 'recent'; break;
					case 1: tabMode = 'like'; break;
					case 2: tabMode = 'search'; break;
					}

					$activeTab = $tab.find('>li.on');
					$activeTable = $activeTab.find('tbody');

					if(index < 2){ // 검색창은 바로 조회되면 안됨
						loadSong();
					}else{
//						if($activeTable.find('tr').length > 1 && $kwdInput.trimVal() != ''){
//							loadSong();
//						}
						$kwdInput.trimVal('');
						$activeTable.html('<tr class="d_no_data"><td colspan="4" class="data_ynlk"><div class="wrap"><span id="songNone">검색어를 입력하세요. </span></div></td></tr>');
						$('button.more').hide();
					}
				});

				// 아티스트 선택시
				$tab.on('change', '#likeSongArtist', function(e) {
					loadSong();
				});

				// 체크된 row 활성화
				$con.on('click', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.trigger('changed');
				}).on('changed', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('active');
				});

				$kwdInput.on('keypress', function(e) {
					if(e.keyCode === 13){
						$('#d_btn_search').triggerHandler('click');
					}
				});

				// 검색버튼
				$('#d_btn_search').on('click', function() {
					$activeTab.find('div.song_sort a.on').click();
				});

				// row에 있는 +, - 클릭시
				$con.on('click', 'button.add_music, button.delt_music', function(){
					var $this = $(this);
					if($this.hasClass('disabled')) {
						return;
					}

					if($this.hasClass('add_music')) {
						if($addedTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							alert('이미 선택된 곡입니다.');
							return;
						}

						addSong($this.closest('tr'));
					} else {
						if(!confirm("선택한 곡을 삭제하시겠습니까?")){
							return;
						}
						removeSong($this.closest('tr'));
					}
				});

				// >, 추가버튼
				$con.on('click', 'button.d_add', function() {
					var $items = $activeTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}
					var totCnt = 0;
					var sameSongCnt = 0;

					$items.each(function(){
						totCnt++;
						if($addedTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							sameSongCnt++;
						}

						if(addSong($(this).closest('tr')) === false){
							return false;
						}
					});
					if(totCnt == sameSongCnt){
						alert('이미 선택된 곡입니다.');
						return;
					}
				});

				// <, 삭제 버튼
				$con.on('click', 'button.d_remove', function() {
					var $items = $addedTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}
					if(!confirm("선택한 곡을 삭제하시겠습니까?")){
						return;
					}
					$items.each(function(){
						removeSong($(this).closest('tr'));
					});
				});

				// 맨위로버튼
				$con.on('click', 'button.top', function() {
					$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 더보기
				$con.on('click', 'button.more', function() {
					loadSong(true);
				});

				// 윗/아래 버튼들
				$con.on('click', 'button.btn_move', function(){
					var $btn = $(this),
						$rows = $addedTable.find('tr:has(input:checked)');

					if($rows.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}

					if($btn.hasClass('up')) { // 위로
						$rows.each(function(){
							var $row = $(this);

							if($row.prev('tr:has(input:checked)').length > 0) { return; }
							$row.insertBefore($row.prev('tr:not(.d_no_data)'));
						});
					} else if($btn.hasClass('down')){ // 아래로
						Array.prototype.reverse.call($rows).each(function(){
							var $row = $(this);

							if($row.next('tr:has(input:checked)').length > 0) { return; }
							$row.insertAfter($row.next());
						});
					} else if($btn.hasClass('top')){ // 맨 위로
						$addedTable.find('tr.d_no_data').after($rows);
					} else if($btn.hasClass('bottom')){ // 맨 아래로
						$addedTable.append($rows);
					}
				});

				//
				$con.on('click', 'div.song_sort a', function(e) {
					e.preventDefault();

					if(tabMode === 'search' && $kwdInput.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwdInput.focus();
						return;
					}

					$(this).activeRow('on');
					loadSong();
				});

				$addedTable.on('addedlistchanged', function(){
					var count = $addedTable.find('tr.d_added').length;
					$('#d_added_count').html(count);

					if(count > 0) {
						$addedTable.find('tr.d_no_rows').hide();
					} else {
						$addedTable.find('tr.d_no_rows').show();
					}
				});

				$('#d_ok').on('click', function(){
					$('#d_ok').attr('disabled', true);

					var	$con = $('div.chic_frend'),
						$tab = $con.find('>ul'),
						$friendBox = $('div.d_friend_box'),
						$friendList = $friendBox.find('ul.d_friend_list'),
						$rows0 = $friendList.find('input[name=friendNo]'),
						frienddata = []; //친구데이터

					var $con1 = $('div.recm_music'),
						$rows1 = $('div.text_insert'),
						simplemsg = $con1.find('#d_hidden_emo').val(), //메세지형태
						msg = $rows1.find('#d_message').val(); //메세지

					var $rows2 = $addedTable.find('tr.d_added'),
						songdata = []; //곡데이터

					$rows0.each(function(){
						if(this.value != 0){
							frienddata.push(this.value);
						}
					});

					if(frienddata.length == 0){
						alert('친구를 선택해 주세요.');
						$('#d_ok').attr('disabled', false);
						return;
					}

					if(msg.length == 0){
						alert('메시지를 입력해 주세요.');
						$('#d_ok').attr('disabled', false);
						return;
					}

//					if($rows2.length === 0){
//						alert('곡을 선택해 주세요.');
//						return;
//					}

					if(msg == "메시지를 입력해 주세요."){
						alert('메시지를 입력해 주세요.');
						$('#d_ok').attr('disabled', false);
						return;
					}

					$rows2.each(function(){
						songdata.push($(this).find('input[name=SONGID]').val());
					})

					if(frienddata.length > 10){
						alert('한 번에 최대 10명에게만 음악메시지 전송이 가능합니다.');
						$('#d_ok').attr('disabled', false);
						return;
					}

					if(songdata.length > 10){
						alert('10곡까지 추가 가능합니다.');
						$('#d_ok').attr('disabled', false);
						return;
					}
					var anrChk = "N";
					 var checkProhibit = false ;
	   				    if(msg.length > 0){
			                $.ajax({
			                     type : "POST",
			                      url  : "/mymusic/common/mymusiccommon_checkRestrictWord.json" ,
			                     async : false,
			                     data : {inputStr : encodeURIComponent(msg)},
			                     success : function(result){
			                            if(result.result == true){
			                                alert( "작성하신 글 중 "+result.message+ "은 금칙어 입니다. 수정 후 등록해주세요." );
			                                checkProhibit = true;
			                                $('#d_ok').attr('disabled', false);
			                           }
			                     },
			                     error : function (request, status, errorThrown){
			                    	 alert("서비스 응답이 없습니다");
			                    	 $('#d_ok').attr('disabled', false);
			                    	 anrChk = "Y";
			                     }
			                });

			                if(checkProhibit){
			                      return;
			                }
			            }
//	   				 msg = msg.replace(/\n/gi,"<br/>");
					//opener.MELON.WEBSVC.PubSub.trigger('sendsongs.mypage', [simplemsg], [msg], [frienddata], [songdata]);
	   				if(anrChk != "Y"){
	   					addMessage(simplemsg, msg, frienddata, songdata);
	   				}
					//self.close();
				});
				function addMessage(simplemsg, msg, frienddata, songdata){
					$.ajax({
						url: '/mymusic/messagepresent/mymusicmessage_insert.json',
						data: {
							 simplemsg  : simplemsg
							,msg        : encodeURIComponent(msg)
							,frienddata : frienddata
							,songdata   : songdata
						},
						success : function(data){
							if(data.msgChk == -501){
			                    alert( "작성하신 글 중 "+data.message+ "은 금칙어 입니다. 수정 후 등록해주세요." );
			                    return;
		                    }
							if(data.RESULT > 0){
								try{
									//var chkpop = window.open('/mymusic/messagepresent/popup/mymusicmessage_confirmPopup.htm', 'popup', 'app_,width=364,height=218');
									var chkpop = MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_confirmPopup.htm' ,364, 218, {'target':'childPop','scrollbars':'no'},'center','메시지완료');
//									chkpop.opener = opener;
								}catch(err){

								}
								self.close();
							}else if(data.RESULT == -4045){
								alert("차단된 회원입니다.\n최신버전의 멜론 모바일앱 음악메시지 설정 > 차단해제 후, 발송 가능합니다.");
								$('#d_ok').attr('disabled', false);
								return;
							}else if(data.RESULT == -4046){
								alert("죄송합니다.\n관리자에 의해 메시지 발송이 제한되었습니다.\n1:1 문의하기를 통해 제한 해제를 요청해주세요.");
								$('#d_ok').attr('disabled', false);
							}else{
								alert("음악메시지 전송을 실패하였습니다.");
							}
						},
	                     error : function (request, status, errorThrown){
	                    	 alert("서비스 응답이 없습니다.");
	                    	 $('#d_ok').attr('disabled', false);
	                     }
					});
				}
				loadSong();

			},

			initMultiAddSong: function(menuId){
				$('#d_ok').on('click', function(){
					$('#d_ok').attr('disabled', true);

					var	$con = $('div.chic_frend'),
						$tab = $con.find('>ul'),
						$friendBox = $('div.d_friend_box'),
						$friendList = $friendBox.find('ul.d_friend_list'),
						$rows0 = $friendList.find('input[name=friendNo]'),
						frienddata = []; //친구데이터

					var $con1 = $('div.recm_music'),
						$rows1 = $('div.text_insert'),
						simplemsg = $con1.find('#d_hidden_emo').val(), //메세지형태
						msg = $rows1.find('#d_message').val(); //메세지

					var contsId = $('div.popup_cntt').find('#contsId').val();
					var contsType = $('div.popup_cntt').find('#contsType').val();

					$rows0.each(function(){
						if($(this).val() != 0){
							frienddata.push($(this).val());
						}
					})

					if(frienddata.length == 0){
						alert('친구를 선택해 주세요.');
						$('#d_ok').attr('disabled', false);
						return;
					}

					if(msg.length == 0){
						alert('메시지를 입력해 주세요.');
						$('#d_ok').attr('disabled', false);
						return;
					}

					if(msg == "메시지를 입력해 주세요."){
						alert('메시지를 입력해 주세요.');
						$('#d_ok').attr('disabled', false);
						return;
					}

					if(frienddata.length > 10){
						alert('한 번에 최대 10명에게만 음악메시지 전송이 가능합니다.');
						$('#d_ok').attr('disabled', false);
						return;
					}

   				 var checkProhibit = false ;
   				 var anrChk = "N";
   				    if(msg.length > 0){
		                $.ajax({
		                     type : "POST",
		                      url  : "/mymusic/common/mymusiccommon_checkRestrictWord.json" ,
		                     async : false,
		                     data : {inputStr : encodeURIComponent(msg)},
		                     success : function(result){
		                            if(result.result == true){
		                                alert( "작성하신 글 중 "+result.message+ "은 금칙어 입니다. 수정 후 등록해주세요." );
		                                $('#d_ok').attr('disabled', false);
		                                checkProhibit = true;
		                           }
		                     },
		                     error : function (request, status, errorThrown){
		                    	 alert("서비스 응답이 없습니다");
		                    	 $('#d_ok').attr('disabled', false);
		                    	 anrChk = "Y";
		                     }
		                });

		                if(checkProhibit){
		                      return;
		                }
		            }
//   				    msg = msg.replace(/\n/gi,"<br/>");
					//opener.MELON.WEBSVC.PubSub.trigger('sendsongs.mypage', [simplemsg], [msg], [frienddata], [songdata]);
   				    if(anrChk != "Y"){
   				    	addMultiMessage(simplemsg, msg, frienddata, contsId, contsType);
   				    }
					//self.close();
				});
				function addMultiMessage(simplemsg, msg, frienddata, contsId, contsType){
					$.ajax({
						url: '/mymusic/messagepresent/mymusicmessage_insert.json',
						data: {
							 simplemsg  : simplemsg
							,msg        : encodeURIComponent(msg)
							,frienddata : frienddata
							,contsId    : contsId
							,contsType  : contsType
						},
						success : function(data){
							if(data.msgChk == -501){
			                    alert( "작성하신 글 중 "+data.message+ "은 금칙어 입니다. 수정 후 등록해주세요." );
			                    return;
		                    }
							if(data.RESULT > 0){
								try{
									//parent.opener.location.reload();
//									var chkpop = window.open('/mymusic/messagepresent/popup/mymusicmessage_confirmPopup.htm', 'popup', 'app_,width=364,height=218');
									var chkpop = MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_confirmPopup.htm' ,364, 218, {'target':'childPop','scrollbars':'no'},'center','메시지완료');
//									chkpop.opener = opener;
								}catch(err){

								}
								self.close();
							}else if(data.RESULT == -4045){
								alert("차단된 회원입니다.\n최신버전의 멜론 모바일앱 음악메시지 설정 > 차단해제 후, 발송 가능합니다.");
								$('#d_ok').attr('disabled', false);
								return;
							}else if(data.RESULT == -4046){
								alert("죄송합니다.\n관리자에 의해 메시지 발송이 제한되었습니다.\n1:1 문의하기를 통해 제한 해제를 요청해주세요.");
								$('#d_ok').attr('disabled', false);
							}else{
								alert("음악메시지 전송을 실패하였습니다.");
							}
						},
	                     error : function (request, status, errorThrown){
	                    	 alert("서비스 응답이 없습니다.");
	                    	 $('#d_ok').attr('disabled', false);
	                    	 return;
	                     }
					});
				}

			},

			// 친구찾기 팝업
			initFriend: function(bfriCnt,bfriend_no,menuId,memberKey) {
				var	friendCount = 10,
                	me = this,
                	$con = $('div.add_frend'),
                    $tab = $('#d_tab'),
                    $addedCount = $('#d_added_count'),
                    $addedTable = $('#d_tab > li.on tbody'),//140403_수정
                    $activeTab = $tab.find('>li.on'),
                    $activeTable = $activeTab.find('tbody'),
                    $kwdInput = $('#d_kwd'),
                    tabModes = ['friend', 'search'],
                    tabMode = tabModes[0],
                    isLoading = false,
                    addedFriendData = [],

                    lastIds = {
                        'friend': 0,
                        'search': 0
                    };
				var lastId;

				//라디오 버튼 클릭시
				$('input[name="frend_c"]').click(function() {
					loadFriend();
				});

				$("#friend_c").change(function() {
					loadFriend();
				});

				 // 이미 추가된 항목인지 체크
                function isAddedFriend(friendId) {
                    return $addedTable.find('input:checkbox[value=' + friendId + ']').length > 0;
                }

                // 테이블 활성화
                function enableTable(b) {
                    $activeTable.find('tr:not(.d_no_data)')[b ? 'noop' : 'remove']();
                    $activeTable.find('tr.d_no_data')[b ? 'hide' : 'show']();
                    $activeTab.find('button.more').prop('disabled', !b)[b ? 'removeClass' : 'addClass']('disabled');
                }

				// 리스트 조회
				function loadFriend(more) {
					if(isLoading) { return; }

					var params = {},
						href = '';
					if(tabMode === 'search'){
						if($kwdInput.trimVal() === '') {
							alert('검색어를 입력해주세요.');
							$kwdInput.focus();
							return;
						}
						href = $activeTab.find('div.song_sort a.on').attr('href');
						params.searchKeyword = $kwdInput.trimVal();
					} else {
						href = $activeTab.find('>a').attr('href');
					}

					if(!more){
//						$activeTable.find('tr.d_item').remove();
//						//$activeTable.find('tr.data_ynlk').hide();
//						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
						$activeTable.find('tr:not(d_no_data)').hide();
					} else {
						params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
						lastId = lastIds[tabMode];
					}

					isLoading = true;

					var gubunCode = $('input[name="frend_c"]:checked').val()
					var originCode = $('#friend_c option:selected').val();
					params.gubunCode = gubunCode;
					params.originCode = originCode;

					$.ajax({
						url: href,
						data: params,
						method: 'post'
//						,dataType: 'json'
						,beforeSend: function(){ $activeTab.find('.loading_wrap').show();}// 140221 add
					}).done(function(html) {
						if(!more){
							$activeTable.find('tr:not(.data_ynlk)').hide();
							$activeTable.find('tr').remove();
						}

						if(tabMode === 'search'){
							enableTable(true);
						}
						$activeTable.append(html);

						$activeTab.find('.loading_wrap').hide(); // 140221 add

						if(tabMode === 'search'){
							 if($activeTable.find('tr').length > 0){
								$activeTable.find('tr.data_ynlk').hide();
							}else{
								$activeTable.append('<tr class="data_ynlk"><td colspan="2">검색 결과가 없습니다</td></tr>');
//								$activeTable.find('tr.data_ynlk').html('<td colspan="2">검색 결과가 없습니다</td>');
								$activeTable.find('tr.data_ynlk').show();
							}
						}else{
							if($activeTable.find('tr').length > 0){
								$activeTable.find('tr.data_ynlk').hide();
							}else{
								$activeTable.append('<tr class="data_ynlk"><td colspan="2">친구가 없습니다</td></tr>');
//								$activeTable.find('tr.data_ynlk').html('<td colspan="2">친구가 없습니다</td>');
								$activeTable.find('tr.data_ynlk').show();
							}
						}
						//numbering();


						// 다음 목록을 가져오기 위한 기준키를 보관
						if($activeTable.find('tr:last input.d_last_id').val() != undefined){
							lastId = parseInt($activeTable.find('tr:last input.d_last_id').val());
							lastIds[tabMode] = lastId;
						}
						var isHasMore = $activeTable.find('tr:last input.isHasMore').val();
						var totCount = $activeTable.find('tr:last input.totCount').val();

						if(lastId < 1){
							$('button.btn_move').prop('disabled', true).addClass('disabled');
						}

						if(tabMode == 'search'){
							if(totCount == undefined){
								$('button.d_get_more').hide();
							}else if(lastId >= totCount) {
								$('button.d_get_more').hide();
							}else{
								$('button.d_get_more').show();
							}
						}else{
							if(isHasMore!='true') {
								$('button.d_get_more').hide();
							}else{
								$('button.d_get_more').show();
							}
						}
					}).fail(function(){
						  enableTable(false);
	                      $activeTab.find('.loading_wrap').hide(); // 140221 add
					}).always(function(){
						isLoading = false;
					});
				}

				 function disableAddedRow($row, b) {
	                    //b = b !== false;
	                    //$row[b ? 'addClass' : 'removeClass']('disabled').find('input, button').prop('disabled', b)[b ? 'addClass' : 'removeClass']('disabled');
	                }

	                // 탭기능
	                $tab.tabs({
	                    type: 'parent-on',
	                    condition: $('#d_tab'),//140407_추가
	                    selectors: {tabs: '>li>a'},//150422_add
	                    msgBefore:'선택하신 친구를 추가하지 않고 \r\n다른 탭으로 이동하실 경우 선택했던 내역이 사라집니다. \r\n이동하시겠습니까?',//140407_추가
	                    onSelected: function(e, index) {
	                        tabMode = tabModes[index];
	                        $activeTab = $tab.find('>li.on');
	                        $activeTable = $tab.find('>li.on tbody');

	                        switch(index) {
	                        case 0:
	                            loadFriend();
	                            break;
	                        }
	                        $tab.find('tr').removeClass('check');//140407_추가
	                        $tab.find('input:checkbox').removeAttr('checked');
	                        $kwdInput.val('');//140407_추가
	                        //140407_추가
	                        if (tabMode !== 'search') {
	                            var searchTab = jQuery.inArray( 'search', tabModes)
	                            $tab.find('li').eq(searchTab).find('tbody').html('<tr class="data_ynlk d_no_data">\n<td colspan="2">검색창에 친구를 검색해 주세요.</td>\n</tr>');
	                        };
	                        if (tabMode === 'search') {
	                        	//IE9 이전 버전 placeholder 문제로 인해 추가
	                        	if(MELON.WEBSVC.browser.isIE && MELON.WEBSVC.browser.version <= 9){
	                        		$tab.find('#d_kwd').focus(function(){
	                                    if($tab.find('#d_kwd').val()==$tab.find('#d_kwd').attr("placeholder")) $tab.find('#d_kwd').val("");
	                                }).blur(function(){
	                                    if($tab.find('#d_kwd').val()=="") $tab.find('#d_kwd').val($tab.find('#d_kwd').attr("placeholder"));
	                                }).blur();
	                        	}
	                        	$('button.d_get_more').hide();
	                        };
	                        //140407_추가
	                    }
	                });

	                // 더보기
	                $con.on('click', 'button.more', function() {
	                    if(tabMode === 'mobile'){ return; }
	                    loadFriend(true);
	                });

	                // 맨위로버튼
	                $con.on('click', 'button.top', function() {
	                    if(tabMode === 'mobile'){ return; }
	                    $activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
	                });

	                // 검색어 입력칸에서 엔터키를 눌렀을 때
	                $kwdInput.on('keypress', function(e) {
	                    if(e.keyCode === 13){
	                    	$('#d_btn_search').triggerHandler('click');
	                    }
	                });

	                // 검색 버튼
	                $('#d_btn_search').on('click', function() {
	                	$activeTab.find('div.song_sort a:eq(0)').trigger('click');
	                });

	                // 검색탭 내의 소팅 링크
	                $con.on('click', 'li.list2 div.song_sort a', function(e) {
	                	e.preventDefault();
	                    if($kwdInput.trimVal() === '') {
	                        alert('검색어를 입력해주세요.');
	                        $kwdInput.focus();
	                        return;
	                    }

	                    if($kwdInput.trimVal().length < 2){
	                    	alert("멜론 친구 닉네임은 두 글자 이상만 검색 가능합니다.");
	                    	return;
	                    }

	                    $(this).activeRow('on');
	                    loadFriend();
	                });

	                // 체크된 row 활성화
	                $con.on('click', 'tbody input:checkbox', function(e) {
	                    var $this = $(this);
	                    $this.trigger('changed');
	                }).on('changed', 'tbody input:checkbox', function(e) {
	                    var $this = $(this);
	                    $this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('check');
	                });

	                // 부모페이지에 친구 추가
	                $('.popup').on('click','#d_btn_add', function() {

	                    var $items = $('#d_tab > li.on tbody').find('tr.check'),
	                        addedFriends = [];

	                    if($items.length === 0){
	                    	alert("친구를 선택해주세요.");
	                    	return;
	                    }

	                    if($items.length === 0 && $('.d_mobile_no').val().replace(/\s/g,"").length == 0) {
	                        alert('선택된 친구가 없습니다.');
	                        return;
	                    }
	                    if($items.length >= friendCount + 1) {
	                        alert('한 번에 최대 '+friendCount+'명에게만 음악메시지 전송이 가능합니다.')
	                        return false;
	                    }

//	                    if(navigator.userAgent.indexOf('Firefox')>0){
	                    	var sumCount = 0;//총인원카운트
                    		var chkCount = 0;//중복카운트
                         	var chkKeyCount = 0;//멤버키카운트
                         	var chkSpaceCount = 0;//공백카운트
                         	var chkStatusCount = 0;//memberStatus카운트
                         	$items.each(function() {
                         		var $tr = $(this),
	                                no = $tr.find('input:checkbox').val(),
	                                name = $tr.find('.d_user_nicnm').text(),
	                            	memberStatus = $tr.find('.memberStatus').val();
                              	for(var j=0; j<bfriCnt; j++){
                              		if(no == bfriend_no[j]){
                                 		chkCount++;
                                 	}
                                 	if(no == memberKey){
                                 		chkKeyCount++;
                                 	}
                                }
                                if(name == '' && no == ''){
                                	chkSpaceCount++;
                                }
                                else if(memberStatus != '0'){
                                	chkStatusCount++;
                                }
                            });
                         	if(chkCount == $items.length){
                      			alert("이미 추가된 친구 입니다.");
                      			return;
                         	}
                         	if(chkKeyCount > 0){
                         		alert("회원 본인을 수신자로 선택할 수 없습니다.");
                 				return;
                         	}
                         	sumCount = ($items.length - 0) + (bfriCnt - 0) - (chkCount - 0);
//                         	alert($items.length+"/"+bfriCnt+"/"+chkCount);
                         	if(sumCount >= friendCount + 1) {
                         		alert("한 번에 최대 "+friendCount+"명에게만 음악메시지 전송이 가능합니다.");
                         		return;
                         	}
                         	if(chkSpaceCount > 0){
                         		 alert("탈퇴한 회원 입니다.");
                         		 return;
                         	}
                         	if(chkStatusCount > 0){
                         		 alert("탈퇴한 회원 입니다.");
                         		 return;
                         	}

                         	$items.each(function() {
                             	var $tr = $(this),
                                     no = $tr.find('input:checkbox').val(),
                                     name = $tr.find('.d_user_nicnm').text(),
                                 	 memberStatus = $tr.find('.memberStatus').val();
                                addedFriends.push({
                                     friendNo: no,
                                     nickName: name,
                                     memberStatus: memberStatus
                                });
                             });
//	                    }
//	                    else{
//	                    	$items.each(function() {
//		                        var $tr = $(this),
//		                            no = $tr.find('input:checkbox').val(),
//		                            name = $tr.find('.d_user_nicnm').text(),
//		                            memberStatus = $tr.find('.memberStatus').val();
//		                        addedFriends.push({
//		                            friendNo: no,
//		                            nickName: name,
//		                            memberStatus: memberStatus
//		                        });
//		                    });
//	                    }

	                    opener.focus();
	                    opener.MELON.WEBSVC.PubSub.trigger('addfriends.mypage', [addedFriends]);
	                });

	                loadFriend();
			},

			 openPopup: function(url) {
	                WEBSVC.util.openPopup(url, 400, 550);
	            }
		};
	});

	//20131118 선물하기 kbc
	WEBSVC.define('WEBSVC.Mypage.SendPresent', function(){
		var URL_ADDFRIEND_POPUP = 'popup/mymusicpresent_listFriend.htm?flag=Y';
		var URL_ADDFRIEND_SONG_POPUP = 'popup/mymusicpresent_listFriend.htm';
		var pocCode = "";
		var pocCodeChk = getCookie("MPS");
		var melonPlayerChk = "MELONPLAYER";
		if(pocCodeChk != null && pocCodeChk.match("^" + melonPlayerChk) == melonPlayerChk){
			pocCode = "WP42";
		}

		return {
			// 선물메세지 보내기 팝업
			init: function(){

				// 메세지 입력창
				$('#d_message').textControl({
					counting: true,
					countType: 'char',
					limit: 160,
					limitTarget: '#d_text_count'
				});

			},

			initAddSong: function(bsongCnt,songIdsArr0,songNameArr0,artistNamesArr0,menuId){
				var $con = $('div.chic_music_cont'),
					$tab = $con.find('div.music_tab>ul').tabs({type: 'parent-on'}),
					$kwdInput = $('#d_kwd'),
					$activeTab = $tab.find('>li.on'),
					$activeTable = $activeTab.find('tbody'),
					$addedTable = $('#d_added_table tbody'),
					tabMode = 'recent',
					isLoading = false, // ajax 로딩 플래그
					lastIds = { // 더보기인 경우 다음목록를 가져올때 기준키
						'recent': 0,
						'like': 0,
						'search': 0
					}; // 검색어
				var lastId;

				if(bsongCnt > 0){
					var presentChk = "Y";
					$.ajax({
						url: '/mymusic/common/mymusiccommon_songSimple.htm',
						data: {songIdsArr0 : songIdsArr0.join(), presentChk : presentChk}
					}).done(function(html) {
						$activeTable.empty();
						$activeTable.append(html);
						var $items = $activeTable.find('input:checkbox');
						$items.each(function(){
							addSong($(this).closest('tr'));
						});
						$activeTable.empty();
						var $row = $(['<tr class="d_no_data"><td colspan="5" class="data_ynlk"><div class="wrap">최근 들은 곡이 없습니다.</div></td></tr>'].join(''));
						$activeTable.append($row);
						loadSong();
					});
				}

				loadSong();

				// 오른쪽에 곡 추가
				function addSong($tr) {
					var val = $tr.find('input:checkbox').val();
					if($addedTable.find('input:checkbox[value=' + val + ']').length > 0) {
						return;
					}

					if($addedTable.find('tr.d_added').length >= 50) {
						alert('한 번에 최대 50곡까지만 선물 가능합니다.');
						return false;
					}

					var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added'),
					$cols = $row.children('td'); // 131023_수정 : jquery 버그
					//$cols = $row.find('td');

					$cols.eq(0).find('input:checkbox').prop('checked', false);
					var strSong = $row.find('td:eq(1)').find('a').html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
					$cols.eq(1).find('a').html(strSong);
					$cols.eq(2).find('div.d_layer').hideLayer();
					$cols.eq(2).find('a').each(function(){
						var strArtist = $(this).html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
						$(this).html(strArtist);
					});
					$cols.eq(3).remove();
					$cols.eq(4).find('button').attr('title', function(){ return (this.title||'').replace(/추가$/, '삭제'); })
						.replaceClass('add_music', 'delt_music').children().text('삭제');

					$addedTable.append($row).trigger('addedlistchanged', ['added', $row]);
				}

				// 오른쪽에서 곡 삭제
				function removeSong($tr) {
					$tr.remove();
					$addedTable.trigger('addedlistchanged', ['removed'])
				}

				// 곡리스트 조회
				function loadSong(more) {
					if(isLoading) { return; }
					$con.find('.d_checkall').attr("checked",false);
					var href = '',
						params = {};

					switch(tabMode){
					case 'recent':
						href=$tab.find('>li:eq(0)>a').attr('href');
						break;
					case 'like':
						href=$tab.find('>li:eq(1) div.song_sort a.on').attr('href');
						break;
					case 'search':
						href=$tab.find('>li:eq(2) div.song_sort a.on').attr('href');
						break;
					}
					isLoading = true;
					if(tabMode === 'search'){
						params.kwd = $kwdInput.trimVal();
					} else if(tabMode === 'like'){
						params.filter = $activeTab.find('select').val();
					}

					if(!more){
						$activeTable.find('tr.d_item').remove();
						//$activeTable.find('tr.d_no_data').hide();
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					} else {
						params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
						lastId = lastIds[tabMode];
					}

					if(tabMode == 'like' && $('#likeSongArtist').find('option').length == 1){
						$.ajax({
							url: '/mymusic/common/mymusiccommon_listSongArtist.json',
							data: params,
							dataType: 'json'
						}).done(function(json) {
							if(json.artistListCount > 0){
								var artistList = json.artistList;
								var jobstr = '';
								var jobjson = '';
								for(var i=0; i < artistList.length; i++) {
									jobstr=JSON.stringify(artistList[i])
									jobjson=JSON.parse(jobstr)
									$('#likeSongArtist').append('<option value=\"'+jobjson.ARTISTID+'\">'+jobjson.ARTISTNAMEWEBLIST+'</option>');
								}
							}
						});
					}

					$.ajax({
						url: href,
						data: params
						,beforeSend: function(){ $activeTab.find('.loading_wrap').show(); }// 140221 add
						//,dataType: 'json'
					}).done(function(html) {
						$activeTable = $activeTab.find('tbody');
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
						// 더보기 모드 여부
						if(!more){
//							$activeTable.find('.d_no_data').remove();
							if($activeTable.find('tr').length > 1){
								$activeTable.find('tr:not(.d_no_data)').remove();
								$activeTable.find('tr.d_no_data').hide();
							}else{
								$activeTable.find('tr.d_no_data').show();
							}
						}
						$activeTable.append(html);
						if(tabMode === 'search'){
							$activeTab.find('.loading_wrap').hide(); // 140221 add
						}
						if($activeTable.find('tr').length > 1){
							$activeTable.find('tr.d_no_data').hide();
						}else{
							$activeTable.find('tr.d_no_data').show();
							if(tabMode === "search"){
								$activeTable.find('#songNone').text('검색 결과가 없습니다.');
							}
						}
						//numbering();
						//lastId = 0;
						// 다음 목록을 가져오기 위한 기준키를 보관
						if($activeTable.find('tr:last input.d_last_id').val() != undefined){
							lastId = parseInt($activeTable.find('tr:last input.d_last_id').val());
							lastIds[tabMode] = lastId;
						}
						var isHasMore = $activeTable.find('tr:last input.isHasMore').val();
						if(lastId < 1){
							$('button.btn_move').prop('disabled', true).addClass('disabled');
						}
						if(isHasMore!='true') {
							$('button.more').hide();
						}else{
							$('button.more').show();
						}
						$activeTab.find('.loading_wrap').hide();
					}).fail(function(){
						// error
					}).always(function(){
						isLoading = false;
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					});
				}

				// 탭을 선택시 활성화된 테이블로 교체
				$tab.on('selected', function(e, index) {
					$con.find('.d_checkall').attr("checked",false);
					$con.find('.a_checkall').attr("checked",false);
					switch(index){
					case 0: tabMode = 'recent'; break;
					case 1: tabMode = 'like'; break;
					case 2: tabMode = 'search'; break;
					}

					$activeTab = $tab.find('>li.on');
					$activeTable = $activeTab.find('tbody');
					if(index < 2){ // 검색창은 바로 조회되면 안됨
						loadSong();
					}else{
//						if($activeTable.find('tr').length > 1 && $kwdInput.trimVal() != ''){
//							loadSong();
//						}
						$kwdInput.trimVal('');
						$activeTable.html('<tr class="d_no_data"><td colspan="4" class="data_ynlk"><div class="wrap"><span id="songNone">검색어를 입력하세요.</span></div>	</td></tr>');
						$('button.more').hide();
					}
				});

				// 아티스트 선택시
				$tab.on('change', '#likeSongArtist', function(e) {
					loadSong();
				});

				// 체크된 row 활성화
				$con.on('click', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.trigger('changed');
				}).on('changed', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('active');
				});

				$kwdInput.on('keypress', function(e) {
					if(e.keyCode === 13){
						$('#d_btn_search').triggerHandler('click');
					}
				});

				// 검색버튼
				$('#d_btn_search').on('click', function() {
					$activeTab = $tab.find('>li.on');
					$activeTab.find('div.song_sort a.on').click();
				});

				// row에 있는 +, - 클릭시
				$con.on('click', 'button.add_music, button.delt_music', function(){
					var $this = $(this);
					if($this.hasClass('disabled')) {
						return;
					}

					if($this.hasClass('add_music')) {
						if($addedTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							alert('이미 추가된 곡입니다.');
							return;
						}
						addSong($this.closest('tr'));
					} else {
						if(!confirm("삭제하시겠습니까?")){
							return;
						}
						removeSong($this.closest('tr'));
					}
				});

				// >, 추가버튼
				$con.on('click', 'button.d_add', function() {
					var $items = $activeTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('곡을 선택해주세요.');
						return;
					}
					var totCnt = 0;
					var sameSongCnt = 0;
					$items.each(function(){
						totCnt++;
						if($addedTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							sameSongCnt++;
						}

						if(addSong($(this).closest('tr')) === false){
							return false;
						}
					});
					if(totCnt == sameSongCnt){
						alert('이미 추가된 곡입니다.');
						return;
					}
				});

				// <, 삭제 버튼
				$con.on('click', 'button.d_remove', function() {
					var $items = $addedTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('곡을 선택해주세요.');
						return;
					}
					if(!confirm("삭제하시겠습니까?")){
						return;
					}
					$items.each(function(){
						removeSong($(this).closest('tr'));
					});
				});

				// 맨위로버튼
				$con.on('click', 'button.top', function() {
					$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 더보기
				$con.on('click', 'button.more', function() {
					loadSong(true);
				});

				// 윗/아래 버튼들
				$con.on('click', 'button.btn_move', function(){
					var $btn = $(this),
						$rows = $addedTable.find('tr:has(input:checked)');

					if($rows.length === 0) {
						alert('곡을 선택해주세요.');
						return;
					}

					if($btn.hasClass('up')) { // 위로
						$rows.each(function(){
							var $row = $(this);

							if($row.prev('tr:has(input:checked)').length > 0) { return; }
							$row.insertBefore($row.prev('tr:not(.d_no_data)'));
						});
					} else if($btn.hasClass('down')){ // 아래로
						Array.prototype.reverse.call($rows).each(function(){
							var $row = $(this);

							if($row.next('tr:has(input:checked)').length > 0) { return; }
							$row.insertAfter($row.next());
						});
					} else if($btn.hasClass('top')){ // 맨 위로
						$addedTable.find('tr.d_no_data').after($rows);
					} else if($btn.hasClass('bottom')){ // 맨 아래로
						$addedTable.append($rows);
					}
				});

				//
				$con.on('click', 'div.song_sort a', function(e) {
					e.preventDefault();

					if(tabMode === 'search' && $kwdInput.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwdInput.focus();
						return;
					}

					$(this).activeRow('on');
					loadSong();
				});

				$addedTable.on('addedlistchanged', function(){
					var count = $addedTable.find('tr.d_added').length;
					$('#d_added_count').html(count);

					if(count > 0) {
						$addedTable.find('tr.d_no_rows').hide();
					} else {
						$addedTable.find('tr.d_no_rows').show();
					}
				});

				$('#d_ok').on('click', function(){
					var $con1 = $('div.recm_music');

					var $rows2 = $addedTable.find('tr.d_added'),
						songdata = []; //곡데이터

					if($rows2.length === 0){
						alert('선택된 곡이 없습니다.');
						return;
					}

					$rows2.each(function(){
						songdata.push($(this).find('input[name=SONGID]').val());
					})

					if(songdata.length > 50){
						alert('한 번에 최대 50곡까지만 선물 가능합니다.');
						return;
					}

//					var $actTable = $('div.tb_list.box_scroll.d_song_list',opener.document);
//					var $atable = $actTable.find('tbody');
//					var $rows =  $atable.find('tr');
//					var rowsize = $rows.length;
//					bsongCnt,songIdsArr0
					var samecnt = 0;
					for(var j=0; j<bsongCnt; j++){
						for(var k=0; k<songdata.length; k++){
							if(songIdsArr0[j] == songdata[k]){
								samecnt++;
							}
						}
					}
//					var sumcnt = (bsongCnt - 0) + (songdata.length - 0) - (samecnt - 0);
////					alert(bsongCnt +"+"+ songdata.length +"-"+ samecnt);
//					if(sumcnt > 50){
//						alert("한 번에 최대 50곡까지만 선물 가능합니다.");
//						return;
//					}

//					if(( (bsongCnt - 0) + (songdata.length - 0) ) > 50){
//						alert('한 번에 최대 50곡까지만 선물 가능합니다.');
//						return false;
//					}
					opener.focus();
					opener.MELON.WEBSVC.PubSub.trigger('addsongs.mypage', [songdata]);
					self.close();
				});
//				loadSong();

			},

			// 친구찾기 팝업
			initFriend: function(bfriCnt,bfriend_no,tabflag,menuId,memberKey) {
				var	 friendCount = 10;
				if(tabflag == 'Y'){
					friendCount = 5;
				}
				var	 me = this,
	                 $con = $('div.add_frend'),
	                 $tab = $('#d_tab'),
	                 $addedCount = $('#d_added_count'),
	                 $addedTable = $('#d_tab > li.on tbody'),//140403_수정
	                 $activeTab = $tab.find('>li.on'),
	                 $activeTable = $activeTab.find('tbody'),
	                 $kwdInput = $('#d_kwd'),
	                 tabModes = ['recent', 'friend', 'search', 'mobile'],
	                 tabMode = tabModes[0],
	                 isLoading = false,
	                 addedFriendData = [],

	                 lastIds = {
	                    'recent': 0,
	                    'friend': 0,
	                    'search': 0
	                 };
				var lastId;
				// 이미 추가된 항목인지 체크
				function isAddedFriend(friendId) {
					return $addedFriends.find('input:checkbox[value=' + friendId + ']').length > 0;
				}

				function getActiveList() {
					return $('#d_tab li.on tbody');
				}

				 // 테이블 활성화
                function enableTable(b) {
                    $activeTable.find('tr:not(.d_no_data)')[b ? 'noop' : 'remove']();
                    $activeTable.find('tr.d_no_data')[b ? 'hide' : 'show']();
                    $activeTab.find('button.more').prop('disabled', !b)[b ? 'removeClass' : 'addClass']('disabled');
                }

              //라디오 버튼 클릭시
				$('input[name="frend_c"]').click(function() {
					loadFriend();
				});

				$("#friend_c").change(function() {
					loadFriend();
				});

				// 리스트 조회
				function loadFriend(more) {
					if(isLoading) { return; }
					$('.tabChanged').val('');

					var params = {},
						href = '';
					if(tabMode === 'search'){
						if($kwdInput.trimVal() === '') {
							alert('검색어를 입력해주세요.');
							$kwdInput.focus();
							return;
						}
						href = $activeTab.find('div.song_sort a.on').attr('href');
						//href = $tab.find('>li.list3>a').attr('href');
						params.searchKeyword = $kwdInput.trimVal();
					} else {
						href = $activeTab.find('>a').attr('href');
					}

					if(!more){
						$activeTable.find('tr.d_item').remove();
						//$activeTable.find('tr.data_ynlk').hide();
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					} else {
						params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
						lastId = lastIds[tabMode];
					}

					isLoading = true;

					var gubunCode = $('input[name="frend_c"]:checked').val()
					var originCode = $('#friend_c option:selected').val();
					params.gubunCode = gubunCode;
					params.originCode = originCode;

					$.ajax({
						url: href,
						data: params,
						method: 'post'
//						,dataType: 'json'
						,beforeSend: function(){ $activeTab.find('.loading_wrap').show();}// 140221 add
					}).done(function(html) {
						$activeTable = $activeTab.find('tbody');
						if(!more){
							if(tabMode === 'search'){
								$activeTable.find('tr:not(.data_ynlk)').remove();
							}else{
								$activeTable.find('tr:not(.data_ynlk00)').remove();
							}
						}
						$activeTable.append(html);

						$activeTab.find('.loading_wrap').hide();

						if(tabMode === 'search'){
//							$activeTab.find('.loading_wrap').hide(); // 140221 add
							 if($activeTable.find('tr').length > 1){
								$activeTable.find('tr.data_ynlk').hide();
							}else{
								$activeTable.find('tr.data_ynlk').html('<td colspan="2"><div class="wrap">검색 결과가 없습니다.</div></td>');
//								$activeTable.append('<tr class="data_ynlk"><td colspan="2">검색 결과가 없습니다</td></tr>');
//								$activeTable.find('tr.data_ynlk').html('<td colspan="2">검색 결과가 없습니다</td>');
								$activeTable.find('tr.data_ynlk').show();
							}
						}else{
							if($activeTable.find('tr').length > 1){
								$activeTable.find('tr.data_ynlk00').hide();
							}else{
								if(tabMode === 'recent'){
									$activeTable.find('tr.data_ynlk00').html('<td colspan="3" class="data_ynlk"><div class="wrap">최근 선물한 친구가 없습니다.</div></td>');
	//								$activeTable.append('<tr class="data_ynlk"><td colspan="2">친구가 없습니다</td></tr>');
	//								$activeTable.find('tr.data_ynlk').html('<td colspan="2">친구가 없습니다</td>');
									$activeTable.find('tr.data_ynlk00').show();
								}else{
									$activeTable.find('tr.data_ynlk00').html('<td colspan="2" class="data_ynlk"><div class="wrap">친구가 없습니다.</div></td>');
	//								$activeTable.append('<tr class="data_ynlk"><td colspan="2">친구가 없습니다</td></tr>');
	//								$activeTable.find('tr.data_ynlk').html('<td colspan="2">친구가 없습니다</td>');
									$activeTable.find('tr.data_ynlk00').show();
								}
							}
						}

						//numbering();

						// 다음 목록을 가져오기 위한 기준키를 보관
						if($activeTable.find('tr:last input.d_last_id').val() != undefined){
							lastId = parseInt($activeTable.find('tr:last input.d_last_id').val());
							lastIds[tabMode] = lastId;
						}
						var isHasMore = $activeTable.find('tr:last input.isHasMore').val();
						var totCount = $activeTable.find('tr:last input.totCount').val();

						if(lastId < 1){
							$('button.btn_move').prop('disabled', true).addClass('disabled');
						}

						if(tabMode == 'search'){
							if(totCount == undefined){
								$('button.d_get_more').hide();
							}else if(lastId >= totCount) {
								$('button.d_get_more').hide();
							}else{
								$('button.d_get_more').show();
							}
						}else{
							if(isHasMore!='true') {
								$('button.d_get_more').hide();
							}else{
								$('button.d_get_more').show();
							}
						}
					}).fail(function(){
						// error
						enableTable(false);
                        $activeTab.find('.loading_wrap').hide(); // 140221 add
					}).always(function(){
						isLoading = false;
					});
				}

				 function disableAddedRow($row, b) {
	                    //b = b !== false;
	                    //$row[b ? 'addClass' : 'removeClass']('disabled').find('input, button').prop('disabled', b)[b ? 'addClass' : 'removeClass']('disabled');
                }

				$tab.tabs({
					type: 'parent-on',
	            	  condition: $('#d_tab'),
	                  selectors: {tabs: '>li>a'},//150422_add
	            	  msgBefore:'선택하신 친구를 추가하지 않고<br />다른 탭으로 이동하실 경우 선택했던 내역이 사라집니다. <br />이동하시겠습니까?',//140407_추가
	            	  onSelected: function(e, index,result) {
	            		  tabMode = tabModes[index];
	            		  $activeTab = $tab.find('>li.on');
//	            		  $activeTable = $activeTab.find('tbody');
	            		  $activeTable = $tab.find('>li.on tbody');

		              	switch(index) {
//		              		case 0: tabMode = 'recent'; loadFriend(); break;
		              	 	case 0: tabMode = 'recent'; loadFriend(); break;
							case 1: tabMode = 'friend'; loadFriend();break;
							case 2: tabMode = 'search'; break;
							case 3: tabMode = 'phone'; break;
		                }
                        $tab.find('tr').removeClass('check');//140407_추가
                        $tab.find('input:checkbox').removeAttr('checked');//140403_추가
                        $tab.find('.d_mobile_no').val('');//140404_추가
                        $kwdInput.val('');//140407_추가
                        //140407_추가
                        if (tabMode !== 'search') {
                            var searchTab = jQuery.inArray( 'search', tabModes)
                            $tab.find('li').eq(searchTab).find('tbody').html('<tr class="data_ynlk d_no_data">\n<td colspan="2">검색창에 친구를 검색해 주세요.</td>\n</tr>');
                        };
                        if (tabMode === 'search') {
                        	//IE9 이전 버전 placeholder 문제로 인해 추가
                        	if(MELON.WEBSVC.browser.isIE && MELON.WEBSVC.browser.version <= 9){
                        		$tab.find('#d_kwd').focus(function(){
                                    if($tab.find('#d_kwd').val()==$tab.find('#d_kwd').attr("placeholder")) $tab.find('#d_kwd').val("");
                                }).blur(function(){
                                    if($tab.find('#d_kwd').val()=="") $tab.find('#d_kwd').val($tab.find('#d_kwd').attr("placeholder"));
                                }).blur();
                        	}
                        	$('button.d_get_more').hide();
                        };
                        if (tabMode === 'phone') {
                         	//IE9 이전 버전 placeholder 문제로 인해 추가
                         	if(MELON.WEBSVC.browser.isIE && MELON.WEBSVC.browser.version <= 9){
                         		$activeTable.find('#d_mobile').focus(function(){
                                     if($activeTable.find('#d_mobile').val()==$activeTable.find('#d_mobile').attr("placeholder")) $activeTable.find('#d_mobile').val("");
                                 }).blur(function(){
                                     if($activeTable.find('#d_mobile').val()=="")$activeTable.find('#d_mobile').val($activeTable.find('#d_mobile').attr("placeholder"));
                                 }).blur();
                         	}
                    	 };

		              }
	              });

				// 맨위로버튼
				$con.on('click', 'button.top', function() {
					$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 더보기
				$('button.d_get_more').on('click', function() {
					loadFriend(true);
				});

				$kwdInput.on('keypress', function(e) {
					if(e.keyCode === 13){
						$('button.d_btn_search').triggerHandler('click');
					}
				});

				// 검색
				$('button.d_btn_search').on('click', function() {
					$('#d_tab li.list3').find('div.song_sort a:eq(0)').triggerHandler('click');
				});

				// 검색탭 내의 소팅 링크
				$('#d_tab li.list3').find('div.song_sort a').on('click', function(e) {
					e.preventDefault();
					if(tabMode === 'search' && $kwdInput.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwdInput.focus();
						$activeTable.html('<tr class="data_ynlk d_no_data">\n<td colspan="2">검색창에 친구를 검색해 주세요.</td>\n</tr>');//140407_추가
						return;
					}

					  if($kwdInput.trimVal().length < 2){
	                    	alert("멜론 친구 닉네임은 두 글자 이상만 검색 가능합니다.");
	                    	return;
	                    }

					$(this).activeRow('on');
					loadFriend();
				});

				$('.popup').on('click','#d_btn_add', function() {//140403_수정

                    var $items = $('#d_tab > li.on tbody').find('tr.check'),//140403_수정
                        addedFriends = [];

                    if($items.length === 0 && $('.d_mobile_no').val().replace(/\s/g,"").length == 0) {
                    	alert("친구를 선택해주세요.");
                    	return;
                    }

                    if($items.length >= friendCount + 1) {
                    	alert("한 번에 최대 "+friendCount+"명에게만 선물 가능합니다.");
                        return;
                    }
//                    if(navigator.userAgent.indexOf('Firefox')>0){
                    	 if ($items.length != 0) {
                         	var sumCount = 0;//총인원카운트
                    		var chkCount = 0;//중복카운트
                         	var chkKeyCount = 0;//멤버키카운트
                         	var chkSpaceCount = 0;//공백카운트
                         	var chkStatusCount = 0;//memberStatus카운트
                         	var chkMobile = 0;
                         	$items.each(function() {
                              	var $tr = $(this),
                                    no = $tr.find('input:checkbox').val(),
                                    name = $tr.find('.d_user_nicnm').text(),
                                  	memberStatus = $tr.find('.memberStatus').val();
                                  for(var j=0; j<bfriCnt; j++){
                                 	 if(no == bfriend_no[j]){
                                 		 chkCount++;
                                 	 }
                                 	 if(no == memberKey){
                                 		 chkKeyCount++;
                                 	 }
                                  }
                                  if(name == '' && no == ''){
                                	  chkSpaceCount++;
                                  }
                                  else if(!/^(?:010|011|016|017|018|019)[\d]{7,8}$/.test(no) && memberStatus != '0'){
                                	  chkStatusCount++;
                                  }
                              });
                         	if(chkCount == $items.length){
                      			alert("이미 추가된 친구 입니다.");
                      			return;
                         	}
                         	if(chkKeyCount > 0){
                         		alert("회원 본인을 수신자로 선택할 수 없습니다.");
                 				return;
                         	}
                         	sumCount = ($items.length - 0) + (bfriCnt - 0) - (chkCount - 0);
//                         	alert($items.length+"/"+bfriCnt+"/"+chkCount);
                         	if(sumCount >= friendCount + 1) {
                         		alert("한 번에 최대 "+friendCount+"명에게만 선물 가능합니다.");
                         		return;
                         	}
                         	if(chkSpaceCount > 0){
                         		 alert("탈퇴한 회원 입니다.");
                         		 return;
                         	}
                         	if(chkStatusCount > 0){
                         		 alert("탈퇴한 회원 입니다.");
                         		 return;
                         	}

                         	$items.each(function() {
                             	var $tr = $(this),
                                     no = $tr.find('input:checkbox').val(),
                                     name = $tr.find('.d_user_nicnm').text(),
                                 	memberStatus = $tr.find('.memberStatus').val();
                                 addedFriends.push({
                                     friendNo: no,
                                     nickName: name,
                                     memberStatus: memberStatus
                                 });
                             });
                         }else {
                         	if($('.d_mobile_no').val().replace(/\s/g,"").length == 0 || $('.d_mobile_no').val() == "“-”자 없이 입력" ){
                         		 alert('친구를 선택해주세요.');
                                  return;
                         	}else{
                         		var pchk = escape($('.d_mobile_no').val());
             				    var numchk = 0;
             				    var mChk = 0;
             				    if(pchk.match(/^\d+$/ig) == null){
             				    	numchk = -1;
             				    }

             				    if(pchk.length < 10 && numchk == 0){
             						alert("휴대폰 번호는 10자리 이상 입력하셔야 합니다.");
             						$('.d_mobile_no').focus();
             						return;
             					}

             					if(!/^(?:010|011|016|017|018|019)[\d]{7,8}$/.test($('.d_mobile_no').val())){
             						alert('휴대폰 번호가 잘못 되었습니다.');
             						$('.d_mobile_no').focus();
             						return;
             					}
             					for(var j=0; j<bfriCnt; j++){
                                	 if($('.d_mobile_no').val() == bfriend_no[j]){
                                		 mChk++;
                                	 }
                                }
             					if(mChk>0) {
             						alert('이미 추가된 번호입니다.');
             						return;
             					}
             					var phoneNum = 0;
             					if($('.d_mobile_no').val().length == 11){
             						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,7)+"-"+$('.d_mobile_no').val().substring(7,11)
             					}else if($('.d_mobile_no').val().length == 12){
             						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,8)+"-"+$('.d_mobile_no').val().substring(8,12)
             					}else if($('.d_mobile_no').val().length == 13){
             						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,9)+"-"+$('.d_mobile_no').val().substring(9,13)
             					}else{
             						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,6)+"-"+$('.d_mobile_no').val().substring(6,10)
             					}

                                 addedFriends.push({
                                     friendNo: $('.d_mobile_no').val(),
                                     nickName: phoneNum,
                                     memberStatus: "0"
                                 });
                         	}
                         };
//                    }
//                    else{
//                    	 if ($items.length != 0) {
//                             $items.each(function() {
//                                 var $tr = $(this),
//                                     no = $tr.find('input:checkbox').val(),
//                                     name = $tr.find('.d_user_nicnm').text(),
//                                 	memberStatus = $tr.find('.memberStatus').val();
//                                 addedFriends.push({
//                                     friendNo: no,
//                                     nickName: name,
//                                     memberStatus: memberStatus
//                                 });
//                             });
//                         }else {
//                        	 if($('.d_mobile_no').val().replace(/\s/g,"").length == 0 || $('.d_mobile_no').val() == "“-”자 없이 입력" ){
//                        		 alert('친구를 선택해주세요.');
//                                 return;
//                        	}else{
//                        		var pchk = escape($('.d_mobile_no').val());
//            				    var numchk = 0;
//            				    if(pchk.match(/^\d+$/ig) == null){
//            				    	numchk = -1;
//            				    }
//
//            				    if(pchk.length < 10 && numchk == 0){
//            						alert("휴대폰 번호는 10자리 이상 입력하셔야 합니다.");
//            						$('.d_mobile_no').focus();
//            						return;
//            					}
//
//            					if(!/^(?:010|011|016|017|018|019)[\d]{7,8}$/.test($('.d_mobile_no').val())){
//            						alert('휴대폰 번호가 잘못 되었습니다.');
//            						$('.d_mobile_no').focus();
//            						return;
//            					}
//
////            					if($addedTable.find('input:checkbox[value='+mb+']').length>0) {
////            						alert('이미 추가된 번호입니다.');
////            						$mb.focus();
////            						return;
////            					}
//            					var phoneNum = 0;
//            					if($('.d_mobile_no').val().length == 11){
//            						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,7)+"-"+$('.d_mobile_no').val().substring(7,11)
//            					}else if($('.d_mobile_no').val().length == 12){
//            						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,8)+"-"+$('.d_mobile_no').val().substring(8,12)
//            					}else if($('.d_mobile_no').val().length == 13){
//            						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,9)+"-"+$('.d_mobile_no').val().substring(9,13)
//            					}else{
//            						phoneNum = $('.d_mobile_no').val().substring(0,3)+"-"+$('.d_mobile_no').val().substring(3,6)+"-"+$('.d_mobile_no').val().substring(6,10)
//            					}
//
//                                addedFriends.push({
//                                    friendNo: $('.d_mobile_no').val(),
//                                    nickName: phoneNum,
//                                    memberStatus: "0"
//                                });
//                        	}
//                        };
//                    }

                    opener.focus();
                    opener.MELON.WEBSVC.PubSub.trigger('addfriends.mypage', [addedFriends]);
                    //self.close();
                });

				// 체크된 row 활성화
				 $con.on('click', 'tbody input:checkbox', function(e) {
	                    var $this = $(this);
	                    $this.trigger('changed');
	                }).on('changed', 'tbody input:checkbox', function(e) {
	                    var $this = $(this);
	                    $this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('check');
	                });

				loadFriend();
			},

			openPopup: function(url) {
                WEBSVC.util.openPopup(url, 834, 640);
            }
		};
	});

})(jQuery, MELON.WEBSVC, MELON.PBPGN);

/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description DJ 플레이리스트(melonweb_dj.js를 인클루드해서 하고 싶은데..세개이상 인클루드하지 말라는 요청으로 인애..그대로 복사해서 가져옴)
 */
(function($, WEBSVC, PBPGN, undefined) {
	var $doc = $(document);

	// 좋아요 처리(버블링 활용)
	WEBSVC.define('WEBSVC.DJCollection', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function() {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				// 전체선택 버튼
				$doc.on('click.djcollection', 'div.d_djcol_list button.d_checkall', function(e){
					$(this).closest('div.d_djcol_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.djcollection', '.d_djcol_list button.like, .d_djcol_list a.btn_like', function(e){
					e.preventDefault();


					// 개발에서 이 부분 작업후에 아랫 얼럿을 지워주세요.
//					alert('관련 코드는 melonweb_dj.js의 WEBSVC.DJCollection 모듈에 있습니다.');

					var $btn = $(this),
						djColNo = $btn.attr('data-djcol-no'),
						menuId = $btn.attr('data-djcol-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						defer, event;

					if(!djColNo) {
						alert('좋아요 버튼에 data-djcol-no 속성을 넣어 주세요');
						return
					}

					$btn.trigger((event = $.Event('likebefore')), [djColNo, doLike]);
					if(event.isDefaultPrevented()){ return; }

					$btn.trigger('mouseleave');

					if(isLike) {
						//if(!confirm('좋아요를 취소 하시겠습니까?')){ return; }
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
//						defer = me.dislike(djColNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(djColNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(djColNo,menuId));
						}
					} else {
						likeM(me.like(djColNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var tmpl = '';
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [djColNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));
								if($btn.is('button')){
									tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];
								} else {
									tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
								}

								$btn.html(
									tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
								);

								if($btn.attr('data-target-id')!=undefined){
									$('#'+$btn.attr('data-target-id')).html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								}

								/*doLike && WEBSVC.confirm2('좋아요 반영 되었습니다.<br />마이뮤직 &gt 좋아요에서 확인하세요.<br />내 플레이리스트에도 저장 하시겠습니까?').on('ok', function(){
									$.ajax({
										type : "POST",
										url  : "/mymusic/common/mymusiccommon_copyPlaylist.json",
										data : {plylstSeq : djColNo},
										async : false,
										success : function(data){
											if(data.result >= 0){
												WEBSVC.alert2('플레이리스트에 저장 되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
											}
											else if(data.result == -201){
												WEBSVC.alert2('플레이리스트 정보가 존재하지 않습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
											}
											else if(data.result == -606){
												WEBSVC.alert2('플레이리스트는 최대 500개까지 만드실 수 있습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
											}
											else{
												WEBSVC.alert2('플레이리스트 복사하는데 실패하였습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
											}
										}
									});
								});*/
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							} else {
								alert(json.errorMessage);
							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(djColNo,menuId){
				var defer = $.Deferred();

				if(!djColNo){ defer.reject(['DJ플레이리스트 번호가 없습니다.(좋아요 버튼에 data-djcol-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 아이디가 없습니다.(좋아요 버튼에 data-djcol-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + djColNo + '&type=djplaylist&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(djColNo,menuId) {
				var defer = $.Deferred();

				if(!djColNo){ defer.reject(['DJ플레이리스트 번호가 없습니다.(좋아요 버튼에 data-djcol-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 아이디가 없습니다.(좋아요 버튼에 data-djcol-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + djColNo + '&type=djplaylist&menuId=' + menuId, defer);

				return defer;
			}
		};
	});


	// DJ플레이리스트 정보 입력
	WEBSVC.define('WEBSVC.MyMusic.DJCollection.InfoWriter', {
		init: function(){
			var me = this,
//				$con = $('dd.gubun');
				selectImageSrc = '';

			//테마선택 레이어 로드
			$.ajax({
				url:'/mymusic/dj/popup/mymusicdjplaylistinsert_cateTypeCodeList.htm?type=theme'
			}).done(function(html){
				$('#d_thema').after(html);
				//$(html).insertAfter($('#d_thema'));
				//장르선택 레이어 로드
				$.ajax({
					url:'/mymusic/dj/popup/mymusicdjplaylistinsert_cateTypeCodeList.htm?type=gnr'
				}).done(function(html){
					$('#d_ganre').after(html);
					//$(html).insertAfter($('#d_ganre'));

					var $con = $('dd.gubun');
					// 라디오 클릭시
					$con.on('click', '>div>input[type=radio]', function(e) {
						var $radio = $(this);
						// 앞서 선택된 게 없으면 레이어팝업을 뛰운다.
						if($radio.siblings('input[type=hidden]').length === 0) {
							$radio.siblings('button').trigger('click');
						} else {
							showSelected($radio.parent(), $radio.parent().index() === 0 ? '테마' : '장르');
						}
					});

					// 레이어팝업에서 아이템 추가
					function addItem(type, name, boxClass, maxCount) {
						var $btn = $(this),
							$layer = $btn.closest('div.layer_popup'),
							$box = $layer.find('div.box_'+boxClass+'_chic ul'),
							title = $btn.find('> span:eq(1)').text(),
							no = $btn.attr('data-'+type+'-no');

						if($box.find('li').length === maxCount) {
							//alert(name + '는 '+maxCount+'개까지 선택하실 수 있습니다.');
							if(type === 'theme'){
//								alert('현재 '+name+'가 모두 선택되었습니다.');
								alert('테마는 2개까지 선택하실 수 있습니다.');
								return;
							}else{
//								alert('현재 '+name+'가 모두 선택되었습니다.');
								alert('장르는 1개까지 선택하실 수 있습니다.');
								return;
							}
						}

						if($box.find('li[data-'+type+'-no='+no+']').length > 0) {
							alert('이미 추가된 '+name+'입니다.'); return;
						}

						if(type === 'theme') {
							$box.append(['<li data-theme-no="'+no+'">',
								'<span>'+title+'</span>',
								'<button type="button" title="'+title+' 테마 삭제" class="btn_delt"></button></li>'].join(''));
						} else {
							$box.append(['<li data-genre-no="'+no+'" class="'+($btn.parent()[0].className||'')+'">',
								'<span class="icon '+boxClass+""+($btn.parent().index() + 1)+'">'+title+'</span>',
								'<button type="button" title="'+title+' 장르 삭제" class="btn_delt"></button></li>'].join(''));
						}

						$layer.trigger('addedcatelistchanged', ['added']);
					}

					// 장르/테마 선택시 선택된 항목 표시
					function showSelected($pane, title){
						var txt = [];
						$pane.find('>input[type=hidden]').each(function() {
							txt.push( $(this).attr('data-name') );
						});

						$pane.find('>input:radio').prop('checked', true);
						$pane.siblings('span.icon_noti').hide();
						$pane.siblings('span.fc_strong').html(title + ': <strong>' + txt.join(', ') + '</strong>').show();
					}

					// 모달에서 확인 클릭시
					function itemSelected($pane, type, name, $items) {
						var input = '';

						if($items.length === 0) {
							alert('선택된 '+name+'가 없습니다.');
							return false;
						}

						$items.each(function(){
							var $item = $(this);
							input += '<input type="hidden" name="cateCode" value="'+$item.attr('data-'+type+'-no')+'" data-name="'+$item.find('>span').text()+'" />';
						});
						$pane.find('>input:radio').prop('checked', true);
						//20131105 hmh 기존 hidden 이 삭제 되지 않아 추가
						$con.find('input[type=hidden]').remove();
						$pane.find('>[type=hidden]').remove().end().prepend( input );
					}

					// 모달 이벤트 바인딩
					function bindModal($target, $other, type, name, clsName, maxCount) {
						$target.find('div.layer_popup').on('modalshow', function() {
							// 초기화
							$(this).find('div.box_'+clsName+'_chic').find('>ul').empty().hide().end().find('>p').hide();
						}).on('click', 'div.collection_chic_list button', function(e) {
							// 테마 선택 시
							addItem.call(this, type, name, clsName, maxCount);
						}).on('click', 'div.box_'+clsName+'_chic ul button', function(){
							// 추가된 테마를 삭제 시
							if(!confirm('선택한 '+name+'를 삭제하시겠습니까?')){
								return;
							}
							var $item = $(this),
								$modal = $item.closest('div.layer_popup');

							$item.parent().remove();
							$modal.trigger('addedcatelistchanged', ['removed']);
						}).on('modalok', function(e){
							// 확인 클릭시 페이지에 히든폼 추가
//							if(!confirm("설정하신 내용을 저장하시겠습니까?")){return;};
							if(itemSelected($target, type, name, $(this).find('div.box_'+clsName+'_chic li')) === false){
								e.preventDefault();
								return;
							}
							showSelected($target, name);
						}).on('modalcancel', function(){
							// 취소 클릭시
							if($target.find('>input[type=hidden]').length === 0) {
								$target.find('>input[type=radio]').prop('checked', false);

								if($other.find('>input[type=hidden]').length === 0) {
									$con.find('>span.icon_noti').show();
									$con.find('>span.fc_strong').html('').hide();
								} else {
									$other.find('input[type=radio]').trigger('click');
								}
							}
						}).on('addedcatelistchanged', function(){
							//
							var $box = $(this).find('div.box_'+clsName+'_chic ul'),
								count = $box.find('>li').length;
							if(count === 0) {
								//140328_수정
								$box.hide().siblings('p').hide();
							} else {
								//140328_수정
								$box.show().siblings('p').show();
							}
						});
					}

					// 테마 레이어팝업 이벤트 바인딩 ///////////////////////////////////////////////////////////////
					var $theme = $con.find('>div:first');
					var $genre = $con.find('>div:eq(1)');

					bindModal($theme, $genre, 'theme', '테마', 'themalk', 2);
					bindModal($genre, $theme, 'genre', '장르', 'gnr', 1);
				})
			})
// start: 131122_수정
			// 이미지 등록 팝업
//			$('div.wrap_magazine_updt button.d_btn_upload').on('click', function() {
//				WEBSVC.openPopup('MY1.1.1.2.1P.3T_dev.html', 576, 640, {'scrollbars': 'no'});
//			});
// end: 131122_수정
		}
	});

	// DJ플레이리스트 선곡하기
	WEBSVC.define('WEBSVC.MyMusic.DJCollection.SongSelector', {
		// 수정 여부
		update : false,
		fame : false,
		init: function(options){
			var me = this,
				$tab = $('div.music_tab>ul').tabs({type: 'parent-on'})
				tabModes = ['playlist', 'recent', 'like', 'search'],
				tabMode = 'playlist',
				$activeTab = $tab.find('li.on'),
				$activeTable = $activeTab.find('tbody'),
				$rightTable = $('div.chic_fin tbody'),
				$kwd = $('div.serch_frend input'),		// 검색어
				$btnSearch = $('div.serch_frend button'),		// 검색 버튼
				$btnTitle = $('div.chic_fin button.d_btn_settitle'), // 타이틀 선정 버튼
				isLoading = false,
				xhr = null,	 // ajax 로딩 플래그
				menuId = $('div.chic_music_cont').attr('data-menuId'); // 메뉴Id
			var backRow = "";	// 수정시 선곡 리스트에 차례대로 넣기 위한 변수 값
			$.extend(me, options);

			// 탭 버튼 클릭시
			$tab.on('selected', function(e, index) {
				tabMode = tabModes[index];
				$activeTab = $tab.find('>li:eq('+index+')');
				$activeTable = $activeTab.find('tbody');

				if(index !== 3) {
					loadList();
				}
				//20131121 hmh 곡 검색 탭 클릭시 초기화 추가
				else {
					$kwd.trimVal('');
//					$activeTable.html('<tr class="d_no_data"><td colspan="5" class="data_ynlk"><div class="wrap">현재 검색된 곡이 없습니다.</div></td></tr>');
					$activeTable.html('<tr class="d_no_data"><td colspan="4" class="data_ynlk"><div class="wrap">현재 검색된 곡이 없습니다.</div></td></tr>');
					$activeTable.parent().find('thead input:checkbox').prop('checked', false);
					$('button.more').hide();
				}
			});

			//드롭다운이 테이블내에 위치하도록, d_scrolldiv 클래스 설정
			$('div.song_list').addClass('d_scrolldiv');

			// thead에 있는 체크박스를 클릭시, tbody에 있는 체크박스 토글링 //////////////////////////////////////////
			$('thead input:checkbox').addClass('d_checkall').on('click', function() {
				$(this).closest('table').find('tbody input:checkbox').trigger('checkboxchanged', [$(this).prop('checked')]);
			});

			// 체크된 row 활성화
			$('div.chic_music_cont').on('click', 'tbody input:checkbox:enabled', function(e) {
				e.stopPropagation();
				$(this).trigger('checkboxchanged', this.checked);
			}).on('checkboxchanged', 'div.song_list tbody input:checkbox:enabled', function(e, checked) {
				e.stopPropagation();
				var $this = $(this);
				$this.closest('tr')[checked ? 'addClass' : 'removeClass']('active');
			});
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			// 검색어폼에서 엔터키를 눌렀을 때
			$kwd.on('keypress', function(e) {
				if(e.keyCode === 13){
					$btnSearch.triggerHandler('click');
				}
			});

			// 검색버튼
			$btnSearch.on('click', function() {
				loadList();
			});

			// 플레이리스트 곡 팝업 띄우기
			$tab.find('li:first').on('click', 'tbody a', function(e) {
				e.preventDefault();
				//WEBSVC.openPopup('/mymusic/djcollection/popup/mymusicdjplaylistinsert_playlistSongListPopup.htm?plylstSeq=' + $(this).closest('tr').find('input:checkbox').val(), 560, 616);
				window.open('/mymusic/dj/popup/mymusicdjplaylistinsert_playlistSongListPopup.htm?plylstSeq=' + $(this).closest('tr').find('input:checkbox').val(),'playlistpopup', 'app_,width=560,height=680,scrollbars=yes');
			});

			// row에 있는 +, -  버튼 클릭시
			$('div.chic_music_cont').on('click', 'button.add_music:not(.disabled), button.delt_music:not(.disabled)', function(){
				var $this = $(this);
				if($this.hasClass('add_music')) {
					backRow = "";
					if(tabMode === 'playlist') {
						//20131105 hmh 플레이리스트 키값을 못가지고 와서 수정
//						addPlaylistSongs($(this).closest('tr').removeClass('active').find('input:checkbox').prop('checked', false).end().val());

						addPlaylistSongs($(this).closest('tr').find('input:checkbox').val());
					} else {

						if($rightTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							alert('중복된 곡은 한번만 선곡됩니다.');
							return;
						}

						if($rightTable.find('tr.d_added').length + 1 > 1000){
//							alert('DJ플레이리스트에는 최대 500곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
							alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
							return;
						}else{
							addSong($this.closest('tr'));
							$rightTable.trigger('addedlistchanged', ['added']);
//							alert('선택하신 곡이 DJ플레이리스트에 담겼습니다.');
						}

						//addSong($this.closest('tr'));
					}
				} else {
					if(!confirm('해당 DJ플레이리스트의 선택된 곡을 삭제 하시겠습니까?')){
						return;
					}
					removeSong($this.closest('tr'));
				}
			});

			// >, 추가버튼
			$('div.chic_music_cont').on('click', 'button.d_move_right', function() {
				backRow = "";
				if($rightTable.find('>tr.d_added').length >= 1000) {
//					alert('500곡 이상 추가하실 수 없습니다.');
					//alert('DJ플레이리스트 발행은 최소 5곡 부터 최대 500곡까지 가능합니다. \nDJ플레이리스트 발행을 위해서는 곡을 추가 혹은 삭제 해주세요.');
					alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
					return;
				}

				var $items = $activeTable.find('input:checkbox:checked');
//				if($items.length === 0) {
//					alert('선택된 항목이 없습니다.');
//					return;
//				}

				if(tabMode === 'playlist') {
					if($items.length === 0) {
						alert('선택된 플레이리스트가 없습니다. 플레이리스트를 선택해주세요.');
						return;
					}
					$items.each(function(){
						addPlaylistSongs($(this).val());
						$(this).prop('checked', false).closest('tr').removeClass('active');
					});
				} else {
					if($items.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}
					var totCnt = 0;
					var sameSongCnt = 0;

					if($rightTable.find('tr.d_added').length === 0){
						$items.each(function(){
							if(addSong($(this).closest('tr')) === false){
								return false;
							}
						});
						$rightTable.trigger('addedlistchanged', ['added']);
//						alert('선택하신 곡이 DJ플레이리스트에 담겼습니다.');
					}else{
						$items.each(function() {
							totCnt++;
							if($rightTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
								sameSongCnt++;
							}
						});

						if(totCnt == sameSongCnt){
							alert('중복된 곡은 한번만 선곡됩니다.');
							return;
						}else if(sameSongCnt > 0){
							if($rightTable.find('tr.d_added').length + (totCnt - sameSongCnt) > 1000){
//								alert('DJ플레이리스트에는 최대 500곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
								alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
								return;
							}else{
								$items.each(function(){
									if(addSong($(this).closest('tr')) === false){
										return false;
									}
								});
								$rightTable.trigger('addedlistchanged', ['added']);
								alert('이미 선택된 곡을 제외하고 추가되었습니다.');
							}
						}else{
							if($rightTable.find('tr.d_added').length + totCnt > 1000){
//								alert('DJ플레이리스트에는 최대 500곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
								alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
								return;
							}else{
								$items.each(function(){
									if(addSong($(this).closest('tr')) === false){
										return false;
									}
								});
								$rightTable.trigger('addedlistchanged', ['added']);
//								alert('선택하신 곡이 DJ플레이리스트에 담겼습니다.');
							}
						}
					}
/*					$items.each(function(){
						if($rightTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							alert('중복된 곡은 한번만 선곡됩니다.'); // 문구를 개발측에서 맞게 수정한다고 합니다.
							return false;
						}
					});

					$items.each(function(){
						if(addSong($(this).closest('tr')) === false){
							return false;
						}
					});*/
				}

				$activeTable.parent().find('thead input:checkbox').prop('checked', false);
			});

			// <, 삭제 버튼
			$('div.chic_music_cont').on('click', 'button.d_remove_right', function() {
				//var $items = $rightTable.find('input:checkbox:checked');
				var $items = $rightTable.find('tr:has(input:checked)');
				if(me.fame){
					alert('명예의 전당에 등록된 DJ플레이리스트는 곡 추가만 가능합니다.');
					return;
				}
				if($items.length === 0) {
					alert('곡을 선택해 주세요.');
					return;
				}
				if(!confirm('해당 DJ플레이리스트의 선택된 곡을 삭제 하시겠습니까?')){
					return;
				}
//				$items.each(function(){
//					removeSong($(this).closest('tr'));
//				});
				$items.remove();

				$rightTable.parent().find('thead input:checkbox').prop('checked', false);
				$rightTable.trigger('addedlistchanged', ['removed']);
			});

			// 맨위로버튼
			$('div.view_more button.top').on('click', function() {
				$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
			});

			// 더보기
			$('div.view_more button.more').on('click', function() {
				loadList(true);
			});

			// 정렬 링크 클릭시
			$tab.on('click', '>li:gt(0) div.song_sort>a', function(e) {
				e.preventDefault();
				if(tabMode === 'search' && $kwd.trimVal() === '') {
					alert('검색어를 입력해 주세요.');
					$kwd.focus();
					return;
				}

				var $this = $(this),
					thisClass = $this.addClass('on').attr('class');//140401_추가

				// 기존에 활성화되어 있던 걸 다시 링크로 변환
				$this.siblings('.on').replaceWith(function(){
					var $that = $(this),
						thatClass = $that.removeClass('on').attr('class');//140401_추가
					return '<a href="javascript:;" data-sort="'+$that.attr('data-sort')+'" title="'+$that.attr('data-title')+'" class="'+thatClass+'">'+$that.text()+'</a>';
				});
				// 링크를 strong으로 변환
				//140401_수정
                var $btn = $('<strong tabindex="0" data-sort="'+$this.attr('data-sort')+'" data-title="'+$this.attr('title')+'" class="'+thisClass+'">'+$this.text()+'</strong>');
				$this.replaceWith($btn);
				$btn.focus();

				loadList();
			});

			// 아티스트 선택시
			$tab.on('change', '#likeSongArtist', function(e) {
				loadList();
			});

			// 선곡된 리스트에 변화가 있을 시..
			$rightTable.on('addedlistchanged', function(e, type){
				var count = $rightTable.find('tr.d_added').length;
				$('div.chic_fin>div.music_tab em').html(count);

				if(count > 0) {
					$rightTable.find('tr.d_no_data').hide();
				} else {
					$rightTable.find('tr.d_no_data').show();
					count === 0 && $rightTable.parent().find('thead input:checkbox').prop('checked', false);
				}

				if(type === 'removed') {
					setTitleButtonStatus();
				}
			}).triggerHandler('addedlistchanged');

			// 체크박스의 선택에 따라 타이틀선정 버튼 토글링
			$rightTable.parent().on('click', 'input:checkbox', function() {
				setTitleButtonStatus();
			});

			// 타이틀 선정/해제
			$btnTitle.on('click', function(e) {
				var $checkedRows = $rightTable.find('tr:has(input:checked)');

				if(($btnTitle.attr('title')||'').indexOf('선정') !== -1) {
					if($checkedRows.length === 0) {
						alert('선정할 타이틀곡을 선택해 주세요.');
						return;
					} else if($checkedRows.length > 1) {
						alert('타이틀곡은 1곡만 지정가능합니다.');
						return;
					}
					// 기존 타이틀 해제
					var $oldTitle = $rightTable.find('tr.d_title');
					$oldTitle.find('input[name=title_song_no]').remove().end()
						.removeClass('d_title').find('div.td_wrap').find('span.title').remove().end().find('a').removeClass('title');
						//.removeClass('d_title').find('div.songname').find('span.title').remove().end().find('a').removeClass('title');

					// 타이틀 선정
					$checkedRows.each(function(){
						$(this).addClass('d_title').find('div.td_wrap').find('a').addClass('title').find('span.icon_play.medium').after(' <span class="icon_song title">Title</span>');
						//$(this).addClass('d_title').find('div.songname strong').after('<span class="icon_song title">Title</span> ').siblings('a').addClass('title');

						var $checkbox = $(this).find('input:checkbox');
						$checkbox.after('<input type="hidden" name="title_song_no" value="'+$checkbox.val()+'" />');
					});

				} else {
					$checkedRows.filter('.d_title').find('input[name=title_song_no]').remove().end()
						.removeClass('d_title').find('div.td_wrap').find('span.title').remove().end().find('a').removeClass('title');
						//.removeClass('d_title').find('div.songname').find('span.title').remove().end().find('a').removeClass('title');
				}
				setTitleButtonStatus();
			});

			// Up / Down 버튼
			$('div.chic_fin div.add_bg').on('click', 'button.btn_move', function(){
				var $btn = $(this),
					$rows = $rightTable.find('tr:has(input:checked)');

				if($rows.length === 0) {
					alert('곡을 선택해 주세요.');
					return;
				}

				if($btn.hasClass('up')) { // 위로
					$rows.each(function(){
						var $row = $(this);

						if($row.prev('tr:has(input:checked)').length > 0) { return; }
						$row.insertBefore($row.prev('tr:not(.d_no_data)'));
					});
				} else if($btn.hasClass('down')){ // 아래로
					Array.prototype.reverse.call($rows).each(function(){
						var $row = $(this);

						if($row.next('tr:has(input:checked)').length > 0) { return; }
						$row.insertAfter($row.next());
					});
				} else if($btn.hasClass('top')){ // 맨 위로
					$rightTable.find('tr.d_no_data').after($rows);
				} else if($btn.hasClass('bottom')){ // 맨 아래로
					$rightTable.append($rows);
				}
				//hmh 2013-12-11 순서 변경시 trigger 추가
				$rightTable.trigger('addedlistchanged', ['order']);
			});

			// 팝업에서 호출되는 핸들러
			WEBSVC.PubSub.on('playlistaddsongs', function(e, playlistNo) {
				addPlaylistSongs(playlistNo, true);
			});

			// 체크항목에 따른 버튼 텍스트 변경
			function setTitleButtonStatus() {
				var $checkedRows = $rightTable.find('>tr:has(input:checked)'),
					from = '해제', to = '선정';

				if($checkedRows.length === 1 && $checkedRows.hasClass('d_title')) {
					from = '선정', to = '해제';
				} else if($checkedRows.filter('.d_title').length > 0) {
					from = '선정', to = '해제';
				}
				$btnTitle.attr('title', ($btnTitle.attr('title')||'').replace(from, to)).find('>span>span').html('타이틀 '+to);
			}

			// 플레이리스트에 있는 곡리스트를 가져와서 오른쪽에 추가
			function addPlaylistSongs(playlistNo, isPopup) {

				if($rightTable.find('>tr.d_added').length >= 1000) {
				//	alert('500곡 이상 추가하실 수 없습니다.');
					alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
					return;
				}

				var $items = $rightTable.find('input:checkbox');

				var songList = new Array();

				$items.each(function() {
					songList.push($(this).closest('tr').find('input:checkbox').val());
				});

				if(xhr && xhr.readyState !== 4) {
					alert('조회중입니다. 잠시만 기다려 주세요.');
					return;
				}

				xhr = $.ajax({
					type : "POST",
					url: '/mymusic/dj/mymusicdjplaylistinsert_playlistSongList.htm',
					data: {
						plylstSeq : playlistNo,
						type : 'playlist'
					},
					async: false
				}).done(function(html) {
					var $items = $('<table><tbody></tbody></table>').find('>tbody').append( html ).find('>tr');

					var totCnt = 0;
					var sameSongCnt = 0;

					if($rightTable.find('tr.d_added').length === 0){
						$items.each(function() {
							if(addSong($(this)) === false){
								return false;
							}
						}).closest('table').remove();
						$rightTable.trigger('addedlistchanged', ['added']);
//						alert('선택하신 곡이 DJ플레이리스트에 담겼습니다.');
					}else{
						$items.each(function() {
							totCnt++;
							if($rightTable.find('input:checkbox[value=' + $(this).find('input:checkbox').val() + ']').length > 0) {
								sameSongCnt++;
							}
						});

						if(totCnt == sameSongCnt){
							alert('중복된 곡은 한번만 선곡됩니다.');
							return;
						}else if(sameSongCnt > 0){
							if($rightTable.find('tr.d_added').length + (totCnt - sameSongCnt) > 1000){
//								alert('DJ플레이리스트에는 최대 500곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
								alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
								return;
							}else{
								$items.each(function() {
									if(addSong($(this)) === false){
										return false;
									}
								}).closest('table').remove();
								$rightTable.trigger('addedlistchanged', ['added']);
								alert('이미 선택된 곡을 제외하고 추가되었습니다.');
							}
						}else{
							if($rightTable.find('tr.d_added').length + totCnt > 1000){
//								alert('DJ플레이리스트에는 최대 500곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
								alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
								return;
							}else{
								$items.each(function() {
									if(addSong($(this)) === false){
										return false;
									}
								}).closest('table').remove();
								$rightTable.trigger('addedlistchanged', ['added']);
//								alert('선택하신 곡이 DJ플레이리스트에 담겼습니다.');
							}
						}
					}
/*					$items.each(function() {
						if($rightTable.find('input:checkbox[value=' + $(this).find('input:checkbox').val() + ']').length > 0) {
							alert('중복된 곡은 한번만 선곡됩니다.'); // 문구를 개발측에서 맞게 수정한다고 합니다.
							return false;
						}
					});

					$items.each(function() {
						if(addSong($(this)) === false){
							return false;
						}
					}).closest('table').remove();

					if(isPopup){
						alert('플레이리스트의 수록곡이 선곡리스트에 담겼습니다.');
					}*/
				});
			}

			// 오른쪽에 곡 추가
			function addSong($tr) {
				var count = $rightTable.find('tr.d_added').length;

				if(count === 0) {
					$rightTable.find('tr.d_no_data').hide();
				}

				var $checkbox = $tr.removeClass('active').find('input:checkbox').prop('checked', false),
					val = $checkbox.val();

				if($rightTable.find('input:checkbox[value=' + val + ']').length > 0) {
//					alert('중복된 곡은 한번만 선곡됩니다.');
					return;
				}

				if($rightTable.find('tr.d_added').length >= 1000) {
				//	alert('최대 500곡까지 추가할 수 있습니다.');
					alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
					return false;
				}


				var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added');
//					$cols = $row.find('td');

				if(tabMode === 'search'){
					$row.find('td:eq(0)').find('input:checkbox').prop('checked', false);
					// 곡 검색 검색어 highlight 처리 제거
					var strSong = $row.find('td:eq(1)').find('a').html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
					$row.find('td:eq(1)').find('a').html(strSong);
					// 곡 검색 검색어 highlight 처리 제거
					$row.find('td:eq(2)').find('div.d_layer').hideLayer().find('span[class^=bullet]').attr('class', 'bullet_vertical');
					// 곡 검색 검색어 highlight 처리 제거
					$row.find('td:eq(2)').find('a').each(function(){
						var strArtist = $(this).html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
						$(this).html(strArtist);
					});
					var strAlbum = $row.find('td:eq(3)').find('a').html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
					$row.find('td:eq(3)').find('a').html(strAlbum);
					// 곡 검색 검색어 highlight 처리 제거
//					$row.find('td:eq(4)').find('button').replaceClass('add_music', 'delt_music').children().text('삭제');
				}else{
					$row.find('td:eq(0)').find('input:checkbox').prop('checked', false);
					$row.find('td:eq(2)').find('div.d_layer').hideLayer().find('span[class^=bullet]').attr('class', 'bullet_vertical');
//					$row.find('td:eq(4)').find('button').replaceClass('add_music', 'delt_music').children().text('삭제');
				}

				if(me.update){
					if(backRow == ""){
						$rightTable.find('tr.d_no_data').after($row);
					}else{
						$rightTable.find(backRow).after($row);
					}
					backRow = $row;
				}else{
					$rightTable.append($row);
				}
			}

			// 오른쪽에서 곡 삭제
			function removeSong($tr) {
				$tr.remove();
				$rightTable.trigger('addedlistchanged', ['removed'])
			}

			// 곡리스트 조회
			function loadList(more) {
				if(xhr && xhr.readyState !== 4) {
					alert('조회중입니다. 잠시만 기다려 주세요.');
					return;
				}


				var href = '',
					params = {};

				switch(tabMode){
				case 'playlist':
					href = '/mymusic/dj/mymusicdjplaylistinsert_playlistSimple.htm?menuId='+menuId;
					break;
				case 'recent':
					href= '/mymusic/common/mymusiccommon_recentSongSimple.htm?menuId='+menuId;
					params.type = 'playlist';
					break;
				case 'like':
					href='/mymusic/common/mymusiccommon_likeSongSimple.htm?menuId='+menuId;
					params.type = 'playlist';
					params.sort = $activeTab.find('div.song_sort>*.on').attr('data-sort');
					params.filter = $activeTab.find('select').val();
					break;
				case 'search':
					if($kwd.trimVal() === '') {
						alert('검색어를 입력해 주세요.');
						$kwd.focus();
						return;
					}
					href='/mymusic/common/mymusiccommon_searchListSong.htm?menuId='+menuId;
					params.type = 'playlist';
					params.sort = $activeTab.find('div.song_sort>*.on').attr('data-sort');
					params.kwd = encodeURIComponent($kwd.trimVal());
					break;
				}

				if(!href || href === '#') {
					return;
				}

				isLoading = true;
				if(more) {
					//20131105 hmh 더보기 기준키 수정
//					params.lastId = $activeTable.find('input[type=hidden].d_last_id').val(); // 더보기할 때 필요한 기준키(예: 페이지, 인덱스키 등)
					params.lastId = $activeTable.find('>tr:last input.d_last_id').val(); // 더보기할 때 필요한 기준키(예: 페이지, 인덱스키 등)
				}

				if(tabMode=='playlist' && params.lastId > 0){
					params.plylstSeq = $activeTable.find('>tr:last input:checkbox').val();
				}

				if(tabMode == 'like' && $('#likeSongArtist').find('option').length == 1){
					$.ajax({
						url: '/mymusic/common/mymusiccommon_listSongArtist.json',
						data: params,
						dataType: 'json'
					}).done(function(json) {
						if(json.artistListCount > 0){
							var artistList = json.artistList;
							var jobstr = '';
							var jobjson = '';
							for(var i=0; i < artistList.length; i++) {
								jobstr=JSON.stringify(artistList[i])
								jobjson=JSON.parse(jobstr)
								$('#likeSongArtist').append('<option value=\"'+jobjson.ARTISTID+'\">'+jobjson.ARTISTNAMEWEBLIST+'</option>');
							}
							$('select.d_selectbox').selectbox('update');
						}
					});
				}

				xhr = $.ajax({
					url: href,
					data: params,
					beforeSend: function(){ $activeTab.find('.loading_wrap').show(); }
				}).done(function(html) {
					$activeTab.find('.loading_wrap').hide();
					// 더보기 모드 여부
					if(!more){
						$activeTable.find('>tr:not(.d_no_data)').remove();
					}

					if($.trim( html ) === '' && $activeTable.find('>tr:not(.d_no_data)').length === 0) {
						// 아무것도 없으면 노데이타 문구를 표시
						$activeTable.find('>tr.d_no_data').show();
						return;
					} else {
						$activeTable.find('>tr.d_no_data').hide();
					}

					$activeTable.append( html );
					if(tabMode=='playlist' && $activeTable.find('>tr:last input.d_last_id').val()==20){
						$activeTable.html( html );
					}
					if($activeTable.find('tr').length > 1){
						$activeTable.find('tr.d_no_data').hide();
					}else{
						$activeTable.find('tr.d_no_data').show();
					}
					if(!more){
						$activeTable.parent().find('thead input:checkbox').prop('checked', false);
						$activeTable.closest('.d_scrolldiv').animate({scrollTop: 0});
					}
					//20131105 hmh 더보기 버튼 숨김을 위해 추가
					var isHasMore = $activeTable.find('>tr:last input.isHasMore').val();
					if(isHasMore!='true') {
						$('button.more').hide();
					}else{
						$('button.more').show();
					}
//					$activeTab.find('.loading_wrap').hide();
				}).fail(function(){
					// error
					$activeTab.find('.loading_wrap').hide();
				}).always(function(){
					isLoading = false;
				});
			}
			//
			loadList();
		}
	});

	// DJ플레이리스트 소개글 입력
	WEBSVC.define('WEBSVC.MyMusic.DJCollection.IntroWriter', {
		maxLength: 1000,

		init: function(){


			this._bindEvent();
		},

		_bindEvent: function() {
			var me = this,
				$box = $('div.write_cntt'),
				textarea = 'textarea:not(.d_tmp_textarea)';

			// TextControl 빌드인
			$('div.write_cntt').on('focusin', 'textarea.re_text:not(.d_textcontrol)', function(){
				$(this).addClass('d_textcontrol').textControl({autoResize: true, counting: true, limit: 1000, countType: 'char', allowPaste: true});
			});

			$box.on('addedlistchanged', function(e, type) {
				// 첨부된 총 갯수
//				$('p.text_noti strong.fc_point').text( $box.find('>div.textarea:not(.d_textbox)').length );
				$('p.text_noti strong.fc_point').text( $box.find('>div.snent_insert:not(.d_textbox)').length );
			});

			var url = '';
			var id = '';
			var searchUrl = '';
			// 첨부
			$('div.wrap_btn_atach').on('click', 'button.btn_atach', function(e) {

				var $btn = $(this);

				if($btn.hasClass('sound')) {
					id = 'artist';
					searchUrl = '/mymusic/djcollection/mymusicdjplaylistinsert_searchArtist.htm';
				} else if($btn.hasClass('photo')) {
					id = 'photo';
				} else if($btn.hasClass('video')) {
					id = 'video';
					searchUrl = '/mymusic/djcollection/mymusicdjplaylistinsert_searchMv.htm';
				}/* else if($btn.hasClass('link')) {
					url = '/mymusic/playlist/MY_link_attach.html';
				}*/

				//20131121 hmh 닫기 버튼 클릭시 초기화 설정
				if(id != 'photo') {
					$('#'+id+'Search').val('');
					$('#'+id+'View').html('<p class="search_wrong">검색된 내용이 없습니다.</p>');
				}
				else {
					if (MELON.WEBSVC.browser.isIE) {    // ie 일때 input[type=file] init.
						$("#albumImage").replaceWith( $("#albumImage").clone(true) );}
					else {    // other browser 일때 input[type=file] init.
						$("#albumImage").val("");
					}
				}

				// 초기화
				$('#selectBoxArtist').css('display','none');
				$('#selectBoxVideo').css('display','none');
				$('#artist').css('display','none');
				$('#photo').css('display','none');
				$('#video').css('display','none');
				$('#'+id).css('display','block');

				//20131121 hmh 닫기 버튼 클릭시 초기화 설정
				if(id != 'photo') {
					$('#'+id+'Search').val('');
					$('#artistView').empty();
					$('#videoView').empty();
					$('#'+id+'View').html('<p class="search_wrong">검색된 내용이 없습니다.</p>');
				}
				else {
					if (MELON.WEBSVC.browser.isIE) {    // ie 일때 input[type=file] init.
						$("#albumImage").replaceWith( $("#albumImage").clone(true) );}
					else {    // other browser 일때 input[type=file] init.
						$("#albumImage").val("");
					}
				}

			});

			// button 검색
			$('.btn_b31').click(function(e){
				search();
			});

			// enter Key 검색
			$('#artistSearch').on('keyup',function(e) {
				if(e.keyCode == 13){
					search();
					return false;
				}
			});

			$('#videoSearch').on('keyup',function(e) {
				if(e.keyCode == 13){
					search();
					return false;
				}
			});

			// 검색
			function search(){
				var searchWord = $('#'+id+'Search').val();
				if(searchWord == "" || searchWord == "검색어를 입력해 주세요"){
					alert("검색어를 입력해 주세요.");
					$('#'+id+'Search').focus();
					return;
				}
				$.ajax({
					url: searchUrl,
					data: {
						searchWord : encodeURIComponent(searchWord)
					}
				}).done(function(html) {
					$('#'+id+'View').empty();
					$('#'+id+'View').html(html);
				});
			}

			//닫기
			$('div.wrap_magazine_write').on('click', 'button.btn_close', function() {
				var id = $(this).parent().parent().attr('id');
				//20131121 hmh 닫기 버튼 클릭시 초기화 설정
				if(id != 'photo') {
					$('#'+id+'Search').val('');
					$('#'+id+'View').html('<p class="search_wrong">검색된 내용이 없습니다.</p>');
				}
				else {
					if (MELON.WEBSVC.browser.isIE) {    // ie 일때 input[type=file] init.
						$("#albumImage").replaceWith( $("#albumImage").clone(true) );}
					else {    // other browser 일때 input[type=file] init.
						$("#albumImage").val("");
					}
				}
				$('#'+$(this).parent().parent().attr('id')).css('display','none');
			});

			//사진 첨부 취소
			$('.btn_emphs02_small').on('click',function() {
				//20131121 hmh 닫기 버튼 클릭시 초기화 설정
				if (MELON.WEBSVC.browser.isIE) {    // ie 일때 input[type=file] init.
					$("#albumImage").replaceWith( $("#albumImage").clone(true) );}
				else {    // other browser 일때 input[type=file] init.
					$("#albumImage").val("");
				}
				$('#photo').css('display','none');
			});

			// 삭제
			$('div.wrap_magazine_write').on('click', 'button.btn_delt', function(){
				if(!confirm('삭제하시겠습니까?')){
					return;
				}
//				var $pane = $(this).closest('div.textarea');
				var $pane = $(this).closest('div.snent_insert');
				if(!$pane.hasClass('d_textbox')){
					// 소속된 텍스트박스도 삭제
					$pane.next('div.d_textbox').find('textarea').textControl('destroy').end().remove();
				}
				$pane.remove();

				$box.triggerHandler('addedlistchanged', ['removed']);
				$box.find(textarea+':first').trigger('textcounterchange');
			});

			// 전체 텍스트에리어의 글자 수 계산
			var $numBoard = $('.num_board');
			$box.find(textarea).placeholder();

			function getTotalLength() {
				var value = '';
				$box.find(textarea).each(function(){
					var $this = $(this);
					if($this.val() == $this.attr('placeholder')) {
						return;
					}
					value += $this.val();
				});

				return value.length;
			}

			$box.on('textcounterchange', textarea, function(){
					$numBoard.html('<strong>'+getTotalLength()+'</strong> /1000자');
				})
				.on('focusin', 'textarea', function() {
					var $txt = $(this),
						instance = $txt.textControl('instance'),
						value = '';

					$box.find(textarea).not(this).each(function(){
						var $this = $(this);
						if($this.val() == $this.attr('placeholder')) {
							return;
						}
						value += $this.val();
					});

					if(value.length >= 1000) {
						instance.textCounter.options.limit = 0;
					} else if(me.maxLength != value.length){
						// 다른 텍스트에리어의 글자수에 따라 현재 텍스트에리어의 글자수 제한 수를 변경
						instance.textCounter.options.countType = 'char';
						instance.textCounter.options.limit = me.maxLength - value.length;
					}
				})
				.find(textarea+':first').trigger('textcounterchange');

			//
		}
	});

})(jQuery, MELON.WEBSVC, MELON.PBPGN);

/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 플레이리스트 관련
 */
(function($, WEBSVC, PBPGN, undefined) {


	WEBSVC.define('WEBSVC.MyMusic.Playlist.AddSong', function(){
		return {
			// 수정 여부
			update: false,
			init: function(options){

				var me = this;
				var backRow = "";

				$.extend(me, options);

				var $con = $('div.chic_music_cont'),
					$tab = $con.find('div.music_tab>ul').tabs({type: 'parent-on'}),
					$kwdInput = $('div.serch_frend input[type=text]'),
					$btnSearch = $('div.serch_frend button'),
					$activeTab = $tab.find('>li.on'),
					$activeTable = $activeTab.find('tbody'),	//선곡 리스트
					$addedTable = $('#d_added_table tbody'),	//선택한 곡 리스트
					//tmplRow = WEBSVC.template($('#d_song_row').html().replace(/\n|\r/g, '')),

					tabMode = 'recent',
					isLoading = false, // ajax 로딩 플래그
					lastIds = { // 더보기인 경우 다음목록를 가져올때 기준키
						'recent': 0,
						'like': 0,
						'search': 0
					},
					menuId = $con.attr('data-menuId'); // 메뉴ID

				// 오른쪽에 곡 추가
				function addSong($tr) {
					var count = $addedTable.find('tr.d_added').length;

					if(count === 0) {
						$addedTable.find('tr.d_no_data').hide();
					}

					var $checkbox = $tr.removeClass('active').find('input:checkbox').prop('checked', false),
						val = $checkbox.val();
					if($addedTable.find('input:checkbox[value=' + val + ']').length > 0) {
						return;
					}

					if($addedTable.find('tr.d_added').length >= 1000) { //20131101 smlee : max 곡은 500곡임
						alert('최대 1000곡까지 추가할 수 있습니다.');
						return false;
					}

					var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added');
//						$cols = $row.find('td');

					if(tabMode === 'search'){
						$row.find('td:eq(0)').find('input:checkbox').prop('checked', false);
						// 곡 검색 검색어 highlight 처리 제거
						var strSong = $row.find('td:eq(1)').find('a').html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
						$row.find('td:eq(1)').find('a').html(strSong);
						// 곡 검색 검색어 highlight 처리 제거
						$row.find('td:eq(2)').find('div.d_layer').hideLayer();
						// 곡 검색 검색어 highlight 처리 제거
						$row.find('td:eq(2)').find('a').each(function(){
							var strArtist = $(this).html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
							$(this).html(strArtist);
						});
						var strAlbum = $row.find('td:eq(3)').find('a').html().replace(/<B>/g,'').replace(/<\/B>/g,'').replace(/<b>/g,'').replace(/<\/b>/g,'');
						$row.find('td:eq(3)').find('a').html(strAlbum);
						// 곡 검색 검색어 highlight 처리 제거
//						$row.find('td:eq(4)').find('button').attr('title', function(){ return (this.title||'').replace(/추가$/, '삭제'); })
//							.replaceClass('add_music', 'delt_music').children().text('삭제');
					}else{
						$row.find('td:eq(0)').find('input:checkbox').prop('checked', false);
						$row.find('td:eq(2)').find('div.d_layer').hideLayer();
//						$row.find('td:eq(4)').find('button').attr('title', function(){ return (this.title||'').replace(/추가$/, '삭제'); })
//						.replaceClass('add_music', 'delt_music').children().text('삭제');
					}

					if(me.update){
						if(backRow == ""){
//							$addedTable.prepend($row);
							$addedTable.find('tr.d_no_data').after($row);
						}else{
							$addedTable.find(backRow).after($row);
						}
						backRow = $row;
					}else{
						$addedTable.append($row);
					}
				}

				// 오른쪽에서 곡 삭제
				function removeSong($tr) {
					$tr.remove();
					$addedTable.trigger('addedlistchanged', ['removed']);
				}

				// 곡리스트 조회
				function loadSong(more) {
					if(isLoading) { return; }

					var href = '',
						params = {};
					//20131101 smlee :  ajax url 로 변경
					switch(tabMode){
					case 'recent':
						href = '/mymusic/common/mymusiccommon_recentSongSimple.htm?menuId='+menuId;
						params.type = 'playlist';
						break;
					case 'like':
						href='/mymusic/common/mymusiccommon_likeSongSimple.htm?menuId='+menuId;
						params.type = 'playlist';
						params.sort = $activeTab.find('div.song_sort div.fl_right>*.on').attr('data-sort');
						params.filter = $activeTab.find('select').val();
						break;
					case 'search':
						if($kwdInput.trimVal() === '') {
							alert('검색어를 입력해 주세요.');
							$kwdInput.focus();
							return;
						}
						href='/mymusic/common/mymusiccommon_searchListSong.htm?menuId='+menuId;
						params.type = 'playlist';
						params.sort = $activeTab.find('div.song_sort div.fl_right>*.on').attr('data-sort');
						params.kwd = encodeURIComponent($kwdInput.trimVal());
						break;
					}

					isLoading = true;

					if(tabMode == 'like' && $('#likeSongArtist').find('option').length == 1){
						$.ajax({
							url: '/mymusic/common/mymusiccommon_listSongArtist.json',
							data: params,
							dataType: 'json'
						}).done(function(json) {
							if(json.artistListCount > 0){
								var artistList = json.artistList;
								var jobstr = '';
								var jobjson = '';
								for(var i=0; i < artistList.length; i++) {
									jobstr=JSON.stringify(artistList[i])
									jobjson=JSON.parse(jobstr)
									$('#likeSongArtist').append('<option value=\"'+jobjson.ARTISTID+'\">'+jobjson.ARTISTNAMEWEBLIST+'</option>');
								}
								$('select.d_selectbox').selectbox('update');
							}
						});
					}

					if(!more){
						$activeTable.find('tr.d_item').remove();
						$activeTable.find('tr.d_no_data').hide();
						tabMode === 'search'&&$activeTable.find('tr.d_loading').show();
						$activeTable.parent().find('thead input:checkbox').prop('checked', false);
					} else {
						params.lastId = lastIds[tabMode]; // 더보기인 경우 기준키를 같이 보낸다
					}

					$.ajax({
						url: href,
						data: params,
						beforeSend: function(){ $activeTab.find('.loading_wrap').show(); }
						/*20131101 smlee : json이 아닌 html 형태로 변경
						dataType: 'json'
					}).done(function(json) {
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
						if(json.result) {
							// 더보기 모드 여부
							if(!more){
								$activeTable.find('tr:not(.d_no_data)').remove();
							}

							lastIds[tabMode] = json.lastId; // 더보기할 때 필요한 기준키(예: 페이지, 인덱스키 등)
							if(json.data.length) {
								for(var i = 0, len = json.data.length; i < len; i++) {

									if(tabMode === 'search'){
										json.data[i].highlightTitle = (json.data[i].title||'').replace(params.kwd, '<em>'+params.kwd+'</em>');
									} else {
										json.data[i].highlightTitle = json.data[i].title;
									}
									$activeTable.append(tmplRow(json.data[i]));
								}
							} else {
								$activeTable.find('tr.d_no_data').show();
							}
						}*/
					}).done(function(html) {
						//$activeTab = $tab.find('>li.on'),
						//$activeTable = $activeTab.find('tbody');
						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();

						if(!more){
							$activeTable.find('tr:not(.d_no_data)').remove();
						}

						$activeTable.append(html);
						//numbering();
						if($activeTable.find('tr').length > 1){
							$activeTable.find('tr.d_no_data').hide();
						}else{
							$activeTable.find('tr.d_no_data').show();
						}

						if(!more){
							$activeTable.closest('.d_scrolldiv').animate({scrollTop: 0});
						}
						lastId = 0;
						// 다음 목록을 가져오기 위한 기준키를 보관
						if($activeTable.find('tr:last input.d_last_id').val() != undefined){
							lastId = parseInt($activeTable.find('tr:last input.d_last_id').val());
							lastIds[tabMode] = lastId;
						}
						isHasMore = $activeTable.find('tr:last input.isHasMore').val();
						/*if(lastId < 1){
							$('button.btn_move').prop('disabled', true).addClass('disabled');
						}*/
						if(isHasMore!='true') {
							$('button.more').hide();
						}else{
							$('button.more').show();
						}
						$activeTab.find('.loading_wrap').hide();
					}).fail(function(){
						// error
						$activeTab.find('.loading_wrap').hide();
					}).always(function(){
						isLoading = false;
						tabMode === 'search'; // 140221 update
//						tabMode === 'search'&&$activeTable.find('tr.d_loading').hide();
					});
				}

				// 탭을 선택시 활성화된 테이블로 교체
				$tab.on('selected', function(e, index) {
					$activeTab = $tab.find('>li:eq('+index+')');
					$activeTable = $activeTab.find('tbody');

					switch(index){
					case 0: tabMode = 'recent'; break;
					case 1: tabMode = 'like'; break;
					case 2: tabMode = 'search'; break;
					}

					if(index < 2){ // 검색창은 바로 조회되면 안됨
						loadSong();
					}
					//20131121 hmh 곡 검색 탭 클릭시 초기화 추가
					else {
						$kwdInput.trimVal('');
//						$activeTable.html('<tr class="d_no_data"><td colspan="5" class="data_ynlk"><div class="wrap">현재 검색된 곡이 없습니다.</div></td></tr>');
						$activeTable.html('<tr class="d_no_data"><td colspan="4" class="data_ynlk"><div class="wrap">현재 검색된 곡이 없습니다.</div></td></tr>');
						$activeTable.parent().find('thead input:checkbox').prop('checked', false);
						$('button.more').hide();
					}
				});

				// 체크된 row 활성화
				$con.on('click', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.trigger('changed');
				}).on('changed', 'tbody input:checkbox', function(e) {
					var $this = $(this);
					$this.closest('tr')[$this.prop('checked') ? 'addClass' : 'removeClass']('active');
				});

				$kwdInput.on('keypress', function(e) {
					if(e.keyCode === 13){
						$btnSearch.triggerHandler('click');
					}
				});

				// 검색버튼
				$btnSearch.on('click', function() {
					$activeTab = $tab.find('>li.on');
					$activeTab.find('div.song_sort a.on').click();
				});

				// row에 있는 +, - 클릭시
				$con.on('click', 'button.add_music, button.delt_music', function(){
					var $this = $(this), val = '', $tr;
					if($this.hasClass('disabled')) {
						return;
					}

					$tr = $this.closest('tr');
					if($this.hasClass('add_music')) {
						backRow = "";
						val = $tr.find('input:checkbox').val();
						if($addedTable.find('input:checkbox[value=' + val + ']').length > 0) {
							alert('중복된 곡은 한번만 선곡됩니다.');
							return;
						}
						addSong($tr);
						$addedTable.trigger('addedlistchanged', ['added']);
//						alert('선택하신 곡이 플레이리스트에 담겼습니다.');
					} else {
						if(!confirm('해당 플레이리스트의 선택된 곡을 삭제 하시겠습니까?')){
							return;
						}
						removeSong($tr);
					}
				});

				// >, 추가버튼
				$con.on('click', 'button.d_move_right', function() {
					backRow = "";
					var $items = $activeTable.find('input:checkbox:checked');
					if($items.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}

/*					$items.each(function(){
						if($addedTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							alert('중복된 곡은 한번만 선곡됩니다.');
							return false;
						}
					});

					$items.each(function(){
						if(addSong($(this).closest('tr')) === false){
							return false;
						}
					});*/
					var totCnt = 0;
					var sameSongCnt = 0;

					if($addedTable.find('tr.d_added').length === 0){
						$items.each(function(){
							if(addSong($(this).closest('tr')) === false){
								return false;
							}
						});
						$addedTable.trigger('addedlistchanged', ['added']);
//						alert('선택하신 곡이 플레이리스트에 담겼습니다.');
					}else{
						$items.each(function() {
							totCnt++;
							if($addedTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
								sameSongCnt++;
							}
						});

						if(totCnt == sameSongCnt){
							alert('중복된 곡은 한번만 선곡됩니다.');
							return;
						}else if(sameSongCnt > 0){
							if($addedTable.find('tr.d_added').length + (totCnt - sameSongCnt) > 1000){
							//	alert('플레이리스트에는 최대 1000곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
								alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
								return;
							}else{
								$items.each(function(){
									if(addSong($(this).closest('tr')) === false){
										return false;
									}
								});
								$addedTable.trigger('addedlistchanged', ['added']);
								alert('이미 선택된 곡을 제외하고 추가되었습니다.');
							}
						}else{
							if($addedTable.find('tr.d_added').length + totCnt > 1000){
							//	alert('플레이리스트에는 최대 1000곡까지 담을 수 있습니다. 곡 수를 확인하시고 다시 선택해 주세요.');
								alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
								return;
							}else{
								$items.each(function(){
									if(addSong($(this).closest('tr')) === false){
										return false;
									}
								});
								$addedTable.trigger('addedlistchanged', ['added']);
//								alert('선택하신 곡이 플레이리스트에 담겼습니다.');
							}
						}
					}
					$activeTable.parent().find('thead input:checkbox').prop('checked', false);
				});

				// <, 삭제 버튼
				$con.on('click', 'button.d_remove_right', function() {
//					var $items = $addedTable.find('input:checkbox:checked');
					var $items = $addedTable.find('tr:has(input:checked)');
					if($items.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}

					if(!confirm('해당 플레이리스트의 선택된 곡을 삭제 하시겠습니까?')){
						return;
					}

//					$items.each(function(){
//						removeSong($(this).closest('tr'));
//					});
					$items.remove();

					$addedTable.parent().find('thead input:checkbox').prop('checked', false);
					$addedTable.trigger('addedlistchanged', ['removed']);
				});

				// 맨위로버튼
				$con.on('click', 'div.play_tab button.top', function() {
					$activeTab.find('div.song_list').animate({'scrollTop': 0}, 'fast');
				});

				// 더보기
				$con.on('click', 'div.play_tab button.more', function() {
					loadSong(true);
				});

				// 윗/아래 버튼들
				$con.on('click', 'div.chic_fin button.btn_move', function(){
					var $btn = $(this),
						$rows = $addedTable.find('tr:has(input:checked)');

					if($rows.length === 0) {
						alert('곡을 선택해 주세요.');
						return;
					}

					if($btn.hasClass('up')) { // 위로
						$rows.each(function(){
							var $row = $(this);

							if($row.prev('tr:has(input:checked)').length > 0) { return; }
							$row.insertBefore($row.prev('tr:not(.d_no_data)'));
						});
					} else if($btn.hasClass('down')){ // 아래로
						Array.prototype.reverse.call($rows).each(function(){
							var $row = $(this);

							if($row.next('tr:has(input:checked)').length > 0) { return; }
							$row.insertAfter($row.next());
						});
					} else if($btn.hasClass('top')){ // 맨 위로
						$addedTable.find('tr.d_no_data').after($rows);
//						$addedTable.prepend($rows);
					} else if($btn.hasClass('bottom')){ // 맨 아래로
						$addedTable.append($rows);
					}
					//hmh 2013-12-11 순서 변경시 trigger 추가
					$addedTable.trigger('addedlistchanged', ['order']);
				});

				$con.on('click', 'div.song_sort a', function(e) {
					e.preventDefault();

					if(tabMode === 'search' && $kwdInput.trimVal() === '') {
						alert('검색어를 입력해 주세요.');
						$kwdInput.focus();
						return;
					}

					$(this).activeRow('on');
					loadSong();
				});

				// 아티스트 선택시
				$tab.on('change', '#likeSongArtist', function(e) {
					loadSong();
				});

				$addedTable.on('addedlistchanged', function(){
					var count = $addedTable.find('tr.d_added').length;
					$('div.chic_fin>div.music_tab em').html(count);

					if(count > 0) {
//						$addedTable.find('tr.d_no_data').remove();
						$addedTable.find('tr.d_no_data').hide();
					} else {
//						$addedTable.find('tr.d_no_data').remove();
//						$addedTable.append('<tr class="d_no_data"><td colspan="5" class="data_ynlk"><div class="wrap">곡을 선택해 주세요.</div></td></tr>');
						$addedTable.find('tr.d_no_data').show();
						$addedTable.parent().find('thead input:checkbox').prop('checked', false);
					}
				}).triggerHandler('addedlistchanged');

				$('#d_ok').on('click', function(){
					var $rows = $addedTable.find('tr.d_added'),
						data = [];

					if($rows.length === 0){
						alert('선택된 곡이 없습니다.');
						return;
					}

					$rows.each(function(){
						data.push($(this).find('input[name=SONGID]').val());
					})

					opener.MELON.WEBSVC.PubSub.trigger('addsongs.mypage', [data]);
					self.close();
				});

				loadSong();

			},

			openPopup: function(url){
				WEBSVC.util.openPopup(url,  834, 640);
			}
		}
	});
})(jQuery, MELON.WEBSVC, MELON.PBPGN);

$(function(){
	var WEBSVC = MELON.WEBSVC;
	MELON.WEBSVC.DJCollection.init();
/*
 *  10월 28일자에 해당 내용이 없었음..
	MELON.WEBSVC.PlayList.init();

*/
	var xhr = null;
	// 좋아요 한 사람 리스트
	$(document).on('beforeshow.dropdown', 'div.userlk06', function(e) {

		var $dlg = $(this),
			$btn = $dlg.data('opener'),
			likeType = '',
			likeNo = '';

		if ( $btn.attr('data-song-no') ) {
			likeNo = $btn.attr('data-song-no');
			likeType = 'song';
		} else if ( $btn.attr('data-album-no') ) {
			likeNo = $btn.attr('data-album-no');
			likeType = 'album';
		} else if ( $btn.attr('data-mv-no') ) {
			likeNo = $btn.attr('data-mv-no');
			likeType = 'video';
		} else if ( $btn.attr('data-play-seq') ) {
			likeNo = $btn.attr('data-play-seq');
			likeType = 'playlist';
		} else if ( $btn.attr('data-user-ids') ) {
			likeNo = $btn.attr('data-user-ids');
			meYn = $btn.attr('me-yn');
			likeType = 'listenedFriend';
		} else if ( $btn.attr('data-manysong-no') ) {
			likeNo = $btn.attr('data-manysong-no');
			searchDate = $btn.attr('data-search-date');
			likeType = 'listenedFriendManySong';
		} else if ( $btn.attr('data-djplay-seq') ) {
			likeNo = $btn.attr('data-djplay-seq');
			likeType = 'djPlaylist';
		} else if ( $btn.attr('data-artistplay-seq') ) {
			likeNo = $btn.attr('data-artistplay-seq');
			likeType = 'artistPlaylist';
		} else {
			e.preventDefault();
			return;
		}

		// 처음 한번만 로드함
		//if($dlg.data('isLoaded') === true){ return; }
		$dlg.data('isLoaded', true);

		if(!likeNo){
			alert('버튼에 data-[type]-no 속성을 넣어주세요.');
			e.preventDefault();
			return;
		}

		// 화살표 위치 재조정
		$dlg.find('>span:last').css('left', Math.abs(parseInt($dlg.css('left'), 10) - $btn.position().left - $btn.width() + 14));

		$dlg.find('div.box_scroll').css({
			textAlign: 'center',
			lineHeight: '352px'
		}).html('조회 중입니다...');

		xhr && xhr.abort();

		if(likeType == 'listenedFriend'){
			xhr = $.ajax({
				url: '/mymusic/friend/mymusicfriendmusicchart_listListenedFriend.htm',
				data: {
					userIds: likeNo,
					mymusicChk: meYn
				}
			}).done(function(html) {
				$dlg.find('div.box_scroll').css({
					textAlign: '',
					lineHeight: ''
				}).html(html);
			});
		} else if(likeType == 'listenedFriendManySong'){
			xhr = $.ajax({
				url: '/mymusic/top/mymusictopmanysong_listListenedFriend.htm',
				data: {
					songId: likeNo,
					searchDate: searchDate
				}
			}).done(function(html) {
				$dlg.find('div.box_scroll').css({
					textAlign: '',
					lineHeight: ''
				}).html(html);
			});
		} else {
			xhr = $.ajax({
				url: '/mymusic/common/mymusiccommon_listUserWithLike.htm',
				data: {
					contsId: likeNo,
					type: likeType
				}
			}).done(function(html) {
				$dlg.find('div.box_scroll').css({
					textAlign: '',
					lineHeight: ''
				}).html(html);
			});
		}
	});

	// 상단의 DJ콜렉션 좋아요
	/*
	$('#conts').addClass('d_djcol_list').on('likechanged', 'button.btn_base02.like', function(e, djColNo, djColName, doLike, count) {
		e.preventDefault();

		var $btn = $(this),
			caption = doLike ? '좋아요 취소' : '좋아요';
		$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', djColName+ ' 플레이리스트 ' + caption).find('>span>span').html('<span class="icon"></span><span class="none">'+caption+'</span><span class="none">총건수</span> '+count);
	});*/

	// 배너 닫기
	$('div.wrap_baner').on('click', '.btn_close', function(){
		$(this).parent().hide();
	});

});

/*
//함께 좋아요 한 유저 10명 ajax
var listUserWithLike = function(contsId,type,dlg){
	$.ajax({
		url: '/mymusic/common/mymusiccommon_listUserWithLike.htm',
		data: {
			 contsId : contsId
			,type : type
		}
	}).done(function(html) {
		dlg.find('div.box_scroll').css({
			textAlign: '',
			lineHeight: ''
		}).html(html);
	});
};

//다중 좋아요 취소
var deleteMultiLike = function(type){
	var contsIds = '';
	$(".input_check:not(.all)").filter(function(){
		if($(this).is(":checked")){
			if($(this).attr('class') != 'input_check d_checkall'){
				if(contsIds == ''){
					contsIds = $(this).attr('data-'+type+'-no');
				}else{
					contsIds = contsIds+","+$(this).attr('data-'+type+'-no');
				}
			}
		}
	});

	if(contsIds==""){
		alert("선택된것이 없습니다.");
		return;
	}

	$.ajax({
		url: '/mymusic/common/mymusiccommon_deleteMultiLike.json',
		data: {
			 contsIds : contsIds
			,type : type
		},
		success : function(data){
			if(data.RESULT > 0){
				location.reload();
			}
		}
	});
};
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * [마이뮤직 전용 스크립트]
 * deleteMultiLike									:	다중 좋아요 취소
 * listUserWithLike								:	함께 좋아요 한 유저 10명 ajax
 * searchListSong								:	곡 검색 ajax
 * searchListArtistImage						:	아티스트명으로 이미지 찾기 ajax
 * searchListAlbumImage						:	앨범명으로 이미지 찾기 ajax
 * --------------------- facebook 관련 펑션 시작 ------------------------------------------
 * getAjaxFbIsConnect 						: 	페이스북 계정연결확인
 * getHeight 										: 	계정연결 팝업 위치 - 높이
 * getWidth 											: 	계정연결 팝업 위치 - 폭
 * popFBConnect 									: 	페이스북 계정연결 팝업호출
 * getAjaxFbFriend 								: 	페이스북 친구 불러오기
 * getAjaxFbFriendPaging 					: 	페이스북 친구 불러오기 페이징
 * closeFbFriend 									: 	페이스북 팝업  close
 * reinvitedFriend 								: 	재요청
 * invitedFriend 									: 	Facebook 친구 초대하기  추가 요청
 * doInviteFbFriend							: 실제 Facebook 친구 초대 프로세스 수행
 * showPopFbFriendConnect				: 	페이스북 친구 불러오기 페이스북 계정연결
 * showPopFbFriendReconnect			: 	페이스북 친구 불러오기 계정연결 만료
 * showPopFbFriendConnectionFail		: 	페이스북 친구 불러오기 계정연결 실패
 * showPopReinvitedFriend					: 	페이스북 친구 불러오기 친구 재요청
 * numberComma									: 	숫자 천단위 콤마 찍어주기
 * snsFacebookRequest						: 	페이스북 친구 초대후 페이스북 알림 전송.
 * popupAutoResize                          :   팝업 사이즈 조절
 *
 * getAjaxPlayList							:	플레이리스트 리스트 ajax(멤버키)
 * getAjaxLikeList							:	좋아요 리스트 ajax(멤버키,타입)
 * --------------------- facebook 관련 펑션 끝 --------------------------------------------
 */
(function() {
	MELON.WEBSVC.POC.MYMUSIC = {

		/** 다건 좋아요 취소
		 *  MELON.WEBSVC.POC.MYMUSIC.deleteMultiLike
		 *  @params type, formId , menuId
		 *  MELON.WEBSVC.POC.MYMUSIC.deleteMultiLike(type,formId,menuId)
		 */
		deleteMultiLike : function(type,formId,menuId){
			// 로그인 체크
			if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
				//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
				MELON.WEBSVC.POC.login.loginPopupLayerd('');
				return;
			}

			var str = "";
			var count = 0;
			if(type=="song"){
				str = "곡을";
			}
			else if(type=="album"){
				str = "앨범을";
			}
			else if(type=="video"){
				str = "영상을";
			}
			else if(type=="photo"){
				str = "포토를";
			}
			else if(type=="playlist"){
				str = "플레이리스트를";
			}
			else if(type=="djplaylist"){
				str = "DJ플레이리스트를";
			}
			else if(type=="partnerplaylist"){
				str = "아티스트 플레이리스트를";
			}

			var contsList = new Array();
			$('#'+formId).find('.input_check:checked').each(function(){
				if (!isNaN($(this).val())) {
					contsList.push($(this).val());
					count++;
				}
			});

			if(contsList==''){
				alert(str+" 선택해 주세요.");
				return;
			}

			if(menuId==''){
				alert("메뉴아이디가 존재하지 않습니다.");
				return;
			}

			MELON.WEBSVC.confirm2('<div class="fc_strong" style="width:225px;">'+count+'개의 '+str+' 좋아요 취소 하시겠습니까?</div>').on('ok', function(){
				$.ajax({
					url: '/mymusic/common/mymusiccommon_deleteMultiLike.json',
					data: {
						 contsIds : contsList
						,type : type
						,menuId : menuId
					},
					success : function(data){
						if(data.result === true){
							if(type=="video"){
								type = "mv";
							}
							MELON.WEBSVC.alert2('좋아요 취소되었습니다.',{opener:$(this), removeOnClose:true});
							mymusic.getAjaxLikeList(data.memberKey,type);
//							location.reload();
						}else{
							alert(data.errorMessage);
							return;
						}
					}
				});
			});

/*			if(!confirm(count+'개의 '+str+' 좋아요 취소 하시겠습니까?')){
				return;
			}

			$.ajax({
				url: '/mymusic/common/mymusiccommon_deleteMultiLike.json',
				data: {
					 contsIds : contsList
					,type : type
					,menuId : menuId
				},
				success : function(data){
					if(data.RESULT > 0){
						location.reload();
					}
				}
			});*/
		},

		listUserWithLike : function(contsId,type,dlg){
			$.ajax({
				url: '/mymusic/common/mymusiccommon_listUserWithLike.htm',
				data: {
					 contsId : contsId
					,type : type
				}
			}).done(function(html) {
				dlg.find('div.box_scroll').css({
					textAlign: '',
					lineHeight: ''
				}).html(html);
			});
		},

		//페이스북 계정연결확인
		getAjaxFbIsConnect : function(memberKey){
			$.getJSON("/mymusic/friend/mymusicfriendfacebook_informFb.json", function(data){
				if(data.ISCONNECTED == true){
					mymusic.getAjaxFbFriend(memberKey, data.ISHOMETAB); //페이스북 친구 불러오기
				}else{
					if(confirm('페이스북 계정 연결 후\n자동으로 친구를 추가하세요.\n계정연결 하시겠습니까?')){
						mymusic.popFBConnect(data.ISHOMETAB);
					}
				}
			});
		},

		//계정연결 팝업 위치
		getHeight : function(){
			return document.documentElement.clientHeight/3;
		},

		//계정연결 팝업 위치
		getWidth : function(){
			return document.documentElement.clientWidth/3;
		},

		//페이스북 계정연결 팝업호출
		popFBConnect : function(homeTab){
			var isHometab = "N";
			//홈탭이면
			if(homeTab==true)
				isHometab = "Y";
//			var opt 	= "resizable=0,width=400,height=550,top="+mymusic.getHeight()+",left="+mymusic.getWidth()+",toolbar=no, status=no,menubar=no";
			var tmpUrl 	= "http://www.melon.com/muid/sns/web/sns_inform.htm?homeTab="+isHometab;
//			window.open(tmpUrl,'fbConn',opt);
			MELON.WEBSVC.openPopup(tmpUrl,  834, 640);
		},

		//페이스북 친구 불러오기
		getAjaxFbFriend : function(memberKey, isHomeTab){
			var totFbFriendCnt = Number($("#totFbFriendCnt").val());
			var fbCnt = 1;
			//[OP2015-3611] 페이스북 친구 자동 추가로 변경
			$.getJSON("/mymusic/friend/mymusicfriendfacebook_list.json",  {memberKey : memberKey , startIndex : fbCnt} ,function(data){
				//alert('data.resultStatus :' + data.resultStatus  + "     ||   " + data.resultStatusCode );
				if(data.resultStatus == false){ //친구 불러오기 실패
					//페이스북 연결 실패 또는 알수 없는 에러 [OP2013-1418] rainus97 : Facebook 친구 초대하기(계정연결 상태 및 에러코드에 따른 메세지 변경
					if(data.resultStatusCode == '1001' || data.resultStatusCode == '1002' || data.resultStatusCode == '1003' || data.resultStatusCode == '-3'){	//계정 만료 또는 잘못된 토큰
						//mymusic.showPopFbFriendReconnect(isHomeTab);
						alert("Facebook 계정연결의\n유효기간이 만료되었습니다.\nSNS 계정연결에서 계정해제 후 다시 연결해주세요.");
					} else if (data.resultStatusCode == '1004' || data.resultStatusCode == '1100'){	//페이스북 연결 실패 또는 알수 없는 에러
						//mymusic.showPopFbFriendConnectionFail(isHomeTab);
						alert("죄송합니다.\n잠시 후 다시 시도해주세요.");
					} else if(data.resultStatusCode == '1005'){
						//mymusic.showPopFbFriendAuthFail(isHomeTab);
						alert("페이스북 권한 오류가 발생하여 친구목록을 불러올 수 없습니다.\n페이스북 계정 재연결 후 사용해 주세요.");
					}
					return false;
				}else{	//친구 자동 추가 성공
					//mymusic.mymusicLink.goFriendFacebook(memberKey);
					if(data.resultStatusCode == '0001'){
						if(confirm(data.MESSAGE)){
							mymusic.getAjaxFbFriend(memberKey, data.ISHOMETAB);
						}
					}
					else{
						alert(data.MESSAGE);
						return false;
					}
				}
			});
		},

		//페이스북 친구 불러오기 페이징
		getAjaxFbFriendPaging : function(memberKey){
			var totFbFriendCnt = Number($("#totFbFriendCntNew").val());
			var pageIndex = Number(totFbFriendCnt+1);
			var fbCnt = 1;
			var isHomeTab = false;

			$.getJSON("/mymusic/friend/mymusicfriendfacebook_listPaging.json",  {pageIndex : pageIndex, memberKey : memberKey}  ,function(data){
				if(data.resultStatus == false){ //친구 불러오기 실패
					var pocCodeChk = getCookie("MPS");
					var melonPlayerChk = "MELONPLAYER";
					if(pocCodeChk != null && pocCodeChk.match("^" + melonPlayerChk) == melonPlayerChk){
						isHomeTab = true;
					}

					//[OP2013-1418] rainus97 : Facebook 친구 초대하기(계정연결 상태 및 에러코드에 따른 메세지 변경
					if(data.resultStatusCode == '1001' || data.resultStatusCode == '1002' || data.resultStatusCode == '1003' || data.resultStatusCode == '-3'){	//계정 만료 또는 잘못된 토큰
						mymusic.showPopFbFriendReconnect(isHomeTab);
					} else if (data.resultStatusCode == '1004' || data.resultStatusCode == '1100'){	//페이스북 연결 실패 또는 알수 없는 에러
						mymusic.showPopFbFriendConnectionFail(isHomeTab);
					} else if(data.resultStatusCode == '1005'){
						mymusic.showPopFbFriendAuthFail(isHomeTab);
					}
				}else{	//친구 불러오기 성공
			 		fbCnt = totFbFriendCnt + data.fbFriendCnt;

			 		var headTitle = '친구를 모두 불러왔습니다.';
	//				var endBtn = '<a href="javascript:;" onclick="closeFbFriend();"><img src="http://image.melon.com/resource/image/cds/mymusic/web/btn_complete1.gif" alt="친구 초대 완료" /></a>';
					var fbFriendList = "";

					if(data.hasMore == true){
						 headTitle = '친구 <strong>'+mymusic.numberComma(fbCnt)+'<span>명</span></strong>을 불러왔습니다.';
	//					 endBtn = '<a href="javascript:;" onclick="mymusic.getAjaxFbFriendPaging('+memberKey+');"><img src="http://image.melon.com/resource/image/cds/mymusic/web/btn_load_more1.gif" alt="더보기" /></a>';
					}else{
						$('#fbFriendMoreBtn').hide();
					}

					if(data.fbFriendCnt > 0){
						 for(var listCnt = 0; listCnt < data.fbFriendCnt ; listCnt++){
							 var friendList = data.fbFriendList;
							 //fbFriendList = fbFriendList+'<li><img src="http://graph.facebook.com/'+friendList[listCnt].PROVIDERUSERID+'/picture" alt="" /><div>'+friendList[listCnt].DISPLAYNAME+'</div></li>'

							 if(friendList[listCnt].ISMYFRIEND == true) {						//멜론 유저이고 페북 연동됐으면서 서로 친구인 상태
								fbFriendList = fbFriendList+ '<li><dl><dt><input type="checkbox" class="input_check" title="'+friendList[listCnt].DISPLAYNAME +'- 선택" disabled="disabled" /></dt>'
													+ '<dd class="img"><img src="https://graph.facebook.com/'+friendList[listCnt].PROVIDERUSERID +'/picture?width=40&height=40" width="40" height="40" alt="'+friendList[listCnt].DISPLAYNAME +'"/></dd>'
													+ '<dd class="name disabled">'+friendList[listCnt].DISPLAYNAME +'</dd>'
													+ '<dd class="bar"><span class="ico_already"><span class="none">이미 친구에요</span></span></dd>'
													+ '<dd class="btn"><button type="button" class="btn_base02 disabled" title="'+friendList[listCnt].DISPLAYNAME +' - 초대" disabled="disabled"><span class="odd_span"><span class="even_span">초대</span></span></button></dd>'
													+ '</dl></li>';
							 } else if((friendList[listCnt].ISMELONUSER == true)) {		//멜론 유저이고 페북 연동되어 있으나 멜론 친구는 안맺은 상태
								fbFriendList = fbFriendList + '<li><dl><dt>'
													+ '<input type="checkbox" class="input_check" title="'+friendList[listCnt].DISPLAYNAME +' - 선택" name="friendId" id="check_'+friendList[listCnt].PROVIDERUSERID +'" value="'+friendList[listCnt].PROVIDERUSERID +'" value2 ="'+friendList[listCnt].MEMBERKEY +'"/></dt>'
													+ '<dd class="img"><img src="https://graph.facebook.com/'+friendList[listCnt].PROVIDERUSERID +'/picture?width=40&height=40" width="40" height="40" alt="'+friendList[listCnt].DISPLAYNAME +'"/></dd>'
													+ '<dd class="name">'+friendList[listCnt].DISPLAYNAME +'</dd>'
													+ '<dd class="bar"><span class="ico_ifs"><span class="none">계정 연동중</span></span></dd>'
													+ '<dd class="btn"><button type="button" class="btn_base02" title="'+friendList[listCnt].DISPLAYNAME +' - 초대" onclick="javascript:inviteFriend(\'friendId\', \''+friendList[listCnt].PROVIDERUSERID +'\','+friendList[listCnt].MEMBERKEY +');"><span class="odd_span"><span class="even_span">초대</span></span></button></dd>'
													+ '</dl></li>';
							 } else {																			//멜론 유저가 아닌 페북 친구들
								fbFriendList = fbFriendList + '<li><dl>'
													+ '<dt><input type="checkbox" class="input_check" title="'+friendList[listCnt].DISPLAYNAME +' - 선택" name="inviteId" id="check_'+friendList[listCnt].PROVIDERUSERID +'" value="'+friendList[listCnt].PROVIDERUSERID +'" value2 ="'+friendList[listCnt].DISPLAYNAME +'"/></dt>'
													+ '<dd class="img"><img src="https://graph.facebook.com/'+friendList[listCnt].PROVIDERUSERID +'/picture?width=40&height=40" width="40" height="40" alt="'+friendList[listCnt].DISPLAYNAME +'"/></dd>'
													+ '<dd class="name">'+friendList[listCnt].DISPLAYNAME +'</dd>'
													+ '<dd class="btn"><button type="button" class="btn_base02" title="'+friendList[listCnt].DISPLAYNAME +' - 초대" onclick="javascript:inviteFriend(\'inviteId\',\''+friendList[listCnt].PROVIDERUSERID +'\',\''+friendList[listCnt].DISPLAYNAME +'\');"><span class="odd_span"><span class="even_span">초대</span></span></button></dd>'
													+ '</dl></li>';
							 }
						 }
					}

					$("#fbFriendCnt").html(headTitle);
					$('#totFbFriendCntNew').val(fbCnt);
					$("#fbFriendListPaging").append(fbFriendList);
					//$(".fbFriendBtn").html(endBtn);

				}
			 });
		},

		//페이스북 팝업  close
		closeFbFriend : function(){
			$(".fbFriendContainer").hide();
			$('#totFbFriendCnt').val("0");
			getAjaxRightPage('myFriend');
		},

		//재요청
//		reinvitedFriend : function(invtSnsId, friendNickName, memberKey, memberNickName, menuId){
////			mymusic.showPopReinvitedFriend();
//			$.getJSON("/mymusic/friend/mymusicfriendinvited_reinvitedFriend.json",  {invtSnsId: invtSnsId, friendNickName: friendNickName, memberKey: memberKey, memberNickName: memberNickName, menuId: menuId}, function(data){
//				if(data.reInvitedResult > 0){
////					mymusic.showPopReinvitedFriend();
////					alert("친구를 다시 초대하였습니다.");
//					MELON.WEBSVC.alert('<p class="facebook_pop"><strong>친구를 다시 초대하였습니다..</strong></p>',{title:'Facebook 친구초대'});
//				}
//			});
//		},
		reinvitedFriend : function(inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId){
			var totalId = "";
			var provcUserId = "";

			if(inviteIdResult){
				totalId = totalId + inviteIdResult;
			}

			if(friendIdResult){
				if(totalId){
					totalId = totalId +","+friendIdResult;
				}else{
					totalId = totalId + friendIdResult;
				}
			}

			if(totalId == ""){
				MELON.WEBSVC.alert('<p class="facebook_pop"><strong>선택한 친구가 없습니다!<br>초대할 친구를 선택해주세요.</strong></p>',{title:'Facebook 친구초대'});
				return false;
			}

			//로그인한 사용자의 계정연결된 페이스북 아이디 조회.
			$.getJSON("/mymusic/friend/mymusicfriendfacebook_informFb.json", function(data){
				if(data.ISCONNECTED == true){
					provcUserId = data.PROVCUSERID;
				}
				mymusic.snsFacebookRequest(totalId, inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId, provcUserId);
			});
		},

		//Facebook 친구 초대하기  추가 요청
		invitedFriend : function(inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId){
			var totalId = "";
			var provcUserId = "";

			if(inviteIdResult){
				totalId = totalId + inviteIdResult;
			}

			if(friendIdResult){
				if(totalId){
					totalId = totalId +","+friendIdResult;
				}else{
					totalId = totalId + friendIdResult;
				}
			}

			if(totalId == ""){
				MELON.WEBSVC.alert('<p class="facebook_pop"><strong>선택한 친구가 없습니다!<br>초대할 친구를 선택해주세요.</strong></p>',{title:'Facebook 친구초대'});
				return false;
			}

			//로그인한 사용자의 계정연결된 페이스북 아이디 조회.
			$.getJSON("/mymusic/friend/mymusicfriendfacebook_informFb.json", function(data){
				if(data.ISCONNECTED == true){
					provcUserId = data.PROVCUSERID;
				}
				mymusic.snsFacebookRequest(totalId, inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId, provcUserId);
			});
		},

		snsFacebookRequest : function (user_ids, inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId, provcUserId) {
			var message ="멜론에서 친구가 만든 플레이리스트 및 다양한 음악을 나눠보세요. 더욱 즐겁게 음악과 함께 할 수 있습니다. 음악이 필요한 순간, 멜론";
			var linkUrl ="www.melon.com";
			var totalId = "";

			if(user_ids){
				totalId = totalId + user_ids;
			}

			//로그인한 사용자의 페북 아이디 받아와서 현재 브라우저상 자동로그인된 페북 아이디와 동일한지 체크.(계정연결이 안된 경우 이 단계까지 진입도 못하므로 재체크는 불필요)
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
				    // the user is logged in and has authenticated your7
				    // app, and response.authResponse supplies
				    // the user's ID, a valid access token, a signed
				    // request, and the time the access token
				    // and signed request each expire
				    var uid = response.authResponse.userID;
				    var accessToken = response.authResponse.accessToken;
//				    alert("connected");
//				    alert("uid: "+uid);
//				    alert("accessToken: "+accessToken);
//				    alert("provcUserId: "+provcUserId);

				    if (provcUserId == uid) {	//계정연결도 되어있고 페북 자동로그인 계정과 계정 연결된 페북계정이 동일한 경우.
				    	//동일한 경우 다이알로그 띄움.
						FB.ui({method: 'apprequests',
						  	message: message,
						  	to: totalId
						}, function(response){
							if (response && !response.error_code) {
								mymusic.doInviteFbFriend(totalId, inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId);
						    }
						});
				    } else if(provcUserId != "" && provcUserId != uid) {	//페북 계정연결이 되어 있는데 페북 자동로그인 설정된 페북 계정과 멜론에 계정연결한 페북 계정이 다른 경우.
				    	//안내메세지 출력후 리턴.
				    	alert("현재 자동로그인 설정된 페이스북 계정이\r\n멜론에 계정연결된 페이스북 계정과 다릅니다.\r\n멜론에 계정연결된 페이스북 계정으로 로그인후 다시 시도해주세요.");
				    	return false;
				    } else {
				    	//페북에 자동로그인 설정되있지만 멜론에 계정연결되어있지 않은 경우 계정연결 팝업 호출.
						mymusic.getAjaxFbIsConnect(memberKey);
				    }
				} else if (response.status === 'not_authorized') {
					// the user is logged in to Facebook,
					// but has not authenticated your app
					//로그인해있지만 멜론앱에 대한 권한 부여가 안되어있다면 계정연결 체크하도록 하여 권한 받도록 유도.
					mymusic.getAjaxFbIsConnect(memberKey);
				} else {
					// the user isn't logged in to Facebook.
					//단순히 로그인만 안한 경우는 다이알로그 호출하면 로그인창이 먼저 뜨게 되므로 다이알로그 호출.
					FB.ui({method: 'apprequests',
					  	message: message,
					  	to: totalId
					}, function(response){
						if (response && !response.error_code) {
							mymusic.doInviteFbFriend(totalId, inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId);
					    }
					});
				}
			 });
		},

		doInviteFbFriend : function(totalId, inviteIdResult,friendIdResult,inviteNameResult,friendMemberKeyResult ,memberKey, menuId){
			$.getJSON("/mymusic/friend/mymusicfriendfacebook_insertFbFriend.json",  {user_ids: totalId, inviteNameResult : inviteNameResult , friendMemberKeyResult : friendMemberKeyResult ,memberKey: memberKey, menuId: menuId} ,function(data){
				if(data.invitedResult == "1" || data.invitedResult == "2"){ //성공시 OR 50건 이상 등록시
					if(data.toCnt > 50){
						MELON.WEBSVC.alert('<p class="facebook_pop"><strong>초대요청인원 <span>'+numberComma(data.toCnt)+'</span>명!<br>초대인원이 초과되었습니다.</strong><span class="text_type">초대하기는 50명까지만 가능합니다.</span></p>',{title:'Facebook 친구초대'});
					}else if(data.toCnt <= 50){
						MELON.WEBSVC.alert('<p class="facebook_pop"><strong>Facebook 친구에게 초대알림을 보냈습니다.</strong></p>',{title:'Facebook 친구초대'});
					}
					if(menuId != '56020202' && menuId != '56020201'){
						mymusic.getAjaxFbFriend(memberKey);
					}
					return false;
		 		}else{
		 			MELON.WEBSVC.alert('<p class="facebook_pop"><strong>죄송합니다.<br>잠시 후 다시 시도해주세요.</strong></p>',{title:'Facebook 친구초대'});
		 			return false;
		 		}
			});
		},

		showPopFbFriendReconnect : function (isHomeTab){
			MELON.WEBSVC.alert('<p class="facebook_pop"><strong>Facebook 계정연결의<br>유효기간이 만료되었습니다.</strong><span class="text_type">SNS 계정연결에서 계정해제 후 다시 연결해주세요.</span></p>',{title:'Facebook 계정연결'});
			return false;
		},

		showPopFbFriendConnectionFail : function (isHomeTab){
			MELON.WEBSVC.alert('<p class="facebook_pop"><strong>죄송합니다.<br>잠시 후 다시 시도해주세요.</strong></p>',{title:'Facebook 계정연결'});
			return false;
		},

		showPopFbFriendAuthFail : function (isHomeTab){
			MELON.WEBSVC.alert('<p class="facebook_pop"><strong>페이스북 권한 오류가 발생하여 친구목록을 불러올 수 없습니다.<br>페이스북 계정 재연결 후 사용해 주세요.</strong></p>',{title:'Facebook 계정연결'});
			return false;
		},

		numberComma : function(_number) {
			  if (isNaN(_number))
			   return;
			  var _regExp = new RegExp("(-?[0-9]+)([0-9]{3})");
			  while (_regExp.test(_number)) {
			   _number = _number.replace(_regExp, "$1,$2");
			  }
			  return _number;
		},

		friendSearch : function() {
			var searchKeyword = $('#friend').trimVal();
			if(searchKeyword == '' || searchKeyword == '멜론회원을 검색해 주세요'){
				alert('검색어를 입력해 주세요.');
				$('#friend').focus();
				return;
			}else{
				if(searchKeyword.length == 1){
					alert('멜론 친구 닉네임은 두 글자 이상만 검색 가능합니다.');
					$('#friend').focus();
					return;
				}
			}
			location.href = '/mymusic/friend/mymusicfriend_listSearch.htm?searchKeyword='+encodeURIComponent(encodeURIComponent(searchKeyword));
		},

		friendSearchKey : function(e) {
			if(e.keyCode == 13){
				MELON.WEBSVC.POC.MYMUSIC.friendSearch();
				return false;
			}
		},

		getAjaxLikeList : function(memberKey,type){
			var herf = '';
			if(type=='song'){
				href = '/mymusic/like/mymusiclikesong_listAjax.htm';
			}
			else if(type=='album'){
				href = '/mymusic/like/mymusiclikealbum_listAjax.htm';
			}
			else if(type=='mv'){
				href = '/mymusic/like/mymusiclikemv_listAjax.htm';
			}
			else if(type=='photo'){
				href = '/mymusic/like/mymusiclikephoto_listAjax.htm';
			}
			else if(type=='playlist'){
				href = '/mymusic/like/mymusiclikeplaylist_listAjax.htm';
			}
			else if(type=='djplaylist'){
				href = '/mymusic/like/mymusiclikedjplaylist_listAjax.htm';
			}
			else if(type=='partnerplaylist'){
				href = '/mymusic/like/mymusiclikeartistplaylist_listAjax.htm';
			}

			$.ajax({
				url: href,
				data: {memberKey : memberKey},
				async: false
			}).done(function(html) {
				$('#likeList').empty();
				$('#likeList').html(html);
				$('.d_selectbox').selectbox();
			});
		},

		getAjaxPlayList : function(memberKey){
			$.ajax({
				url: '/mymusic/playlist/mymusicplaylist_listAjax.htm',
				data: {memberKey : memberKey},
				async: false
			}).done(function(html) {
				$('#playlistList').empty();
				$('#playlistList').html(html);
			});
		},

		getAjaxArtistFanList : function(memberKey){
			$.ajax({
				url: '/mymusic/artistfan/mymusicartistfan_listAjax.htm',
				data: {memberKey : memberKey},
				async: false
			}).done(function(html) {
				$('#artistFanList').empty();
				$('#artistFanList').html(html);
			});
		},

		getPhotoDeatil : function(memberKey,photoId,orderBy,artistId){
			// 로그인 체크
			if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
				//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
				MELON.WEBSVC.POC.login.loginPopupLayerd('');
				return;
			}
			// 방어 로직 추가
			if(typeof memberKey == "undefined" || memberKey < 1){
				alert("정상적인 접근이 아닙니다.");
				location.href="http://www.melon.com";
				return;
			}

			//20150203 private 컨텐츠
			$.ajax({
				type : "POST",
				url  : "/mymusic/common/mymusiccommon_informPhotoPrivtAuth.json" ,
				async : false,
				data : {memberKey : memberKey, photoId : photoId},
				success : function(result){
					if(result.privtAuth == "N"){
						alert( "맺은팬 전용 콘텐츠 입니다." );
						return;
					}else{
						$.ajax({
							url: '/mymusic/like/mymusiclikephoto_inform.htm',
							data: {memberKey : memberKey, photoId : photoId, orderBy:orderBy, paramArtistId:artistId},
							async: false
						}).done(function(html) {
							$('#likeList').empty();
							$('#likeList').html(html);
						});
					}
				}
			});
		},

		popupAutoResize : function() {
			window.resizeTo(100, 100);
		    var thisX = parseInt(document.body.scrollWidth);
		    var thisY = parseInt(document.body.scrollHeight);
		    var maxThisX = screen.width - 50;
		    var maxThisY = screen.height - 50;
		    var marginY = 0;
		    //alert(thisX + "===" + thisY);
		    //alert("임시 브라우저 확인 : " + navigator.userAgent);
		    // 브라우저별 높이 조절.
		    if (navigator.userAgent.indexOf("MSIE 6") > 0) marginY = 60;        // IE 6.x
		    else if(navigator.userAgent.indexOf("MSIE 7") > 0) marginY = 80;    // IE 7.x
		    else if(navigator.userAgent.indexOf("Firefox") > 0) marginY = 50;   // FF
		    else if(navigator.userAgent.indexOf("Opera") > 0) marginY = 30;     // Opera
		    else if(navigator.userAgent.indexOf("Netscape") > 0) marginY = -2;  // Netscape
		    else if(navigator.userAgent.indexOf("Chrome") > 0) marginY = 20;  // Chrome
		    else marginY = 80;    // IE

		    if (thisX > maxThisX) {
			       window.document.body.scroll = "yes";
			       thisX = maxThisX;
			   }
			   if (thisY > maxThisY - marginY) {
			       window.document.body.scroll = "yes";
			       thisX += 19;
			       thisY = maxThisY - marginY;
			   }
			   window.resizeTo(thisX+10, thisY+marginY);
		},

		saveWiseLog : function(url, memberKey){
			var cMemberKey = getMemberKey()==""? 0 : getMemberKey();
			var dummyUrl = "";
			var mypageChk = "my";

			if(memberKey != cMemberKey){
				mypageChk = "other";
			}
			url  = url.replace("http://www.melon.com/mymusic/", "");

			url = url.split(".htm")[0];
			dummyUrl = "/mymusic/common/" + mypageChk + "/" + url + ".json?memberKey="+ memberKey;

			$.ajax({
				type : "GET",
				url  : dummyUrl
			});
		},


		/**
		 * [마이뮤직 링크 전용 스크립트]
		 * ex)goURL                 	: 해당 URL로 이동
		 * goFriend						: 내친구(팝업)
		 * goMyFriend					: 내친구(페이지 이동)
		 * goFriendMusicChart			: 친구 음악차트
		 * goRecmFriend					: 추천친구
		 * goFriendAddsMe				: 나를 추가한 사람
		 * goFriendInvited				: 초대한 친구
		 * goFriendFacebook				: 페이스북 친구 초대 페이지로 이동
		 * goLikeSong					: 좋아요 곡
		 * goLikeAlbum					: 좋아요 앨범
		 * goLikeMv						: 좋아요 영상
		 * goLikePlaylist				: 좋아요 일반 플레이리스트
		 * goLikeArtistPlaylist			: 좋아요 아티스트 플레이리스트
		 * goLikeDjPlaylist				: 좋아요 DJ플레이리스트
		 * goLikePhoto					: 좋아요 포토
		 * goPlaylistDetail				: 플레이리스트 상세(멤버상태,공개여부,삭제여부,플레이리스트SEQ)
		 * goMyPlaylistDetail			: 본인의 플레이리스트 상세
		 * goDjPlaylistDetail			: DJ플레이리스트 상세(멤버상태,어드민공개여부,삭제여부,플레이리스트SEQ)
		 * goMyDjPlaylistDetail			: 본인의 DJ플레이리스트 상세
		 * goMyPage						: 마이뮤직 메인(멤버키)
		 * goMyPageOther				: 타인의 마이뮤직 메인(멤버키)
		 * goInsertPresent      		: 선물하기
		 * goDjPlaylistList				: DJ플레이리스트 리스트(멤버키)
		 * goDjplaylistInsert	 		: DJ플레이리스트 만들기(plylstSeq or '')
		 * goDjplaylistManage			: DJ플레이리스트 순서변경/삭제
		 * goDjplaylistUpdate			: DJ플레이리스트 수정(plylstSeq)
		 * goPlaylistList				: 플레이리스트 리스트(멤버키)
		 * goPlaylistInsert				: 플레이리스트 만들기
		 * goPlaylistManage				: 플레이리스트 순서변경/삭제
		 * goPlaylistUpdate				: 플레이리스트 수정(plylstSeq)
		 * goRecentSong					: 최근 들은곡(멤버키)
		 * goRecentMv 					: 최근 본 영상(멤버키)
		 * goRecentSmartRadio 			: 최근 들은 스마트라디오(멤버키)
		 * goManySong 					: 많이 들은 곡(멤버키)
		 * goMyPageSetting				: 마이페이지 설정(멤버키)
		 * goUpdateMyInfo				: 회원정보 변경(멤버키)
		 * goUsageHistory				: 멜론 사용내역(멤버키)	- 해당 URL 지정 필요
		 * goFanArtist					: 팬 맺은 아티스트(멤버키)	- 해당 URL 지정 필요
		 * goPresentSong                : 선물하기
		 * goRePresentSong              : 선물하기(보답하기) 곡 (타겟멤버키,타겟닉네임) 경로에 rePresent => 보답하기일 경우 체크
		 * goMain              			: 선택된 유저의 메인으로 이동(멤버키)
		 * goMessage                    : 음악메세지
		 * goReturnMessage              : 음악메세지(답장하기) (타겟멤버키,타겟닉네임) 경로에 reMessage => 답장하기일 경우 체크
		 * goMessagePop                 : 음악메세지 보내기 팝업
		 * goMainNew                    : 타인의메인 새창(멤버status,멤버키)
		 * goMultiMessagePop            : 다중음악메세지 보내기(타입,아이디)
		 *                                ex)goMultiMessagePop('song','342342')
		 *                                타입 종류 => 곡 => song, 앨범 => album, 아티스트 => artist, 뮤비 => mv, 플레이리스트 => plylst,
		 *                                            DJ플레이리스트 => djcol, 아티스트플레이리스트 => artistplylst, 포토 => photo,
		 *                                            단! 포토의 경우 아이디 = 포토ID,아티스트ID (순서 틀리면 안됨)
		 *                                            ex) goMultiMessagePop('photo','2345235,234567')
		 * goPlaylistDetailNew			: 플레이리스트 상세 새창(멤버상태,공개여부,삭제여부,플레이리스트SEQ)
		 * goDjPlaylistDetailNew		: DJ플레이리스트 상세 새창(멤버상태,어드민공개여부,삭제여부,플레이리스트SEQ)
		 * goMyPageOther				: 타인의 마이뮤직 메인 새창(멤버키)
		 * goMagazineEpsd				: 매거진 상세 이동(매거진seq)
		 * goArtistPlaylistDetail		: 아티스트플레이리스트 상세(공개여부,플레이리스트SEQ)
		 */
		mymusicLink : {
		//		goURL : function(memberKey){
		//			location.href = '/mymusic/recent/mymusicrecentsmartradio_list.htm?memberKey='+memberKey;
		//		}
				goFriend : function(memberKey){
					if(typeof memberKey == "undefined")return;
					//location.href = '/mymusic/friend/mymusicfriend_list.htm?memberKey='+memberKey;
					window.open('/mymusic/friend/mymusicfriend_list.htm?memberKey='+memberKey);
				},
				goMyFriend : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/friend/mymusicfriend_list.htm?memberKey='+memberKey;
				},
				goFriendMusicChart : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/friend/mymusicfriendmusicchart_list.htm?memberKey='+memberKey;
				},
				goRecmFriend : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/friend/mymusicfriendrecm_list.htm?memberKey='+memberKey;
				},
				goFriendAddsMe : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/friend/mymusicfriendaddsme_list.htm?memberKey='+memberKey;
				},
				goFriendInvited : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/friend/mymusicfriendinvited_list.htm?memberKey='+memberKey;
				},
				goFriendFacebook : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/friend/mymusicfriendfacebook_list.htm?memberKey='+memberKey;
				},
				goLikeSong : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/like/mymusiclikesong_list.htm?memberKey='+memberKey;
				},
				goLikeAlbum : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/like/mymusiclikealbum_list.htm?memberKey='+memberKey;
				},
				goLikeMv : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/like/mymusiclikemv_list.htm?memberKey='+memberKey;
				},
				goLikePlaylist : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/like/mymusiclikeplaylist_list.htm?memberKey='+memberKey;
				},
				goLikeArtistPlaylist : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/like/mymusiclikeartistplaylist_list.htm?memberKey='+memberKey;
				},
				goLikeDjPlaylist : function(memberKey,flag){
					if(typeof memberKey == "undefined")return;
					var params = '';
					if(flag!=''){
						params = '&flag='+flag;
					}
					location.href = '/mymusic/like/mymusiclikedjplaylist_list.htm?memberKey='+memberKey+params;
				},
				goLikePhoto : function(memberKey){
					if(typeof memberKey == "undefined")return;
					location.href = '/mymusic/like/mymusiclikephoto_list.htm?memberKey='+memberKey;
				},
				goPlaylistDetail : function(memberStatus,openYn,delYn,plylstSeq){
					//2014-05-26 요건 변경
					/*if(memberStatus == 1){
						alert("탈퇴한 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == 2){
						alert("휴면 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == ''){
						alert("존재하지 않는 회원의 컨텐츠 입니다.")
						return;
					}*/
					if(openYn == "N"){
						alert("비공개된 컨텐츠 입니다.")
						return;
					}
					if(delYn == "Y"){
						alert("삭제된 컨텐츠 입니다.")
						return;
					}
					location.href = '/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=' + plylstSeq;
				},
				goMyPlaylistDetail : function(plylstSeq){
					location.href = '/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=' + plylstSeq;
				},
				goDjPlaylistDetail : function(memberStatus,adminOpenYn,delYn,plylstSeq){
					//2014-05-26 요건 변경
					/*if(memberStatus == 1){
						alert("탈퇴한 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == 2){
						alert("휴면 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == ''){
						alert("존재하지 않는 회원의 컨텐츠 입니다.")
						return;
					}*/
					if(adminOpenYn == "N"){
						alert("비공개된 컨텐츠 입니다.")
						return;
					}
					if(delYn == "Y"){
						alert("삭제된 컨텐츠 입니다.")
						return;
					}
					location.href = '/mymusic/dj/mymusicdjplaylistview_inform.htm?plylstSeq='+plylstSeq;
				},
				goMyDjPlaylistDetail : function(plylstSeq){
					location.href = '/mymusic/dj/mymusicdjplaylistview_inform.htm?plylstSeq='+plylstSeq;
				},
				goMyPage : function(memberKey){
					// 방어 로직 추가
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						location.href="http://www.melon.com";
						return;
					}
					location.href = '/mymusic/main/mymusicmain_list.htm?memberKey='+memberKey;
				},
				goMyPageOther : function(memberKey){
					// 방어 로직 추가
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						location.href="http://www.melon.com";
						return;
					}
					location.href = '/mymusic/main/mymusicmainother_list.htm?memberKey='+memberKey;
				},
				goInsertPresent : function(){
					location.href = '/mymusic/messagepresent/mymusicpresent_insert.htm';
				},
				goDjPlaylistList : function(memberKey){
					location.href = '/mymusic/dj/mymusicdjplaylist_list.htm?memberKey='+memberKey;
				},
				goDjplaylistInsert : function(plylstSeq){
					$.ajax({
						url: '/mymusic/common/mymusiccommon_plylstCount.json',
						data: {
							plylstTypeCode : 'M20002'
						},
						async : false,
						success : function(result){
							if(result.result > 0){
								var url = '/mymusic/dj/mymusicdjplaylistinsert_insert.htm';
								if(typeof plylstSeq != "undefined" && plylstSeq!=''){
									url = url+'?plylstSeq='+plylstSeq;
								}
								location.href = url;
							}
							else if(result.result == -309){
								alert('DJ플레이리스트는 최대 500개까지 만드실 수 있습니다.');
								return;
							}
						}
					});
				},
				goDjplaylistInsert : function(plylstSeq,menuId){
					$.ajax({
						url: '/mymusic/common/mymusiccommon_plylstCount.json',
						data: {
							plylstTypeCode : 'M20002'
						},
						async : false,
						success : function(result){
							if(result.result > 0){
								var url = '/mymusic/dj/mymusicdjplaylistinsert_insert.htm';
								if(typeof plylstSeq != "undefined" && plylstSeq!=''){
									url = url+'?plylstSeq='+plylstSeq+'&menuId='+menuId;
								}
								location.href = url;
							}
							else if(result.result == -309){
								alert('DJ플레이리스트는 최대 500개까지 만드실 수 있습니다.');
								return;
							}
						}
					});
				},
				goDjPlaylistManage : function(){
					location.href = '/mymusic/dj/mymusicdjplaylistmanage_list.htm';
				},
				goDjplaylistUpdate : function(plylstSeq){
					if(typeof plylstSeq == "undefined" || plylstSeq =="" ){
						alert("DJ플레이리스트 번호가 없습니다.");
						return;
					}
					location.href = '/mymusic/dj/mymusicdjplaylistupdate_inform.htm?plylstSeq='+plylstSeq;
				},
				goPlaylistList : function(memberKey){
					location.href = '/mymusic/playlist/mymusicplaylist_list.htm?memberKey='+memberKey;
				},
				goPlaylistInsert : function(){
					$.ajax({
						url: '/mymusic/common/mymusiccommon_plylstCount.json',
						data: {
							plylstTypeCode : 'M20001'
						},
						async : false,
						success : function(result){
							if(result.result > 0){
								location.href = '/mymusic/playlist/mymusicplaylistinsert_insert.htm';
							}
							else if(result.result == -309){
								alert('플레이리스트는 최대 500개까지 만드실 수 있습니다.');
								return;
							}
						}
					});
				},
				goPlaylistManage : function(){
					location.href = '/mymusic/playlist/mymusicplaylistmanage_list.htm';
				},
				goPlaylistUpdate : function(plylstSeq){
					if(typeof plylstSeq == "undefined" || plylstSeq =="" ){
						alert("플레이리스트 번호가 없습니다.");
						return;
					}
					location.href = '/mymusic/playlist/mymusicplaylistupdate_inform.htm?plylstSeq='+plylstSeq;
				},
				goRecentSong : function(memberKey){
					// 로그인 체크
					if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}
					location.href = '/mymusic/recent/mymusicrecentsong_list.htm?memberKey='+memberKey;
				},
				goRecentMv : function(memberKey){
					// 로그인 체크
					if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}
					location.href = '/mymusic/recent/mymusicrecentmv_list.htm?memberKey='+memberKey;
				},
				goRecentSmartRadio : function(memberKey){
					location.href = '/mymusic/recent/mymusicrecentsmartradio_list.htm?memberKey='+memberKey;
				},
				goManySong : function(memberKey, periodFlag){
					// 로그인 체크
					if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}
					if(typeof periodFlag != "undefined"){
						location.href = '/mymusic/top/mymusictopmanysong_list.htm?memberKey='+memberKey+"&dateType="+periodFlag;
						return;
					}
					location.href = '/mymusic/top/mymusictopmanysong_list.htm?memberKey='+memberKey;
				},
				goMyPageSetting : function(){
					location.href = '/mymusic/setting/mymusicsetting_informProfile.htm';
				},
				goUpdateMyInfo : function(memberKey){
					// 방어 로직 추가
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						window.location="http://www.melon.com";
						return;
					}
					location.href = 'https://www.melon.com/muid/update/web/memberinfomationupdateform_inform.htm';
				},
				goUsageHistory : function(memberKey){
					// 방어 로직 추가
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						window.location="http://www.melon.com";
						return;
					}
					window.location="http://www.melon.com/commerce/mypage/product/web/producthistory_listCurUserProdView.htm";
				},
				goFanArtist : function(memberKey){
					location.href = '/mymusic/artistfan/mymusicartistfan_list.htm?memberKey='+memberKey;
				},
				goPresentSong : function(menuId){
					location.href = '/mymusic/messagepresent/mymusicpresent_list.htm';
				},
				goRePresentSong : function(memberkey,menuId){
					// 방어 로직 추가
					if(typeof memberkey == "undefined" || memberkey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						window.location="http://www.melon.com";
						return;
					}

					if(!MELON.WEBSVC.POC.login.isMelonLogin()){
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}

					$.get("/mymusic/friend/mymusicfriend_listFriendMemberStatus.json",{memberkey : memberkey},function(data){
					}).done(function(data){
						if(data.MEMBERSTATUS != '0'){
							alert("탈퇴한 회원입니다.");
							return;
	                    }else{
	                    	params = {
	             	        		'targetMemK':memberkey,
	             	        		'targetMemN':data.MEMBERNICKNAME,
	             	        		'rePresent':'Y',
	             	        		'menuId':menuId
	                     		}
	        	     		method = "POST";
	        	     		var form = document.createElement("form");
	        	     		form.setAttribute("method",method);
	        	     		form.setAttribute("action", "/mymusic/messagepresent/mymusicpresent_insert.htm");
	        	     		for(var key in params){
	        	     			var hiddenField = document.createElement("input");
	        	     			hiddenField.setAttribute("type","hidden");
	        	     			hiddenField.setAttribute("name",key);
	        	     			hiddenField.setAttribute("value", params[key]);
	        	     			form.appendChild(hiddenField);
	        	     		}
	        	     		document.body.appendChild(form);
	        	     		form.submit();
//	                    	if(typeof menuId == "undefined"){
//	    						location.href = '/mymusic/messagepresent/mymusicpresent_insert.htm?targetMemK='+memberkey+'&targetMemN='+nickname+'&rePresent=Y';
//	    					}else{
//	    						location.href = '/mymusic/messagepresent/mymusicpresent_insert.htm?targetMemK='+memberkey+'&targetMemN='+nickname+'&menuId='+menuId+'&rePresent=Y';
//	    					}
	                    }
					});
				},
				goMain : function(memberStatus,memberKey){
					if(memberStatus == 1){
						alert("탈퇴한 회원 입니다.")
						return;
					}
					if(memberStatus == 2){
						alert("휴면 회원 입니다.")
						return;
					}
					if(memberStatus == '' || memberKey == -1){
						alert("존재하지 않는 회원입니다.")
						return;
					}
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						window.location="http://www.melon.com";
						return;
					}
					location.href = '/mymusic/main/mymusicmainother_list.htm?memberKey='+memberKey;
				},
				goMessage : function(menuId){
					location.href = '/mymusic/messagepresent/mymusicmessage_list.htm';
				},
				goReturnMessage : function(memberkey,menuId){
					// 방어 로직 추가
					if(typeof memberkey == "undefined" || memberkey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						window.location="http://www.melon.com";
						return;
					}

					if(!MELON.WEBSVC.POC.login.isMelonLogin()){
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}

					var ua = navigator.userAgent.toLocaleLowerCase();

					$.get("/mymusic/friend/mymusicfriend_listFriendMemberStatus.json",{memberkey : memberkey},function(data){
					}).done(function(data){
						if(data.MEMBERSTATUS != '0'){
							alert("탈퇴한 회원입니다.");
							return;
	                    }else{
	                    	params = {
	             	        		'targetMemK':memberkey,
	             	        		'targetMemN':data.MEMBERNICKNAME,
	             	        		'reMessage':'Y',
	             	        		'menuId':menuId
	                     		}
	        	     		method = "POST";
	        	     		var form = document.createElement("form");
	        	     		form.setAttribute("method",method);
	        	     		form.setAttribute("action", "/mymusic/messagepresent/popup/mymusicmessage_insertForm.htm");
	        	     		for(var key in params){
	        	     			var hiddenField = document.createElement("input");
	        	     			hiddenField.setAttribute("type","hidden");
	        	     			hiddenField.setAttribute("name",key);
	        	     			hiddenField.setAttribute("value", params[key]);
	        	     			form.appendChild(hiddenField);
	        	     		}
	        	     		document.body.appendChild(form);
	        	     		if (ua.indexOf('safari') > -1 || ua.indexOf('IS40') > -1){
//	        	     			window.open('','pop', 'app_,width=730,height=750');
	        	     			MELON.WEBSVC.openPopup('' ,730, 750, {'target':'pop','scrollbars':'no'},'center','pop');
	    					}else{
//	    						window.open('','pop', 'app_,width=730,height=738');
	    						MELON.WEBSVC.openPopup('' ,730, 738, {'target':'pop','scrollbars':'no'},'center','pop');
	    					}
	        	     		form.setAttribute("target", "pop");
	        	     		form.submit();
//	                    	if(typeof menuId == "undefined"){
//	    						MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertForm.htm?targetMemK='+memberkey+'&targetMemN='+nickname+'&reMessage=Y', 730, 738);
//	    					}else{
//	    						MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertForm.htm?targetMemK='+memberkey+'&targetMemN='+nickname+'&menuId='+menuId+'&reMessage=Y', 730, 738);
//	    					}
	                    }
					});
				},
				goMainNew : function(memberStatus,memberKey){
					if(memberStatus == 1){
						alert("탈퇴한 회원입니다.")
						return;
					}
					if(memberStatus == 2){
						alert("휴면 회원입니다.")
						return;
					}
					if(memberStatus == '' || memberKey == -1){
//						alert("존재하지 않는 회원입니다.")
						alert("탈퇴한 회원입니다.")
						return;
					}
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						window.location="http://www.melon.com";
						return;
					}
					window.open('/mymusic/main/mymusicmainother_list.htm?memberKey='+memberKey);
				},
				goMessagePop : function(menuId){
//					MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertForm.htm', 816, 640, {'scrollbars': 'yes'});
					var ua = navigator.userAgent.toLocaleLowerCase();
					var h = 738;
					//사파리 혹은 크롬, webkit
					if (ua.indexOf('safari') > -1 || ua.indexOf('IS40') > -1){
						h = 750;
					}
					if(typeof menuId == "undefined"){
						MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertForm.htm', 730, h,{'scrollbars':'no'}, 'center', 'mespop');
					}else{
						MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertForm.htm?menuId='+menuId, 730, h,{'scrollbars':'no'}, 'center', 'mespop');
					}
				},
				goMultiMessagePop : function(contsType,contsId,menuId){
					var h = 0;
					if(contsType == 'song'){//곡
						h = 456;
					}else if(contsType == 'album'){//앨범
						h = 456;
					}else if(contsType == 'artist'){//아티스트
						h = 456;
					}else if(contsType == 'mv'){//영상
						h = 460;
					}else if(contsType == 'plylst'){//플레이리스트
						h = 466;
					}else if(contsType == 'djcol'){//DJ플레이리스트
						h = 466;
					}else if(contsType == 'artistplylst'){//아티스트 플레이리스트
						h = 466;
					}else if(contsType == 'photo'){//포토
						h = 546;
					}

					if(typeof menuId == "undefined"){
						MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertMultiForm.htm?contsType='+contsType+'&contsId='+contsId, 730, h, {'scrollbars':'no'}, 'center', 'multipop');
					}else{
						MELON.WEBSVC.openPopup('/mymusic/messagepresent/popup/mymusicmessage_insertMultiForm.htm?contsType='+contsType+'&menuId='+menuId+'&contsId='+contsId, 730, h, {'scrollbars':'no'}, 'center', 'multipop');
					}
				},
				goPlaylistDetailNew : function(memberStatus,openYn,delYn,plylstSeq){
					//2014-05-26 요건 변경
					/*if(memberStatus == 1){
						alert("탈퇴한 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == 2){
						alert("휴면 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == ''){
						alert("존재하지 않는 회원의 컨텐츠 입니다.")
						return;
					}*/
					if(openYn == "N"){
						alert("비공개된 컨텐츠 입니다.")
						return;
					}
					if(delYn == "Y"){
						alert("삭제된 컨텐츠 입니다.")
						return;
					}
					window.open('/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=' + plylstSeq);
				},
				goDjPlaylistDetailNew : function(memberStatus,adminOpenYn,delYn,plylstSeq){
					//2014-05-26 요건 변경
					/*if(memberStatus == 1){
						alert("탈퇴한 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == 2){
						alert("휴면 회원의 컨텐츠 입니다.")
						return;
					}
					if(memberStatus == ''){
						alert("존재하지 않는 회원의 컨텐츠 입니다.")
						return;
					}*/
					if(adminOpenYn == "N"){
						alert("비공개된 컨텐츠 입니다.")
						return;
					}
					if(delYn == "Y"){
						alert("삭제된 컨텐츠 입니다.")
						return;
					}
					window.open('/mymusic/dj/mymusicdjplaylistview_inform.htm?plylstSeq='+plylstSeq);
				},
				goMyPageOtherNew : function(memberKey){
					// 방어 로직 추가
					if(typeof memberKey == "undefined" || memberKey < 1 ){
						alert("정상적인 접근이 아닙니다.");
						location.href="http://www.melon.com";
						return;
					}
					window.open('/mymusic/main/mymusicmainother_list.htm?memberKey='+memberKey);
				},
				goMagazineEpsd : function(magaznSeq){
					if(typeof magaznSeq == "undefined"){
						alert("DJ매거진SEQ가 없습니다.");
						return;
					}
					location.href = '/dj/magazine/djmagazinedetail_listEpsd.htm?magaznSeq='+magaznSeq;
				},
				goMyCommerce : function(){
					location.href = "/cm/record/listSongMp3DlRecrdView.htm";
				},
				goArtistPlaylistDetail : function(openYn, plylstSeq){
					if(openYn == "N"){
						alert("비공개된 컨텐츠입니다.")
						return;
					}
					if(typeof plylstSeq == "undefined") return;
					location.href = '/artist/playlistDetail.htm?plylstSeq=' + plylstSeq;
				}

			}
		}
	})();

var mymusic = MELON.WEBSVC.POC.MYMUSIC;
