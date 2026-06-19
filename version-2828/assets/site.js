
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function throttle(fn, wait = 120) {
  let t = 0, last = 0, timer = null;
  return (...args) => {
    const now = Date.now();
    last = args;
    if (now - t >= wait) {
      t = now;
      fn(...args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        t = Date.now();
        fn(...last);
      }, wait);
    }
  };
}

function initMobileNav() {
  const btn = $('[data-nav-toggle]');
  const nav = $('[data-navlinks]');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
}

function initHeroCarousel() {
  const hero = $('[data-hero-carousel]');
  if (!hero) return;
  const track = $('.hero-track', hero);
  const slides = $$('.hero-slide', hero);
  const dotsWrap = $('[data-hero-dots]', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  if (!track || slides.length === 0) return;
  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.className = 'hero-dot' + (i === 0 ? ' active' : '');
    b.type = 'button';
    b.setAttribute('aria-label', `切换第 ${i + 1} 张推荐`);
    b.addEventListener('click', () => go(i));
    dotsWrap?.appendChild(b);
    return b;
  });

  const render = () => {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  };

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    render();
  };
  const nextSlide = () => go(index + 1);
  const prevSlide = () => go(index - 1);

  prev?.addEventListener('click', prevSlide);
  next?.addEventListener('click', nextSlide);

  const start = () => {
    stop();
    timer = setInterval(nextSlide, 5500);
  };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
  render();
}

function initSearchFilters() {
  const filters = $$('[data-filter-input]');
  if (!filters.length) return;

  filters.forEach(input => {
    const scope = input.dataset.filterTarget ? document.querySelector(input.dataset.filterTarget) : (input.closest('[data-filter-scope]') || document);
    const cards = scope ? $$('[data-filter-card]', scope) : [];
    const count = $('[data-filter-count]', scope);
    const chips = $$('[data-filter-chip]', scope);

    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const hay = (card.dataset.search || card.textContent || '').toLowerCase();
        const ok = !q || hay.includes(q);
        card.classList.toggle('hidden', !ok);
        if (ok) visible++;
      });
      if (count) count.textContent = String(visible);
    };

    input.addEventListener('input', throttle(apply, 80));
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value || '';
        input.value = value;
        apply();
      });
    });
    apply();
  });
}

async function initPlayers() {
  const wrappers = $$('[data-player]');
  if (!wrappers.length) return;

  const module = await import('./hls-vendor.js').catch(() => null);
  const Hls = module?.H;

  wrappers.forEach(wrapper => {
    const video = $('video', wrapper);
    const btn = $('[data-play-btn]', wrapper);
    if (!video) return;

    const source = wrapper.dataset.m3u8 || video.dataset.m3u8 || '';
    let attached = false;
    let hls = null;

    const attachSource = async () => {
      if (attached) return;
      attached = true;
      if (!source) return;
      if (Hls && Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        // Fallback to mp4 if provided.
        const fallback = wrapper.dataset.mp4 || video.dataset.mp4 || '';
        if (fallback) video.src = fallback;
      }
    };

    const start = async () => {
      await attachSource();
      try {
        await video.play();
        if (btn) btn.classList.add('hidden');
      } catch (err) {
        // keep overlay visible when autoplay is blocked
      }
    };

    btn?.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) start();
    });
    wrapper.addEventListener('mouseenter', () => {
      if (btn && !video.paused) btn.classList.add('hidden');
    });
  });
}

function initLazyPosterSwap() {
  $$('img[data-poster-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      img.src = img.dataset.posterFallback;
    }, { once: true });
  });
}

function initBackToTop() {
  const btn = $('[data-backtop]');
  if (!btn) return;
  const onScroll = () => btn.classList.toggle('hidden', window.scrollY < 500);
  window.addEventListener('scroll', throttle(onScroll, 120), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onScroll();
}

function initDetailJump() {
  const jump = $('[data-jump-player]');
  if (jump) jump.addEventListener('click', () => $('[data-player]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroCarousel();
  initSearchFilters();
  initLazyPosterSwap();
  initBackToTop();
  initDetailJump();
  if ($('[data-player]')) {
    initPlayers();
  }
});
