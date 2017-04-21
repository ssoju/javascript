/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 멜론 프레임웍
 */
(function($, WEBSVC, PBPGN, undefined) {
	var $doc = $(document);

	// 좋아요 처리(버블링 활용)
	WEBSVC.define('WEBSVC.DJCollection', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="cnt_like_m"><span>{CNT}</span></span>'
				},
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

				// 좋아요 버튼
				$doc.on('click.djcollection', '.d_djcol_list button.like, .d_djcol_list a.btn_like, .clfix .btn_like_m', function(e){
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
						defer = me.dislike(djColNo,menuId)
					} else {
						defer = me.like(djColNo,menuId)
					}

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
							if($btn.is('button.btn_like_m')){
								tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
								$btn.next().html(tmpl.replace(/\{CNT\}/g, summCnt));
							} else if($btn.is('button')){
								tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];
							} else {
								tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
							}

							$btn.html(
								tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
							);

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
			},

			magazinelike: function(djColNo,menuId){
				var defer = $.Deferred();

				if(!djColNo){ defer.reject(['DJ매거진 번호가 없습니다.(좋아요 버튼에 data-djcol-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 아이디가 없습니다.(좋아요 버튼에 data-djcol-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + djColNo + '&type=djmagazine&menuId=' + menuId, defer);

				return defer;
			},

			magazinedislike: function(djColNo,menuId) {
				var defer = $.Deferred();

				if(!djColNo){ defer.reject(['DJ매거진 번호가 없습니다.(좋아요 버튼에 data-djcol-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 아이디가 없습니다.(좋아요 버튼에 data-djcol-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + djColNo + '&type=djmagazine&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	// DJ신청하기 매니아 장르 정보 입력
	WEBSVC.define('PBPGN.MelonDJ.ManiaGenre', {
		init: function(){
			var me = this,
				selectImageSrc = '';

			//140523_매니아 장르선택
            $.ajax({
            	url:'/dj/djregister/popup/djregister_gnrList.htm'
            }).done(function(html){
            	$('#d_mthema').after(html);

				var $mcon = $('.wrap_genre_select');//140523_매니아 장르관련
				var $con = $('dd.gubun');

				// 모달에서 확인 클릭시
				function itemSelected($pane, type, name, $items) {
					var input = '';

					if($items.length === 0) {
						alert('선택된 '+name+'가 없습니다.');
						return false;
					}
					if(type == "mgenre"){ //140526_수정
                        type = "genre"
                    }

					$items.each(function(){
						var $item = $(this);
						input += '<input type="hidden" name="melondjPrefeGnrCode" value="'+$item.attr('data-'+type+'-no')+'" data-name="'+$item.find('>span').text()+'" />';
					});
					$pane.find('>input:radio').prop('checked', true);
					//20131105 hmh 기존 hidden 이 삭제 되지 않아 추가
					//$con.find('input[type=hidden]').remove();
					$pane.find('>[type=hidden]').remove().end().prepend( input );
				}

				// 모달 이벤트 바인딩
				function bindModal($target, type, name, clsName, maxCount) {
				    $target.find('div.layer_popup').on('modalshow', function() {
                        $(this).find('div.box_'+clsName+'_chic').find('>ul').empty().hide();
                    }).on('click', 'div.collection_chic_list button', function(e) {
                        var $btn = $(this),
                            $layer = $btn.closest('div.layer_popup'),
                            $box = $layer.find('div.box_'+clsName+'_chic ul'),
                            title = $btn.find('> span:eq(1)').text(),
                            no = $btn.attr('data-genre-no');

                        $(this).parent().addClass('active').siblings().removeClass('active');
                        $box.empty();
                        $box.append(['<li data-genre-no="'+no+'" class="'+($btn.parent()[0].className||'')+'">',
                            '<span>'+title+'</span>',
                            '<button type="button" title="'+title+' 장르 삭제" class="btn_delt"></button></li>'].join(''));
                    }).on('modalok', function(e){
                        if(itemSelected($target, type, name, $(this).find('div.box_'+clsName+'_chic li')) === false){
                            e.preventDefault();
                            return;
                        }
                        var txt = [];
                        $mcon.find('>input[type=hidden]').each(function() {
                            txt.push( $(this).attr('data-name') );
                        });
                        $mgenre.siblings('div').find('.txt_bullet').html("장르" + ': <strong>' + txt.join(', ') + '</strong>').show();
                    })
				}

				// 테마 레이어팝업 이벤트 바인딩 ///////////////////////////////////////////////////////////////
				var $mgenre = $mcon.find('>div:first'); //140523_매니아 장르관련

				bindModal($mcon, 'mgenre', '매니아장르', 'gnr', 1); //140523_매니아 장르관련
			})
		}
	});

	// 정보 입력
	WEBSVC.define('PBPGN.MelonDJ.InfoWriter', {
		init: function(){
			var me = this,
				$con = $('dd.gubun');

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
					title = $btn.find('span:eq(1)').text(),
					no = $btn.attr('data-'+type+'-no');

				if($box.find('li').length === maxCount) {
					alert(name + '는 '+maxCount+'개까지 선택하실 수 있습니다.');
					return;
				}

				if($box.find('li[data-'+type+'-no='+no+']').length > 0) {
					alert('이미 추가된 '+name+'입니다.'); return;
				}

				if(type === 'theme') {
					$box.append(['<li data-theme-no="'+no+'">',
						'<span class="icon '+boxClass+""+($btn.parent().index() + 1)+'"></span>',
						'<span>'+title+'</span>',
						'<button type="button" title="'+title+' 테마 삭제" class="btn_delt"></button></li>'].join(''));
				} else {
					$box.append(['<li data-genre-no="'+no+'" class="'+($btn.parent()[0].className||'')+'">',
						'<span class="icon '+boxClass+""+($btn.parent().index() + 1)+'">'+title+'</span>',
						'<button type="button" title="'+title+' 장르 삭제" class="btn_delt"></button></li>'].join(''));
				}

				$layer.trigger('addedlistchanged', ['added']);
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
					input += '<input type="hidden" name="'+type+'" value="'+$item.attr('data-'+type+'-no')+'" data-name="'+$item.find('>span').text()+'" />';
				});
				$pane.find('>input:radio').prop('checked', true);
				$pane.find('>input[type=hidden]').remove().end().prepend( input );
			}

			// 모달 이벤트 바인딩
			function bindModal($target, $other, type, name, clsName, maxCount) {
				$target.find('div.layer_popup').on('modalshow', function() {
					// 초기화
					$(this).find('div.box_'+clsName+'_chic').find('>ul').empty().hide().end().find('>p').show();
				}).on('click', 'div.collection_chic_list button', function(e) {
					// 테마 선택 시
					addItem.call(this, type, name, clsName, maxCount);
				}).on('click', 'div.box_'+clsName+'_chic ul button', function(){
					// 추가된 테마를 삭제 시
					var $item = $(this),
						$modal = $item.closest('div.layer_popup');

					$item.parent().remove();
					$modal.trigger('addedlistchanged', ['removed']);
				}).on('modalok', function(e){
					// 확인 클릭시 페이지에 히든폼 추가
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
				}).on('addedlistchanged', function(){
					//
					var $box = $(this).find('div.box_'+clsName+'_chic ul'),
						count = $box.find('>li').length;
					if(count === 0) {
						$box.hide().siblings('p').show();
					} else {
						$box.show().siblings('p').hide();
					}
				});
			}

			// 테마 레이어팝업 이벤트 바인딩 ///////////////////////////////////////////////////////////////
			var $theme = $con.find('>div:first');
			var $genre = $con.find('>div:eq(1)');

			bindModal($theme, $genre, 'theme', '테마', 'themalk', 2);
			bindModal($genre, $theme, 'genre', '장르', 'gnr', 1);
		}
	});

	// 선곡하기
	WEBSVC.define('PBPGN.MelonDJ.SongSelector', {
		init: function(){
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
				xhr = null; // ajax 로딩 플래그

			// 탭 버튼 클릭시
			$tab.on('selected', function(e, index) {
				tabMode = tabModes[index];
				$activeTab = $tab.find('>li:eq('+index+')');
				$activeTable = $activeTab.find('tbody');

				if(index !== 3) {
					loadList();
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
			$kwd.on('keyup', function(e) {
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

				WEBSVC.openPopup('/dj/DJ_playlist_popup_dev.html?playlistNo=' + $(this).closest('tr').find('input:checkbox').val(), 560, 616);
			});

			// row에 있는 +, -  버튼 클릭시
			$('div.chic_music_cont').on('click', 'button.add_music:not(.disabled), button.delt_music:not(.disabled)', function(){
				var $this = $(this);
				if($this.hasClass('add_music')) {
					if(tabMode === 'playlist') {
						addPlaylistSongs($(this).closest('tr').removeClass('active').find('input:checkbox').prop('checked', false).end().val());
					} else {
						addSong($this.closest('tr'));
					}
				} else {
					removeSong($this.closest('tr'));
				}
			});

			// >, 추가버튼
			$('div.chic_music_cont').on('click', 'button.d_move_right', function() {
				if($rightTable.find('>tr.d_added').length >= 1000) {
//					alert('500곡 이상 추가하실 수 없습니다.');
					alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
					return;
				}

				var $items = $activeTable.find('input:checkbox:checked');
				if($items.length === 0) {
					alert('선택된 항목이 없습니다.');
					return;
				}

				if(tabMode === 'playlist') {
					$items.each(function(){
						addPlaylistSongs($(this).val());
						$(this).prop('checked', false).closest('tr').removeClass('active');
					});
				} else {
					$items.each(function(){
						if($rightTable.find('input:checkbox[value=' + $(this).closest('tr').find('input:checkbox').val() + ']').length > 0) {
							alert('이미 선택된 곡입니다.'); // 문구를 개발측에서 맞게 수정한다고 합니다.
							return false;
						}
					});

					$items.each(function(){
						if(addSong($(this).closest('tr')) === false){
							return false;
						}
					});
				}

				$activeTable.parent().find('thead input:checkbox').prop('checked', false);
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
					alert('검색어를 입력해주세요.');
					$kwd.focus();
					return;
				}

				var $this = $(this);

				// 기존에 활성화되어 있던 걸 다시 링크로 변환
				$this.siblings('.on').replaceWith(function(){
					var $that = $(this);
					return '<a href="#" data-sort="'+$that.attr('data-sort')+'" title="'+$that.attr('data-title')+'" class="d_tablink">'+$that.text()+'</a>';
				});
				// 링크를 strong으로 변환
				var $btn = $('<strong tabindex="0" data-sort="'+$this.attr('data-sort')+'" data-title="'+$this.attr('title')+'" class="on d_tablink">'+$this.text()+'</strong>');
				$this.replaceWith($btn);
				$btn.focus();

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
						.removeClass('d_title').find('div.songname').find('span.title').remove().end().find('a').removeClass('title');

					// 타이틀 선정
					$checkedRows.each(function(){
						$(this).addClass('d_title').find('div.songname strong').after('<span class="icon_song title">Title</span>').siblings('a').addClass('title');

						var $checkbox = $(this).find('input:checkbox');
						$checkbox.after('<input type="hidden" name="title_song_no" value="'+$checkbox.val()+'" />');
					});

				} else {
					$checkedRows.filter('.d_title').find('input[name=title_song_no]').remove().end()
						.removeClass('d_title').find('div.songname').find('span.title').remove().end().find('a').removeClass('title');
				}
				setTitleButtonStatus();
			});

			// Up / Down 버튼
			$('div.chic_fin div.add_bg').on('click', 'button.btn_move', function(){
				var $btn = $(this),
					$rows = $rightTable.find('tr:has(input:checked)');

				if($rows.length === 0) {
					alert('선택해 주세요.');
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
				if(xhr && xhr.readyState !== 4) {
					alert('조회중입니다. 잠시만 기다려 주세요.');
					return;
				}

				xhr = $.ajax({
					url: '/dj/DJ_playlist_songs_ajax.html?playlistNo=' + playlistNo,
					async: false
				}).done(function(html) {
					var $items = $('<table><tbody></tbody></table>').find('>tbody').append( html ).find('>tr');

					$items.each(function() {
						if(addSong($(this)) === false){
							return false;
						}
					}).closest('table').remove();

					if(isPopup){
						alert('플레이리스트의 수록곡이 선곡리스트에 담겼습니다.');
					}
				});
			}

			// 오른쪽에 곡 추가
			function addSong($tr) {
				var $checkbox = $tr.removeClass('active').find('input:checkbox').prop('checked', false),
					val = $checkbox.val();

				if($rightTable.find('input:checkbox[value=' + val + ']').length > 0) {
					return;
				}

				if($rightTable.find('tr.d_added').length >= 1000) {
				//	alert('최대 500곡까지 추가할 수 있습니다.');
					alert('플레이리스트에는 최대 1,000곡까지 담기 가능합니다.\n편집모드에서 수록곡을 수정하신 후 다시 시도해주세요.');
					return false;
				}


				var $row = $tr.closest('tr').clone().removeClass('active').addClass('d_added'),
					$cols = $row.find('td');

				$cols.eq(0).find('input:checkbox').prop('checked', false);
				$cols.eq(2).find('div.d_layer').hideLayer().find('span[class^=bullet]').attr('class', 'bullet_vertical');
				$cols.eq(4).find('button').replaceClass('add_music', 'delt_music').children().text('삭제');
				$rightTable.append($row).trigger('addedlistchanged', ['added', $row]);
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
					href = '/dj/DJ_playlist_ajax.html';
					break;
				case 'recent':
					href= '/dj/DJ_songlist_ajax.html?type=recent';
					break;
				case 'like':
					href='/dj/DJ_songlist_ajax.html?type=like';
					params.sort = $activeTab.find('div.song_sort strong.on').attr('data-sort');
					params.filter = $activeTab.find('select').val();
					break;
				case 'search':
					if($kwd.trimVal() === '') {
						alert('검색어를 입력해주세요.');
						$kwd.focus();
						return;
					}
					href="/dj/DJ_searchlist_ajax.html";
					params.sort = $activeTab.find('div.song_sort strong.on').attr('data-sort');
					params.kwd = $kwd.trimVal();
					break;
				}

				if(!href || href === '#') {
					return;
				}

				isLoading = true;
				if(more) {
					params.lastId = $activeTable.find('input[type=hidden].d_last_idx').val(); // 더보기할 때 필요한 기준키(예: 페이지, 인덱스키 등)
				} else {
					$activeTable.parent().find('thead input:checkbox').prop('checked', false);
				}

				xhr = $.ajax({
					url: href,
					data: params
				}).done(function(html) {
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
					if(!more){
						$activeTable.closest('.d_scrolldiv').animate({scrollTop: 0});
					}

				}).fail(function(){
					// error
				}).always(function(){
					isLoading = false;
				});
			}


			//
			loadList();
		}
	});

	// 소개글 입력
	WEBSVC.define('PBPGN.MelonDJ.IntroWriter', {
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
				$('p.text_noti strong.fc_point').text( $box.find('>div.textarea:not(.d_textbox)').length );
			});

			// 첨부
			$('div.wrap_btn_atach').on('click', 'button', function(e) {
				if($box.find('>div.textarea:not(.d_textbox)').length >= 5) {
					alert('컨텐츠 첨부는 최대 5개까지 가능합니다.');
					return;
				}

				var $btn = $(this),
					url = '';

				if($btn.hasClass('sound')) {
					url = '/dj/DJ_artist_attach.html';
				} else if($btn.hasClass('photo')) {
					url = '/dj/DJ_image_attach.html';
				} else if($btn.hasClass('video')) {
					url = '/dj/DJ_video_attach.html';
				} else if($btn.hasClass('link')) {
					url = '/dj/DJ_link_attach.html';
				}

				$.ajax({
					url: url
				}).done(function(html) {
					$box.append(html).find('textarea').placeholder();

					$box.triggerHandler('addedlistchanged', ['added']);
				});

			});

			// 삭제
			$('div.wrap_magazine_write').on('click', 'button.btn_delt', function(){
				var $pane = $(this).closest('div.textarea');
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


$(function(){

	MELON.WEBSVC.DJCollection.init();

	// 상단의 DJ콜렉션 좋아요
	/*
	$('#conts').addClass('d_djcol_list').on('likechanged', 'button.btn_base02.like', function(e, djColNo, djColName, doLike, count) {
		e.preventDefault();

		var $btn = $(this),
			caption = doLike ? '좋아요 취소' : '좋아요';
		$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', djColName+ ' 플레이리스트 ' + caption).find('>span>span').html('<span class="icon"></span><span class="none">'+caption+'</span><span class="none">총건수</span> '+count);
	});*/

	// 배너 닫기
	$('div.line_ban').on('click', '.close', function(){
		$(this).parent().hide();
	});

});

/**
 * [멜론DJ 링크 전용 스크립트]
 * goMagazine				    : DJ매거진
 * goMagazineEpsd		        : DJ매거진상세 회차별(매거진키)
 * goMagazineIntrod		        : DJ매거진상세 소개글(매거진키)
 * goMagazineReview		        : DJ매거진상세 리뷰(매거진키)
 * goDjPlaylistDetail	        : DJ플레이리스트 상세(멤버상태,어드민공개여부,삭제여부,플레이리스트SEQ)
 * goDjMain				        : DJ의 메인으로 이동(멤버상태,삭제여부)
 * goDjplaylistInsert		    : DJ플레이리스트 만들기(플레이리스트SEQ or '')
 * goDjToday                    : 오늘은 뭘듣지
 * goDjThemeGenre               : 테마/장르플레이리스트
 * goDjChart                    : DJ플레이리스트차트
 * goHonorDj                    : 이주의DJ,플레이리스트(WD,WP)
 * goDjFinder                   : DJ파인더
 * goDjRegister					: DJ신청하기
 * goBannerUrl                  : 배너링크(url)
 */

(function() {
	MELON.WEBSVC.POC.DJ = {
		djCollSearch : function() {
			var section = $('#section').val();
			var searchKeyword = $('#djColl').val();
			if(searchKeyword == '' || searchKeyword == '닉네임으로 검색해주세요' || searchKeyword == '플레이리스트명으로 검색해주세요'){
				if(section == "pd"){
					alert('닉네임으로 검색해주세요');
				}else{
					alert('플레이리스트명으로 검색해주세요');
				}
//				alert('검색어를 입력해 주세요.');
				$('#djColl').focus();
				return;
			}
//			location.href = '/dj/djfinder/djplaylistfinder_list.htm?searchKeyword='+encodeURIComponent(encodeURIComponent(searchKeyword))+'&section='+section;
			var form = document.createElement("form");
			var rUrl = "/dj/djfinder/djplaylistfinder_list.htm";
			form.setAttribute("name",'searchPlaylist');
	     	form.setAttribute("style", "display:none");
			form.setAttribute('action',rUrl);
			form.setAttribute('method','get');
	     	var hiddenField = document.createElement("input");
	     	hiddenField.setAttribute("name",'searchKeyword');
	     	hiddenField.setAttribute("value", searchKeyword);
	     	hiddenField.setAttribute("style", "display:none");
	     	form.appendChild(hiddenField);
			var hiddenField2 = document.createElement("input");
	     	hiddenField2.setAttribute("name",'section');
	     	hiddenField2.setAttribute("value", section);
	     	hiddenField2.setAttribute("style", "display:none");
	     	form.appendChild(hiddenField2);
			document.body.appendChild(form);
			form.submit();
		},

		djCollSearchKey : function(e) {
			if(e.keyCode == 13){
				MELON.WEBSVC.POC.DJ.djCollSearch();
				return false;
			}
		},

		djLink : {
			goMagazine : function(){
				location.href = '/dj/magazine/djmagazine_list.htm';
			},
			goMagazineEpsd : function(magaznSeq){
				if(typeof magaznSeq == "undefined"){
					alert("DJ매거진SEQ가 없습니다.");
					return;
				}
				location.href = '/dj/magazine/djmagazinedetail_listEpsd.htm?magaznSeq='+magaznSeq;
			},
			goMagazineIntrod : function(magaznSeq){
				if(typeof magaznSeq == "undefined"){
					alert("DJ매거진SEQ가 없습니다.");
					return;
				}
				location.href = '/dj/magazine/djmagazinedetail_listIntroduction.htm?magaznSeq='+magaznSeq;
			},
			goMagazineReview : function(magaznSeq){
				if(typeof magaznSeq == "undefined"){
					alert("DJ매거진SEQ가 없습니다.");
					return;
				}
				location.href = '/dj/magazine/djmagazinedetail_listReview.htm?magaznSeq='+magaznSeq;
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
			goDjMain : function(memberStatus,memberKey){
				if(memberStatus == 1){
					alert("탈퇴한 회원의 DJ플레이리스트 입니다.")
					return;
				}
				if(memberStatus == 2){
					alert("휴면 회원의 DJ플레이리스트 입니다.")
					return;
				}
				if(memberStatus == ''){
					alert("존재하지 않는 회원의 DJ플레이리스트 입니다.")
					return;
				}
				if(memberKey == -1){
					alert("Melon이 제작한 DJ플레이리스트입니다.")
					return;
				}
				location.href = '/mymusic/main/mymusicmainother_list.htm?memberKey='+memberKey;
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
							if(plylstSeq!=''){
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
			goDjToday : function(){
				location.href = '/dj/today/djtoday_list.htm';
			},
			goDjThemeGenre : function(){
				location.href = '/dj/themegenre/djthemegenre_list.htm';
			},
			goDjChart : function(){
				location.href = '/dj/chart/djchart_list.htm';
			},
			goHonorDj : function(type){
				if(type == "WD"){
					location.href = '/dj/honor/djhonorweekdj_list.htm';
				}else{
					location.href = '/dj/honor/djhonorweekplaylist_list.htm';
				}
			},
			goDjFinder : function(){
				location.href = '/dj/djfinder/djfinder.htm';
			},
			goDjRegister : function(){
				location.href = '/dj/djregister/djregister_inform.htm';
			},
			goBannerUrl : function(url){
				if(url != ''){
					location.href = url;
				}
			},
			goMelgunsPick : function(){
				location.href = '/dj/melgunspick/djmelgunspick_list.htm';
			}
		}
	}
})();

var dj = MELON.WEBSVC.POC.DJ;
