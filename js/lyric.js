$(function () {
    'use strict';
    //songTextArr=['horse','moon','2012']
    window.Lyric = function ($audio, songTextArr) {

        this.audio = $audio[0];
        this.timer = null;
        this.targetArr = [];
        this.songTextArr = songTextArr;

        this.bind();
    }
    Lyric.prototype.Loading = function (newIndex) {
        this.id = newIndex;
        this.getWordsArr();
    }
    Lyric.prototype.bind = function () {
        var me = this;
        // 点击歌词则显示/隐藏歌词
        $("#showLyric").on('click', function () {
            $(".current-words").toggle();//显示隐藏的开关
            me.showWords();
        });
    }
    // 重新获取新的歌词数组
    Lyric.prototype.getWordsArr = function () {
        this.targetArr = [];
        var songTextRaw = this.songTextArr[this.id];
        if (!songTextRaw) {
            $(".current-words").text("暂无歌词");
            return;
        }
        var arr = songTextRaw.split('\n');
        for (var i = 0; i < arr.length; i++) {
            var textItem = arr[i]                   //"[03:13.98]心需要你哄它"  [ar:大张伟]
                , numberFlag = textItem.split(":")[0].replace('[', '');       //03

            if (!isNaN(numberFlag)) {// 判断是否是带有时间数字的歌词
                var words = textItem.split("]")[1]
                    , timeRaw = textItem.split("]")[0].replace("[", '')
                    , timerArr = timeRaw.split(":")
                    , minute = parseFloat(timerArr[0])
                    , seconds = parseFloat(timerArr[1]) + minute * 60
                    , obj = {
                        time: seconds,
                        content: words,
                    }
                this.targetArr.push(obj);
            }
        }
    }
    Lyric.prototype.showWords = function () {
        if (this.timer) {
            return;
        }
        var me = this;
        this.timer = setInterval(function () {
            var str = me.getWordsByTime(me.audio.currentTime);
            $(".current-words").text(str);

        }, 100);
    }
    Lyric.prototype.getWordsByTime = function (time) {

        for (var i = 1; i < this.targetArr.length; i++) {
            if ((this.targetArr[i].time - 0.5) < time)
                continue;
            else {
                return this.targetArr[i - 1].content;
            }
        }
    }

})