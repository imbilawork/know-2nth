/**
 * know.2nth.ai — auth bar + tier display
 *
 * Single sign-on with the rest of the .2nth.ai estate (cookies are scoped
 * to .2nth.ai). The session is loaded from beta.2nth.ai; the user's plan
 * (explorer / starter / designer / builder) is translated to the
 * know.2nth.ai display tiers (Open / Member / Partner) for the auth bar.
 *
 * Auth bar injection strategy:
 *   1. If <div id="auth-nav-slot"></div> exists — populate it.
 *   2. Else if <a class="btn-nav-primary">Get Access</a> exists — wrap it.
 *   3. Else — append to .nav-right or .nav-links.
 *
 * Tier gates (data-tier="...") are kept inert for now; explainers stay
 * fully open per the access page promise. Wire them in when MEMBER content
 * (operational nodes / templates) ships.
 */
(function () {
  'use strict';

  const API = 'https://beta.2nth.ai';

  // Backend plan ordering (existing system on 2nth-skills + beta.2nth.ai)
  const PLAN_ORDER = { explorer: 0, starter: 1, designer: 2, builder: 3 };

  // know.2nth.ai display tiers, mapped from the backend plan
  function displayTier(plan) {
    if (!plan || plan === 'explorer') return 'Open';
    if (plan === 'builder') return 'Partner';
    return 'Member'; // starter, designer
  }

  function displayTierColor(plan) {
    if (!plan || plan === 'explorer') return { bg: 'rgba(56,189,248,0.12)', fg: '#38BDF8', border: 'rgba(56,189,248,0.25)' };
    if (plan === 'builder') return { bg: 'rgba(245,158,11,0.12)', fg: '#F59E0B', border: 'rgba(245,158,11,0.25)' };
    return { bg: 'rgba(37,99,235,0.12)', fg: '#3B82F6', border: 'rgba(37,99,235,0.25)' }; // Member
  }

  // ── Session ───────────────────────────────────────────────────────────────
  async function loadSession() {
    try {
      const res = await fetch(API + '/api/auth/session', { credentials: 'include' });
      const { user } = await res.json();
      window.__2nth_user = user || null;
    } catch (_) {
      window.__2nth_user = null;
    }
    return window.__2nth_user;
  }

  // ── Slot resolution ───────────────────────────────────────────────────────
  function ensureAuthSlot() {
    let slot = document.getElementById('auth-nav-slot');
    if (slot) return slot;

    // Strategy 2: replace existing "Get Access" button
    const getAccessBtn = document.querySelector('a.btn-nav-primary[href*="#access"], a[href="#access"].btn-nav-primary');
    if (getAccessBtn && getAccessBtn.parentNode) {
      slot = document.createElement('div');
      slot.id = 'auth-nav-slot';
      slot.style.display = 'inline-flex';
      slot.style.alignItems = 'center';
      getAccessBtn.parentNode.insertBefore(slot, getAccessBtn);
      // Hide the original button — slot will render the right CTA based on auth state
      getAccessBtn.style.display = 'none';
      return slot;
    }

    // Strategy 3: append to .nav-right or .nav-links
    const navHost = document.querySelector('.nav-right') || document.querySelector('.nav-links');
    if (navHost) {
      slot = document.createElement('div');
      slot.id = 'auth-nav-slot';
      slot.style.display = 'inline-flex';
      slot.style.alignItems = 'center';
      // Insert before theme-toggle if present, otherwise append
      const themeToggle = navHost.querySelector('.theme-toggle');
      if (themeToggle) {
        navHost.insertBefore(slot, themeToggle);
      } else {
        navHost.appendChild(slot);
      }
      return slot;
    }

    return null;
  }

  // ── Inject styles once ────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('know-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'know-auth-styles';
    style.textContent = [
      '#auth-nav-slot { display: inline-flex; align-items: center; gap: 10px; }',
      '.know-auth-cta {',
      '  font-family: \'JetBrains Mono\', monospace;',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  letter-spacing: 1px;',
      '  text-transform: uppercase;',
      '  background: linear-gradient(135deg, #2563EB, #3B82F6);',
      '  color: #fff;',
      '  padding: 8px 16px;',
      '  border-radius: 100px;',
      '  text-decoration: none;',
      '  border: none;',
      '  cursor: pointer;',
      '  transition: opacity 0.2s;',
      '}',
      '.know-auth-cta:hover { opacity: 0.85; }',
      '.know-auth-user { display: inline-flex; align-items: center; gap: 8px; position: relative; }',
      '.know-auth-tier {',
      '  font-family: \'JetBrains Mono\', monospace;',
      '  font-size: 9px;',
      '  font-weight: 600;',
      '  letter-spacing: 1px;',
      '  text-transform: uppercase;',
      '  padding: 3px 9px;',
      '  border: 1px solid;',
      '  border-radius: 100px;',
      '}',
      '.know-auth-avatar {',
      '  width: 30px;',
      '  height: 30px;',
      '  border-radius: 50%;',
      '  background: rgba(56,189,248,0.15);',
      '  border: 1px solid rgba(56,189,248,0.3);',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-family: \'JetBrains Mono\', monospace;',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  color: #38BDF8;',
      '  cursor: pointer;',
      '  flex-shrink: 0;',
      '}',
      '.know-auth-menu {',
      '  display: none;',
      '  position: absolute;',
      '  top: 42px;',
      '  right: 0;',
      '  background: rgba(18, 29, 51, 0.98);',
      '  backdrop-filter: blur(12px);',
      '  border: 1px solid rgba(148, 163, 184, 0.15);',
      '  border-radius: 8px;',
      '  padding: 6px;',
      '  min-width: 200px;',
      '  z-index: 200;',
      '  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);',
      '}',
      '.know-auth-menu.open { display: block; }',
      '.know-auth-menu .email {',
      '  padding: 8px 10px;',
      '  font-family: \'JetBrains Mono\', monospace;',
      '  font-size: 11px;',
      '  color: #94A3B8;',
      '  border-bottom: 1px solid rgba(148, 163, 184, 0.1);',
      '  margin-bottom: 4px;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.know-auth-menu a, .know-auth-menu button {',
      '  display: block;',
      '  width: 100%;',
      '  text-align: left;',
      '  padding: 8px 10px;',
      '  font-size: 13px;',
      '  font-family: \'Outfit\', system-ui, sans-serif;',
      '  color: #F8FAFC;',
      '  text-decoration: none;',
      '  background: none;',
      '  border: none;',
      '  cursor: pointer;',
      '  border-radius: 4px;',
      '  transition: background 0.1s;',
      '}',
      '.know-auth-menu a:hover, .know-auth-menu button:hover { background: rgba(56,189,248,0.08); }',
      '.know-auth-menu .divider { border-top: 1px solid rgba(148, 163, 184, 0.1); margin: 4px 0; padding-top: 4px; }',
      '.know-auth-menu .signout { color: #F43F5E; }',
      '[data-theme="light"] .know-auth-menu { background: #FFFFFF; border-color: rgba(15, 23, 42, 0.08); }',
      '[data-theme="light"] .know-auth-menu a, [data-theme="light"] .know-auth-menu button { color: #0B1120; }',
      '[data-theme="light"] .know-auth-menu .signout { color: #F43F5E; }',
      '[data-theme="light"] .know-auth-menu .email { color: #475569; border-bottom-color: rgba(15, 23, 42, 0.08); }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function renderSignedOut(slot) {
    slot.innerHTML = '<a href="' + API + '/join.html" class="know-auth-cta">Sign In</a>';
  }

  function renderSignedIn(slot, user) {
    const initials = (user.email || '??').slice(0, 2).toUpperCase();
    const tier = displayTier(user.plan);
    const c = displayTierColor(user.plan);

    slot.innerHTML = [
      '<div class="know-auth-user">',
      '  <span class="know-auth-tier" style="background:' + c.bg + ';color:' + c.fg + ';border-color:' + c.border + '">' + tier + '</span>',
      '  <div class="know-auth-avatar" id="know-auth-avatar" title="' + escapeHtml(user.email) + '">' + escapeHtml(initials) + '</div>',
      '  <div class="know-auth-menu" id="know-auth-menu">',
      '    <div class="email">' + escapeHtml(user.email) + '</div>',
      '    <a href="' + API + '">Dashboard</a>',
      '    <a href="' + API + '/projects.html">Projects</a>',
      '    <a href="' + API + '/bill.html">Upgrade plan</a>',
      '    <div class="divider">',
      '      <button onclick="window.__2nth_logout()" class="signout">Sign out</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    const avatar = document.getElementById('know-auth-avatar');
    const menu = document.getElementById('know-auth-menu');
    if (avatar && menu) {
      avatar.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.know-auth-user')) menu.classList.remove('open');
      });
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  window.__2nth_logout = async function () {
    try {
      await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) { /* no-op */ }
    window.__2nth_user = null;
    location.href = API + '/join.html';
  };

  // ── Tier-gate hook (inert until MEMBER content ships) ─────────────────────
  // Marks elements with data-tier="member" or data-tier="partner" as gated
  // and replaces them with an upgrade prompt if the user's plan is too low.
  // Currently no elements have data-tier markers; this is a future hook.
  function applyTierGates() {
    const user = window.__2nth_user;
    const userLevel = PLAN_ORDER[(user && user.plan) || 'explorer'] || 0;

    // Map display tier on data-tier to backend plan threshold
    const TIER_THRESHOLD = { open: 0, member: 1, partner: 3 };

    document.querySelectorAll('[data-tier]').forEach(function (el) {
      const required = (el.getAttribute('data-tier') || '').toLowerCase();
      const requiredLevel = TIER_THRESHOLD[required];
      if (requiredLevel == null || userLevel >= requiredLevel) return;

      el.style.position = 'relative';
      el.style.overflow = 'hidden';

      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;inset:0;background:rgba(11,17,32,0.92);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:5;border-radius:inherit;padding:24px;text-align:center';
      overlay.innerHTML = [
        '<div>',
        '  <div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#3B82F6;margin-bottom:8px">' + required.toUpperCase() + ' tier required</div>',
        '  <div style="font-size:14px;color:#94A3B8;margin-bottom:14px;line-height:1.5">Upgrade to unlock this section</div>',
        '  <a href="' + API + '/bill.html" class="know-auth-cta" style="display:inline-block">Upgrade →</a>',
        '</div>'
      ].join('\n');
      el.appendChild(overlay);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async function init() {
    injectStyles();
    const slot = ensureAuthSlot();
    if (!slot) return; // No nav to attach to — bail silently

    const user = await loadSession();
    if (user) renderSignedIn(slot, user);
    else renderSignedOut(slot);

    applyTierGates();

    // Expose helper for inline pages
    window.__2nth_canAccess = function (tier) {
      const u = window.__2nth_user;
      const level = PLAN_ORDER[(u && u.plan) || 'explorer'] || 0;
      const TIER_THRESHOLD = { open: 0, member: 1, partner: 3 };
      const t = (tier || '').toLowerCase();
      return level >= (TIER_THRESHOLD[t] != null ? TIER_THRESHOLD[t] : 1);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
