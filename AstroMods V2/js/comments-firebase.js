// =====================================================
// ASTROMODS COMMENT BRIDGE - Firebase Integration
// Override handleSubmitComment dan loadModComments
// =====================================================

(function() {
  'use strict';

  // Tunggu firebase-auth.js selesai load
  function waitForFirebase(cb, maxWait = 5000) {
    const start = Date.now();
    const check = () => {
      if (window.submitComment && window.loadComments) { cb(); return; }
      if (Date.now() - start > maxWait) { console.warn('Firebase comment bridge timeout'); return; }
      setTimeout(check, 200);
    };
    check();
  }

  // Override handleSubmitComment dengan Firebase version
  window.handleSubmitComment = function(event) {
    if (event) event.preventDefault();
    const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1' || localStorage.getItem('astroUserLoggedIn') === 'true';
    if (!isLoggedIn) {
      if (typeof openLoginModal === 'function') openLoginModal();
      return;
    }
    const input = document.getElementById('commentInputArea');
    if (!input || !input.value.trim()) return;
    const modId = window.currentDetailPageModId || 'unknown';
    const text = input.value.trim();
    input.value = '';
    
    if (window.submitComment) {
      window.submitComment(modId, text);
    } else {
      // Fallback localStorage
      const username = localStorage.getItem('_astro_username') || localStorage.getItem('astroUsername') || 'Player';
      const uid = localStorage.getItem('_astro_uid') || 'guest';
      const avatar = localStorage.getItem('_astro_avatar') || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${uid}`;
      let arr = JSON.parse(localStorage.getItem(`astro_${modId}_comments`) || '[]');
      arr.unshift({ user: username, text, timestamp: new Date().toLocaleDateString('id-ID'), avatar, uid });
      localStorage.setItem(`astro_${modId}_comments`, JSON.stringify(arr));
      loadModComments();
    }
  };

  // Override loadModComments dengan Firebase version
  window.loadModComments = function() {
    const modId = window.currentDetailPageModId;
    if (!modId) return;
    
    // Set container ID yang digunakan di detail-pokemon.html
    const box = document.getElementById('commentsContainerBox');
    if (box) box.id = '_commentsContainer'; // rename agar cocok dengan firebase-auth.js

    if (window.loadComments) {
      window.loadComments(modId);
    } else {
      // Fallback localStorage
      renderLocalComments(modId);
    }
  };

  function renderLocalComments(modId) {
    const box = document.getElementById('_commentsContainer') || document.getElementById('commentsContainerBox');
    if (!box) return;
    const arr = JSON.parse(localStorage.getItem(`astro_${modId}_comments`) || '[]');
    if (arr.length === 0) {
      box.innerHTML = '<p style="color:#64748b;font-size:13px;font-style:italic;padding:10px 0;">Belum ada komentar. Jadilah yang pertama!</p>';
      return;
    }
    box.innerHTML = '';
    arr.forEach(c => {
      const avatarSrc = c.avatar || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${c.uid||'guest'}`;
      box.innerHTML += `
        <div style="background:rgba(255,255,255,.02);padding:14px;border-radius:10px;margin-bottom:12px;border:1px solid rgba(255,255,255,.04);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <img src="${avatarSrc}" style="width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,0,60,.3);" onerror="this.src='https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=guest'">
            <div>
              <strong style="color:#10b981;font-size:13px;">@${c.user}</strong>
              <div style="color:#64748b;font-size:10px;">${c.timestamp||'Baru saja'}</div>
            </div>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.5;">${c.text}</p>
        </div>
      `;
    });
  }

  // Expose untuk digunakan di detail page
  window.initFirebaseComments = function(modId) {
    // Rename container jika perlu
    const oldBox = document.getElementById('commentsContainerBox');
    if (oldBox && !document.getElementById('_commentsContainer')) {
      oldBox.id = '_commentsContainer';
    }

    waitForFirebase(() => {
      if (window.loadComments) window.loadComments(modId);
      else renderLocalComments(modId);
    });
  };

  // Tunggu DOM siap
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('detail-')) {
      // Sedikit delay agar currentDetailPageModId tersedia
      setTimeout(() => {
        const modId = window.currentDetailPageModId;
        if (modId) window.initFirebaseComments(modId);
      }, 500);
    }
  });

})();
