document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-sub');
  const heroCta = document.querySelector('.hero-cta');
  const heroCtaLinks = [...document.querySelectorAll('.hero-cta a[href^="#"]')];
  const howtoSection = document.querySelector('.section-howto');
  const howtoTitle = document.querySelector('.section-howto .container > h2');
  const howtoSteps = [...document.querySelectorAll('.section-howto .steps li')];
  const howtoNote = document.querySelector('.section-howto .note');
  let howtoTitleLeft = null;
  let howtoTitleRight = null;
  let howtoNoteLeft = null;
  let howtoNoteRight = null;
  const words = document.querySelectorAll('.hero-title .word');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!words.length || !heroTitle || !heroSub || !heroCta) {
    return;
  }

  let lastScrollY = window.scrollY;
  let introLocked = true;
  let introProgress = 0;
  let touchStartY = null;
  const introEndProgress = 1;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };
  const MIN_VISIBLE_WHEEL_STEPS = 4;
  const WHEEL_STEP_PX = 100;
  const HOWTO_ENTRY_FADE_PX = 120;
  const HOWTO_EXIT_FADE_PX = 120;
  const HOWTO_TITLE_STATIC_WHEEL_STEPS = 3;
  const HOWTO_TITLE_MOVE_WHEEL_STEPS = 4;
  const HOWTO_TITLE_STATIC_PX = HOWTO_TITLE_STATIC_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_TITLE_SPLIT_PX = HOWTO_TITLE_MOVE_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_TITLE_TOTAL_EXIT_PX = HOWTO_TITLE_STATIC_PX + HOWTO_TITLE_SPLIT_PX;

  const isIntroSequenceComplete = () => introProgress >= introEndProgress;

  const scrollToHashTarget = (hash) => {
    const targetId = hash.replace('#', '');
    if (!targetId) {
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
  };

  const revealTargets = [
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

  if (howtoTitle) {
    const titleText = (howtoTitle.textContent || '').trim().replace(/\s+/g, ' ');
    const titleWords = titleText.split(' ');
    if (titleWords.length >= 2) {
      const leftWord = titleWords[0];
      const rightWord = titleWords.slice(1).join(' ');
      howtoTitle.innerHTML = `<span class="howto-title-word howto-title-word-left">${leftWord}</span> <span class="howto-title-word howto-title-word-right">${rightWord}</span>`;
      howtoTitleLeft = howtoTitle.querySelector('.howto-title-word-left');
      howtoTitleRight = howtoTitle.querySelector('.howto-title-word-right');
    }
  }

  if (howtoNote) {
    const noteText = (howtoNote.textContent || '').trim().replace(/\s+/g, ' ');
    const noteWords = noteText.split(' ');
    if (noteWords.length >= 2) {
      const leftWord = noteWords[0];
      const rightWord = noteWords.slice(1).join(' ');
      howtoNote.innerHTML = `<span class="howto-note-word howto-note-word-left">${leftWord}</span> <span class="howto-note-word howto-note-word-right">${rightWord}</span>`;
      howtoNoteLeft = howtoNote.querySelector('.howto-note-word-left');
      howtoNoteRight = howtoNote.querySelector('.howto-note-word-right');
    }
  }

  const updateHowtoSequence = () => {
    if (!howtoSection || !howtoSteps.length) {
      return;
    }

    const howtoSequenceItems = [
      howtoTitle,
      ...howtoSteps,
      howtoNote
    ].filter(Boolean);

    if (!howtoSequenceItems.length) {
      return;
    }

    if (window.matchMedia('(max-width: 900px)').matches) {
      howtoSection.style.minHeight = '';
      howtoSequenceItems.forEach((item) => {
        item.style.opacity = '';
        item.style.transform = '';
        item.style.filter = '';
      });
      if (howtoTitleLeft && howtoTitleRight) {
        howtoTitleLeft.style.transform = '';
        howtoTitleLeft.style.opacity = '';
        howtoTitleRight.style.transform = '';
        howtoTitleRight.style.opacity = '';
      }
      if (howtoNoteLeft && howtoNoteRight) {
        howtoNoteLeft.style.transform = '';
        howtoNoteLeft.style.opacity = '';
        howtoNoteRight.style.transform = '';
        howtoNoteRight.style.opacity = '';
      }
      return;
    }

    const sectionRect = howtoSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const minVisiblePx = MIN_VISIBLE_WHEEL_STEPS * WHEEL_STEP_PX;
    const maxExitTravelPx = Math.max(HOWTO_EXIT_FADE_PX, HOWTO_TITLE_TOTAL_EXIT_PX);
    const minTravelPerItem = minVisiblePx + HOWTO_ENTRY_FADE_PX + maxExitTravelPx;
    const minSectionHeight = Math.ceil(viewportHeight + minTravelPerItem * howtoSequenceItems.length);
    if (howtoSection.offsetHeight < minSectionHeight) {
      howtoSection.style.minHeight = `${minSectionHeight}px`;
    }

    const totalTravel = Math.max(1, howtoSection.offsetHeight - viewportHeight);
    const rawProgress = (-sectionRect.top) / totalTravel;
    const sectionProgress = clamp01(rawProgress);
    const itemTravelPx = totalTravel / howtoSequenceItems.length;

    howtoSequenceItems.forEach((item, index) => {
      const globalTravelPx = sectionProgress * totalTravel;
      const itemStartPx = index * itemTravelPx;
      const localTravelPx = globalTravelPx - itemStartPx;
      let opacity = 0;
      let exitSpreadPhase = 0;
      const isTitleItem = item === howtoTitle;
      const isNoteItem = item === howtoNote;
      const isSplitTextItem = isTitleItem || isNoteItem;
      const exitTravelPx = isSplitTextItem
        ? Math.max(HOWTO_EXIT_FADE_PX, HOWTO_TITLE_TOTAL_EXIT_PX)
        : HOWTO_EXIT_FADE_PX;
      const exitStartPx = Math.max(HOWTO_ENTRY_FADE_PX, itemTravelPx - exitTravelPx);

      if (localTravelPx > 0 && localTravelPx < itemTravelPx) {
        if (isSplitTextItem) {
          if (localTravelPx <= HOWTO_TITLE_STATIC_PX) {
            opacity = 1;
          } else {
            // Title stays static for 3 wheel steps, then splits/fades for 4.
            exitSpreadPhase = clamp01((localTravelPx - HOWTO_TITLE_STATIC_PX) / Math.max(1, HOWTO_TITLE_SPLIT_PX));
            opacity = 1 - smooth(exitSpreadPhase);
          }
        } else if (localTravelPx <= HOWTO_ENTRY_FADE_PX) {
          opacity = smooth(localTravelPx / HOWTO_ENTRY_FADE_PX);
        } else if (localTravelPx <= exitStartPx) {
          opacity = 1;
        } else {
          exitSpreadPhase = clamp01((localTravelPx - exitStartPx) / Math.max(1, exitTravelPx));
          opacity = 1 - smooth(exitSpreadPhase);
        }
      }

      const lift = (1 - opacity) * 26;
      item.style.opacity = opacity.toFixed(3);
      item.style.filter = `blur(${((1 - opacity) * 2).toFixed(2)}px)`;

      if (howtoSteps.includes(item)) {
        item.style.transform = `translateY(${lift.toFixed(1)}px) scale(${(0.98 + opacity * 0.02).toFixed(3)})`;
      } else if (isSplitTextItem) {
        item.style.transform = 'translate(-50%, -50%)';
        const spreadPx = 160 * smooth(exitSpreadPhase);
        if (isTitleItem && howtoTitleLeft && howtoTitleRight) {
          howtoTitleLeft.style.transform = `translateX(${-spreadPx.toFixed(1)}px)`;
          howtoTitleLeft.style.opacity = opacity.toFixed(3);
          howtoTitleRight.style.transform = `translateX(${spreadPx.toFixed(1)}px)`;
          howtoTitleRight.style.opacity = opacity.toFixed(3);
        }
        if (isNoteItem && howtoNoteLeft && howtoNoteRight) {
          howtoNoteLeft.style.transform = `translateX(${-spreadPx.toFixed(1)}px)`;
          howtoNoteLeft.style.opacity = opacity.toFixed(3);
          howtoNoteRight.style.transform = `translateX(${spreadPx.toFixed(1)}px)`;
          howtoNoteRight.style.opacity = opacity.toFixed(3);
        }

      } else {
        item.style.transform = `translateY(${(lift * 0.6).toFixed(1)}px)`;
      }
    });
  };

  const renderLockedIntro = () => {
    words.forEach((word) => {
      word.style.animation = 'none';
      word.style.opacity = '1';
    });

    const titlePhase = clamp01(introProgress / 0.34);
    words.forEach((word, index) => {
      // Hide each word one after another while translating it upward.
      const segmentStart = index / words.length;
      const localPhase = clamp01((titlePhase - segmentStart) * words.length);
      const eased = smooth(localPhase);
      word.style.opacity = String(1 - eased);
      word.style.transform = `translateY(${-30 * eased}px)`;
    });

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

    heroTitle.style.opacity = '1';
    heroTitle.style.filter = `blur(${titlePhase * 1.4}px)`;

    heroSub.style.opacity = String(subOpacity);
    heroSub.style.filter = `blur(${(1 - subOpacity) * 2}px)`;

    heroCta.style.opacity = String(ctaOpacity);
    heroCta.style.filter = `blur(${(1 - ctaOpacity) * 2}px)`;
    heroCta.style.pointerEvents = ctaOpacity > 0.3 ? 'auto' : 'none';
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
    if (isIntroSequenceComplete() && direction > 0) {
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
    if (isIntroSequenceComplete() && isDown) {
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
    if (isIntroSequenceComplete() && direction > 0) {
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

  heroCtaLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') {
        return;
      }

      event.preventDefault();

      if (introLocked) {
        introProgress = 1;
        unlockIntro();
      }

      requestAnimationFrame(() => {
        scrollToHashTarget(hash);
      });
    });
  });

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

  let scrollTicking = false;
  const runScrollAnimations = () => {
    scrollTicking = false;
    updateRevealStates();
    updateHowtoSequence();
  };

  const onScrollAnimated = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    requestAnimationFrame(runScrollAnimations);
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
  if (howtoSection && howtoSteps.length) {
    body.classList.add('js-howto-sequence');
  }

  lockIntro(0);

  updateRevealStates();
  updateHowtoSequence();
  window.addEventListener('wheel', onTopReverseWheel, { passive: false });
  window.addEventListener('scroll', onScrollAnimated, { passive: true });
  window.addEventListener('resize', updateRevealStates);
  window.addEventListener('resize', updateHowtoSequence);
  window.addEventListener('load', updateRevealStates);
  window.addEventListener('load', updateHowtoSequence);
});