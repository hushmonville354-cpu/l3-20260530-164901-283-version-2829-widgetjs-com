(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var open = menu.hasAttribute('hidden');
            if (open) {
                menu.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                menu.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1) {
        var current = 0;
        var show = function (index) {
            slides[current].classList.remove('is-active');
            if (dots[current]) {
                dots[current].classList.remove('is-active');
            }
            current = index;
            slides[current].classList.add('is-active');
            if (dots[current]) {
                dots[current].classList.add('is-active');
            }
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });
        setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    var filterInput = document.querySelector('.filter-input');
    var filterGrid = document.querySelector('[data-filterable="true"]');
    if (filterInput && filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.empty-state');
        filterInput.addEventListener('input', function () {
            var q = filterInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var hit = !q || (card.getAttribute('data-search') || '').indexOf(q) !== -1;
                card.hidden = !hit;
                if (hit) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    }

    var searchGrid = document.querySelector('[data-search-results="true"]');
    if (searchGrid) {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim().toLowerCase();
        var input = document.querySelector('.search-query-input');
        if (input) {
            input.value = q;
        }
        var searchCards = Array.prototype.slice.call(searchGrid.querySelectorAll('.search-result-card'));
        var emptySearch = document.querySelector('.empty-state');
        var visibleSearch = 0;
        searchCards.forEach(function (card) {
            var hit = !q || (card.getAttribute('data-search') || '').indexOf(q) !== -1;
            card.hidden = !hit;
            if (hit) {
                visibleSearch += 1;
            }
        });
        if (emptySearch) {
            emptySearch.hidden = visibleSearch !== 0;
        }
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player="true"]'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;
        var start = function () {
            if (!stream) {
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                started = true;
            }
            player.classList.add('is-playing');
            video.play().catch(function () {});
        };
        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
