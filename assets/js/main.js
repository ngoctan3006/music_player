const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'Tan';
const cd = $('.cd');
const header = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'The Playah (Special Performance)',
            singer: 'Soobin X SlimV',
            path: './assets/audio/1.mp3',
            image: './assets/img/1.jpg'
        },
        {
            name: 'Đường Tôi Chở Em Về Remix',
            singer: 'buitruonglinh',
            path: './assets/audio/2.mp3',
            image: './assets/img/2.jpg'
        },
        {
            name: 'Có Hẹn Với Thanh Xuân',
            singer: 'Monstar',
            path: './assets/audio/3.mp3',
            image: './assets/img/3.jpg'
        },
        {
            name: 'Muộn Rồi Mà Sao Còn',
            singer: 'Sơn Tùng M-TP',
            path: './assets/audio/4.mp3',
            image: './assets/img/4.jpg'
        },
        {
            name: 'Có Chắc Yêu Là Đây',
            singer: 'Sơn Tùng M-TP',
            path: './assets/audio/5.mp3',
            image: './assets/img/5.jpg'
        },
        {
            name: 'Yêu Từ Đâu Mà Ra Remix',
            singer: 'Lil Zpoet',
            path: './assets/audio/6.mp3',
            image: './assets/img/6.jpg'
        },
        {
            name: 'Thích Em Hơi Nhiều',
            singer: 'Wren Evans',
            path: './assets/audio/7.mp3',
            image: './assets/img/7.jpg'
        },
        {
            name: 'Lỡ Say Bye Là Bye',
            singer: 'Changg X Lemese',
            path: './assets/audio/8.mp3',
            image: './assets/img/8.jpg'
        },
        {
            name: 'Internet Love',
            singer: 'hnhngan',
            path: './assets/audio/9.mp3',
            image: './assets/img/9.jpg'
        },
        {
            name: 'Phải Chăng Em Đã Yêu',
            singer: 'Juky San ft. Redt',
            path: './assets/audio/10.mp3',
            image: './assets/img/10.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}');"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`;
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvent: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Rotate CD
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth > 0 ? newCdWidth / cdWidth : 0;
        }

        // Play/pause
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        audio.ontimeupdate = function() {
            const progressPercent = Math.floor(this.currentTime / this.duration * 100);
            progress.value = progressPercent;
        }

        progress.oninput = function(e) {
            const seekTime = e.target.value/100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Netx/Prev
        nextBtn.onclick = function() {
            if(_this.isRandom)
                _this.playRandomSong();
            else _this.nextSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        prevBtn.onclick = function() {
            if(_this.isRandom)
                _this.playRandomSong();
            else _this.prevSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Randon
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Auto next/repeat when audio ended
        audio.onended = function() {
            if(_this.isRepeat)
                audio.play();
            else nextBtn.click();
        }

        // Repeat
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Click playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionNode = e.target.closest('.option');
            if(songNode || optionNode) {
                if(songNode) {
                    // _this.currentIndex = songNode.getAttribute('data-index');
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }
    },
    loadCurrentSong: function() {
        header.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        if(this.currentIndex === this.songs.length - 1)
            this.currentIndex = 0;
        else this.currentIndex++;
        this.loadCurrentSong();
    },
    prevSong: function() {
        if(this.currentIndex === 0)
            this.currentIndex = this.songs.length - 1;
        else this.currentIndex--;
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 200);
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();
        // Lắng nghe/ xử lý các sự kiện (DOM events)
        this.handleEvent();
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng)
        this.loadCurrentSong();
        // Render playlist
        this.render();
        // Hiển thị trạng thái ban đầu của button randon và repeat
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();
