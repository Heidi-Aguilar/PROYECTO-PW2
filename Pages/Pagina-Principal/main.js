document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = document.querySelectorAll('.hero-title .word');

  if (!words.length) {
    return;
  }

  if (prefersReduced) {
    document.documentElement.style.setProperty('--motion', 'none');

    words.forEach((word) => {
      word.style.animation = 'none';
      word.style.opacity = 1;
      word.style.transform = 'none';
    });
    return;
  }

  // Reproduce de nuevo la animación al cargar (útil en navegación back/forward)
  words.forEach((word) => {
    word.style.animation = 'none';
    void word.offsetWidth;
    word.style.animation = '';
  });
});