(() => {
  const preview = document.currentScript?.dataset.introPreview === 'true' && new URLSearchParams(location.search).get('intro-preview') === '1';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!preview) {
    try {
      if (motion.matches || sessionStorage.getItem('iloop:intro-seen') === '1') return;
      sessionStorage.setItem('iloop:intro-seen', '1');
    } catch {
      return;
    }
  }

  const root = document.documentElement;
  const listeners = new AbortController();
  let content;
  let revealTimer;
  let exitTimer;
  root.classList.add('intro-active');
  if (preview) root.classList.add('intro-preview');

  function finish() {
    root.classList.remove('intro-active', 'intro-preview');
    if (content) content.inert = false;
    clearTimeout(deadline);
    clearTimeout(revealTimer);
    clearTimeout(exitTimer);
    listeners.abort();
  }

  // Start the deadline before parsing the page or waiting for fonts.
  const deadline = setTimeout(finish, 3000);
  const options = { capture: true, signal: listeners.signal };
  document.addEventListener('keydown', event => {
    if (['Tab', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) event.preventDefault();
  }, options);
  document.addEventListener('focusin', event => {
    if (event.target instanceof HTMLElement) event.target.blur();
  }, options);
  if (!preview) motion.addEventListener('change', event => { if (event.matches) finish(); }, { signal: listeners.signal });
  window.addEventListener('pagehide', finish, { signal: listeners.signal });

  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loading-screen');
    content = document.getElementById('site-content');
    if (!overlay || !content) return finish();
    content.inert = true;

    Promise.all([
      document.fonts.load('600 64px "DM Sans"', 'iloop'),
      document.fonts.load('400 64px "DM Sans"', '.id'),
    ]).then(() => {
      if (!root.classList.contains('intro-active')) return;
      overlay.classList.add('is-revealing');
      revealTimer = setTimeout(() => {
        overlay.classList.add('is-leaving');
        exitTimer = setTimeout(finish, 300);
      }, 1200);
    }).catch(finish);
  }, { once: true, signal: listeners.signal });
})();
