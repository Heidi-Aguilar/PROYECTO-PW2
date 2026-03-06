document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-sub');
  const heroCta = document.querySelector('.hero-cta');
  const words = document.querySelectorAll('.hero-title .word');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!words.length || !heroTitle || !heroSub || !heroCta) {
    return;
  }

  let lastScrollY = window.scrollY;
  let introLocked = true;
  let introProgress = 0;
  let touchStartY = null;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };

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
  revealItems.forEach((item, index) => {
    const stagger = 0.04 + (index % 6) * 0.04;
    item.style.transitionDelay = `${stagger.toFixed(2)}s`;
  });

  const isElementInView = (element) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportHeight * 0.9 && rect.bottom >= 0;
  };

  const renderLockedIntro = () => {
    words.forEach((word) => {
      word.style.animation = 'none';
      word.style.opacity = 1;
    });

    const titleOpacity = 1 - smooth(clamp01(introProgress / 0.34));

    const subPhase = (introProgress - 0.34) / 0.33;
    let subOpacity = 0;
    if (subPhase > 0 && subPhase < 1) {
      if (subPhase <= 0.5) {
        subOpacity = smooth(subPhase * 2);
      } else {
        subOpacity = 1 - smooth((subPhase - 0.5) * 2);
      }
    }

    const ctaPhase = (introProgress - 0.67) / 0.33;
    let ctaOpacity = 0;
    if (ctaPhase > 0 && ctaPhase < 1) {
      if (ctaPhase <= 0.5) {
        ctaOpacity = smooth(ctaPhase * 2);
      } else {
        ctaOpacity = 1 - smooth((ctaPhase - 0.5) * 2);
      }
    }

    heroTitle.style.opacity = String(titleOpacity);
    heroTitle.style.filter = `blur(${(1 - titleOpacity) * 2}px)`;

    heroSub.style.opacity = String(subOpacity);
    heroSub.style.filter = `blur(${(1 - subOpacity) * 2}px)`;

    heroCta.style.opacity = String(ctaOpacity);
    heroCta.style.filter = `blur(${(1 - ctaOpacity) * 2}px)`;
  };

  const onLockedWheel = (event) => {
    if (!introLocked) {
      return;
    }

    event.preventDefault();
    if (event.deltaY === 0) {
      return;
    }

    const step = Math.min(0.08, Math.abs(event.deltaY) * 0.0017);
    const direction = event.deltaY > 0 ? 1 : -1;
    introProgress = clamp01(introProgress + step * direction);
    renderLockedIntro();
    if (introProgress >= 1 && direction > 0) {
      unlockIntro();
    }
  };

  const onLockedKeydown = (event) => {
    if (!introLocked) {
      return;
    }

    const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'];
    const upKeys = ['ArrowUp', 'PageUp', 'Home'];
    const isDown = downKeys.includes(event.key);
    const isUp = upKeys.includes(event.key);

    if (!isDown && !isUp) {
      return;
    }

    event.preventDefault();
    introProgress = clamp01(introProgress + (isDown ? 0.08 : -0.08));
    renderLockedIntro();
    if (introProgress >= 1 && isDown) {
      unlockIntro();
    }
  };

  const onLockedTouchStart = (event) => {
    if (!introLocked || !event.touches.length) {
      return;
    }

    touchStartY = event.touches[0].clientY;
  };

  const onLockedTouchMove = (event) => {
    if (!introLocked || !event.touches.length || touchStartY === null) {
      return;
    }

    const currentY = event.touches[0].clientY;
    const delta = touchStartY - currentY;
    if (delta === 0) {
      return;
    }

    event.preventDefault();
    const step = Math.min(0.08, Math.abs(delta) * 0.003);
    const direction = delta > 0 ? 1 : -1;
    introProgress = clamp01(introProgress + step * direction);
    touchStartY = currentY;
    renderLockedIntro();
    if (introProgress >= 1 && direction > 0) {
      unlockIntro();
    }
  };

  const lockIntro = (startProgress = 0) => {
    introLocked = true;
    introProgress = clamp01(startProgress);
    window.scrollTo(0, 0);
    root.classList.add('scroll-lock');
    body.classList.add('scroll-lock');
    heroTitle.style.opacity = '1';
    heroTitle.style.filter = 'blur(0px)';
    heroSub.style.opacity = '0';
    heroSub.style.filter = 'blur(2px)';
    heroCta.style.opacity = '0';
    heroCta.style.filter = 'blur(2px)';
    heroSub.style.pointerEvents = 'none';
    heroCta.style.pointerEvents = 'none';
    renderLockedIntro();

    window.addEventListener('wheel', onLockedWheel, { passive: false });
    window.addEventListener('touchstart', onLockedTouchStart, { passive: true });
    window.addEventListener('touchmove', onLockedTouchMove, { passive: false });
    window.addEventListener('keydown', onLockedKeydown);
  };

  const unlockIntro = () => {
    introLocked = false;
    root.classList.remove('scroll-lock');
    body.classList.remove('scroll-lock');
    window.removeEventListener('wheel', onLockedWheel);
    window.removeEventListener('touchstart', onLockedTouchStart);
    window.removeEventListener('touchmove', onLockedTouchMove);
    window.removeEventListener('keydown', onLockedKeydown);

    heroTitle.style.opacity = '0';
    heroTitle.style.filter = 'blur(2px)';
    heroSub.style.opacity = '0';
    heroSub.style.filter = 'blur(2px)';
    heroCta.style.opacity = '0';
    heroCta.style.filter = 'blur(2px)';
    heroCta.style.pointerEvents = 'none';
  };

  const onTopReverseWheel = (event) => {
    if (introLocked) {
      return;
    }

    if (window.scrollY > 2 || event.deltaY >= 0) {
      return;
    }

    lockIntro(1);
    onLockedWheel(event);
  };

  const updateRevealStates = () => {
    if (introLocked) {
      if (header) {
        header.classList.remove('header-hidden');
      }
      return;
    }

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

    revealItems.forEach((item) => {
      if (isElementInView(item)) {
        item.classList.add('is-visible');
      } else {
        item.classList.remove('is-visible');
      }
    });

    lastScrollY = currentScrollY;
  };

  if (prefersReduced) {
    body.classList.add('reduced-motion');
    words.forEach((word) => {
      word.style.animation = 'none';
      word.style.opacity = 1;
    });
    heroTitle.style.opacity = '1';
    heroSub.style.opacity = '1';
    heroCta.style.opacity = '1';
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  body.classList.add('js-scroll-reveal');

  lockIntro(0);

  updateRevealStates();
  window.addEventListener('wheel', onTopReverseWheel, { passive: false });
  window.addEventListener('scroll', updateRevealStates, { passive: true });
  window.addEventListener('resize', updateRevealStates);
  window.addEventListener('load', updateRevealStates);
});