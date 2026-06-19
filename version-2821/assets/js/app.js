document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var queryInput = document.querySelector(".search-input");
  var yearSelect = document.querySelector(".year-filter");
  var typeSelect = document.querySelector(".type-filter");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
  var empty = document.querySelector(".no-results");
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  if (queryInput && initialQuery) {
    queryInput.value = initialQuery;
  }
  function filterCards() {
    if (!queryInput && !yearSelect && !typeSelect) return;
    var q = queryInput ? queryInput.value.trim().toLowerCase() : "";
    var year = yearSelect ? yearSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var shown = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title || "",
        card.dataset.tags || "",
        card.dataset.region || "",
        card.dataset.genre || ""
      ].join(" ").toLowerCase();
      var ok = true;
      if (q && haystack.indexOf(q) === -1) ok = false;
      if (year && String(card.dataset.year) !== year) ok = false;
      if (type && haystack.indexOf(type.toLowerCase()) === -1) ok = false;
      card.style.display = ok ? "" : "none";
      if (ok) shown += 1;
    });
    if (empty) {
      empty.classList.toggle("show", shown === 0);
    }
  }
  [queryInput, yearSelect, typeSelect].forEach(function (el) {
    if (el) {
      el.addEventListener("input", filterCards);
      el.addEventListener("change", filterCards);
    }
  });
  filterCards();
});
