(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function bindHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".mobile-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("open");
    });
  }

  function bindHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-arrow.prev");
    var next = slider.querySelector(".hero-arrow.next");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === current);
        slide.setAttribute("aria-hidden", pos === current ? "false" : "true");
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getSearchText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-region") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-type") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
  }

  function bindSearchFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-item"));
    var empty = document.querySelector(".empty-message");
    if (!cards.length || (!input && !select)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input && q) {
      input.value = q;
    }

    function update() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var chosen = select ? select.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = getSearchText(card);
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !chosen || (card.getAttribute("data-type") || "") === chosen;
        var shouldShow = matchesQuery && matchesType;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", update);
    }
    if (select) {
      select.addEventListener("change", update);
    }
    update();
  }

  window.initPlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !overlay || !source) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachSource() {
      if (attached) {
        overlay.classList.add("hidden");
        video.controls = true;
        playVideo();
        return;
      }

      attached = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      }

      overlay.classList.add("hidden");
      playVideo();
    }

    overlay.addEventListener("click", attachSource);
    video.addEventListener("click", function () {
      if (!attached) {
        attachSource();
      }
    });
  };

  onReady(function () {
    bindHeader();
    bindHero();
    bindSearchFilters();
  });
})();
