/**
 * Created by 김승일책임(comahead@vi-nyl.com) on 2015-08-27
 * @module
 * @description 주소찾기 자동완성 모듈
 */
(function ($, core) {
	"use strict";

	if (core.ui.AutoComplete) { return; }

	/**
	 * 주소찾기 자동완성 모듈
	 * @class
	 * @name scui.ui.AutoComplete
	 * @extends scui.ui.View
	 */
	var AutoComplete = core.ui('AutoComplete', {
		bindjQuery: 'autoComplete',
		defaults: {
			url: '/cuide/script/demo/addr_keywords.html?q={keyword}'
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			me.$listWrap = me.$el.parent().next();
			me.$scroller = me.$listWrap.find('.ui_scrollarea');
			me.$listbox = me.$listWrap.find('ul').css('position', 'relative');
			me.itemCount = 0;

			me._bindEvents();
		},
		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this,
				xhr, timer, inputTimer;

			if (core.browser.isGecko) {
				me._forceKeyup();
			}

			// 리스트 조회
			var loadList = function (val) {
				if (me.oldValue === val) {
					if (me.itemCount) {
						me.open();
					}
					return;
				}
				if (xhr && xhr.readyState != 4) { xhr.abort(); xhr = null; }

				//
				if (!val) {
					me._render({list:[]});
				} else {
					//console.log('sender', val);
					xhr = $.ajax({
						global: false,
						url: me.options.url.replace(/\{keyword\}/, val),
						dataType: "json"
					}).done(function (json) {
						me._render(json);
					});
				}
			};

			// 키보드를 입력할 때 0.1초 이후에 조회(타이핑이 잠깐 멈첬을 때 조회)
			me.$el.on('keyup paste cut focusin input', function (e) {
				var val = this.value;
				if (!$.trim(val)) { me.close(); return; }
				if (core.array.include([38, 37, 40, 39, 35, 36, 13, 27], e.keyCode)) { return; } // 키능식 조작시 ajax콜 방지

				clearTimeout(inputTimer);
				inputTimer = setTimeout(function () {
					loadList(val);
				}, 200);
			}).next().on('click', function () { me.close(); });

			// 리스트에서 항목 선택
			me.$listWrap.on('click', 'a', function (e) {
				clearTimeout(timer);
				e.preventDefault();
				me.close();
				me.$el.val(me.prevValue = $(this).text()).parent().next('button').focus();
			});

			// 포커스를 벗어나면 닫히도록
			var $wrapper = me.$el.parent().parent().on('focusin focusout', 'input, .auto_wrap', function (e){
				clearTimeout(timer);
				if (e.type === 'focusout'){
					timer = setTimeout(function () {
						me.close();
					}, 100);
				}
			});

			// 키보드 방향키 바인딩
			!core.browser.isTouch && me.$el.on('keydown', function (e) {
				switch (e.keyCode) {
					case 38: // 위로
						if (!me.isOpened) { return; }

						e.preventDefault();
						me._selectItem('up');
						break;
					case 40: // 아래로
						if (me.itemCount === 0) { return; }
						if (!me.isOpened) {
							if (me.oldValue === me.$el.val()) {
								me.open();
							} else {
								loadList();
							}
							return;
						}

						e.preventDefault();
						me._selectItem('down');
						break;
					case 27: // esc
						e.preventDefault();
					case 13: // enter
						me.close();
						break;
				}
			});

			// 바깥영역을 클릭할 때 닫히도록
			$(document).on('click.'+me.cid, function (e){
				if (!$.contains($wrapper[0], e.target)) {
					clearTimeout(timer);
					me.close();
				}
			});
		},
		_forceKeyup: function () {
			// 파이어폭스에서 한글을 입력할 때 keyup이벤트가 발생하지 않는 버그가 있어서
			// 타이머로 value값이 변경된걸 체크해서 강제로 keyup 이벤트를 발생시켜 주어야 한다.
			var me = this,
				$el = me.$el,
				el = me.el,
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
							el.dispatchEvent(e);
						};
					} else {
						// ie: :(
						return function(oldValue) {
							var e = doc.createEventObject();
							e.keyCode = 65;
							el.fireEvent('onkeyup', e);
						};
					}
				})();

			var timer = null;
			$el.on('focusin', function(){
				if (timer){ return; }
				timer = setInterval(function() {
					nowValue = el.value;
					if (me.prevValue !== nowValue) {
						me.prevValue = nowValue;
						fireEvent();
					}
				}, 60);
			}).on('focuout', function(){
				if (timer){
					clearInterval(timer);
					timer = null;
				}
			});
		},

		// 활성화
		_selectItem: function(dir) {
			var me = this,
				index, $items, $item;

			if (!me.isOpened) { return; }
			$items = me.$listbox.children().find('a');
			index = $items.index($items.filter('.active'));

			if (dir === 'up') {
				index -= 1;
				if (index < 0) { index = me.itemCount - 1; }
			} else {
				index += 1;
				if (index >= me.itemCount) { index = 0; }
			}

			$item = $items.eq(index);
			$items.filter('.active').removeClass('active');
			$item.addClass('active');  // 활성화
			me.$scroller.scrollTop($item.parent().position().top - 50); // 활성화된 항목의 위치가 가운데 오게 강제스크롤

			me.$el.val(me.prevValue = $item.text()); // 인풋에 삽입
		},

		// 렌더링
		_render: function (json) {
			var me = this,
				html = '',
				keyword = me.$el.val(),
				list = json.list,
				len = list.length;

			me.itemCount = len;
			me.oldValue = keyword;

			if (!$.trim(keyword) || len === 0) {
				me.close();
				return;
			}

			for(var i = 0; i < len; i++) {
				html += '<li><a href="#" tabindex="-1">' +
					core.string.escapeHTML(list[i]).replace(keyword, '<b>'+keyword+'</b>') +
					'</a></li>';
			}
			me.$listbox.html(html);
			me.$scroller.scrollTop(0);
			me.open();
		},
		// 열기
		open: function (){
			this.isOpened = true;
			this.$listbox.find('a.active').removeClass('active');
			this.$listWrap.show().find('.ui_scrollview').removeAttr('tabindex');
		},
		// 닫기
		close: function (){
			this.isOpened = false;
			this.$listWrap.hide();
		}
	});

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return AutoComplete;
		});
	}

})(jQuery, window[LIB_NAME]);