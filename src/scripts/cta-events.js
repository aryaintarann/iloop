document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[data-cta-action][data-cta-placement]');
  if (!link) return;
  window.dispatchEvent(new CustomEvent('iloop:cta-click', {
    detail: {
      action: link.getAttribute('data-cta-action'),
      placement: link.getAttribute('data-cta-placement'),
      path: window.location.pathname,
    },
  }));
});
