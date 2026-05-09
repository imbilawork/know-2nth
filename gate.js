/**
 * know.2nth.ai email-gate
 *
 * Site-wide soft gate for lead capture. Hides sections from index 3 onwards
 * (hero + section 01 + section 02 stay free); shows a HubSpot form embedded
 * inside a gate card. On submission, sets a localStorage flag that lifts the
 * gate site-wide.
 *
 * Opt-out per page: add `data-gate="off"` to <body>.
 * Opt-out for users: localStorage["2nth-lead-captured"] is set after submit.
 *
 * Pure client-side. Crawlers see the full HTML.
 */
(function () {
  'use strict';

  const KEY = '2nth-lead-captured';
  const PORTAL_ID = '48288371';
  const FORM_ID = 'd759aabd-39b7-4dd6-a60c-ac39bef79628';
  const REGION = 'na1';
  const GATE_FROM_INDEX = 3; // hero + section 01 + section 02 stay free

  function init() {
    // Skip if user already converted
    try {
      if (localStorage.getItem(KEY)) return;
    } catch (_) { /* no localStorage available — fall through */ }

    // Skip if page opts out
    if (document.body.getAttribute('data-gate') === 'off') return;
    if (document.documentElement.getAttribute('data-gate') === 'off') return;

    // Find top-level <section> elements
    const sections = Array.from(document.querySelectorAll('body > section'));
    if (sections.length <= GATE_FROM_INDEX) return; // not enough content to gate

    const sectionsToHide = sections.slice(GATE_FROM_INDEX);
    sectionsToHide.forEach(s => { s.style.display = 'none'; });

    // Build the gate card
    const gate = document.createElement('div');
    gate.id = 'email-gate';
    gate.innerHTML = [
      '<div class="email-gate-inner">',
      '  <div class="email-gate-eyebrow">Continue reading</div>',
      '  <h2 class="email-gate-title">Get the rest of this page</h2>',
      '  <p class="email-gate-desc">Plus new know.2nth.ai content as it ships. Email-only — unsubscribe whenever.</p>',
      '  <div class="hs-form-frame" data-region="' + REGION + '" data-form-id="' + FORM_ID + '" data-portal-id="' + PORTAL_ID + '"></div>',
      '</div>'
    ].join('\n');
    sectionsToHide[0].parentNode.insertBefore(gate, sectionsToHide[0]);

    // Inject styles
    const style = document.createElement('style');
    style.textContent = [
      '#email-gate {',
      '  max-width: 760px;',
      '  margin: 60px auto;',
      '  padding: 0 24px;',
      '  position: relative;',
      '  z-index: 2;',
      '}',
      '.email-gate-inner {',
      '  background: var(--bg-card, rgba(18, 29, 51, 0.7));',
      '  backdrop-filter: blur(10px);',
      '  border: 1px solid var(--border, rgba(148, 163, 184, 0.1));',
      '  border-left: 3px solid var(--blue-glow, #3B82F6);',
      '  border-radius: 12px;',
      '  padding: 36px 40px;',
      '}',
      '.email-gate-eyebrow {',
      '  font-family: \'JetBrains Mono\', monospace;',
      '  font-size: 11px;',
      '  font-weight: 500;',
      '  letter-spacing: 2px;',
      '  text-transform: uppercase;',
      '  color: var(--sky, #38BDF8);',
      '  margin-bottom: 14px;',
      '}',
      '.email-gate-title {',
      '  font-size: 28px;',
      '  font-weight: 700;',
      '  letter-spacing: -0.6px;',
      '  line-height: 1.2;',
      '  margin-bottom: 12px;',
      '  color: var(--text-primary, #F8FAFC);',
      '  font-family: \'Outfit\', system-ui, sans-serif;',
      '}',
      '.email-gate-desc {',
      '  font-size: 15px;',
      '  color: var(--text-secondary, #94A3B8);',
      '  line-height: 1.65;',
      '  font-weight: 300;',
      '  margin-bottom: 24px;',
      '  font-family: \'Outfit\', system-ui, sans-serif;',
      '}',
      '#email-gate .hs-form-frame {',
      '  max-width: 100%;',
      '}',
      '@media (max-width: 600px) {',
      '  .email-gate-inner { padding: 28px 24px; }',
      '  .email-gate-title { font-size: 24px; }',
      '}',
      '#email-gate.email-gate--lifting {',
      '  transition: opacity 0.4s ease;',
      '  opacity: 0;',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    // Load the HubSpot embed script if not already on the page
    const embedSrc = 'https://js.hsforms.net/forms/embed/' + PORTAL_ID + '.js';
    if (!document.querySelector('script[src="' + embedSrc + '"]')) {
      const s = document.createElement('script');
      s.src = embedSrc;
      s.defer = true;
      document.head.appendChild(s);
    }

    // Lift the gate after submission
    function lift() {
      try {
        localStorage.setItem(KEY, JSON.stringify({ at: new Date().toISOString() }));
      } catch (_) { /* no-op */ }
      sectionsToHide.forEach(s => { s.style.display = ''; });
      gate.classList.add('email-gate--lifting');
      setTimeout(() => {
        if (gate.parentNode) gate.parentNode.removeChild(gate);
      }, 400);
    }

    // HubSpot's embed dispatches a postMessage on submit. The exact event
    // shape has shifted across versions; match permissively.
    window.addEventListener('message', function (e) {
      if (!e || !e.data) return;
      const d = e.data;
      const eventName = (d.eventName || d.type || '').toString();
      if (
        (d.type === 'hsFormCallback' && /onFormSubmit/i.test(eventName)) ||
        (d.id && /^hsForm/.test(d.id) && /Submit/i.test(eventName)) ||
        (typeof d === 'string' && d.indexOf('onFormSubmitted') !== -1)
      ) {
        lift();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
