(() => {
if (window.__principalEffectsInitialized) {
  // already initialized
  return;
} else {
  window.__principalEffectsInitialized = true;
  const body = document.body;
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const heroSection = document.querySelector('.hero');
  const heroInner = document.querySelector('.hero-inner');
  const heroTitle = document.querySelector('.hero-title');
  const heroSub = document.querySelector('.hero-sub');
  const howtoSection = document.querySelector('.section-catalogo');
  const howtoTitle = document.querySelector('.section-catalogo .container > h2');
  const howtoSteps = [...document.querySelectorAll('.section-catalogo .steps li')];
  const howtoStepSet = new Set(howtoSteps);
  const howtoReservaStep = document.querySelector('.section-catalogo .steps li.step-reserva');
  const howtoDisfrutaStep = document.querySelector('.section-catalogo .steps li:nth-child(3)');
  const howtoNote = document.querySelector('.section-catalogo .note');
  const howtoEligeStep = document.querySelector('.section-catalogo .steps li.step-elige');
  let howtoTitleLeft = null;
  let howtoTitleRight = null;
  let howtoNoteLeft = null;
  let howtoNoteRight = null;
  let howtoNoteBicici = null;
  const words = document.querySelectorAll('.hero-title .word');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!words.length || !heroTitle || !heroSub) {
    return;
  }

  let lastScrollY = window.scrollY;
  let introLocked = true;
  let introProgress = 0;
  let touchStartY = null;
  let heroRideOutActive = false;
  const introEndProgress = 1;
  const INTRO_TITLE_PHASE = 0.30;
  const INTRO_SUB_PHASE = 0.55;
  const HERO_EXIT_START = 0.08;
  const HERO_EXIT_TRAVEL_PX = 170;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));
  const smooth = (value) => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };
  const MIN_VISIBLE_WHEEL_STEPS = 0;
  const WHEEL_STEP_PX = 100;
  const HOWTO_ENTRY_FADE_PX = 120;
  const HOWTO_EXIT_FADE_PX = 120;
  const HOWTO_ACTIVE_MARGIN_PX = 280;
  const HOWTO_TITLE_IN_WHEEL_STEPS = 4;
  const HOWTO_TITLE_STATIC_WHEEL_STEPS = 3;
  const HOWTO_TITLE_OUT_WHEEL_STEPS = 4;
  const HOWTO_TITLE_IN_PX = HOWTO_TITLE_IN_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_TITLE_STATIC_PX = HOWTO_TITLE_STATIC_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_TITLE_SPLIT_PX = HOWTO_TITLE_OUT_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_TITLE_TOTAL_PX = HOWTO_TITLE_IN_PX + HOWTO_TITLE_STATIC_PX + HOWTO_TITLE_SPLIT_PX;
  const ELIGE_FIRST_IMAGE_IN_PX = WHEEL_STEP_PX;
  const ELIGE_STACK_START_PX = WHEEL_STEP_PX * 3;
  const ELIGE_STACK_TRAVEL_PX = WHEEL_STEP_PX;
  const ELIGE_THIRD_START_PX = WHEEL_STEP_PX * 4;
  const ELIGE_THIRD_TRAVEL_PX = WHEEL_STEP_PX;
  const ELIGE_STATIC_WHEEL_STEPS = 2;
  const ELIGE_STATIC_PX = ELIGE_STATIC_WHEEL_STEPS * WHEEL_STEP_PX;
  const ELIGE_STACK_SPACING_PX = 180;
  const HOWTO_NOTE_IN_WHEEL_STEPS = 4;
  const HOWTO_NOTE_STATIC_WHEEL_STEPS = 8;
  const HOWTO_NOTE_OUT_WHEEL_STEPS = 4;
  const HOWTO_NOTE_IN_PX = HOWTO_NOTE_IN_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_NOTE_STATIC_PX = HOWTO_NOTE_STATIC_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_NOTE_OUT_PX = HOWTO_NOTE_OUT_WHEEL_STEPS * WHEEL_STEP_PX;
  const HOWTO_NOTE_TOTAL_PX = HOWTO_NOTE_IN_PX + HOWTO_NOTE_STATIC_PX + HOWTO_NOTE_OUT_PX;
  const HOWTO_NOTE_MAX_SPREAD_PX = 180;
  const RESERVA_STATIC_WHEEL_STEPS = 4;
  const RESERVA_STATIC_PX = RESERVA_STATIC_WHEEL_STEPS * WHEEL_STEP_PX;
  const RESERVA_UP_PX = 96;
  const RESERVA_EXIT_LEFT_MAX_PX = 460;
  const DISFRUTA_ENTER_FROM_RIGHT_PX = 460;
  const DISFRUTA_LEFT_TARGET_MAX_PX = 340;

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
    '.catalogo-intro > *',
    '.catalogo-card'
  ];

  revealTargets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      // No aplicar animación a elementos dentro de secciones marcadas con data-no-reveal
      if (!element.closest('[data-no-reveal]')) {
        element.classList.add('reveal-on-scroll');
      }
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
      howtoNote.innerHTML = `<span class="howto-note-word howto-note-word-left">${leftWord}</span><span class="howto-note-bicici" aria-hidden="true"></span><span class="howto-note-word howto-note-word-right">${rightWord}</span>`;
      howtoNoteLeft = howtoNote.querySelector('.howto-note-word-left');
      howtoNoteRight = howtoNote.querySelector('.howto-note-word-right');
      howtoNoteBicici = howtoNote.querySelector('.howto-note-bicici');
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

    if (window.innerWidth <= 900) {
      howtoSection.style.minHeight = '';
      howtoSequenceItems.forEach((item) => {
        item.style.opacity = '';
        item.style.transform = '';
        item.style.filter = '';
      });
      if (howtoEligeStep) {
        howtoEligeStep.style.removeProperty('--elige-top-opacity');
        howtoEligeStep.style.removeProperty('--elige-top-y');
        howtoEligeStep.style.removeProperty('--elige-top-rot');
        howtoEligeStep.style.removeProperty('--elige-bottom-opacity');
        howtoEligeStep.style.removeProperty('--elige-bottom-y');
        howtoEligeStep.style.removeProperty('--elige-bottom-rot');
        howtoEligeStep.style.removeProperty('--elige-third-opacity');
        howtoEligeStep.style.removeProperty('--elige-third-y');
        howtoEligeStep.style.removeProperty('--elige-third-rot');
      }
      if (howtoReservaStep) {
        howtoReservaStep.style.removeProperty('--reserva-calendar-reveal');
        howtoReservaStep.style.removeProperty('--reserva-calendar-opacity');
      }
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
      if (howtoNoteBicici) {
        howtoNoteBicici.style.transform = '';
        howtoNoteBicici.style.opacity = '';
      }
      return;
    }

    const sectionRect = howtoSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Skip costly per-item updates when section is far from viewport.
    if (sectionRect.bottom < -HOWTO_ACTIVE_MARGIN_PX || sectionRect.top > viewportHeight + HOWTO_ACTIVE_MARGIN_PX) {
      return;
    }

    const minVisiblePx = MIN_VISIBLE_WHEEL_STEPS * WHEEL_STEP_PX;
    const maxExitTravelPx = Math.max(HOWTO_EXIT_FADE_PX, HOWTO_TITLE_TOTAL_PX, HOWTO_NOTE_TOTAL_PX);
    const minTravelPerItem = minVisiblePx + HOWTO_ENTRY_FADE_PX + maxExitTravelPx;
    const minSectionHeight = Math.ceil(viewportHeight + minTravelPerItem * howtoSequenceItems.length);
    if (howtoSection.offsetHeight < minSectionHeight) {
      howtoSection.style.minHeight = `${minSectionHeight}px`;
    }

    const totalTravel = Math.max(1, howtoSection.offsetHeight - viewportHeight);
    const rawProgress = (-sectionRect.top) / totalTravel;
    const sectionProgress = clamp01(rawProgress);
    const itemTravelPx = totalTravel / howtoSequenceItems.length;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    howtoSequenceItems.forEach((item, index) => {
      const globalTravelPx = sectionProgress * totalTravel;
      const itemStartPx = index * itemTravelPx;
      const localTravelPx = globalTravelPx - itemStartPx;
      let opacity = 0;
      let exitSpreadPhase = 0;
      let noteSpreadPhase = 0;
      let noteBiciciPhase = 0;
      const isTitleItem = item === howtoTitle;
      const isNoteItem = item === howtoNote;
      const isReservaItem = item === howtoReservaStep;
      const isDisfrutaItem = item === howtoDisfrutaStep;
      const isEligeItem = item === howtoEligeStep;
      const isSplitTextItem = isTitleItem || isNoteItem;
      const exitTravelPx = isSplitTextItem
        ? Math.max(HOWTO_EXIT_FADE_PX, HOWTO_TITLE_TOTAL_PX)
        : HOWTO_EXIT_FADE_PX;
      const exitStartPx = Math.max(HOWTO_ENTRY_FADE_PX, itemTravelPx - exitTravelPx);

      if (localTravelPx > 0 && localTravelPx < itemTravelPx) {
        if (isTitleItem) {
          if (localTravelPx <= HOWTO_TITLE_IN_PX) {
            const inPhase = clamp01(localTravelPx / Math.max(1, HOWTO_TITLE_IN_PX));
            const easedIn = smooth(inPhase);
            opacity = easedIn;
            exitSpreadPhase = 1 - easedIn;
          } else if (localTravelPx <= HOWTO_TITLE_IN_PX + HOWTO_TITLE_STATIC_PX) {
            opacity = 1;
          } else {
            // Title enters in 4 wheel steps, stays static in 3, then splits/fades in 4.
            exitSpreadPhase = clamp01((localTravelPx - HOWTO_TITLE_IN_PX - HOWTO_TITLE_STATIC_PX) / Math.max(1, HOWTO_TITLE_SPLIT_PX));
            opacity = 1 - smooth(exitSpreadPhase);
          }
        } else if (isNoteItem) {
          if (localTravelPx <= HOWTO_NOTE_IN_PX) {
            const inPhase = clamp01(localTravelPx / Math.max(1, HOWTO_NOTE_IN_PX));
            const easedIn = smooth(inPhase);
            opacity = easedIn;
            noteSpreadPhase = 1 - easedIn;
          } else if (localTravelPx <= HOWTO_NOTE_IN_PX + HOWTO_NOTE_STATIC_PX) {
            opacity = 1;
            noteSpreadPhase = 0;
          } else if (localTravelPx <= HOWTO_NOTE_TOTAL_PX) {
            const outPhase = clamp01((localTravelPx - HOWTO_NOTE_IN_PX - HOWTO_NOTE_STATIC_PX) / Math.max(1, HOWTO_NOTE_OUT_PX));
            const easedOut = smooth(outPhase);
            opacity = 1 - easedOut;
            noteSpreadPhase = easedOut;
            noteBiciciPhase = easedOut;
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
      if (isEligeItem) {
        // Keep Elige visually identical enough while avoiding expensive per-frame blur.
        item.style.filter = 'none';
      } else {
        item.style.filter = `blur(${((1 - opacity) * 2).toFixed(2)}px)`;
      }

      if (howtoStepSet.has(item)) {
        let reservaOffset = 0;
        let reservaX = 0;
        if (isReservaItem) {
          const reservaRiseStartPx = HOWTO_ENTRY_FADE_PX + RESERVA_STATIC_PX;
          const reservaRiseTravelPx = Math.max(1, exitStartPx - reservaRiseStartPx);
          const reservaRisePhase = clamp01((localTravelPx - reservaRiseStartPx) / reservaRiseTravelPx);
          const reservaRiseEase = smooth(reservaRisePhase);
          reservaOffset = -RESERVA_UP_PX * reservaRiseEase;
          item.style.setProperty('--reserva-calendar-reveal', (reservaRiseEase * 0.667).toFixed(3));
          item.style.setProperty('--reserva-calendar-opacity', (reservaRiseEase * opacity).toFixed(3));

          if (localTravelPx > exitStartPx) {
            const reservaExitPhase = clamp01((localTravelPx - exitStartPx) / Math.max(1, exitTravelPx));
            const reservaExitDistance = Math.min(RESERVA_EXIT_LEFT_MAX_PX, viewportWidth * 0.34);
            reservaX = -reservaExitDistance * smooth(reservaExitPhase);
          }
        }

        if (isDisfrutaItem) {
          const disfrutaEnterPhase = clamp01(localTravelPx / Math.max(1, HOWTO_ENTRY_FADE_PX));
          const disfrutaLeftTarget = -Math.min(DISFRUTA_LEFT_TARGET_MAX_PX, viewportWidth * 0.26);
          let disfrutaX = disfrutaLeftTarget;

          if (localTravelPx <= HOWTO_ENTRY_FADE_PX) {
            const enterEase = smooth(disfrutaEnterPhase);
            disfrutaX = DISFRUTA_ENTER_FROM_RIGHT_PX * (1 - enterEase) + disfrutaLeftTarget * enterEase;
          } else if (localTravelPx > exitStartPx) {
            const disfrutaExitPhase = clamp01((localTravelPx - exitStartPx) / Math.max(1, exitTravelPx));
            disfrutaX = disfrutaLeftTarget - 72 * smooth(disfrutaExitPhase);
          }

          item.style.transform = `translate(${disfrutaX.toFixed(1)}px, ${(lift * 0.35).toFixed(1)}px) scale(${(0.98 + opacity * 0.02).toFixed(3)})`;
        } else {
          item.style.transform = `translate(${reservaX.toFixed(1)}px, ${(lift + reservaOffset).toFixed(1)}px) scale(${(0.98 + opacity * 0.02).toFixed(3)})`;
        }
      } else if (isTitleItem) {
        item.style.transform = 'translate(-50%, -50%)';
        const spreadPx = 160 * smooth(exitSpreadPhase);
        if (howtoTitleLeft && howtoTitleRight) {
          howtoTitleLeft.style.transform = `translateX(${-spreadPx.toFixed(1)}px)`;
          howtoTitleLeft.style.opacity = opacity.toFixed(3);
          howtoTitleRight.style.transform = `translateX(${spreadPx.toFixed(1)}px)`;
          howtoTitleRight.style.opacity = opacity.toFixed(3);
        }
        if (localTravelPx <= 0 && howtoTitleLeft && howtoTitleRight) {
          howtoTitleLeft.style.transform = 'translateX(-160px)';
          howtoTitleLeft.style.opacity = '0';
          howtoTitleRight.style.transform = 'translateX(160px)';
          howtoTitleRight.style.opacity = '0';
        }
      } else if (isNoteItem) {
        item.style.transform = 'translate(-50%, -50%)';
        const spreadPx = HOWTO_NOTE_MAX_SPREAD_PX * noteSpreadPhase;
        if (howtoNoteLeft && howtoNoteRight) {
          howtoNoteLeft.style.transform = `translateX(${-spreadPx.toFixed(1)}px)`;
          howtoNoteLeft.style.opacity = opacity.toFixed(3);
          howtoNoteRight.style.transform = `translateX(${spreadPx.toFixed(1)}px)`;
          howtoNoteRight.style.opacity = opacity.toFixed(3);
        }
        if (howtoNoteBicici) {
          const zoom = 0.08 + 1.38 * smooth(noteBiciciPhase);
          const biciciOpacity = Math.min(1, noteBiciciPhase * 1.25);
          howtoNoteBicici.style.transform = `translate(-50%, -50%) scale(${zoom.toFixed(3)})`;
          howtoNoteBicici.style.opacity = biciciOpacity.toFixed(3);
        }
      } else {
        item.style.transform = `translateY(${(lift * 0.6).toFixed(1)}px)`;
      }

      if (isEligeItem) {
        const firstInPhase = clamp01(localTravelPx / Math.max(1, ELIGE_FIRST_IMAGE_IN_PX));
        const stackPhase = clamp01((localTravelPx - ELIGE_STACK_START_PX) / Math.max(1, ELIGE_STACK_TRAVEL_PX));
        const thirdPhase = clamp01((localTravelPx - ELIGE_THIRD_START_PX) / Math.max(1, ELIGE_THIRD_TRAVEL_PX));
        const stackReadyPx = ELIGE_THIRD_START_PX + ELIGE_THIRD_TRAVEL_PX;
        const towerExitStartPx = stackReadyPx + ELIGE_STATIC_PX;
        const towerExitTravelPx = Math.max(1, itemTravelPx - towerExitStartPx);
        const towerExitPhase = clamp01((localTravelPx - towerExitStartPx) / towerExitTravelPx);
        const towerExitEase = smooth(towerExitPhase);
        const towerVisibility = 1 - towerExitEase;

        const topOpacity = smooth(firstInPhase) * opacity * towerVisibility;
        const topLift = -ELIGE_STACK_SPACING_PX * smooth(stackPhase) - 120 * towerExitEase;
        const topRotate = -0.6 - 0.5 * smooth(stackPhase) - 0.4 * towerExitEase;
        const bottomOpacity = smooth(stackPhase) * opacity * towerVisibility;
        const bottomDrop = ELIGE_STACK_SPACING_PX * (1 - smooth(stackPhase)) + 20 * towerExitEase;
        const bottomRotate = 0.9 + 0.25 * smooth(stackPhase) + 0.2 * towerExitEase;
        const thirdOpacity = smooth(thirdPhase) * opacity * towerVisibility;
        const thirdY = ELIGE_STACK_SPACING_PX * (2 - smooth(thirdPhase)) + 120 * towerExitEase;
        const thirdRotate = 0.3 - 0.25 * smooth(thirdPhase) + 0.4 * towerExitEase;

        item.style.setProperty('--elige-top-opacity', topOpacity.toFixed(3));
        item.style.setProperty('--elige-top-y', `${topLift.toFixed(1)}px`);
        item.style.setProperty('--elige-top-rot', `${topRotate.toFixed(2)}deg`);
        item.style.setProperty('--elige-bottom-opacity', bottomOpacity.toFixed(3));
        item.style.setProperty('--elige-bottom-y', `${bottomDrop.toFixed(1)}px`);
        item.style.setProperty('--elige-bottom-rot', `${bottomRotate.toFixed(2)}deg`);
        item.style.setProperty('--elige-third-opacity', thirdOpacity.toFixed(3));
        item.style.setProperty('--elige-third-y', `${thirdY.toFixed(1)}px`);
        item.style.setProperty('--elige-third-rot', `${thirdRotate.toFixed(2)}deg`);
      }

      if (isNoteItem && localTravelPx <= 0 && howtoNoteLeft && howtoNoteRight) {
        // Keep words outside before the note starts entering.
        howtoNoteLeft.style.transform = `translateX(${-HOWTO_NOTE_MAX_SPREAD_PX}px)`;
        howtoNoteLeft.style.opacity = '0';
        howtoNoteRight.style.transform = `translateX(${HOWTO_NOTE_MAX_SPREAD_PX}px)`;
        howtoNoteRight.style.opacity = '0';
        if (howtoNoteBicici) {
          howtoNoteBicici.style.transform = 'translate(-50%, -50%) scale(0.08)';
          howtoNoteBicici.style.opacity = '0';
        }
      }
    });
  };

  const renderLockedIntro = () => {
    words.forEach((word) => {
      word.style.animation = 'none';
      word.style.opacity = '1';
    });

    const titlePhase = clamp01(introProgress / INTRO_TITLE_PHASE);
    words.forEach((word, index) => {
      // Hide each word one after another while translating it upward.
      const segmentStart = index / words.length;
      const localPhase = clamp01((titlePhase - segmentStart) * words.length);
      const eased = smooth(localPhase);
      word.style.opacity = String(1 - eased);
      word.style.transform = `translateY(${-30 * eased}px)`;
    });

    const subPhase = (introProgress - INTRO_TITLE_PHASE) / INTRO_SUB_PHASE;
    let subOpacity = 0;
    if (subPhase > 0 && subPhase < 1) {
      if (subPhase <= 0.25) {
        subOpacity = smooth(subPhase / 0.25);
      } else if (subPhase <= 0.75) {
        subOpacity = 1;
      } else {
        subOpacity = 1 - smooth((subPhase - 0.75) / 0.25);
      }
    }

    heroTitle.style.opacity = '1';
    heroTitle.style.filter = `blur(${titlePhase * 1.4}px)`;

    heroSub.style.opacity = String(subOpacity);
    heroSub.style.filter = `blur(${(1 - subOpacity) * 2}px)`;
  };

  const updateHeroRideOut = () => {
    if (!heroSection || introLocked || !heroRideOutActive) {
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const totalTravel = Math.max(1, heroSection.offsetHeight - viewportHeight);
    const sectionRect = heroSection.getBoundingClientRect();
    const progress = clamp01((-sectionRect.top) / totalTravel);
    const exitProgress = clamp01((progress - HERO_EXIT_START) / (1 - HERO_EXIT_START));
    const exitEase = smooth(exitProgress);

    if (heroInner) {
      const heroOffset = -HERO_EXIT_TRAVEL_PX * exitEase;
      const heroOpacity = 1 - 0.98 * exitEase;
      heroInner.style.transform = `translateY(-26vh) translateY(${heroOffset.toFixed(1)}px)`;
      heroInner.style.opacity = heroOpacity.toFixed(3);
    }

    if (sectionRect.bottom <= 0 || progress >= 1) {
      if (heroInner) {
        heroInner.style.transform = `translateY(-26vh) translateY(${-HERO_EXIT_TRAVEL_PX}px)`;
        heroInner.style.opacity = '0';
      }
      return;
    }
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
    heroRideOutActive = false;
    introProgress = clamp01(startProgress);
    window.scrollTo(0, 0);
    root.classList.add('scroll-lock');
    body.classList.add('scroll-lock');
    heroTitle.style.opacity = '1';
    heroTitle.style.filter = 'blur(0px)';
    heroSub.style.opacity = '0';
    heroSub.style.filter = 'blur(2px)';
    heroSub.style.pointerEvents = 'none';
    if (heroInner) {
      heroInner.style.transform = '';
      heroInner.style.opacity = '';
    }

    if (introProgress === 0) {
      // Keep CSS keyframes active on first load so hero-title entry is visible.
      words.forEach((word) => {
        word.style.animation = '';
        word.style.opacity = '';
        word.style.transform = '';
      });
    } else {
      renderLockedIntro();
    }

    window.addEventListener('wheel', onLockedWheel, { passive: false });
    window.addEventListener('touchstart', onLockedTouchStart, { passive: true });
    window.addEventListener('touchmove', onLockedTouchMove, { passive: false });
    window.addEventListener('keydown', onLockedKeydown);
  };

  const unlockIntro = () => {
    introLocked = false;
    heroRideOutActive = true;
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
    if (heroInner) {
      heroInner.style.transform = 'translateY(-26vh)';
      heroInner.style.opacity = '1';
    }

    updateHeroRideOut();
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

    updateHeroRideOut();

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
    if (hasCatalogSequence) {
      updateHowtoSequence();
    }
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
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  body.classList.add('js-scroll-reveal');
  const hasCatalogSequence = Boolean(howtoSection && howtoSteps.length);
  if (hasCatalogSequence) {
    body.classList.add('js-catalogo-sequence');
  }

  lockIntro(0);

  updateRevealStates();
  if (hasCatalogSequence) {
    updateHowtoSequence();
  }
  window.addEventListener('wheel', onTopReverseWheel, { passive: false });
  window.addEventListener('scroll', onScrollAnimated, { passive: true });
  window.addEventListener('resize', updateRevealStates);
  if (hasCatalogSequence) {
    window.addEventListener('resize', updateHowtoSequence);
  }
  window.addEventListener('load', updateRevealStates);
  if (hasCatalogSequence) {
    window.addEventListener('load', updateHowtoSequence);
  }
}
})();

