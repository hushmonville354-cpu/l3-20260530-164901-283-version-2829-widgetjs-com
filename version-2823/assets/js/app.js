(function () {
    var menu = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (menu && panel) {
        menu.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (slides.length > 1) {
        var active = 0;
        var show = function (index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        setInterval(function () {
            show((active + 1) % slides.length);
        }, 5200);
    }

    var form = document.querySelector('[data-filter-form]');
    if (form) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.empty-state');
        var keyword = form.querySelector('[name="keyword"]');
        var year = form.querySelector('[name="year"]');
        var type = form.querySelector('[name="type"]');
        var apply = function () {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || '',
                    card.dataset.region || '',
                    card.dataset.genre || '',
                    card.dataset.type || ''
                ].join(' ').toLowerCase();
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && (card.dataset.year || '') !== y) {
                    ok = false;
                }
                if (t && (card.dataset.type || '') !== t) {
                    ok = false;
                }
                card.classList.toggle('hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        };
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });
        ['input', 'change'].forEach(function (name) {
            form.addEventListener(name, apply);
        });
        var params = new URLSearchParams(window.location.search);
        if (keyword && params.get('q')) {
            keyword.value = params.get('q');
            apply();
        }
    }
})();

function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
        return;
    }
    var attached = false;
    var attach = function () {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };
    var start = function () {
        attach();
        button.style.display = 'none';
        var play = video.play();
        if (play && typeof play.catch === 'function') {
            play.catch(function () {
                button.style.display = 'flex';
            });
        }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!attached || video.paused) {
            start();
        }
    });
}
