// =====================================================
// ASTROMODS OWNER DASHBOARD - Real-time v2.0
// Dashboard owner dengan statistik realtime dari Firestore
// =====================================================

import {
  auth, db, onAuthStateChanged,
  collection, getDocs, query, where, orderBy, limit, onSnapshot,
  doc, getDoc, updateDoc, serverTimestamp
} from './firebase-init.js';

let isOwnerOrAdmin = false;
let unsubscribes = [];

// ─── CHECK OWNER/ADMIN ────────────────────────────────
async function checkRole(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return false;
    const d = snap.data();
    return d.isOwner === true || d.role === 'owner' || d.role === 'admin' || d.role === 'moderator';
  } catch { return false; }
}

// ─── LOAD OWNER STATS ─────────────────────────────────
async function loadOwnerStats() {
  try {
    const [usersSnap, modsSnap, pendingSnap, downloadsSnap, vipSnap, likesSnap, commSnap, ratingsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(query(collection(db, 'mod_submissions'), where('status', '==', 'approved'))),
      getDocs(query(collection(db, 'mod_submissions'), where('status', '==', 'pending'))),
      getDocs(collection(db, 'downloads')),
      getDocs(query(collection(db, 'users'), where('vipStatus', '==', true))),
      getDocs(collection(db, 'likes')),
      getDocs(collection(db, 'comments')),
      getDocs(collection(db, 'ratings'))
    ]);

    const totalDownloads = downloadsSnap.size;

    // Update stat cards
    setEl('totalUsers', usersSnap.size);
    setEl('totalMods', modsSnap.size);
    setEl('totalVIP', vipSnap.size);
    setEl('totalPendingMods', pendingSnap.size);

    // Extended stats (jika ada elemen-nya)
    setEl('totalDownloads', totalDownloads.toLocaleString());
    setEl('totalLikes', likesSnap.size);
    setEl('totalComments', commSnap.size);
    setEl('totalRatings', ratingsSnap.size);

    // Build owner dashboard if on dashboard page
    renderOwnerDashboard({
      users: usersSnap.size,
      mods: modsSnap.size,
      pending: pendingSnap.size,
      downloads: totalDownloads,
      vip: vipSnap.size,
      likes: likesSnap.size,
      comments: commSnap.size,
      ratings: ratingsSnap.size
    });

  } catch (err) {
    console.warn('Owner stats error:', err.message);
  }
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── RENDER OWNER DASHBOARD ───────────────────────────
async function renderOwnerDashboard(stats) {
  const ownerCard = document.querySelector('.owner-welcome-card');
  if (!ownerCard) return;

  // Tambahkan admin panel link
  const actions = document.querySelector('.owner-actions');
  if (actions && !document.getElementById('_adminPanelBtn')) {
    const btn = document.createElement('button');
    btn.id = '_adminPanelBtn';
    btn.className = 'owner-action-btn';
    btn.innerHTML = '<a href="admin.html" style="color:inherit;text-decoration:none;">🛡️ Admin Panel</a>';
    actions.appendChild(btn);
  }

  // Update stats cards dengan angka realtime
  const dashStats = document.querySelector('.dashboard-stats');
  if (dashStats) {
    // Tambah card yang belum ada
    const cardIds = ['totalLikes', 'totalComments', 'totalRatings'];
    const cardLabels = ['Total Likes 👍', 'Total Komentar 💬', 'Total Rating ⭐'];
    cardIds.forEach((id, i) => {
      if (!document.getElementById(id)) {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        card.innerHTML = `<h3 id="${id}">—</h3><span>${cardLabels[i]}</span>`;
        dashStats.appendChild(card);
      }
    });
  }

  // Update angka
  setEl('totalLikes', stats.likes);
  setEl('totalComments', stats.comments);
  setEl('totalRatings', stats.ratings);

  // Render recent activity
  await renderRecentActivity();
}

// ─── RECENT ACTIVITY FOR OWNER ─────────────────────────
async function renderRecentActivity() {
  const container = document.getElementById('_ownerActivity');
  if (!container) return;

  try {
    const [recentDl, recentComm, recentMods] = await Promise.all([
      getDocs(query(collection(db, 'downloads'), orderBy('createdAt', 'desc'), limit(5))),
      getDocs(query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(5))),
      getDocs(query(collection(db, 'mod_submissions'), where('status', '==', 'pending'), orderBy('submittedAt', 'desc'), limit(3)))
    ]);

    let html = '';

    if (!recentMods.empty) {
      html += `<div style="margin-bottom:16px;">
        <h4 style="color:#f59e0b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">⏳ Pending Mods</h4>`;
      recentMods.forEach(d => {
        const m = d.data();
        html += `<div style="background:rgba(245,158,11,.05);border-left:3px solid #f59e0b;padding:10px 14px;border-radius:4px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#fff;font-size:13px;">${m.title || m.modTitle || d.id}</span>
          <a href="admin.html" style="color:#f59e0b;font-size:11px;font-weight:bold;text-decoration:none;">Review →</a>
        </div>`;
      });
      html += '</div>';
    }

    if (!recentDl.empty) {
      html += `<div style="margin-bottom:16px;">
        <h4 style="color:#10b981;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">⬇️ Download Terbaru</h4>`;
      recentDl.forEach(d => {
        const dl = d.data();
        const time = dl.createdAt?.toDate ? dl.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja';
        html += `<div style="background:rgba(16,185,129,.05);border-left:3px solid #10b981;padding:10px 14px;border-radius:4px;margin-bottom:6px;display:flex;justify-content:space-between;">
          <span style="color:#94a3b8;font-size:12px;">⬇️ ${dl.modTitle || dl.modId}</span>
          <span style="color:#475569;font-size:11px;">${time}</span>
        </div>`;
      });
      html += '</div>';
    }

    if (!recentComm.empty) {
      html += `<div>
        <h4 style="color:#6366f1;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 10px;">💬 Komentar Terbaru</h4>`;
      recentComm.forEach(d => {
        const c = d.data();
        const time = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja';
        html += `<div style="background:rgba(99,102,241,.05);border-left:3px solid #6366f1;padding:10px 14px;border-radius:4px;margin-bottom:6px;display:flex;justify-content:space-between;">
          <span style="color:#94a3b8;font-size:12px;">@${c.username}: ${c.text?.substring(0, 50)}${c.text?.length > 50 ? '...' : ''}</span>
          <span style="color:#475569;font-size:11px;">${time}</span>
        </div>`;
      });
      html += '</div>';
    }

    container.innerHTML = html || '<div style="color:#64748b;font-size:13px;">Belum ada aktivitas terbaru.</div>';
  } catch (err) {
    console.warn('Recent activity error:', err.message);
    container.innerHTML = '<div style="color:#64748b;font-size:13px;">Tidak dapat memuat aktivitas.</div>';
  }
}

// ─── INJECT OWNER ACTIVITY SECTION ───────────────────
function injectOwnerSection() {
  const isDashboard = window.location.pathname.includes('dashboard.html');
  if (!isDashboard || !isOwnerOrAdmin) return;

  const main = document.querySelector('.analytics-panel');
  if (main && !document.getElementById('_ownerActivity')) {
    const section = document.createElement('div');
    section.style.cssText = 'background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:22px;margin-top:24px;';
    section.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <h2 style="font-family:'Orbitron',sans-serif;font-size:15px;color:#fff;margin:0;">🚀 AKTIVITAS REALTIME</h2>
        <a href="admin.html" style="background:rgba(255,0,60,.1);color:#ff003c;border:1px solid rgba(255,0,60,.2);
          padding:7px 16px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;">
          🛡️ Admin Panel →
        </a>
      </div>
      <div id="_ownerActivity"><div style="color:#64748b;">Memuat...</div></div>
    `;
    main.after(section);
  }
}

// ─── AUTH STATE ───────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  isOwnerOrAdmin = await checkRole(user.uid);

  if (window.location.pathname.includes('dashboard.html')) {
    await loadOwnerStats();

    if (isOwnerOrAdmin) {
      injectOwnerSection();
      setTimeout(renderRecentActivity, 500);
    }
  }
});

export { loadOwnerStats };
