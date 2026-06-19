const nav = document.querySelector('#siteNav');
const toggle = document.querySelector('.menu-toggle');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const opened = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
}

const hero = document.querySelector('#heroSlider');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let active = 0;

  const showSlide = index => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => showSlide(i));
  });

  if (slides.length > 1) {
    setInterval(() => showSlide(active + 1), 5200);
  }
}

const filterInputs = Array.from(document.querySelectorAll('[data-filter-input]'));

filterInputs.forEach(input => {
  const section = input.closest('section');
  const yearSelect = section ? section.querySelector('[data-year-filter]') : null;
  const scope = section ? section.querySelector('[data-filter-scope]') : null;
  const cards = scope ? Array.from(scope.querySelectorAll('[data-card]')) : [];

  const applyFilter = () => {
    const keyword = input.value.trim().toLowerCase();
    const year = yearSelect ? yearSelect.value : '';

    cards.forEach(card => {
      const text = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.textContent
      ].join(' ').toLowerCase();
      const matchedKeyword = !keyword || text.includes(keyword);
      const matchedYear = !year || card.dataset.year === year;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
    });
  };

  input.addEventListener('input', applyFilter);

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilter);
  }
});
