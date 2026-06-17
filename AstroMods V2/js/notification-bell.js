// =====================================================
// ASTROMODS NOTIFICATION BELL - Injector
// Tambahkan ke header semua halaman yang sudah ada
// =====================================================

import {
  auth, db, onAuthStateChanged,
  collection, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, onSnapshot
} from './firebase-init.js';

// ─── INJECT BELL KE NAVBAR ───────────────────────────
function injectNotificationBell() {
  // Cari profileSection atau header right
  const profileSection = document.getElementById('profileSection');
  if (!profileSection || document.getElementById('_bellContainer')) return;

  const bellHTML = `
    <div id="_bellContainer" class="bell-notification-container" style="position:relative;display:inline-block;">
      <button id="_bellBtn" class="bell-notification-btn" onclick="toggleNotifDropdown()"
        style="background:transparent;border:1px solid rgba(255,255,255,.08);color:#94a3b8;
        width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:18px;
        display:flex;align-items:center;justify-content:center;transition:.2s;position:relative;"
        onmouseover="this.style.borderColor='rgba(255,0,60,.3)';this.style.color='#fff'"
        onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.color='#94a3b8'">
        🔔
        <span id="_notifBadge" style="display:none;position:absolute;top:-4px;right:-4px;
          background:#ff003c;color:#fff;font-size:9px;font-weight:bold;
          width:16px;height:16px;border-radius:50%;align-items:center;justify-content:center;
          font-family:'Space Grotesk',sans-serif;"></span>
      </button>
      <div id="_notifDropdown" style="display:none;position:absolute;right:0;top:calc(100% + 8px);
        width:320px;background:#0d0f1a;border:1px solid rgba(255,255,255,.08);
        border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.6);z-index:9999;overflow:hidden;">
        <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.05);
          display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:700;color:#fff;font-family:'Orbitron',sans-serif;">🔔 NOTIFIKASI</span>
          <button onclick="markAllNotifsRead()" style="background:transparent;border:none;
            color:#ff003c;font-size:11px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;">
            Tandai Semua Dibaca
          </button>
        </div>
        <div id="_notifList" style="max-height:340px;overflow-y:auto;">
          <div style="padding:30px;text-align:center;color:#64748b;font-size:13px;">Memuat notifikasi...</div>
        </div>
      </div>
    </div>
  `;

  // Sisipkan sebelum avatar
  profileSection.insertAdjacentHTML('afterbegin', bellHTML);

  // Close on outside click
  document.addEventListener('click', function (e) {
    const bell = document.getElementById('_bellContainer');
    if (bell && !bell.contains(e.target)) {
      const dd = document.getElementById('_notifDropdown');
      if (dd) dd.style.display = 'none';
    }
  });
}

window.toggleNotifDropdown = function () {
  const dd = document.getElementById('_notifDropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none';
  dd.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) loadNotifList();
};

async function loadNotifList() {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  const list = document.getElementById('_notifList');
  if (!list) return;

  try {
    const q = query(
      collection(db, 'notifications'),
      where('userUid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    const unread = snap.docs.filter(d => !d.data().read).length;

    const badge = document.getElementById('_notifBadge');
    if (badge) {
      badge.textContent = unread > 9 ? '9+' : (unread || '');
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    if (snap.empty) {
      list.innerHTML = '<div style="padding:30px;text-align:center;color:#64748b;font-size:13px;">🔔 Belum ada notifikasi</div>';
      return;
    }

    list.innerHTML = snap.docs.map(d => {
      const n = d.data();
      const time = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
      return `
        <div onclick="markNotifRead('${d.id}')" style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.03);cursor:pointer;
          background:${!n.read ? 'rgba(255,0,60,.04)' : 'transparent'};transition:.15s;"
          onmouseover="this.style.background='rgba(255,255,255,.03)'"
          onmouseout="this.style.background='${!n.read ? 'rgba(255,0,60,.04)' : 'transparent'}'">
          <div style="display:flex;align-items:flex-start;gap:8px;">
            <div style="flex:1;">
              <div style="font-size:13px;color:#fff;font-weight:${!n.read ? '600' : '400'};margin-bottom:3px;">${n.title}</div>
              <div style="font-size:12px;color:#64748b;line-height:1.4;">${n.message}</div>
              <div style="font-size:10px;color:#475569;margin-top:4px;">${time}</div>
            </div>
            ${!n.read ? '<span style="width:6px;height:6px;border-radius:50%;background:#ff003c;flex-shrink:0;margin-top:5px;"></span>' : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn('Notif list error:', err.message);
    if (list) list.innerHTML = '<div style="padding:20px;color:#f87171;font-size:12px;">Gagal memuat notifikasi.</div>';
  }
}

window.markNotifRead = async function (notifId) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
    loadNotifList();
  } catch (err) { console.warn(err); }
};

window.markAllNotifsRead = async function () {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  try {
    const q = query(collection(db, 'notifications'), where('userUid', '==', uid), where('read', '==', false));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
    loadNotifList();
    if (typeof window.astroToast === 'function') window.astroToast('Semua notifikasi dibaca', '🔔', '#64748b');
  } catch (err) { console.warn(err); }
};

// ─── REALTIME BADGE UPDATE ────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  injectNotificationBell();
  const q = query(
    collection(db, 'notifications'),
    where('userUid', '==', user.uid),
    where('read', '==', false)
  );
  onSnapshot(q, (snap) => {
    const badge = document.getElementById('_notifBadge');
    if (!badge) return;
    const count = snap.size;
    badge.textContent = count > 9 ? '9+' : (count || '');
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
});

// Inject saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(injectNotificationBell, 800);
});
