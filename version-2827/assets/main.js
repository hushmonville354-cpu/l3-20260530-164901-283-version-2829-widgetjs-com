(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeText(value) {
        return String(value || "").replace(/[&<>"]/g, function (ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[ch];
        });
    }

    ready(function () {
        var menu = qs(".menu-toggle");
        var panel = qs(".mobile-panel");
        if (menu && panel) {
            menu.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var slides = qsa(".hero-slide");
        if (slides.length) {
            var dots = qsa(".hero-dots button");
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            };
            var prev = qs(".hero-arrow.prev");
            var next = qs(".hero-arrow.next");
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            setInterval(function () {
                show(current + 1);
            }, 5800);
        }

        var filter = qs("#pageFilter");
        if (filter) {
            var cards = qsa(".movie-card");
            var empty = qs(".empty-state");
            filter.addEventListener("input", function () {
                var keyword = filter.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var hit = !keyword || (card.getAttribute("data-search") || "").toLowerCase().indexOf(keyword) !== -1;
                    card.style.display = hit ? "" : "none";
                    if (hit) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            });
        }

        var results = qs("#searchResults");
        if (results && window.SEARCH_INDEX) {
            var params = new URLSearchParams(window.location.search);
            var query = (params.get("q") || "").trim().toLowerCase();
            var heading = qs("#searchHeading");
            var list = window.SEARCH_INDEX.filter(function (item) {
                if (!query) {
                    return true;
                }
                return item.text.toLowerCase().indexOf(query) !== -1;
            }).slice(0, 120);
            if (heading) {
                heading.textContent = query ? "搜索结果：" + params.get("q") : "片库精选";
            }
            if (!list.length) {
                results.innerHTML = "<div class=\"empty-state show\">暂无匹配影片</div>";
            } else {
                results.innerHTML = list.map(function (item) {
                    return "<a class=\"movie-card\" href=\"./" + item.file + "\" data-search=\"" + escapeText(item.text) + "\">" +
                        "<span class=\"poster-wrap\"><img src=\"" + item.cover + "\" alt=\"" + escapeText(item.title) + "\" loading=\"lazy\"><span class=\"year-badge\">" + escapeText(item.year) + "</span><span class=\"hover-play\">▶</span></span>" +
                        "<span class=\"movie-card-body\"><strong>" + escapeText(item.title) + "</strong><em>" + escapeText(item.genre) + "</em><span class=\"card-line\">" + escapeText(item.line) + "</span></span>" +
                    "</a>";
                }).join("");
            }
        }
    });

    window.initPlayer = function (sourceUrl) {
        ready(function () {
            var video = document.getElementById("moviePlayer");
            var overlay = document.getElementById("playOverlay");
            if (!video || !overlay) {
                return;
            }
            var hlsInstance = null;
            var started = false;
            var loadScript = function (done) {
                if (window.Hls) {
                    done();
                    return;
                }
                var existing = document.querySelector("script[data-hls-loader]");
                if (existing) {
                    existing.addEventListener("load", done, { once: true });
                    existing.addEventListener("error", done, { once: true });
                    return;
                }
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
                script.setAttribute("data-hls-loader", "1");
                script.addEventListener("load", done, { once: true });
                script.addEventListener("error", done, { once: true });
                document.head.appendChild(script);
            };
            var playVideo = function () {
                overlay.classList.add("is-hidden");
                video.controls = true;
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {});
                }
            };
            var attach = function () {
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                    playVideo();
                    return;
                }
                loadScript(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hlsInstance.loadSource(sourceUrl);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            playVideo();
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal && hlsInstance) {
                                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                    hlsInstance.startLoad();
                                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                    hlsInstance.recoverMediaError();
                                }
                            }
                        });
                    } else {
                        video.src = sourceUrl;
                        playVideo();
                    }
                });
            };
            overlay.addEventListener("click", attach);
            video.addEventListener("click", function () {
                if (video.paused) {
                    attach();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };
})();
