/*!
 * @module placeholder
 * @author 김승일(comahead@vi-nyl.com)
 *
 * 1시간만에 작성한 모듈..ㅋ
 */
(function() {
	"use strict";

	var isInputSupported = 'placeholder' in document.createElement('input');
	if (isInputSupported) { return; }

	var Placeholder = function (el) {
		this.el = el;
		this.placeholder = el.getAttribute('placeholder') || '';
		this.password = this.el.type === 'password';
		this._init();
	};

	Placeholder.prototype = {
		constructor: Placeholder,
		_init: function () {
			var me = this;

			if (me.password) {
				var input = document.createElement('input');
				input.type = 'text';
				input.style.cssText = me.el.style.cssText;
				input.style.display = 'none';
				input.className = me.el.className.replace(/ *ui_[a-z0-9_]+/ig, '') + ' ui_fake';
				input.value = me.placeholder;
				input.readOnly = true;
				if (me.el.parentNode.lastchild === me.el) {
					me.el.parentNode.appendChild(input);
				} else {
					me.el.parentNode.insertBefore(input, me.el.nextSibling);
				}
				me.fake = input;
				if (!me.el.value) {
					me.el.style.display = 'none';
					me.fake.style.display = '';
				}
			}

			if (!me.password && !me.el.value) {
				me.el.value = me.placeholder;
			}

			me._bindEvents();
		},

		_bindEvents: function () {
			var me = this;

			if (me.password) {
				me.fake.attachEvent('onfocus', function () {
					me.fake.style.display = 'none';
					me.el.style.display = '';
					me.el.focus();
				});
				me.el.attachEvent('onblur', function () {
					if (me.el.value === '' || me.el.value === me.placeholder) {
						me.el.style.display = 'none';
						me.fake.style.display = '';
					}
				});
			} else {
				me.el.attachEvent('onfocus', function () {
					if (me.el.value === me.placeholder) {
						me.el.value = '';
					}
				});
				me.el.attachEvent('onblur', function () {
					if (me.el.value === '' || me.el.value === me.placeholder) {
						me.el.value = me.placeholder;
					}
				});
			}
		}
	};

	var hooks = {
		set: function (el, value) {
			el.value = value || '';
			if (el.type === 'password') {
				if (el.value) {
					$(el).show().siblings('.ui_fake').hide();
				} else {
					$(el).hide().siblings('.ui_fake').show();
				}
			} else {
				if (!el.value) {
					el.value = el.getAttribute('placeholder') || '';
				}
			}

			//var e = document.createEventObject();
			//el.fireEvent('onchange', e);
			return $(el);
		},
		get: function (el) {
			if (el.value === el.getAttribute('placeholder')) {
				return '';
			}
			return el.value;
		}
	}

	window.attachEvent('onbeforeunload', function () {
		for(var i = 0, len = instances.length; i < len; i++) {
			if (instances[i].fake){
				instances[i].fake.parentNode.removeChild(instances[i].fake);
			}
			instances[i] = null;
		}
		instances = [];
	});

	var inputs = document.getElementsByTagName('input'),
		textareas = document.getElementsByTagName('textarea'),
		instances = [],
		bindjQueryHooks;

	setInterval(function () {
		var input,
			len;
		if (!bindjQueryHooks && window.$) {
			$.valHooks.input = $.valHooks.textarea = hooks;
			$.propHooks.value = hooks;
			bindjQueryHooks = true;
		}
		len = inputs.length;
		for (var i = 0; i < len; i++) {
			input = inputs[i];
			if (input.className.indexOf('ui_placeholder') < 0 &&
				input.className.indexOf('ui_fake') < 0 &&
				(input.type === 'text' || input.type === 'password') &&
				input.getAttribute('placeholder')) {
				input.className += ' ui_placeholder';
				instances.push(new Placeholder(input));
			}
		}

		len = textareas.length;
		for (var i = 0; i < len; i++) {
			input = textareas[i];
			if (input.className.indexOf('ui_placeholder') < 0 && input.getAttribute('placeholder')) {
				input.className += ' ui_placeholder';
				instances.push(new Placeholder(input));
			}
		}
	}, 500);

})();
