/**
 * Created by 김승일책임(comahead@vi-nyl.com) on 2015-05-22.
 * @author 김승일 책임
 * @description 문의사항이 있으시면 저에게 문의주세요.
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		COOKIE_NAME = 'recent_keywords';

	/**
	 * 통합검색 모듈
	 * @class
	 * @name scui.ui.CombineSearcher
	 * @extends scui.ui.View
	 */
	var CombineSearcher = core.ui('CombineSearcher', {
		bindjQuery: 'combineSearcher',
		defaults: {

		},
		selectors: {
			keywordBox: '.auto_keyword_t',        // 키워드 박스
			recentBox: '.recent_keyword_t',       // 최근검색어 박스
			input: 'input[type=text]',          // 인풋박스
			btnSubmit: '.btn_mirror_t'            // 검색 버튼
		},
		/**
		 * 생성자
		 * @param {string|Element} el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			// 일반이벤트 바인딩
			me._bindEvents();
			// 음성검색 이벤트 바인딩
			me._bindSpeechEvents();
			// 인풋박스 이벤트 바인딩
			me._bindInputEvents();
			// 드롭박스 이벤트 바인딩
			me._bindDropdownListEvents();
		},

		/**
		 * value  유무에 따라 드롭박스 토글
		 * @param {string} value
		 * @private
		 */
		_openDropdown: function (value) {
			var me = this;

			if (!$.trim(value)) {
				me.hasKeywords = false;
				me._toggleRecents(true);
			} else {
				if (value === me.oldKeyword) {
					if (me.hasKeywords) {
						me._toggleKeywords(true);
					}
				} else {
					me._loadKeywords(value);
				}
			}
		},


		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this;

			// 서브밋 시에 값 체크
			me.$el.on('submit', 'form', function (e) {
				var $input = $(this).find('[name=query]');
				if (!$.trim($input.val())) {
					core.showMessage('N0000009'); // 검색어를 입력해주세요.
					$input.focus();
					return false;
				}
			});

			me.$el.find('.btn_search').css('-webkit-user-select', 'none');

			// 키워드 링크를 클릭했을 때 검색페이지로 날린다.
			me.$el.on('click', '[data-keyword]', function (e) {
				e.preventDefault();

				me._closeAllsubs();
				me.$input.val($(this).attr('data-keyword'))[0].form.submit();
			});
		},

		/**
		 * 인풋관련 이벤트 바인딩
		 * @private
		 */
		_bindInputEvents: function () {
			var me = this;

			if (core.browser.isGecko) {
				// 파폭에서는 한글키 입력시에 키이벤트가 발생안되는 버그가 있어서 타이머를 돌려서 강제를 이벤트를 발생
				me._forceKeyup();
			}

			// 검색어 입력 - START
			me.$el.on('focusout', 'input[type=text]', function (e) {
				$('body').removeClass('opened_header');
				//me.$el.off('mousedown.toggle'+me.cid);
				if (!core.browser.isTouch) {
					me.closeTimer = setTimeout(function () {
						me._closeAllsubs();
					}, 100);
				}
			}).on('keyup paste cut focusin change', 'input[type=text]', core.delayRun(function (e) {
				$('body').addClass('opened_header');
				// 단어입력시 키워드 리스트 조회
				if (e.type == 'keyup' && core.array.include([38, 37, 40, 39, 35, 36, 13, 27], e.keyCode)) { return; } // 키능식 조작시 ajax콜 방지
				clearTimeout(me.closeTimer);

				if (e.type === 'focusin' && !core.browser.isTouch) {
					me.$el.off('mousedown.toggle'+me.cid)
						.on('mousedown.toggle'+me.cid, 'input[type=text]', function (e) {
							clearTimeout(me.closeTimer);

							if (!$.trim(this.value)) {
								me._toggleRecents();
							} else if(me.hasKeywords){
								me._toggleKeywords();
							}
						});
				}

				me._openDropdown(this.value);
			}, 100));

			// 키보드 방향키 바인딩
			!core.browser.isTouch && me.$el.on('keydown', 'input[type=text]', function (e) {
				switch (e.keyCode) {
					case 38: // 위로
						if (me.$('div.visible').size() === 0) { return; }

						e.preventDefault();
						me._selectItem('up');
						break;
					case 40: // 아래로
						if (me.$('div.visible').size() === 0) {
							return;
						}

						e.preventDefault();
						me._selectItem('down');
						break;
					case 27: // esc
						e.preventDefault();
						me._closeAllsubs();
						break;
				}
			});
			// 검색어 입력 - END
		},

		/**
		 * 음성검색 레이어 팝업
		 * @private
		 */
		_bindSpeechEvents: function () {
			var me = this;

			// 음성검색: 추본 모듈은 샘플용입니다. 개발은 서버개발단에서 하는걸로 협의가 됐습니다.
			var showSpeechModal = function () {
				if ($('#speech-modal').size() > 0) { $('#speech-modal').scModal('open'); return; }

				core.importJs(['modules/speech-recognition'], function (e) {
					var $modal = $($('#speech-modal-tmpl').html()).appendTo('body');
					$modal.scModal('open').scSpeechRecognition().on('modalshown', function () {
						$modal.find('.ui_searching, .ui_failure').hide();
						$modal.find('.ui_ready').show();
					});
				});
			};
			// 음성검색 버튼 클릭
			me.$el.on('click', '.input_voice', function (e) {
				showSpeechModal();
			});
		},

		/**
		 * 키워드 관련 이벤트 바인딩
		 * 최근 검색어 관련 이벤트 바인딩
		 * @private
		 */
		_bindDropdownListEvents: function () {
			var me = this;

			// 자동완성 리스트 - START
			me.$el.on('click', '.auto_keyword_t .close', function (e) {
				me._toggleKeywords(false);
				me.$btnSubmit.focus();
			}).on('mousedown', '.auto_keyword_t', function (e) {
				e.preventDefault();
				clearTimeout(me.closeTimer);
			});
			// 자동완성 리스트 - END

			// 최근검색어 - START
			me.$el.on('click', '.recent_keyword_t li .del', function (e) {
				e.stopPropagation();

				// 최근검색어 삭제
				core.Cookie.removeItem(COOKIE_NAME, $(this).siblings('a').attr('data-keyword'));
				$(this).closest('li').remove();

				if (me.$recentBox.find('li').size() === 0) {
					me._toggleRecents(false);
				}
				me.$input.focus();
			}).on('click', '.recent_keyword_t .close', function (e) {
				// 최근검색어 닫기
				me._toggleRecents(false);
				me.$btnSubmit.focus();
			}).on('click', '.recent_keyword_t .all_del', function (e) {
				// 최근검색어 전체삭제
				core.Cookie.remove(COOKIE_NAME);
				me._toggleRecents(false);
				me.$input.focus();
			}).on('mousedown', '.recent_keyword_t', function (e) {
				e.preventDefault();
				clearTimeout(me.closeTimer);
			});
			// 최근검색어 - END
		},

		_forceKeyup: function () {
			// 파이어폭스에서 한글을 입력할 때 keyup이벤트가 발생하지 않는 버그가 있어서
			// 타이머로 value값이 변경된걸 체크해서 강제로 keyup 이벤트를 발생시켜 주어야 한다.
			var me = this,
				nowValue,
				win = window,
				doc = document,

			// keyup 이벤트 발생함수: 크로스브라우징 처리
				fireEvent = (function(){
					if (doc.createEvent) {
						// no ie
						return function(oldValue){
							var e;
							if (win.KeyEvent) {
								e = doc.createEvent('KeyEvents');
								e.initKeyEvent('keyup', true, true, win, false, false, false, false, 65, 0);
							} else {
								e = doc.createEvent('UIEvents');
								e.initUIEvent('keyup', true, true, win, 1);
								e.keyCode = 65;
							}
							me.$input[0].dispatchEvent(e);
						};
					} else {
						// ie: :(
						return function(oldValue) {
							var e = doc.createEventObject();
							e.keyCode = 65;
							me.$input[0].fireEvent('onkeyup', e);
						};
					}
				})();

			var timer = null;
			me.$el.on('focusin', 'input', function(){
				if (timer){ return; }
				var el = this;
				timer = setInterval(function() {
					nowValue = el.value;
					if (me.oldKeyword !== nowValue) {
						me.oldKeyword = nowValue;
						fireEvent();
					}
				}, 60);
			}).on('focuout', 'input', function(){
				if (timer){
					clearInterval(timer);
					timer = null;
				}
			});
		},

		/**
		 * 활성화
		 * @param {string} dir 방향 (up, down 중 택일)
		 * @private
		 */
		_selectItem: function(dir) {
			var me = this,
				index, $items, $item, count;

			$items = me.$('div.visible li');
			count = $items.size();
			index = $items.index($items.filter('.active'));

			if (dir === 'up') {
				index -= 1;
				if (index < 0) { index = count - 1; }
			} else {
				index += 1;
				if (index >= count) { index = 0; }
			}

			$item = $items.eq(index);
			$items.filter('.active').removeClass('active');
			$item.addClass('active');  // 활성화

			me.$input.val($item.find('a').attr('data-keyword')); // 인풋에 삽입
		},
		/**
		 * 열려있는 박스를 전부 닫는다.
		 * @private
		 */
		_closeAllsubs: function () {
			var me = this;

			$('body').removeClass('opened_header');
			me._toggleKeywords(false);
			me._toggleRecents(false);
		},

		/**
		 * 검색리스트 조회
		 * @param {string} q 입력한 키워드
		 * @return {XMLRequest}
		 * @private
		 */
		_loadKeywords: function (q) {
			var me = this;

			if (me.oldKeyword === me.$input.val()) { return; }
			// 이전 request 취소
			if (me.xhr && me.xhr.readyState != 4) { me.xhr.abort(); me.xhr = null; }

			me.xhr = $.ajax({
				url: me.$input.attr('data-url'),
				dataType: 'json',
				data: {
					query: q
				}
			}).done(function (json) {
					if (json.responsestatus == 0
						&& !core.isEmpty(json.result)
						&& !core.isEmpty(json.result[0].items)) {
					me.hasKeywords = true;
					me._renderKeywords(json.result[0].items, q);
					me._toggleKeywords(true);
				} else {
					me.hasKeywords = false;
					me._toggleKeywords(false);
				}
			}).fail(function () {
				me._toggleKeywords(false)
			});

			return me.xhr;
		},


		/**
		 * 자동완성 렌더링
		 * @param {Object} json 검색된 키워드리스트
		 * @param {string} q 입력한 키워드
		 * @private
		 */
		_renderKeywords: function (items, q) {
			var me = this,
				html = '';

			if (!items || !items.length) {
				me.hasKeywords = false;
				me.$keywordBox.find('ul').empty();
				return;
			}

			core.each(items, function (item, i) {
				if (i >= 14){ return false; } // TODO
				var val = core.string.escapeHTML(item.keyword);
				if (item.hkeyword) {
					html += '<li><a href="#" data-keyword="' + val + '">' + item.hkeyword + '</a></li>';
				} else {
					html += '<li><a href="#" data-keyword="' + val + '">' + val.replace(q, '<i class="highlight">' + q + '</i>') + '</a></li>';
				}
			});

			me.$keywordBox.find('ul').html(html);
		},

		/**
		 * 최근검색어 렌더링
		 * @private
		 */
		_renderRecents: function () {
			var me = this,
				items = core.Cookie.getItems(COOKIE_NAME),
				html = '';

			if (core.isEmpty(items)) {
				me.hasRecents = false;
				me.$recentBox.find('ul').empty();
				return;
			}

			core.each(items, function (val, i) {
				if (i >= 14){ return false; }
				val = core.string.escapeHTML(val);
				html += '<li><a href="#" data-keyword="'+val+'">'+val+'</a><button type="button" class="del"><span class="hide">검색어 삭제</span></button></li>';
			});
			me.$recentBox.find('ul').html(html);
			me.hasRecents = true;
		},

		/**
		 * 최근검색어 토글
		 * @param {boolean} flag 최근검색어 박스 표시여부
		 * @private
		 */
		_toggleRecents: function (flag) {
			var me = this;

			if (flag) {
				// 키워드박스 닫기
				me._toggleKeywords(false);
			}

			me._renderRecents();
			if (arguments.length === 0) {
				flag = !me.$recentBox.is('.visible');
			}
			flag = flag && me.hasRecents;
			me.$recentBox.toggle(flag).toggleClass('visible', flag);
			me.isOpenedDropdown = flag;
		},

		/**
		 * 키워드 토글
		 * @param {boolean} flag 키워드 박스 표시여부
		 * @private
		 */
		_toggleKeywords: function (flag) {
			var me = this;

			if (arguments.length === 0) {
				flag = !me.$keywordBox.is('.visible');
			}
			flag = flag && me.hasKeywords;

			if (flag) {
				// 최근검색어 닫기
				me._toggleRecents(false);
			}
			me.$keywordBox.toggle(flag).toggleClass('visible', flag);
			me.isOpenedDropdown = flag;
		}
	});

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return CombineSearcher;
		});
	}

})(jQuery, window[LIB_NAME]);