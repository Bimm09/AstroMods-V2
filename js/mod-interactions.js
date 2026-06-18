// =====================================================
// ASTROMODS MOD INTERACTIONS - Detail Page Helper
// Sisipkan ke halaman detail mod untuk rating, like, wishlist, report
// =====================================================

/**
 * Panggil fungsi ini di halaman detail mod setelah modId tersedia:
 *   renderModInteractions('mod123', { title: 'Nama Mod', img: '...', game: 'Minecraft' });
 */
window.renderModInteractions = async function (modId, modData = {}) {
  const container = document.getElementById('_modInteractionsBar');
  if (!container) return;

  const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1';

  // Load current state dari Firestore
  let likeCount = 0;
  let downloadCount = 0;
  let averageRating = 0;
  let ratingCount = 0;

  try {
    const { db, doc, getDoc } = await import('./firebase-init.js');
    const snap = await getDoc(doc(db, 'mod_submissions', modId));
    if (snap.exists()) {
      const d = snap.data();
      likeCount = d.likeCount || 0;
      downloadCount = d.downloadCount || 0;
      averageRating = d.averageRating || 0;
      ratingCount = d.ratingCount || 0;
    }
  } catch (e) {}

  container.innerHTML = `
    <div style="background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:20px;margin:20px 0;">
      
      <!-- Stats Row -->
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.05);">
        <span style="color:#64748b;font-size:13px;">⬇️ <strong style="color:#fff" id="_dlCount">${downloadCount.toLocaleString()}</strong> downloads</span>
        <span style="color:#64748b;font-size:13px;">👍 <strong style="color:#fff" data-like-count="${modId}">${likeCount}</strong> likes</span>
        <span style="color:#64748b;font-size:13px;">⭐ <strong style="color:#fff">${averageRating > 0 ? averageRating : '—'}</strong>${ratingCount > 0 ? ` (${ratingCount} rating)` : ''}</span>
      </div>
      
      <!-- Action Buttons -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
        
        <!-- Download Button -->
        <button onclick="handleDownload('${modId}', '${(modData.title || '').replace(/'/g, "\\'")}', '${modData.downloadUrl || ''}')"
          style="background:linear-gradient(135deg,#10b981,#065f46);color:#fff;border:none;padding:10px 20px;
          border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;transition:.2s;font-family:'Space Grotesk',sans-serif;"
          onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">
          ⬇️ Download Mod
        </button>
        
        <!-- Wishlist Button -->
        <button data-wishlist="${modId}"
          onclick="toggleWishlist('${modId}', ${JSON.stringify(modData).replace(/'/g, "\\'")})"
          style="background:#141724;color:#94a3b8;border:1px solid rgba(255,255,255,.08);
          padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;transition:.2s;font-family:'Space Grotesk',sans-serif;">
          🤍 Add To Wishlist
        </button>
        
        <!-- Like Button -->
        <button data-like-btn="${modId}" onclick="toggleLike('${modId}')"
          style="background:#141724;color:#94a3b8;border:1px solid rgba(255,255,255,.08);
          padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;
          display:flex;align-items:center;gap:6px;transition:.2s;font-family:'Space Grotesk',sans-serif;">
          👍 Like
        </button>
        
        <!-- Report Button -->
        <button onclick="reportMod('${modId}')"
          style="background:transparent;color:#64748b;border:1px solid rgba(255,255,255,.06);
          padding:10px 14px;border-radius:10px;cursor:pointer;font-size:12px;transition:.2s;font-family:'Space Grotesk',sans-serif;"
          onmouseover="this.style.borderColor='rgba(239,68,68,.3)';this.style.color='#ef4444'"
          onmouseout="this.style.borderColor='rgba(255,255,255,.06)';this.style.color='#64748b'">
          🚩 Report
        </button>
        
      </div>
      
      <!-- Star Rating -->
      <div style="margin-bottom:4px;">
        <p style="color:#64748b;font-size:12px;margin:0 0 8px;">Beri rating untuk mod ini:</p>
        <div data-rating-mod="${modId}">
          <div style="display:flex;align-items:center;gap:8px;">
            ${[1,2,3,4,5].map(i => `
              <span class="astro-star ${i <= Math.round(averageRating) ? 'active' : ''}"
                style="font-size:24px;cursor:pointer;color:${i <= Math.round(averageRating) ? '#f59e0b' : '#334155'};transition:.15s;"
                onclick="submitRating('${modId}', ${i})"
                onmouseover="highlightStars(this.parentElement, ${i})"
                onmouseout="resetStars(this.parentElement, ${Math.round(averageRating)})">★</span>
            `).join('')}
            <span style="color:#94a3b8;font-size:12px;">${averageRating > 0 ? `${averageRating}/5` : 'Belum dinilai'}</span>
          </div>
        </div>
      </div>
      
    </div>
  `;

  // Init states (wishlist & like)
  if (typeof window.initModInteractions === 'function') {
    window.initModInteractions(modId, modData);
  }
};

/**
 * Render Creator Card dengan follow button dan verified badge
 */
window.renderCreatorCard = async function (creatorUid, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !creatorUid) return;

  try {
    const { db, doc, getDoc } = await import('./firebase-init.js');
    const snap = await getDoc(doc(db, 'users', creatorUid));
    if (!snap.exists()) return;

    const creator = snap.data();
    const uid = snap.id;
    const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1';
    const currentUid = localStorage.getItem('_astro_uid');
    const isSelf = currentUid === uid;

    // Get follower count
    let followers = 0;
    if (typeof window.getFollowerCount === 'function') {
      followers = await window.getFollowerCount(uid);
    }

    const verifiedBadge = creator.verified
      ? '<span style="background:rgba(99,102,241,.15);border:1px solid #6366f1;color:#818cf8;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:bold;">✔ Verified</span>'
      : '';

    container.innerHTML = `
      <div style="background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <a href="/profile.html?uid=${uid}" style="text-decoration:none;display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
          <img src="${creator.avatarUrl || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${uid}`}"
            style="width:52px;height:52px;border-radius:50%;border:2px solid rgba(255,0,60,.25);flex-shrink:0;"
            onerror="this.src='https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=guest'">
          <div>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="color:#fff;font-weight:700;font-size:15px;">${creator.username || 'Creator'}</span>
              ${verifiedBadge}
              ${creator.isOwner || creator.role === 'owner' ? '<span style="background:rgba(255,0,60,.15);color:#ff003c;font-size:9px;padding:2px 7px;border-radius:20px;font-weight:bold;">👑 Owner</span>' : ''}
            </div>
            <div style="color:#64748b;font-size:12px;margin-top:3px;">👥 ${followers} followers</div>
          </div>
        </a>
        ${!isSelf ? `
          <button data-follow-btn="${uid}" onclick="toggleFollow('${uid}')"
            style="background:#141724;color:#94a3b8;border:1px solid rgba(255,255,255,.08);
            padding:9px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;
            flex-shrink:0;transition:.2s;font-family:'Space Grotesk',sans-serif;">
            ➕ Follow
          </button>
        ` : ''}
      </div>
    `;

    // Check follow status
    if (!isSelf && typeof window.checkFollowStatus === 'function') {
      const following = await window.checkFollowStatus(uid);
      if (following) {
        const btn = container.querySelector(`[data-follow-btn="${uid}"]`);
        if (btn) {
          btn.textContent = '✅ Following';
          btn.style.background = 'rgba(16,185,129,.15)';
          btn.style.borderColor = '#10b981';
          btn.style.color = '#10b981';
        }
      }
    }
  } catch (err) {
    console.warn('Creator card error:', err.message);
  }
};
