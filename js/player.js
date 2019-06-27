$(function () {
    'use strict';

    window.Player = function (resource) {
        var oPlay = $(".play-btn")
            , oNext = $(".next-btn")
            , oLast = $(".last-btn")
            , $oAudio = $("audio")
            , totalTime = $(".total-time")
            , currentTimeBar = $(".current-time")
            , barCurrent = $(".active")
            , activeRadio = $(".radio")
            , volumeBtn = $(".volume-radio")
            , volumeCurrBar = $(".volume-curr")
            , volumeIcon = $(".volume-icon")
            , volumeNumber = $(".volumeNotice")
            , songName = $(".song")
            , singer = $(".singer")
            , playRandom = $(".fa-random")
            , loading = $("#loading");
        var duration
            , timer = null
            , currentTime
            , barTotalWidth = 310
            , volumeTotalHeight = 48
            , currIndex = 0
            , songTextArr = []
            , lyric = null
            ,   len = resource.length;
        var preSrc = location.href.substring(0, location.href.lastIndexOf('/')).concat("/source/");

        init();

        $oAudio[0].ondurationchange = function () {
            loading.hide();
            duration = $oAudio[0].duration;
            currentTimeBar.text(consertion(0));
            totalTime.text(consertion(duration));

        }
        // 操作：点击播放键
        oPlay.on('mouseup', function () {
            if ($oAudio[0].paused) {
                musicPlay();
            }
            else {
                musicPause();
            }
        })
        $oAudio[0].onended = function () {
            toAnotherSong(1);
        }
        // 操作：进度条
        activeRadio.on('mousedown', function () {

            clearInterval(timer);
            var curT = $oAudio[0].currentTime;

            $("body").on('mousemove', function (e) {
                var allLeft = e.clientX;
                var positionLeft = barCurrent[0].getBoundingClientRect().left;
                var newPositon = allLeft - positionLeft;
                if (newPositon < 0) {
                    newPositon = 0;
                }
                else if (newPositon > 310) {
                    newPositon = 310;
                }
                curT = (newPositon / barTotalWidth) * $oAudio[0].duration;
                barCurrent.css('width', newPositon + 'px');
                currentTimeBar.text(consertion(curT));
            })
            $("body").on('mouseup', function (e) {
                $("body").unbind('mousemove')//解绑
                $("body").unbind("mouseup")
                $oAudio[0].currentTime = curT;
                clearInterval(timer);
                timer = null;
                musicPlay();
            })
        })

        // 点击随机按钮
        playRandom.on('click', function () {
            playRandom.toggleClass('randomActive');
        })
        // 下一首
        oNext.on('mouseup', function () {

            loading.show();
            musicPause();
            wayToChange(1);

        })
         // 上一首
        oLast.on('mouseup', function () {

            loading.show();
            musicPause();
            wayToChange(2);
        })
        // 音量控制
        volumeBtn.on('mousedown', function () {
            var height;
            volumeNumber.fadeIn();
            $oAudio[0].muted = false;

            $("body").on("mousemove", function (e) {
                height = volumeCurrBar[0].getBoundingClientRect().bottom - e.clientY;
                if (height < 5) {
                    height = 5;
                }
                else if (height > 68) {
                    height = 68;
                }
                height = (height - 5) / (68 - 5) * 42 + 6;
                volumeCurrBar.css('height', height + "px");
                var volumeStr = parseInt((height - 6) / (volumeTotalHeight - 6) * 100) + "%";
                volumeNumber.text(volumeStr);
            })
            $("body").on("mouseup", function (e) {
                volumeNumber.fadeOut(1000);
                $("body").unbind("mousemove");
                $("body").unbind("mouseup");
                $oAudio[0].volume = (height - 6) / (volumeTotalHeight - 6);

                if ($oAudio[0].volume <= 0.1) {
                    volumeOff();
                }
                else {
                    volumeUp();
                }
            })
        })
        volumeIcon.on('click', function () {
            if (!$oAudio[0].muted) {
                $oAudio[0].muted = true;
                volumeCurrBar.css('height', 6 + "px");
                volumeOff();
            }
            else {
                $oAudio[0].muted = false;
                $oAudio[0].volume = 0.5;
                volumeCurrBar.css('height', volumeTotalHeight / 2 + "px");
                volumeUp();
            }
        })
        // 音量图标更改
        function volumeUp() {
            volumeIcon.removeClass().addClass("fa fa-volume-up");
        }
        function volumeOff() {
            volumeIcon.removeClass().addClass("fa fa-volume-off");
        }
        // 操作：onload:加载显示基本信息
        function init() {

            updateLoad();

            getSongTextArr();
            lyric = new Lyric($oAudio, songTextArr);
            lyric.Loading(currIndex);
        }
        // 更新src.加载audio
        function updateLoad() {
            $oAudio[0].src = preSrc.concat(resource[currIndex].src);
            $oAudio[0].load();
            musicPlay();
        }

        // 获取歌词数组
        function getSongTextArr() {
            for (var j = 0; j < len; j++) {
                songTextArr.push(resource[j].lyric)
            }
        }
        // 当音乐播放时的操作
        function musicPlay() {
            $oAudio[0].play();
            oPlay.children().removeClass().addClass("fa fa-pause");
            if (!timer) {
                timer = setInterval(updateTime, 200); /*设置时间间隔太长计时器不精准会有问题 */
            }

        }
        // 当音乐暂停时的操作
        function musicPause() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            $oAudio[0].pause();
            oPlay.children().removeClass().addClass("fa fa-play");
        }
        // 实时更新时间和进度条
        function updateTime() {
            currentTime = $oAudio[0].currentTime;
            currentTimeBar.text(consertion(currentTime));
            barCurrent.css('width', barTotalWidth * (currentTime / duration) + "px")
        }
        // 时间格式转化
        function consertion(time) {
            var sec = parseInt(time % 60) < 10 ? "0" + parseInt(time % 60) : parseInt(time % 60);
            var min = parseInt(time / 60) < 10 ? "0" + parseInt(time / 60) : parseInt(time / 60);
            return min + ":" + sec;
        }

        // 随机/顺序
        function wayToChange(num) {
            if (playRandom.hasClass("randomActive")) {
                toRandomSong();
            }
            else {
                if (num == 1) {
                    toAnotherSong(1);
                }
                else if (num == 2) {
                    toAnotherSong(2);
                }
            }
        }
        // 切歌
        function toAnotherSong(para) {//para 1-下一首 2-上一首
            currIndex = (currIndex + para) % len;
            changeSrcThenLoad();
        }
        // 随机播放
        function toRandomSong() {
            currIndex = parseInt(Math.random() * len);
            changeSrcThenLoad();

        }
        // 更改后更新
        function changeSrcThenLoad() {
            updateLoad();
            lyric.Loading(currIndex);
            songName.text(resource[currIndex].song);
            singer.text(resource[currIndex].singer);
            // console.log(currIndex, resource[currIndex].song, resource[currIndex].singer)
        }
    }
})


