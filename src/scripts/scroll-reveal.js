import { inView } from 'motion';
import { animate } from 'motion/mini';

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!preference.matches && 'IntersectionObserver' in window) {
  const elements = Array.from(document.querySelectorAll([
    '.hero-copy > *', '.hero-scene', '.page-intro > *', '.not-found > *',
    '.channel-strip .container', '.section-heading > *', '.benefit-grid > article',
    '.summary-list > a', '.home-process > div', '.setup-list > li',
    '.journey-summary .container', '.control-summary > div',
    '.faq-section > div:not(.faq-list)', '.faq-list > details',
    '.featured-feature > *', '.feature-detail-grid > article',
    '.reporting-layout > *', '.control-grid > article', '.setup-section > div',
    '.journey-list > li', '.integration-section > div', '.contact-options > article',
    '.direct-contact > *', '.cta-inner > *', '.footer-top > *', '.footer-bottom',
  ].join(', ')));
  const animations = new Map();
  const listeners = new AbortController();
  let stopObserving;
  let introObserver;

  function show(element) {
    animations.get(element)?.cancel();
    animations.delete(element);
    element.dataset.scrollReveal = 'revealed';
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
  }

  function reveal(element) {
    if (element.dataset.scrollReveal !== 'pending') return;
    const siblings = Array.from(element.parentElement.children).filter(child => elements.includes(child));
    const delay = Math.min(siblings.indexOf(element) * 0.07, 0.21);
    const animation = animate(element, {
      opacity: [0, 1],
      transform: ['translateY(18px)', 'translateY(0px)'],
    }, { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] });
    animations.set(element, animation);
    animation.then(() => show(element));
  }

  function finish() {
    introObserver?.disconnect();
    stopObserving?.();
    for (const element of elements) show(element);
    listeners.abort();
  }

  function start() {
    introObserver?.disconnect();
    // Let the page transition reveal the first viewport without a second fade.
    if (CSS.supports('selector(:active-view-transition)') && document.documentElement.matches(':active-view-transition')) {
      for (const element of elements) {
        const bounds = element.getBoundingClientRect();
        if (bounds.top < innerHeight - 24 && bounds.bottom > 0) show(element);
      }
    }
    stopObserving = inView(elements, reveal, { margin: '0px 0px -24px 0px', amount: 0.08 });
  }

  for (const element of elements) element.dataset.scrollReveal = 'pending';

  // Keyboard focus must never land on a hidden block or wait for its reveal.
  document.addEventListener('focusin', event => {
    const element = event.target.closest('[data-scroll-reveal]');
    if (element) show(element);
  }, { signal: listeners.signal });
  preference.addEventListener('change', event => {
    if (event.matches) finish();
  }, { signal: listeners.signal });
  window.addEventListener('pagehide', finish, { once: true, signal: listeners.signal });

  if (document.documentElement.classList.contains('intro-active')) {
    introObserver = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('intro-active')) start();
    });
    introObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  } else {
    start();
  }
}
