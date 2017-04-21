/*!
 * @author: 김승일
 * @email: comahead@vi-nyl.com
 * @require: MediaElement(MIT License, http://mediaelementjs.com)
 */
$(function() {
    "use strict";

    var core = window[LIB_NAME];

    core.music = {
        /**
         * 팝업플레이어 뛰우기
         * @param typeadd, remove
         * @param track
         */
        openPlayer: function(type, track){
            var musicPopup = window.open('', 'musicPopup', 'width=607,height=531, resizable=no, scrollbars=no');
            if(!musicPopup || musicPopup.outerWidth === 0 || musicPopup.outerHeight === 0) {
                alert("팝업 차단 기능이 설정되어있습니다\n\n차단 기능을 해제(팝업허용) 한 후 다시 이용해 주십시오.");
                return;
            }

            if(musicPopup.location.href === 'about:blank') {
                musicPopup.location.href = core.Env.get('popupPlayer');
            }

            var limit = 10,
                fn = function () {
                    if(limit > 50){ return; }
                    if(!musicPopup.emart || !musicPopup.emart.music){ setTimeout(fn, 100); return; }
                    musicPopup.emart.music[type](track);
                    musicPopup.focus();
                };

            if(!musicPopup.emart){ setTimeout(fn, 100); }
            else { fn(); }
        }
    };

    core.$doc.on('click', 'button.review', function (e) {
        // 리뷰버튼 바인딩
        e.preventDefault();

        var $el = $(this),
            $trackRow = $el.closest('.d-track-row'),
            $reviewRow = $trackRow.next('.d-review-row');

        if($el.data('builtreview') !== true) {
            $reviewRow
                .on('togglereview', function(e, data) {
                    // 리부박스가 토글될 때
                    $el.toggleClass('on', data.isExpand);
                    if(!data.isExpand){
                        $el.focus();
                    }
                })
                .on('loadedreview', function(e, data){
                    // 리뷰리스트가 로드됐을 때
                    var $numEl = $el.parent().find('.review_num');
                    $numEl.html('<span class="none">등록리뷰갯수</span>' + data.totalCount)
                        .toggleClass('none', !data.totalCount);
                })
                .musicReview({
                    musicSeq: $trackRow.data('id')
                });
            $el.data('builtreview', true);
        } else {
            $reviewRow
                .musicReview('toggle');
        }
    }).on('click', '.d-listen, .d-addtrack', function(e) {
        // 듣기, 추가
        e.preventDefault();

        var $el = $(this);
        if($el.hasClass('d-listen')) {
            emart.PubSub.trigger('addMusic', {seq: $el.closest('.d-track-row').attr('data-id'), play:true});
        } else if($el.hasClass('d-addtrack')) {
            emart.PubSub.trigger('addMusic', {seq: $el.closest('.d-track-row').attr('data-id')});
        }

    });

    core.PubSub.on('addMusic', function(e, data) {
        core.music.openPlayer('add', data);
    });

    core.require([
        '/js/pages/smu/smu-review.js',
        '/js/common/textcontrol.js'
    ]);
});
