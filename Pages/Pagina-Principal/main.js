document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');
  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-sub');
  const heroCta = document.querySelector('.hero-cta');
  const words = document.querySelectorAll('.hero-title .word');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!words.length || !hero || !heroTitle) {
    return;
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  let lastScrollY = window.scrollY;

  if (prefersReduced) {
    body.classList.add('reduced-motion');
    words.forEach((word) => {
      word.style.animation = 'none';
      word.style.opacity = 1;
      word.style.transform = 'none';
    });

    document.querySelectorAll('.reveal-on-scroll').forEach((item) => {
      item.classList.add('is-visible');
    });
    return;
  }

  body.classList.add('js-scroll-reveal');

  words.forEach((word) => {
    word.style.animation = 'none';
    void word.offsetWidth;
    word.style.animation = '';
  });

  const revealTargets = [
    '.section-howto .container > h2',
    '.steps li',
    '.section-howto .note',
    '.section-types .container > h2',
    '.type-card',
    '.section-benefits .container > h3',
    '.section-benefits .container > h2',
    '.benefits-list li',
    '.section-contact .container > h2',
    '.section-contact .redes-sociales a'
  ];

  revealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add('reveal-on-scroll');
    });
  });

  const revealItems = [...document.querySelectorAll('.reveal-on-scroll')];

  heroSub?.classList.add('reveal-on-scroll');
  heroSub?.setAttribute('data-min-scroll', '220');
  heroCta?.classList.add('reveal-on-scroll');
  heroCta?.setAttribute('data-min-scroll', '260');

  revealItems.forEach((item, index) => {
    const stagger = 0.04 + (index % 6) * 0.04;
    item.style.transitionDelay = `${stagger.toFixed(2)}s`;
  });

  const isElementInView = (element) => {
    const minScroll = Number(element.getAttribute('data-min-scroll') || '0');
    if (window.scrollY < minScroll) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportHeight * 0.9 && rect.bottom >= 0;
  };

  const updateRevealStates = () => {
    const currentScrollY = window.scrollY;

    if (header) {
      if (currentScrollY <= 8) {
        header.classList.remove('header-hidden');
      } else if (currentScrollY > lastScrollY + 4) {
        header.classList.add('header-hidden');
      } else if (currentScrollY < lastScrollY - 4) {
        header.classList.remove('header-hidden');
      }
    }

    const heroHeight = hero.offsetHeight || window.innerHeight;
    const heroProgressRaw = clamp(currentScrollY / (heroHeight * 0.45), 0, 1);
    const heroProgress = easeOutCubic(heroProgressRaw);

    heroTitle.style.transform = `scale(${1 + heroProgress * 0.55})`;
    heroTitle.style.opacity = String(1 - heroProgress);
    heroTitle.style.filter = `blur(${heroProgress * 2.2}px)`;

    revealItems.forEach((item) => {
      if (isElementInView(item)) {
        item.classList.add('is-visible');
        return;
      }

      item.classList.remove('is-visible');
    });

    lastScrollY = currentScrollY;
  };

  updateRevealStates();
  window.addEventListener('scroll', updateRevealStates, { passive: true });
  window.addEventListener('resize', updateRevealStates);
  window.addEventListener('load', updateRevealStates);
});