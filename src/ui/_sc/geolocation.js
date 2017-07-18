/**
 * Authror: �����
 * Email: comahead@vi-nyl.com
 * Created date: 2014-04-30
 * Description: ���������̼� ���
 */
(function ($, core, undefined) {
	"use strict";

	/**
	 * ����Ƽ�� ���������̼Ǹ� ���� ����ϱ� ������ �ۼ��� Wrapper Ŭ����
	 * @class
	 * @name scui.module.Geolocation
	 * @extends scui.TypeClass
	 * @example
	 *  // ���� ��ġ ��ȸ
	 * Geolocation.getInstance().getCurrentPosition()
	 *      .done(function (position) {
	 *          alert('latitude:' + position.coords.latitude +', longitude:' + position.coords.longitude);
	 *      })
	 *      .fail(function (err) {
	 *          alert('error code:' + err.code + ', error message: ' + err.message);
	 *      });
	 *
	 * // �ǽð� ��ȸ
	 * Geolocation.getInstance().watchPosition(
	 * function (position) { // success callback
	 *
	 * },
	 * function (err) { // failure callback
	 *
	 * });
	 */
	var Geolocation = core.Class(/**@lends common.module.Geolocation */{
		$singleton: true, // �̱���
		/**
		 * ������
		 * @param {Object} options
		 */
		initialize: function(options) {
			var me = this;

			me.options = $.extend({}, {
				maximumAge:600000,					// �ִ� ���� �ð�
				timeout:60000,							// Ÿ�Ӿƿ�
				enableHighAccuracy: false			//
			}, options);

		},

		/**
		 * �����ڵ忡 �ش��ϴ� �ѱ۸޼��� ��ȯ
		 * @param {Object} err err.code, err.message
		 * @return {string} �ѱ� �����޼���
		 */
		_getTransKorMessage: function(err) {
			/*
			 err.code�� ������ �ǹ���. - error.UNKNOWN_ERROR
			 0 : �� �� ���� ���� - error.PERMISSION_DENIED
			 1 : ���� �ź� - error.PERMISSION_DENIED
			 2 : ��ġ�� ����� �� ���� (�� ������ ��ġ ���� �����ڰ� ����) - error.POSITION_UNAVAILABLE
			 3 : �ð� �ʰ� - error.TIMEOUT
			 */
			var message = '';
			if( err.code == 0 ) {
				message = "�� �� ���� �����Դϴ�. \n�ٽ� �õ��� �ּ���.";
			} else if( err.code == 1 ) {
				message = "������ �źεǾ����ϴ�! \n�������� ��ġ���񽺰� �����ִ��� Ȯ�����ּ���.";
			} else if( err.code == 2 ) {
				message = "��ġ�� ����� �� �����ϴ�!";
			} else if( err.code == 3 ) {
				message = "�ð� �ʰ��Ǿ����ϴ�. \n�ٽ� �õ��� �ּ���.";
			}
			return message;
		},

		/**
		 * ���� ��ġ ������
		 * @returns {*}
		 */
		getCurrentPosition: function(options) {
			var me = this,
				defer = $.Deferred();

			options = $.extend({}, me.options, options);

			if( navigator.geolocation ) {
				navigator.geolocation.getCurrentPosition(function(position) {
					defer.resolve(position);
				}, function(err){
					defer.reject({code: err.code, message: me._getTransKorMessage(err)});
				}, options);
			} else {
				defer.reject({code: 101, message: "�˼��մϴ�. �������� ��ġ���񽺸� �������� �ʽ��ϴ�!"});
			}

			return defer.promise();
		},

		/**
		 * �ǽð����� ����(������ �� ���� success ����)
		 * @returns {*}
		 */
		watchPosition: function(successCallback, failCallback, options) {
			var me = this,
				defer = $.Deferred();

			if( navigator.geolocation ) {
				defer.resolve('��� �����մϴ�.');
				navigator.geolocation.watchPosition(successCallback, failCallback, options || me.options);
			} else {
				defer.reject({code: 101, message: "�˼��մϴ�. �������� ��ġ���񽺸� �������� �ʽ��ϴ�!"});
			}

			return defer.promise();
		},

		/**
		 * �������� api�� �̿��Ͽ� ���� ��ġ�� �ּҷ� ��ȯ�Ͽ� ��ȯ(���� ������. ���� ������ �����ʿ�)
		 * @returns {*}
		 */
		getCurrentAddress: function() {
			var me = this,
				defer = $.Deferred();

			me.getCurrentPosition()
				.done(function(position) {
					me._getCoord2Addr(position)
						.done(function() {
							defer.resolve.apply(defer, arguments);
						}).fail(function() {
							defer.reject.apply(defer, arguments);
						});

				}).fail(function(err) {
					defer.reject({code: err.code, message: me._getTransKorMessage(err)});
				});

			return defer.promise();
		}
	});

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return Geolocation;
		});
	}

})(jQuery, window[LIB_NAME]);