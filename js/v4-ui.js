/* ============================================================
   ASTROMODS V4 — UI ENHANCEMENTS
   Scroll reveal, navbar, stats counter animation
   ============================================================ */

(function() {
  'use strict';

  // ── SCROLL REVEAL ────────────────────────────────────────
  function initScrollReveal() {
    const els = document.querySelectorAll('.v4-reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = parseInt(e.target.dataset.delay || 0);
          setTimeout(() => e.target.classList.add('revealed'), delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el, i) => {
      // Stagger children within grids
      if (el.parentElement?.classList.contains('v4-mod-grid') ||
          el.parentElement?.classList.contains('v4-game-grid') ||
          el.parentElement?.classList.contains('v4-creator-grid')) {
        el.dataset.delay = i * 60;
      }
      obs.observe(el);
    });
  }

  // ── NAVBAR SCROLL ────────────────────────────────────────
  function initNavbar() {
    const nav = document.getElementById('v4Navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ── ANIMATED COUNTER ─────────────────────────────────────
  function animateCounter(el, target, duration = 1200) {
    if (!el || isNaN(target)) return;
    const start = performance.now();
    const initial = 0;
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(initial + (target - initial) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function initStatsCounter() {
    const stats = [
      { id: 'statTotalMods', target: 50 },
      { id: 'statTotalDownloads', target: 124 },
      { id: 'statTotalUsers', target: 10 },
      { id: 'statTotalCreators', target: 500 },
    ];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const stat = stats.find(s => document.getElementById(s.id) === e.target);
          if (stat) {
            animateCounter(e.target, stat.target);
            obs.unobserve(e.target);
          }
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
  }

  // ── MOD CARD TILT EFFECT ──────────────────────────────────
  function initCardTilt() {
    document.querySelectorAll('.v4-mod-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ── GLOW CURSOR FOR HERO ─────────────────────────────────
  function initHeroGlow() {
    const hero = document.querySelector('.v4-hero');
    if (!hero) return;
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hero.style.setProperty('--mouse-x', x + 'px');
      hero.style.setProperty('--mouse-y', y + 'px');
    });
  }

  // ── SEARCH ENHANCEMENTS ───────────────────────────────────
  function initSearch() {
    const input = document.getElementById('homeSearchModsInput');
    const results = document.getElementById('homeSearchSuggestionsBox');
    if (!input || !results) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q || !window.ALL_GAME_MODS) {
        results.innerHTML = '';
        return;
      }
      const filtered = window.ALL_GAME_MODS.filter(m =>
        m.title?.toLowerCase().includes(q) ||
        m.game?.toLowerCase().includes(q) ||
        m.creator?.toLowerCase().includes(q)
      ).slice(0, 6);

      if (!filtered.length) {
        results.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">No results for "${q}"</div>`;
        return;
      }

      results.innerHTML = filtered.map(m => `
        <div class="v4-search-result-item" onclick="window.location.href='detail-mod-minecraft-bedrock/minecraft.html'">
          <img src="${m.img}" alt="${m.title}" onerror="this.style.display='none'">
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--text-primary);">${m.title}</div>
            <div style="font-size:12px;color:var(--text-muted);">${m.game} · ${m.downloads} downloads</div>
          </div>
        </div>
      `).join('');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.innerHTML = '';
      }
    });
  }

  // ── TOAST NOTIFICATION SYSTEM ─────────────────────────────
  window.showV4Toast = function(msg, type = 'success', duration = 3000) {
    const colors = {
      success: 'var(--success)',
      error: 'var(--danger)',
      warning: 'var(--warning)',
      info: 'var(--primary-light)',
    };
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      z-index: 9999;
      background: var(--bg-card);
      border-left: 3px solid ${colors[type] || colors.info};
      border: 1px solid var(--glass-border);
      border-left-width: 3px;
      color: var(--text-primary);
      padding: 14px 18px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      font-size: 13.5px;
      font-family: 'Space Grotesk', sans-serif;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 340px;
      animation: fadeInUp 0.3s ease both;
      backdrop-filter: blur(12px);
    `;
    toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ── INIT ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initNavbar();
    initScrollReveal();
    initStatsCounter();
    initHeroGlow();
    initSearch();
    // Tilt is opt-in, slight perf cost
    if (!window.matchMedia('(pointer: coarse)').matches) {
      setTimeout(initCardTilt, 500);
    }
  }
})();
