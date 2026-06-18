// =====================================================
// ASTROMODS FEATURES - v1.0
// Download Counter, Wishlist, Rating, Like, Notifications,
// Report, Follow, Verified Badge systems
// =====================================================

import {
  auth, db, onAuthStateChanged,
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  collection, getDocs, query, where, orderBy, limit,
  serverTimestamp, increment, onSnapshot
} from './firebase-init.js';

console.log('🚀 AstroMods Features v1.0 loaded.');

// ─── UTILS ─────────────────────────────────────────────
function getUid() { return localStorage.getItem('_astro_uid') || null; }
function isLoggedIn() { return localStorage.getItem('_astro_loggedIn') === '1'; }
function requireLogin() {
  if (!isLoggedIn()) {
    if (typeof openLoginModal === 'function') openLoginModal();
    return false;
  }
  return true;
}

// ─── 1. DOWNLOAD COUNTER ──────────────────────────────
/**
 * Tambah downloadCount di dokumen mod dan catat di collection downloads.
 * @param {string} modId - ID dokumen mod
 * @param {string} modTitle - Judul mod (untuk histori)
 * @param {string} downloadUrl - URL download mod
 */
window.handleDownload = async function (modId, modTitle, downloadUrl) {
  // Buka URL download
  if (downloadUrl) window.open(downloadUrl, '_blank');

  try {
    // Increment counter di mod_submissions
    const modRef = doc(db, 'mod_submissions', modId);
    await updateDoc(modRef, {
      downloadCount: increment(1)
    });

    // Catat riwayat download
    const uid = getUid();
    await addDoc(collection(db, 'downloads'), {
      modId,
      modTitle: modTitle || modId,
      uid: uid || 'guest',
      createdAt: serverTimestamp()
    });

    // Kirim notifikasi ke uploader jika user login
    if (uid) {
      const modSnap = await getDoc(modRef);
      if (modSnap.exists()) {
        const uploaderUid = modSnap.data().submittedBy || modSnap.data().uploaderUid;
        if (uploaderUid && uploaderUid !== uid) {
          await sendNotification(uploaderUid, '⬇️ Mod Kamu Didownload', `Mod "${modTitle}" baru saja didownload!`);
        }
      }
    }

    if (typeof window.astroToast === 'function') {
      window.astroToast('Download dimulai! Terima kasih 🚀', '⬇️', '#10b981');
    }
  } catch (err) {
    console.warn('Download counter error:', err.message);
  }
};

// ─── 2. WISHLIST / BOOKMARK SYSTEM ───────────────────
window.toggleWishlist = async function (modId, modData = {}) {
  if (!requireLogin()) return;
  const uid = getUid();

  try {
    const q = query(
      collection(db, 'bookmarks'),
      where('uid', '==', uid),
      where('modId', '==', modId)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Hapus dari wishlist
      await deleteDoc(doc(db, 'bookmarks', snap.docs[0].id));
      if (typeof window.astroToast === 'function') {
        window.astroToast('Dihapus dari Wishlist', '💔', '#64748b');
      }
      updateWishlistBtn(modId, false);
    } else {
      // Tambah ke wishlist
      await addDoc(collection(db, 'bookmarks'), {
        uid,
        modId,
        modTitle: modData.title || modData.modTitle || modId,
        modImg: modData.img || modData.coverUrl || '',
        modGame: modData.game || modData.modGame || 'Mod',
        createdAt: serverTimestamp()
      });
      if (typeof window.astroToast === 'function') {
        window.astroToast('Ditambahkan ke Wishlist! ❤️', '❤️', '#ff003c');
      }
      updateWishlistBtn(modId, true);

      // Notifikasi ke uploader
      const modRef = doc(db, 'mod_submissions', modId);
      const modSnap = await getDoc(modRef);
      if (modSnap.exists()) {
        const uploaderUid = modSnap.data().submittedBy;
        if (uploaderUid && uploaderUid !== uid) {
          await sendNotification(uploaderUid, '❤️ Mod Masuk Wishlist', `Mod "${modData.title || modId}" ditambahkan ke wishlist!`);
        }
      }
    }
  } catch (err) {
    console.error('Wishlist error:', err);
    if (typeof window.astroToast === 'function') {
      window.astroToast('Gagal update wishlist', '❌', '#ef4444');
    }
  }
};

window.checkWishlistStatus = async function (modId) {
  if (!isLoggedIn()) return false;
  const uid = getUid();
  try {
    const q = query(
      collection(db, 'bookmarks'),
      where('uid', '==', uid),
      where('modId', '==', modId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch { return false; }
};

function updateWishlistBtn(modId, active) {
  const btns = document.querySelectorAll(`[data-wishlist="${modId}"]`);
  btns.forEach(btn => {
    if (active) {
      btn.style.background = 'rgba(255,0,60,0.2)';
      btn.style.borderColor = '#ff003c';
      btn.style.color = '#ff003c';
      btn.innerHTML = '❤️ In Wishlist';
    } else {
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.innerHTML = '🤍 Add To Wishlist';
    }
  });
}

// ─── 3. RATING SYSTEM ────────────────────────────────
window.submitRating = async function (modId, ratingValue) {
  if (!requireLogin()) return;
  const uid = getUid();
  ratingValue = parseInt(ratingValue);
  if (ratingValue < 1 || ratingValue > 5) return;

  try {
    // Cek apakah sudah pernah rating
    const existingQ = query(
      collection(db, 'ratings'),
      where('uid', '==', uid),
      where('modId', '==', modId)
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      if (typeof window.astroToast === 'function') {
        window.astroToast('Kamu sudah memberi rating sebelumnya!', '⭐', '#f59e0b');
      }
      return;
    }

    // Simpan rating baru
    await addDoc(collection(db, 'ratings'), {
      uid,
      modId,
      rating: ratingValue,
      createdAt: serverTimestamp()
    });

    // Update rata-rata rating di mod
    const modRef = doc(db, 'mod_submissions', modId);
    const modSnap = await getDoc(modRef);
    if (modSnap.exists()) {
      const data = modSnap.data();
      const oldCount = data.ratingCount || 0;
      const oldAvg = data.averageRating || 0;
      const newCount = oldCount + 1;
      const newAvg = ((oldAvg * oldCount) + ratingValue) / newCount;
      await updateDoc(modRef, {
        averageRating: Math.round(newAvg * 10) / 10,
        ratingCount: newCount
      });

      // Notifikasi ke uploader
      const uploaderUid = data.submittedBy;
      if (uploaderUid && uploaderUid !== uid) {
        await sendNotification(uploaderUid, '⭐ Mod Kamu Diberi Rating', `Mod mendapat rating ${ratingValue} bintang!`);
      }
    }

    if (typeof window.astroToast === 'function') {
      window.astroToast(`Rating ${ratingValue} bintang dikirim! ⭐`, '⭐', '#f59e0b');
    }
    renderStarRating(modId, ratingValue, true);
  } catch (err) {
    console.error('Rating error:', err);
    if (typeof window.astroToast === 'function') {
      window.astroToast('Gagal kirim rating', '❌', '#ef4444');
    }
  }
};

window.loadRating = async function (modId) {
  try {
    const modRef = doc(db, 'mod_submissions', modId);
    const modSnap = await getDoc(modRef);
    if (!modSnap.exists()) return;
    const { averageRating = 0, ratingCount = 0 } = modSnap.data();

    const uid = getUid();
    let userRating = 0;
    if (uid) {
      const q = query(collection(db, 'ratings'), where('uid', '==', uid), where('modId', '==', modId));
      const snap = await getDocs(q);
      if (!snap.empty) userRating = snap.docs[0].data().rating;
    }

    renderStarRating(modId, userRating, !!userRating, averageRating, ratingCount);
  } catch (err) {
    console.warn('Load rating error:', err.message);
  }
};

function renderStarRating(modId, userRating, alreadyRated, avgRating = 0, ratingCount = 0) {
  const container = document.querySelector(`[data-rating-mod="${modId}"]`);
  if (!container) return;

  const stars = [1, 2, 3, 4, 5].map(i => `
    <span class="astro-star ${i <= (userRating || Math.round(avgRating)) ? 'active' : ''}"
      style="font-size:22px;cursor:${alreadyRated ? 'default' : 'pointer'};color:${i <= (userRating || Math.round(avgRating)) ? '#f59e0b' : '#334155'};transition:.2s;"
      ${!alreadyRated ? `onclick="submitRating('${modId}', ${i})"
        onmouseover="highlightStars(this.parentElement, ${i})"
        onmouseout="resetStars(this.parentElement, ${Math.round(avgRating)})"` : ''}
    >★</span>
  `).join('');

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <div class="astro-stars-row">${stars}</div>
      <span style="color:#94a3b8;font-size:12px;">${avgRating > 0 ? `${avgRating} (${ratingCount} rating)` : 'Belum ada rating'}</span>
      ${alreadyRated ? '<span style="color:#f59e0b;font-size:11px;">✓ Sudah dinilai</span>' : ''}
    </div>
  `;
}

window.highlightStars = function (container, n) {
  container.querySelectorAll('.astro-star').forEach((s, i) => {
    s.style.color = i < n ? '#fbbf24' : '#334155';
  });
};
window.resetStars = function (container, n) {
  container.querySelectorAll('.astro-star').forEach((s, i) => {
    s.style.color = i < n ? '#f59e0b' : '#334155';
  });
};

// ─── 4. LIKE SYSTEM ──────────────────────────────────
window.toggleLike = async function (modId) {
  if (!requireLogin()) return;
  const uid = getUid();

  try {
    const likeId = `${uid}_${modId}`;
    const likeRef = doc(db, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(doc(db, 'mod_submissions', modId), { likeCount: increment(-1) });
      updateLikeBtn(modId, false);
    } else {
      // Like
      await setDoc(likeRef, { uid, modId, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'mod_submissions', modId), { likeCount: increment(1) });
      updateLikeBtn(modId, true);

      // Notifikasi ke uploader
      const modSnap = await getDoc(doc(db, 'mod_submissions', modId));
      if (modSnap.exists()) {
        const uploaderUid = modSnap.data().submittedBy;
        if (uploaderUid && uploaderUid !== uid) {
          await sendNotification(uploaderUid, '👍 Mod Kamu Dilike!', `Seseorang menyukai mod "${modSnap.data().title || modId}"`);
        }
      }
    }
  } catch (err) {
    console.error('Like error:', err);
  }
};

window.checkLikeStatus = async function (modId) {
  if (!isLoggedIn()) return false;
  const uid = getUid();
  try {
    const likeRef = doc(db, 'likes', `${uid}_${modId}`);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch { return false; }
};

function updateLikeBtn(modId, liked) {
  const btn = document.querySelector(`[data-like-btn="${modId}"]`);
  if (!btn) return;
  btn.style.background = liked ? 'rgba(99,102,241,0.2)' : '';
  btn.style.borderColor = liked ? '#6366f1' : '';
  btn.style.color = liked ? '#818cf8' : '';
  const countEl = document.querySelector(`[data-like-count="${modId}"]`);
  if (countEl) {
    const current = parseInt(countEl.textContent) || 0;
    countEl.textContent = liked ? current + 1 : Math.max(0, current - 1);
  }
}

window.initModInteractions = async function (modId, modData = {}) {
  // Init wishlist btn
  const wishlisted = await checkWishlistStatus(modId);
  updateWishlistBtn(modId, wishlisted);

  // Init like btn
  const liked = await checkLikeStatus(modId);
  updateLikeBtn(modId, liked);

  // Init rating
  await loadRating(modId);
};

// ─── 5. COMMENT SYSTEM (UPGRADE) ─────────────────────
window.submitComment = async function (modId, text, parentId = null) {
  if (!requireLogin()) return;
  const uid = getUid();
  const profile = JSON.parse(localStorage.getItem('_astro_profile') || '{}');

  try {
    const commentData = {
      modId,
      uid,
      username: profile.username || 'Player',
      avatarUrl: profile.avatarUrl || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${uid}`,
      text: text.trim(),
      parentId: parentId || null,
      edited: false,
      likes: 0,
      createdAt: serverTimestamp()
    };

    const ref = await addDoc(collection(db, 'comments'), commentData);

    // Notifikasi ke uploader
    const modSnap = await getDoc(doc(db, 'mod_submissions', modId));
    if (modSnap.exists()) {
      const uploaderUid = modSnap.data().submittedBy;
      if (uploaderUid && uploaderUid !== uid) {
        await sendNotification(uploaderUid, '💬 Komentar Baru', `Ada komentar baru di mod "${modSnap.data().title || modId}"`);
      }
    }

    if (typeof window.loadComments === 'function') window.loadComments(modId);
    if (typeof window.astroToast === 'function') window.astroToast('Komentar dikirim!', '💬', '#10b981');
    return ref.id;
  } catch (err) {
    console.error('Comment error:', err);
    if (typeof window.astroToast === 'function') window.astroToast('Gagal kirim komentar', '❌', '#ef4444');
  }
};

window.editComment = async function (commentId, newText) {
  const uid = getUid();
  if (!uid) return;
  try {
    const ref = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().uid !== uid) {
      window.astroToast('Tidak bisa edit komentar ini', '❌', '#ef4444');
      return;
    }
    await updateDoc(ref, { text: newText.trim(), edited: true, editedAt: serverTimestamp() });
    window.astroToast('Komentar diperbarui!', '✏️', '#10b981');
    const modId = snap.data().modId;
    if (typeof window.loadComments === 'function') window.loadComments(modId);
  } catch (err) {
    console.error('Edit comment error:', err);
  }
};

window.deleteComment = async function (commentId) {
  const uid = getUid();
  if (!uid) return;
  if (!confirm('Hapus komentar ini?')) return;
  try {
    const ref = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const profile = JSON.parse(localStorage.getItem('_astro_profile') || '{}');
    const isModOrOwner = ['owner', 'admin', 'moderator'].includes(profile.role);

    if (snap.data().uid !== uid && !isModOrOwner) {
      window.astroToast('Tidak bisa hapus komentar ini', '❌', '#ef4444');
      return;
    }
    const modId = snap.data().modId;
    await deleteDoc(ref);
    window.astroToast('Komentar dihapus', '🗑️', '#64748b');
    if (typeof window.loadComments === 'function') window.loadComments(modId);
  } catch (err) {
    console.error('Delete comment error:', err);
  }
};

window.loadComments = async function (modId) {
  const container = document.getElementById('_commentsContainer') || document.getElementById('commentsContainerBox');
  if (!container) return;
  container.innerHTML = '<div style="color:#64748b;font-size:13px;">Memuat komentar...</div>';

  try {
    const q = query(
      collection(db, 'comments'),
      where('modId', '==', modId),
      where('parentId', '==', null),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snaps = await getDocs(q);

    if (snaps.empty) {
      container.innerHTML = '<p style="color:#64748b;font-size:13px;font-style:italic;padding:10px 0;">Belum ada komentar. Jadilah yang pertama!</p>';
      return;
    }

    const uid = getUid();
    const profile = JSON.parse(localStorage.getItem('_astro_profile') || '{}');
    const isMod = ['owner', 'admin', 'moderator'].includes(profile.role);

    container.innerHTML = '';
    for (const snap of snaps.docs) {
      const c = snap.data();
      const time = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Baru saja';
      const isOwner = c.uid === uid;
      const canDelete = isOwner || isMod;
      const canEdit = isOwner;

      // Load replies
      const repQ = query(collection(db, 'comments'), where('parentId', '==', snap.id), orderBy('createdAt', 'asc'));
      const repSnaps = await getDocs(repQ);

      let repliesHtml = '';
      for (const rep of repSnaps.docs) {
        const r = rep.data();
        const rTime = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
        const rIsOwner = r.uid === uid;
        repliesHtml += `
          <div style="background:rgba(255,255,255,.015);padding:10px 12px;border-radius:8px;margin-top:8px;border-left:2px solid rgba(99,102,241,.3);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <img src="${r.avatarUrl || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${r.uid}`}" style="width:26px;height:26px;border-radius:50%;" onerror="this.src='https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=guest'">
              <strong style="color:#818cf8;font-size:12px;">@${r.username}</strong>
              <span style="color:#475569;font-size:10px;">${rTime}</span>
              ${r.edited ? '<span style="color:#475569;font-size:10px;">(diedit)</span>' : ''}
            </div>
            <p style="color:#94a3b8;font-size:12.5px;margin:0 0 6px;line-height:1.5;">${escapeHtml(r.text)}</p>
            <div style="display:flex;gap:8px;">
              ${rIsOwner ? `<button onclick="promptEditComment('${rep.id}', this)" style="background:transparent;border:none;color:#64748b;font-size:11px;cursor:pointer;">✏️ Edit</button>` : ''}
              ${(rIsOwner || isMod) ? `<button onclick="deleteComment('${rep.id}')" style="background:transparent;border:none;color:#64748b;font-size:11px;cursor:pointer;">🗑️ Hapus</button>` : ''}
            </div>
          </div>
        `;
      }

      container.innerHTML += `
        <div style="background:rgba(255,255,255,.02);padding:14px;border-radius:10px;margin-bottom:12px;border:1px solid rgba(255,255,255,.04);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <img src="${c.avatarUrl || `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${c.uid}`}" style="width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,0,60,.3);" onerror="this.src='https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=guest'">
            <div style="flex:1;">
              <strong style="color:#10b981;font-size:13px;">@${c.username}</strong>
              <span style="color:#475569;font-size:10px;margin-left:8px;">${time}</span>
              ${c.edited ? '<span style="color:#475569;font-size:10px;margin-left:4px;">(diedit)</span>' : ''}
            </div>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin:0 0 10px;line-height:1.5;">${escapeHtml(c.text)}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button onclick="showReplyBox('${snap.id}', '${modId}')" style="background:transparent;border:1px solid rgba(255,255,255,.08);color:#64748b;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;">💬 Balas</button>
            ${canEdit ? `<button onclick="promptEditComment('${snap.id}', this)" style="background:transparent;border:none;color:#64748b;font-size:11px;cursor:pointer;">✏️ Edit</button>` : ''}
            ${canDelete ? `<button onclick="deleteComment('${snap.id}')" style="background:transparent;border:none;color:#64748b;font-size:11px;cursor:pointer;">🗑️ Hapus</button>` : ''}
          </div>
          <div id="replyBox_${snap.id}" style="display:none;margin-top:10px;">
            <textarea id="replyText_${snap.id}" placeholder="Tulis balasan..." rows="2"
              style="width:100%;background:#0f111a;border:1px solid rgba(255,255,255,.08);color:#fff;border-radius:8px;padding:10px;font-size:13px;resize:none;box-sizing:border-box;"></textarea>
            <div style="display:flex;gap:8px;margin-top:6px;">
              <button onclick="submitReply('${snap.id}', '${modId}')" style="background:#6366f1;color:#fff;border:none;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px;">Kirim Balasan</button>
              <button onclick="document.getElementById('replyBox_${snap.id}').style.display='none'" style="background:#1e293b;color:#94a3b8;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Batal</button>
            </div>
          </div>
          ${repliesHtml}
        </div>
      `;
    }
  } catch (err) {
    console.error('Load comments error:', err);
    container.innerHTML = '<div style="color:#f87171;font-size:13px;">Gagal memuat komentar.</div>';
  }
};

window.showReplyBox = function (commentId, modId) {
  const box = document.getElementById(`replyBox_${commentId}`);
  if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
};

window.submitReply = async function (parentId, modId) {
  const textarea = document.getElementById(`replyText_${parentId}`);
  if (!textarea || !textarea.value.trim()) return;
  await submitComment(modId, textarea.value.trim(), parentId);
  textarea.value = '';
  const box = document.getElementById(`replyBox_${parentId}`);
  if (box) box.style.display = 'none';
};

window.promptEditComment = function (commentId, btn) {
  const pEl = btn.closest('div').previousElementSibling;
  if (!pEl) return;
  const currentText = pEl.textContent;
  const newText = prompt('Edit komentar:', currentText);
  if (newText && newText.trim() && newText !== currentText) {
    editComment(commentId, newText);
  }
};

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── 6. NOTIFICATION CENTER ───────────────────────────
async function sendNotification(targetUid, title, message) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userUid: targetUid,
      title,
      message,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Send notification error:', err.message);
  }
}
window.sendNotification = sendNotification;

window.loadNotifications = async function () {
  const uid = getUid();
  if (!uid) return;

  const badge = document.getElementById('_notifBadge');
  const dropdown = document.getElementById('_notifDropdown');

  try {
    const q = query(
      collection(db, 'notifications'),
      where('userUid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    const unread = snap.docs.filter(d => !d.data().read).length;

    if (badge) {
      badge.textContent = unread > 0 ? (unread > 9 ? '9+' : unread) : '';
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    if (dropdown) {
      if (snap.empty) {
        dropdown.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;font-size:13px;">🔔 Belum ada notifikasi</div>';
      } else {
        dropdown.innerHTML = snap.docs.map(d => {
          const n = d.data();
          const time = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString('id-ID') : '';
          return `
            <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="markNotifRead('${d.id}')" style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;background:${!n.read ? 'rgba(255,0,60,.05)' : 'transparent'};transition:.2s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='${!n.read ? 'rgba(255,0,60,.05)' : 'transparent'}'">
              <div style="font-size:13px;color:#fff;font-weight:${!n.read ? '600' : '400'};">${n.title}</div>
              <div style="font-size:12px;color:#64748b;margin-top:2px;">${n.message}</div>
              <div style="font-size:10px;color:#475569;margin-top:4px;">${time}</div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.warn('Load notifications error:', err.message);
  }
};

window.markNotifRead = async function (notifId) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
    await loadNotifications();
  } catch (err) { console.warn(err); }
};

window.markAllNotifsRead = async function () {
  const uid = getUid();
  if (!uid) return;
  try {
    const q = query(collection(db, 'notifications'), where('userUid', '==', uid), where('read', '==', false));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
    await loadNotifications();
  } catch (err) { console.warn(err); }
};

// ─── 10. REPORT MOD SYSTEM ───────────────────────────
window.reportMod = async function (modId) {
  if (!requireLogin()) return;
  const uid = getUid();

  const reasons = ['Konten tidak pantas', 'Spam / duplikat', 'Mod rusak / tidak berfungsi', 'Hak cipta / plagiarisme', 'Lainnya'];
  const reason = prompt(`Pilih alasan report:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nKetik nomor pilihan (1-${reasons.length}):`);
  if (!reason) return;

  const idx = parseInt(reason) - 1;
  const selectedReason = reasons[idx] || 'Lainnya';

  try {
    // Cek apakah sudah pernah report mod ini
    const existQ = query(
      collection(db, 'reports'),
      where('reporterUid', '==', uid),
      where('modId', '==', modId)
    );
    const existSnap = await getDocs(existQ);
    if (!existSnap.empty) {
      window.astroToast('Kamu sudah pernah melaporkan mod ini', '🚩', '#f59e0b');
      return;
    }

    await addDoc(collection(db, 'reports'), {
      reporterUid: uid,
      modId,
      reason: selectedReason,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    window.astroToast('Laporan berhasil dikirim. Terima kasih!', '🚩', '#10b981');
  } catch (err) {
    console.error('Report error:', err);
    window.astroToast('Gagal kirim laporan', '❌', '#ef4444');
  }
};

// ─── 12. VERIFIED CREATOR BADGE ──────────────────────
window.renderVerifiedBadge = function (isVerified) {
  if (!isVerified) return '';
  return '<span style="background:rgba(99,102,241,.15);border:1px solid #6366f1;color:#818cf8;font-size:10px;padding:3px 8px;border-radius:20px;font-weight:bold;margin-left:6px;">✔ Verified</span>';
};

// ─── 13. FOLLOW CREATOR SYSTEM ───────────────────────
window.toggleFollow = async function (creatorUid) {
  if (!requireLogin()) return;
  const uid = getUid();
  if (uid === creatorUid) {
    window.astroToast('Tidak bisa follow diri sendiri', '😅', '#f59e0b');
    return;
  }

  try {
    const followId = `${uid}_${creatorUid}`;
    const followRef = doc(db, 'follows', followId);
    const snap = await getDoc(followRef);

    if (snap.exists()) {
      await deleteDoc(followRef);
      updateFollowBtn(creatorUid, false);
      window.astroToast('Berhenti mengikuti creator', '👋', '#64748b');
    } else {
      await setDoc(followRef, {
        followerUid: uid,
        creatorUid,
        createdAt: serverTimestamp()
      });
      updateFollowBtn(creatorUid, true);
      window.astroToast('Sekarang kamu mengikuti creator ini!', '✅', '#10b981');
      await sendNotification(creatorUid, '👥 Follower Baru!', 'Ada pengguna baru yang mengikuti kamu!');
    }
  } catch (err) {
    console.error('Follow error:', err);
  }
};

window.checkFollowStatus = async function (creatorUid) {
  if (!isLoggedIn()) return false;
  const uid = getUid();
  try {
    const snap = await getDoc(doc(db, 'follows', `${uid}_${creatorUid}`));
    return snap.exists();
  } catch { return false; }
};

window.getFollowerCount = async function (creatorUid) {
  try {
    const q = query(collection(db, 'follows'), where('creatorUid', '==', creatorUid));
    const snap = await getDocs(q);
    return snap.size;
  } catch { return 0; }
};

window.getFollowingCount = async function (uid) {
  try {
    const q = query(collection(db, 'follows'), where('followerUid', '==', uid));
    const snap = await getDocs(q);
    return snap.size;
  } catch { return 0; }
};

function updateFollowBtn(creatorUid, following) {
  const btn = document.querySelector(`[data-follow-btn="${creatorUid}"]`);
  if (!btn) return;
  if (following) {
    btn.textContent = '✅ Following';
    btn.style.background = 'rgba(16,185,129,.15)';
    btn.style.borderColor = '#10b981';
    btn.style.color = '#10b981';
  } else {
    btn.textContent = '➕ Follow';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
  }
}

// ─── INIT ON AUTH STATE ───────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadNotifications();
    // Realtime listener untuk notifikasi baru
    const uid = user.uid;
    const q = query(
      collection(db, 'notifications'),
      where('userUid', '==', uid),
      where('read', '==', false)
    );
    onSnapshot(q, () => { loadNotifications(); });
  }
});

// ─── EXPORT HELPERS ──────────────────────────────────
export {
  sendNotification,
  isLoggedIn,
  getUid
};
