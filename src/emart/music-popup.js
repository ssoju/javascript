/*!
 * @author: 김승일
 * @email: comahead@vi-nyl.com
 * @dependence: MediaElement(MIT License, http://mediaelementjs.com)
 */
(function(context, $, core, undefined) {
    "use strict";

    var config = emart.Env.get('emartMusic'),
        Cookie = core.Cookie,
        player;

    //
    core.music = {
        /**
         * 곡 추가
         * @param data
         * @returns {*}
         */
        add: function (data) {
            if(!player) { return; }
            var seq = core.isArray(data.seq) ? data.seq : [data.seq];
            //if(data.play){ player.remove(seq); }
            if(data.play && player.isPlaying()){ player.pause(); }
            return this.loadFromServer({seq: seq.join(',')}).done(function (json) {
                if (data.play) {
                    player.pause();
                    player.playById(seq[0]);
                }
            });
        },
        /**
         * 곡 재생
         * @param id
         */
        play: function(id){
            if(!player) { return; }
            player.pause();
            player.playById(id);
        },
        // 서버에서 주어진 seq에 해당하는 트랙정보를 조회 ///////////////////////////////////////////////////////////
        loadFromServer: function(params) {
            return $.ajax({
                url: config.url,
                type: config.type || 'post',
                dataType: config.dataType || 'json',
                data: params,
                cache: false
            }).done(function(json) {
                var tracks = [];
                if (json.playTrack) {
                    // 파라미터로 넘어온 트랙을 자동으로 재생시키기 위한.
                    tracks.push(json.playTrack);
                };

                // 쿠키에 있는 값을 추가
                player.addTracks(tracks.concat(json.tracks));
            });
        },
        // 컨텐츠 사이즈에 맞게 창사이즈 조절
        resizeToContent: function(){
            var innerX,innerY,
                pageX, pageY,
                win = window,
                doc = win.document;

            if (win.innerHeight) {
                innerX = win.innerWidth;
                innerY = win.innerHeight;
            } else if (doc.documentElement && doc.documentElement.clientHeight) {
                innerX = doc.documentElement.clientWidth;
                innerY = doc.documentElement.clientHeight;
            } else if (doc.body) {
                innerX = doc.body.clientWidth;
                innerY = doc.body.clientHeight;
            }

            pageX = doc.body.offsetWidth;
            pageY = doc.body.offsetHeight;

            win.resizeBy(pageX - innerX, pageY - innerY);
        }
    };

    player = window.player = new core.ui.EmartAudioPlayer(config.target, {
        idAttribute: 'seq', // 트랙의 id에 해당하는 키명
        srcAttribute: 'music_file', // 트랙의 src에 해당하는 키명
        loop: Cookie.get('musicloop') || '',
        success: function(e, data) {

            // 파라미터 & 쿠키에 있는 시퀀스를 조합해서 서버로부터 리스트를 조회
            var params = {},
                ckTracks = Cookie.get('musictracks') || '';

            if (ckTracks) {          // 쿠키에 있는 값을 조회
                params.seq = ckTracks.replace(/\|/g, ',');
                core.music.loadFromServer(params);
            }
        }
    });


    // 트랙리스트에 변화가 생기면 쿠키에 동기화 시킨다. /////////////////////////////////////////////////////////////
    player.on('click', '.d-loop', function() {
        // 반복여부를 쿠키에 저장
        Cookie.set('musicloop', player.getOption('loop'));
    }).playList.on('addedtrack removedtrack', function(e, data) {
            if(!data.id){ return; }

            // 쿠키에 반영
            switch(e.type){
                case 'addedtrack':
                    Cookie.addToArray('musictracks', data.id);
                    break;
                case 'removedtrack':
                    Cookie.removeToArray('musictracks', data.id);
                    break;
            }
        });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // 접근성을 위해 wsc키를 누를 때 플레이가 일시정지되도록 함.
    emart.$doc.on('keyup', function(e){
        if(e.which === emart.keyCode.ESCAPE && player.isPlaying()){
            player.pause();
        } else if(e.which === emart.keyCode.SPACE && player.playList.tracks.size()>0 && !player.isPlaying()) {
            player.play();
        }
    });


    $(window).on('beforeunload', function() {
        if(player.isPlaying()){
            return "뮤직 플레이어 화면을 벗어나면 재생중인 음악이 정지됩니다.";
        }
    }).on('load', function(){
        // 팝업사이즈 조절
        $('#player_wrap').css('height', 531);
        window.setTimeout(emart.music.resizeToContent, 1000);
    });



})(window, jQuery, emart);
