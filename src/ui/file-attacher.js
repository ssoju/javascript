/*!
 * @author: 김승일
 * @email: comahead@vi-nyl.com
 */
(function($, core, ui, undefined) {
    "use strict";

    /**
     * @class
     * @name common.ui.FileAttacher
     * @extends common.ui.View
     * @description
     *   안드로이드 4.3이상 부터는 form를 이용한 파일업로드가 지원되지 않기 때문에,<br>
     *   앱에서 서버로 직접 파일을 올린 다음, 그 올려진 파일 path를 넘겨받아서 hidden에 담아주는 역할을 담당한다.<br><br>
     *
     *  1. 안드로이드 4.3이상<br>
     *   1) 파일버튼 클릭<br>
     *   2) 히든폼 생성<br>
     *   3) 앱에다 파일업로드 요청<br>
     *   4) 앱에서 업로드 후 notifyFileUploadResult 이벤트를 날려줌(id 와 파일 path가 넘어옴)<br>
     *   5) 2번에서 생성한 히든폼에 파일 path를 설정<br>
     *  <br>
     *  2. 일반 웹 버전<br>
     *   1) 파일폼 클릭
     *   2) 파일선택창에서 파일선택을 하는 순간
     *   3) 파일이 선택된 파일폼은 숨기고, 새로운 파일폼을 생성하여 기존파일폼 위치에 배치
     *
     */
    ui('FileAttacher', /** @lends common.ui.FileAttacher# */{
        bindjQuery: 'fileAttacher',
        defaults: {
            target: ''
        },
        /**
         * 생성자
         * @param {Element} el 폼엘리먼트
         * @param {JSON} options 옵션
         */
        initialize: function(el, options) {
            var me = this;

            if(me.callParent(el, options) === false) { return; }

            me.addedCount = 0;	// 다중 업로드 모드일 때 현재까지 추가된 갯수

            if(window.isAndroid4_3_over){
                me._bindAppEvents();
            } else {
                me._bindEvents();
            }
        },

        /**
         * 다중업로드 모드일때 다음 시퀀스번호 반환(현재까지 추가된 갯수 + 1)
         * @param {String} name 파일폼 이름
         */
        getNextSeq: function(name) {
            return this.$el.find('input[name='+name+']').length + 1;
        },

        /**
         * 다중업로드 모드일 때, 현재까지 추가된 파일폼 갯수를 기준으로 현재 시퀀스번호 반환
         * @param {String} name 파일폼 이름
         */
        getCurrentSeq: function(name) {
            return this.$el.find('input[name='+name+']').length;
        },

        // 앱모드(안드로이드 4.3 이상일때만)
        _bindAppEvents: function() {
            var me = this;

            // 앱에서 파일 업로드 후 호출되는 핸들러.
            // hidden폼에 앱에서 넘겨받은 파일path를 설정해준다. 
            // key : 고유키
            // filename: 올려진 파일의 path경로
            core.PubSub.on('notifyFileUploadResult', function(e, key, filename) {
                var $el = $('#'+key).val(filename),
                    isMultiple = $el.attr('data-multiple') === 'true',											// 다중업로드 여부
                    validExts = ($el.attr('data-exts')||'jpg;png;gif').toLowerCase().split(';'),		// 확장자 체크
                    maxCount = $el.data('max')|0;																	// 최대 업로드 수

                // 최대업로드 수를 넘겼으면 무효화
                if(me.getCurrentSeq() > maxCount){
                    return;
                }

                // 확장자 체크
                if(validExts.length > 0 && !core.valid.allowFile(filename, validExts)){
                    alert('유효하지 않는 확장자입니다.');
                    $el.remove();
                    return;
                }

                // 파일업로드 후, 페이지내에서 별도의 작업을 처리할 수 있도록 이벤트를 날려준다.
                // 이를테면, 업로드된 파일정보를 보여주는 UI가 있을 경우..이 이벤트를 이용하면 된다. 
                me.triggerHandler('fileattached', {
                    from: 'app',			// 
                    _id: key,
                    result: {
                        key: key,
                        value: filename
                    },
                    isMultiple: isMultiple,
                    maxCount: $el.data('max')|0
                });
            });

            // d-file클래스를 가진 파일폼이나 버튼을 클릭했을 때, 앱에다 파일업로드 를 요청한다.
            me.on('click', '.d-file', function(e) {
                e.preventDefault();

                var $el = $(this),
                    name = $el.attr('data-name'),
                    upload_dir = $el.attr('data-dir'),
                    seq = me.getNextSeq(name),
                    id = name+'_'+seq,
                    maxCount = $el.data('max')|0,
                    isMultiple = $el.attr('data-multiple') === 'true';

                // 파일path를 설정할 히든폼의 이름
                if(!name){
                    alert('data-name 속성을 설정해 주세요.');
                    e.preventDefault();
                    return;
                }

                // 업로드할 디렉토리
                if(!upload_dir){
                    alert('data-dir 속성을 설정해 주세요.');
                    e.preventDefault();
                    return;
                }

                // 최대업로드 수 체크
                if(isMultiple && seq > maxCount){
                    alert('최대 ' + maxCount + '개까지 등록할 수 있습니다.');
                    e.preventDefault();
                    return;
                }

                // 파일path를 설정할 히든폼을 하나 생성해놓는다.
                $el.parent().append('<input type="hidden" name="'+name+'" id="'+id+'" >');
                $el.focus();

                // 앱에다 파일업로드 요청
                // id: 업로드 후 파일path를 설정할 히든폼의 id
                common.app.cmd('upload_image_file', 'key='+id+'&upload_dir='+upload_dir);
            });

        },

        // 일반 웹모드
        _bindEvents: function() {
            var me = this;

            // d-file를 가진 파일폼을 클릭시, 조건에 부합하지 않으면 파일선택창을 안띄움
            me.on('click', '.d-file', function(e){
                var $el = $(this),
                    name = $el.attr('data-name'),
                    maxCount = $el.data('max')|0,
                    isMultiple = $el.attr('data-multiple') === 'true';

                if(!name){
                    alert('data-name 속성을 설정해 주세요.');
                    e.preventDefault();
                    return;
                }

                // 최대업로드 수 체크
                if(isMultiple && me.getCurrentSeq(name) >= maxCount){
                    e.preventDefault();
                    alert('최대 ' + maxCount + '개까지 등록할 수 있습니다.');
                    return;
                }
            });

            // 파일이 추가되었으면
            me.on('change', '.d-file', function(e) {
                var $el = $(this),
                    name = $el.attr('data-name'),
                    isMultiple = $el.attr('data-multiple') === 'true',
                    validExts = ($el.attr('data-exts')||'jpg;png;gif').toLowerCase().split(';'),
                    seq = isMultiple ? me.getNextSeq(name) : me.getNextSeq(name),
                    id = name + '_' + seq;

                // 확장자 체크
                if(validExts.length > 0 && !core.valid.allowFile($el[0].value, validExts)){
                    $el.replaceWith($el.clone());
                    alert('유효하지 않는 확장자입니다.');
                    return;
                }

                var $file = $el.clone();
                $el.parent().append($file); //파일이 첨부된 file요소는 숨기고, 새로운(clone된) file요소를 버튼으로 표시

                if(!isMultiple) {
                    // 다중 파일이 아니면 기존에 존재하는걸 삭제하고 새로 첨부된 것으로 교체
                    $el.parent().find('.d-added-file, .d-oldfile').remove();
                }
                // 파일이 선택된 파일폼을 숨긴다.
                $el.attr({'name': name, 'id': id}).hide().removeData().addClass('d-added-file');
                $file.focus();

                // 파일업로드 후, 페이지내에서 별도의 작업을 처리할 수 있도록 이벤트를 날려준다.
                // 이를테면, 업로드된 파일정보를 보여주는 UI가 있을 경우..이 이벤트를 이용하면 된다. 
                me.triggerHandler('fileattached', {
                    from: 'web',
                    _id: id,
                    result: {
                        value: $el[0].value
                    },
                    isMultiple: isMultiple,
                    maxCount: $el.data('max')|0
                });
            });

        }
    });

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);