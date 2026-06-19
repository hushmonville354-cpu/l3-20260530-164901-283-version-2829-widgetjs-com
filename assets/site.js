(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".mobile-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll(".hero-thumb"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("active", thumbIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var index = parseInt(thumb.getAttribute("data-slide"), 10);
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function setupFilter(scope) {
    var input = scope.querySelector(".page-filter");
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-year-filter]"));
    var grid = scope.parentElement.querySelector(".filter-grid");

    if (!grid) {
      grid = document.querySelector(".filter-grid");
    }

    if (!grid) {
      return;
    }

    var items = Array.prototype.slice.call(grid.children);
    var activeYear = "all";

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";

      items.forEach(function (item) {
        var text = (item.getAttribute("data-title") + " " + item.getAttribute("data-region") + " " + item.getAttribute("data-genre") + " " + item.getAttribute("data-year")).toLowerCase();
        var year = item.getAttribute("data-year");
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedYear = activeYear === "all" || year === activeYear;

        item.classList.toggle("is-filtered-out", !(matchedText && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q) {
        input.value = q;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeYear = button.getAttribute("data-year-filter") || "all";

        buttons.forEach(function (other) {
          other.classList.toggle("active", other === button);
        });

        applyFilter();
      });
    });

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(setupFilter);
})();

function initVideoPlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var loaded = false;

  if (!video || !cover || !sourceUrl) {
    return;
  }

  function loadAndPlay() {
    cover.classList.add("is-hidden");

    if (!loaded) {
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = sourceUrl;
        video.play().catch(function () {});
      }
    } else {
      video.play().catch(function () {});
    }
  }

  cover.addEventListener("click", loadAndPlay);

  video.addEventListener("click", function () {
    if (!loaded) {
      loadAndPlay();
    }
  });
}
