/**
 * know.2nth.ai — minimal tier-gate hook
 *
 * Self-contained, no external auth, no SSO. The "is this person a Member?"
 * signal is a localStorage flag set after a successful HubSpot form
 * submission (typically from /join.html). Any element with
 * data-tier="member" gets a soft overlay for visitors without the flag.
 *
 * Currently no element on the site carries the marker — explainers stay
 * fully open. The hook is here for when the first MEMBER content lands.
 */
(function () {
  'use strict';

  const KEY = '2nth-know-member';

  function isMember() {
    try { return !!localStorage.getItem(KEY); } catch (_) { return false; }
  }

  // Listen for a HubSpot form submission on this page (e.g. /join.html)
  // and set the membership flag. Permissive matching for embed-format shifts.
  window.addEventListener('message', function (e) {
    if (!e || !e.data) return;
    const d = e.data;
    const eventName = (d.eventName || d.type || '').toString();
    if (
      (d.type === 'hsFormCallback' && /onFormSubmit/i.test(eventName)) ||
      (d.id && /^hsForm/.test(d.id) && /Submit/i.test(eventName)) ||
      (typeof d === 'string' && d.indexOf('onFormSubmitted') !== -1)
    ) {
      try { localStorage.setItem(KEY, JSON.stringify({ at: new Date().toISOString() })); } catch (_) { /* no-op */ }
      // Lift any existing gates on this page
      document.querySelectorAll('.member-gate-overlay').forEach(function (el) { el.remove(); });
    }
  });

  function applyGates() {
    if (isMember()) return;
    document.querySelectorAll('[data-tier="member"]').forEach(function (el) {
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      const overlay = document.createElement('div');
      overlay.className = 'member-gate-overlay';
      overlay.style.cssText = 'position:absolute;inset:0;background:rgba(11,17,32,0.92);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:5;border-radius:inherit;padding:24px;text-align:center';
      overlay.innerHTML = [
        '<div>',
        '  <div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#3B82F6;margin-bottom:8px">Member &middot; waitlist</div>',
        '  <div style="font-size:14px;color:#94A3B8;margin-bottom:14px;line-height:1.5;font-family:\'Outfit\',system-ui,sans-serif">Get on the list to unlock this section.</div>',
        '  <a href="/join.html" style="font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;background:linear-gradient(135deg,#2563EB,#3B82F6);color:#fff;padding:8px 16px;border-radius:100px;text-decoration:none;display:inline-block">Join the waitlist &rarr;</a>',
        '</div>'
      ].join('\n');
      el.appendChild(overlay);
    });
  }

  // Expose helper
  window.__knowMember = { is: isMember, key: KEY };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGates);
  } else {
    applyGates();
  }
})();
