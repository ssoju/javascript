/*!
 * @author 김승일(comahead@vi-nyl.com)
 */
(function(context, $, core, undefined) {
    "use strict";

    var isDebug = location.href.indexOf('debug=true') >= 0;
    if(isDebug) {
        window.isLogin = true;
    }

    $.ajaxSetup({
        timeout: 20000,
        fail: function(){
            alert('죄송합니다. 알 수 없는 오류로 인해 중단되었습니다.');
        }
    })

    var MusicReview = core.ui('MusicReview', {
        bindjQuery: 'musicReview',
        defaults: {
            limit: 300
        },
        events: {

        },
        // 리뷰작성 템플릿
        _tmpl: '<div class="review_box">' +
        '<div class="write">' +
        '<form action="<$-action$>" method="post" onsubmit="return false">' +
        '<input type="hidden" name="musicSeq" value="<$-musicSeq$>" >' +
        '<textarea name="contents" <$ if(!window.isLogin){ $>readonly="readonly"<$ } $> placeholder="리뷰는 300자 이내로 입력할 수 있으며, 타인을 배려해서 리뷰를 남겨주세요. 불건전한 내용은 관리자에 의해 비공개 처리 될 수 있습니다." title="리뷰 입력창"></textarea>' +
        '<button class="button d-submit">등록</button>' +
        '</form>' +
        '</div>' +
        '<div class="d-review-list"><ul class="review_list"><li class="no_review"><p>리뷰를 조회중입니다...</p></li></ul></div>' +
        '<button type="button" class="review_close">리뷰 접기</button>' +
        '</div>',

        // 리뷰수정 템플릿
        _tmplModify: '<form action="<$-action$>" method="post" onsubmit="return false">' +
        '<input type="hidden" name="musicSeq" value="<$-musicSeq$>">' +
        '<input type="hidden" name="seq" value="<$-seq$>">' +
        '<textarea rows="7" cols="7" name="contents" placeholder="리뷰는 300자 이내로 입력할 수 있으며, 타인을 배려해서 리뷰를 남겨주세요. 불건전한 내용은 관리자에 의해 비공개 처리 될 수 있습니다." title="리뷰 입력창"><$=contents$></textarea>' +
        '<div class="btns">' +
        '<button class="btn_review d-submit">등록</button> ' +
        '<button type="button" class="btn_review d-cancel">취소</button>' +
        '</div>' +
        '</form>',

        initialize: function(el, options) {
            var me = this;

            if(me.callParent(el, options) === false) {
                return;
            }

            me.musicSeq = me.options.musicSeq;
            me.page = 1;

            me._createReviewRow();
            me._bindEvents();

            me.toggle(true);
        },
        /**
         * 리뷰행 생성
         * @private
         */
        _createReviewRow: function () {
            console.log('_createReviewRow');
            var me = this,
                $row;

            if(me.$el.hasClass('d-built')){ return; }
            if(me.$el.is('tr')) { $row = me.$el.children(); }
            else { $row = me.$el; }

            // 리뷰행 생성
            $row.html(core.template(me._tmpl, {
                musicSeq: me.musicSeq,
                action: core.Env.get('reviewWrite')
            })).buildUIControls();

            me.$el.addClass('d-built');
        },
        /**
         *
         * @private
         */
        _bindEvents: function () {
            var me = this;

            /*me.on('click', function(e) {
             e.stopPropagation();
             me.toggle();
             });*/

            me.$el
                .on('keydown', '.d-contents-input textarea', function (e) {
                    // esc키를 눌렀을 때 읽기모드로 변경
                    if(e.which === core.keyCode.ESCAPE && confirm("입력한 내용이 삭제됩니다. \n취소하시겠습니까?")) {
                        me._toggleModify(me._getReviewSeq(this), false);
                    }
                })
                .on('click', 'div.paging a:not(.disabled)', function (e) {
                    // 페이징
                    e.preventDefault();
                    var $a = $(this),
                        page = $a.data('page') || 1,
                        cls = $a.attr('class');
                    me._loadList(page).done(function(){
                        me.$el.find('.d-review-list .paging a.'+cls).focus();
                    });
                })
                .on('click', 'button.d-delete', function(e) {
                    // 삭제
                    e.preventDefault();
                    if(!me._checkLogin()){ return; }
                    if(!confirm('삭제하시겠습니까?')){ return; }

                    me._deleteReview(me._getReviewSeq(this));
                })
                .on('click', 'button.d-cancel, button.d-modify', function (e) {
                    // 수정, 취소
                    e.preventDefault();
                    if(!me._checkLogin()){ return; }

                    me._toggleModify(me._getReviewSeq(this), $(this).hasClass('d-modify'));
                })
                .on('click', 'textarea', function () {
                    var $txt = $(this);
                    if (!me._checkLogin()) { return; }
                    $txt.removeAttr('readonly');
                })
                .on('focusin', 'textarea', function(e){
                    // 포커싱이 될 때 글자수 제한기능 바인딩
                    var $txt = $(this);
                    if($txt.data('bindLimit')){ return; }
                    $txt.data('bindLimit', true).textControl({limit: me.options.limit});
                })
                .on('click', '.review_close', function () {
                    // 접기
                    me.toggle(false);
                })
                .on('submit', 'div.write form', function(e) {
                    // 서브밋 시, 로그인체크
                    e.preventDefault();
                    if(!me._checkLogin()){ return; }

                    var xhr;
                    if(xhr = me._doSubmit(this)) {
                        xhr.done(function (json) {
                            alert('등록되었습니다');

                            me._loadList(me.page);
                        });
                    }
                })
                .on('submit', '.d-contents-input form', function(e){
                    e.preventDefault();
                    if(!me._checkLogin()){ $(this).find('.d-submit').focus(); return; }

                    var $frm = $(this),
                        xhr;

                    if(xhr = me._doSubmit(this)) {
                        xhr.done(function (json) {
                            var $row = $frm.closest('li'),
                                $contents = $row.find('.d-contents>p');

                            me._toggleModify(me._getReviewSeq($frm), false);
                            $contents.html((json.contents||'').replace(/\r\n|\n/g, "<br>"));

                            alert('수정되었습니다');
                        });
                    }
                });

            core.PubSub.on('resetreview', function(e, data) {
                me.reset(data.reviewSeq);
            });
        },
        /**
         * 로그인 체크
         * @returns {boolean}
         * @private
         */
        _checkLogin: function(){
            if(!window.isLogin){
                if (confirm('로그인이 필요합니다.\r\n로그인 팝업을 띄우시겠습니까?')) {
                    openLoginPopup("Y");
                }
                return false;
            }
            return true;
        },
        /**
         * el이 소속된 리뷰 seq를 추출
         * @param el
         * @returns {*|string}
         * @private
         */
        _getReviewSeq: function(el) {
            return $(el).closest('li').data('reviewSeq') || '';
        },
        /**
         * 리뷰 등록 ajax
         * @param e
         * @returns {boolean}
         * @private
         */
        _doSubmit: function (frm) {
            if(!this._checkLogin()){ return; }

            var me = this,
                $frm = $(frm),
                $txt = $frm.find('textarea'),
                data = {};

            if($txt.trimVal() === '') {
                alert('내용을 입력해주세요.');
                $txt.focus();
                return false;
            }

            // serialize
            core.each(core.toArray($frm[0].elements), function(el){
                if(el.name){
                    data[el.name] = el.value;
                }
            });

            var def = $.Deferred();
            $.ajax({
                type: 'post',
                url: frm.action, //'SMU1_review_write.html',
                dataType: 'json',
                data: data
            }).done(function (json) {
                if(!json.success) {
                    alert(json.message);
                    def.reject();
                    return;
                }
                def.resolve.apply(this, [].slice.call(arguments))
                $frm[0].reset();
            }).fail(function (res) {
                if(res && res.responseJSON){
                    alert(res.responseJSON.message);
                } else {
                    alert('죄송합니다. 알수 없는 이유로 작업이 중단되었습니다.');
                }
                def.reject();
            });
            return def.promise();
        },
        /**
         * 수정화면 토글
         * @param seq
         * @param isModify
         * @private
         */
        _toggleModify: function(seq, isModify) {
            if(isModify && !this._checkLogin()){ return; }

            var me = this,
                $row = me.$el.find('.d-review-list li[data-review-seq='+seq+']'),
                $input = $row.find('.d-contents-input'),
                $contents = $row.find('.d-contents');


            $contents.toggleClass('none', isModify);
            $input.toggleClass('none', !isModify);
            $row.toggleClass('d-modify-mode', isModify);

            if(isModify) {
                // 수정모드
                // form 강제리셋
                core.PubSub.trigger('resetreview', {reviewSeq: seq});

                $input.html(core.template(me._tmplModify, {
                    action: core.Env.get('reviewModify'),
                    musicSeq: me.musicSeq,
                    seq: seq,
                    contents: core.string.unescapeHTML($contents.find('p').html().replace(/\n/g, '').replace(/<br[ \/]*>/gi, "\n"))
                })).find('textarea').focus();
            } else {
                // 읽기모드
                $input.html('');
                $contents.find('.d-modify').focus();
            }

        },
        /**
         * 리뷰리스트 조회
         * @param page
         * @returns {*}
         * @private
         */
        _loadList: function (page) {
            console.log('_loadList');
            var me = this,
                url;

            if(isDebug) {
                url = (me.musicSeq | 0) === 123 ? 'SMU1_review_list.html' : 'SMU1_review_list_no.html';
            } else {
                url = core.Env.get('reviewList');
            }

            return $.ajax({
                type: 'post',
                url: url, //  core.Env.get('reviewList'), //'SMU1_review_list.html',
                data: {
                    musicSeq: me.musicSeq,
                    page: page
                }
            }).done(function (html) {
                var $list = me.$el.find('.d-review-list'),
                    total;

                $list.html(html).buildUIControls();
                total = $list.find('.paging').data('totalCount') | 0;
                me.page = page;
                me.triggerHandler('loadedreview', {
                    totalCount: Math.min(total, 99),
                    page: page
                });
            });
        },
        /**
         * 리뷰삭제
         * @param seq
         * @returns {*}
         * @private
         */
        _deleteReview: function (seq) {
            console.log('_deleteReview');
            var me = this,
                def = $.Deferred();

            $.ajax({
                type: 'post',
                url: core.Env.get('reviewDelete'), //'SMU1_review_delete.html',
                data: {
                    musicSeq: me.musicSeq,
                    seq: seq
                },
                dataType: 'json'
            }).done(function(json) {
                if(!json.success) {
                    alert(json.message);
                    def.reject();
                    return;
                }
                def.resolve.apply(this, [].slice.call(arguments))
                me._loadList(1);
            }).fail(function () {
                def.reject();
            });
            return def.promise();
        },
        /**
         * 읽기모드로 변환
         */
        reset: function(reviewSeq){
            var me = this;
            me.$el.find('.d-modify-mode').each(function(){
                var seq = $(this).data('reviewSeq');
                if(seq === reviewSeq){ return; }
                me._toggleModify(seq, false);
            });
        },
        /**
         * 숨김/펼침 전환
         * @param isShow
         */
        toggle: function (isShow) {
            var me = this,
                isExpand;

            if(arguments.length > 0){
                me.$el.toggleClass('none', !isShow);
            } else {
                me.$el.toggleClass('none');
            }
            isExpand = !me.$el.hasClass('none');

            me.$el.toggleClass('on', isExpand);
            me.triggerHandler('togglereview', {isExpand: isExpand});
            isExpand && me._loadList(1);
        },
        /**
         *
         */
        release: function () {
            var me = this;

            me.callParent();
            me.$el.off().removeData();
        }
    })
})(window, jQuery, emart);
