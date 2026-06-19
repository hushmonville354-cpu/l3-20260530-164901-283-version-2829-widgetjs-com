(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchQuery();
  });

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dots button"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
        dot.setAttribute("aria-pressed", String(current === active));
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var input = document.querySelector(".movie-filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var clear = document.querySelector(".filter-clear");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".quick-filters button"));
    var empty = document.querySelector(".no-results");
    if (!input || !cards.length) {
      return;
    }

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.keywords,
        card.textContent
      ].join(" ").toLowerCase();
    }

    function apply(value) {
      var keyword = String(value || "").trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", function () {
      chips.forEach(function (chip) {
        chip.classList.remove("is-active");
      });
      apply(input.value);
    });

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        chips.forEach(function (chip) {
          chip.classList.remove("is-active");
        });
        apply("");
        input.focus();
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.dataset.filter || chip.textContent;
        input.value = value;
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply(value);
      });
    });
  }

  function setupSearchQuery() {
    var input = document.querySelector(".movie-filter-input");
    if (!input || !window.location.search) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (!q) {
      return;
    }
    input.value = q;
    input.dispatchEvent(new Event("input"));
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector(".player-start");
      var source = player.getAttribute("data-source") || (video && video.getAttribute("data-source"));
      var loaded = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function attachSource() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        video.setAttribute("playsinline", "playsinline");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
      }

      function playVideo() {
        attachSource().then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      }

      if (trigger) {
        trigger.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (!loaded) {
          playVideo();
          return;
        }
        if (video.paused) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }
})();
