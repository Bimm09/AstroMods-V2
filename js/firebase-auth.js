// =====================================================
// ASTROMODS FIREBASE AUTH - v3.0
// Sistem Authentication & Account Management Lengkap
// =====================================================

import {
  auth, db, googleProvider, getDiceBearAvatarUrl,
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  arrayUnion, arrayRemove, collection, getDocs,
  query, where, orderBy, limit, serverTimestamp, increment,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail,
  updatePassword, deleteUser, reauthenticateWithCredential,
  EmailAuthProvider, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence, browserSessionPersistence
} from './firebase-init.js';

// ─── STATE GLOBAL ─────────────────────────────────────
let currentUser = null;
let currentProfile = null;

// Path prefix untuk subpage
const isSubfolder = window.location.pathname.includes('/detail-mod-');
const ROOT = isSubfolder ? '../' : '';

console.log('🚀 AstroMods Auth System v3.0 loaded.');

// ─── DICEBEAR AVATAR ──────────────────────────────────
function getAvatar(uid, customUrl) {
  if (customUrl && customUrl !== '' && !customUrl.includes('i.imgur.com/8Km9tLL')) {
    return customUrl;
  }
  return getDiceBearAvatarUrl(uid);
}

// ─── TOAST NOTIFICATION ──────────────────────────────
window.astroToast = function (message, icon = '⚡', color = '#ff003c') {
  const old = document.getElementById('_astroToast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = '_astroToast';
  t.style.cssText = `
    position:fixed; bottom:28px; right:24px; z-index:99999;
    background:#0d0f1a; border-left:4px solid ${color};
    color:#fff; padding:14px 20px; border-radius:10px;
    box-shadow:0 8px 30px rgba(0,0,0,0.6); display:flex;
    align-items:center; gap:10px; font-family:'Space Grotesk',sans-serif;
    font-size:13px; max-width:340px; line-height:1.4;
    animation:slideInToast .3s cubic-bezier(.16,1,.3,1) forwards;
  `;
  if (!document.getElementById('_astroToastStyle')) {
    const s = document.createElement('style');
    s.id = '_astroToastStyle';
    s.textContent = `@keyframes slideInToast{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`;
    document.head.appendChild(s);
  }
  t.innerHTML = `<span style="font-size:18px">${icon}</span><span>${message}</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = '.3s ease';
    t.style.opacity = '0';
    t.style.transform = 'translateY(10px)';
    setTimeout(() => t.remove(), 350);
  }, 4000);
};

// ─── INJECT AUTH MODAL ────────────────────────────────
function injectAuthModal() {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  modal.innerHTML = `
    <div class="modal-box modern-auth-box" id="_authModalBox">
      <button class="close-modal-btn" onclick="closeLoginModal()">&times;</button>
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${ROOT}src/assets/images/logo.png" style="width:48px;height:48px;margin-bottom:8px;" onerror="this.src='https://i.imgur.com/8Km9tLL.png'">
        <h2 style="font-family:'Orbitron',sans-serif;font-size:15px;color:#fff;font-weight:800;letter-spacing:1.5px;margin:4px 0;text-shadow:0 0 8px rgba(255,0,60,.4);">ASTROMODS ACCESS PORTAL</h2>
        <p style="font-size:11px;color:#64748b;">Initialize connection to cloud gaming database</p>
      </div>
      <div class="auth-tabs-row">
        <button type="button" class="auth-tab-btn active" id="_tabSignIn" onclick="authSwitchTab('signin')">SIGN IN</button>
        <button type="button" class="auth-tab-btn" id="_tabSignUp" onclick="authSwitchTab('signup')">SIGN UP</button>
      </div>
      <div id="_authAlert" style="display:none;padding:10px 14px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:8px;color:#f87171;font-size:12.5px;margin-bottom:14px;"></div>
      
      <!-- SIGN IN FORM -->
      <form id="_formSignIn" onsubmit="authEmailSignIn(event)">
        <div class="auth-input-wrapper"><span class="auth-icon-badge">📧</span>
          <input type="email" id="_siEmail" placeholder="Email Address" required autocomplete="email">
        </div>
        <div class="auth-input-wrapper"><span class="auth-icon-badge">🔑</span>
          <input type="password" id="_siPass" placeholder="Password" required autocomplete="current-password">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;font-size:12px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#94a3b8;">
            <input type="checkbox" id="_rememberMe" style="accent-color:#ff003c;cursor:pointer;">
            <span>Remember Me</span>
          </label>
          <button type="button" onclick="authForgotPassword()" style="background:transparent;border:none;color:#ff003c;font-weight:600;cursor:pointer;font-family:inherit;font-size:12px;">Forgot Password?</button>
        </div>
        <button type="submit" class="auth-submit-btn" id="_siBtn">ESTABLISH CONNECTION</button>
      </form>
      
      <!-- SIGN UP FORM -->
      <form id="_formSignUp" style="display:none;" onsubmit="authEmailSignUp(event)">
        <div class="auth-input-wrapper"><span class="auth-icon-badge">👤</span>
          <input type="text" id="_suUser" placeholder="Username (min 3 karakter)" required autocomplete="username">
        </div>
        <div class="auth-input-wrapper"><span class="auth-icon-badge">📧</span>
          <input type="email" id="_suEmail" placeholder="Email Address" required autocomplete="email">
        </div>
        <div class="auth-input-wrapper"><span class="auth-icon-badge">🔑</span>
          <input type="password" id="_suPass" placeholder="Password (min 8 karakter)" required autocomplete="new-password">
        </div>
        <button type="submit" class="auth-submit-btn register-action-btn" id="_suBtn">CREATE SECURE ACCOUNT</button>
      </form>
      
      <div class="modal-divider" style="margin:16px 0;"><span>OR CONTINUE WITH</span></div>
      <button onclick="authGoogleLogin()" style="width:100%;background:#141724;border:1px solid rgba(255,255,255,.08);color:#fff;padding:11px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;font-size:13px;transition:.2s;font-family:'Space Grotesk',sans-serif;" onmouseover="this.style.background='#1d2133'" onmouseout="this.style.background='#141724'">
        <img src="https://www.google.com/favicon.ico" style="width:16px;height:16px;">
        Google Secure Authentication
      </button>
      <p style="text-align:center;font-size:10px;color:#64748b;margin-top:16px;">Dengan melanjutkan, kamu menyetujui Syarat & Kebijakan Privasi AstroMods.</p>
    </div>
  `;

  // Load saved email
  const saved = localStorage.getItem('_astro_rem');
  if (saved) {
    setTimeout(() => {
      const el = document.getElementById('_siEmail');
      const cb = document.getElementById('_rememberMe');
      if (el) el.value = saved;
      if (cb) cb.checked = true;
    }, 100);
  }
}

// ─── AUTH MODAL STYLE INJECTION ───────────────────────
function injectAuthStyles() {
  if (document.getElementById('_authStyles')) return;
  const s = document.createElement('style');
  s.id = '_authStyles';
  s.textContent = `
    .modern-auth-box{background:rgba(10,12,18,.97)!important;border:2px solid rgba(255,0,60,.35)!important;border-radius:16px!important;box-shadow:0 0 40px rgba(255,0,60,.18)!important;padding:28px!important;max-width:440px!important;width:94%!important;}
    .auth-tabs-row{display:flex;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:20px;}
    .auth-tab-btn{flex:1;background:transparent;border:none;color:#64748b;font-weight:bold;font-size:12.5px;padding:10px 5px;cursor:pointer;position:relative;transition:.2s;font-family:'Orbitron',sans-serif;}
    .auth-tab-btn.active{color:#ff003c;}
    .auth-tab-btn.active::after{content:'';position:absolute;bottom:-1px;left:0;width:100%;height:2px;background:#ff003c;box-shadow:0 0 8px #ff003c;}
    .auth-input-wrapper{position:relative;margin-bottom:14px;}
    .auth-icon-badge{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:13px;opacity:.5;}
    .auth-input-wrapper input{width:100%!important;padding:11px 14px 11px 40px!important;background:#0f111a!important;border:1px solid rgba(255,255,255,.08)!important;color:#fff!important;border-radius:8px!important;font-size:13.5px!important;transition:.25s!important;box-sizing:border-box!important;}
    .auth-input-wrapper input:focus{outline:none!important;border-color:#ff003c!important;box-shadow:0 0 10px rgba(255,0,60,.25)!important;}
    .auth-submit-btn{width:100%;background:linear-gradient(135deg,#ff003c,#b30026)!important;color:#fff!important;font-family:'Orbitron',sans-serif!important;font-weight:bold!important;letter-spacing:.8px!important;font-size:12px!important;padding:12px!important;border:none!important;border-radius:8px!important;cursor:pointer!important;transition:.25s!important;box-shadow:0 4px 14px rgba(255,0,60,.3)!important;}
    .auth-submit-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,0,60,.55)!important;}
    .register-action-btn{background:linear-gradient(135deg,#10b981,#065f46)!important;box-shadow:0 4px 14px rgba(16,185,129,.3)!important;}
    .register-action-btn:hover{box-shadow:0 4px 20px rgba(16,185,129,.55)!important;}
    .auth-submit-btn:disabled{opacity:.6;cursor:not-allowed!important;transform:none!important;}
    
    /* Edit Profile Modal */
    #_editProfileModal{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;}
    ._editBox{background:#0d0f1a;border:2px solid rgba(255,0,60,.3);border-radius:16px;padding:28px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;}
    ._editBox h3{font-family:'Orbitron',sans-serif;color:#fff;font-size:16px;font-weight:800;margin-bottom:20px;}
    ._editFormGroup{margin-bottom:16px;}
    ._editFormGroup label{display:block;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
    ._editFormGroup input,._editFormGroup textarea{width:100%;padding:11px 14px;background:#0f111a;border:1px solid rgba(255,255,255,.08);color:#fff;border-radius:8px;font-size:13px;font-family:'Space Grotesk',sans-serif;box-sizing:border-box;resize:none;}
    ._editFormGroup input:focus,._editFormGroup textarea:focus{outline:none;border-color:#ff003c;box-shadow:0 0 10px rgba(255,0,60,.2);}
    ._avatarPreviewRow{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
    ._avatarPreviewImg{width:72px;height:72px;border-radius:50%;border:3px solid rgba(255,0,60,.4);object-fit:cover;}
    ._editSaveBtn{width:100%;padding:12px;background:linear-gradient(135deg,#ff003c,#b30026);color:#fff;border:none;border-radius:8px;font-family:'Orbitron',sans-serif;font-weight:800;font-size:12px;cursor:pointer;transition:.2s;}
    ._editSaveBtn:hover{opacity:.9;transform:translateY(-1px);}
    ._editCancelBtn{width:100%;padding:11px;background:transparent;color:#64748b;border:1px solid rgba(255,255,255,.08);border-radius:8px;font-size:12px;cursor:pointer;margin-top:8px;font-family:inherit;}

    /* Dashboard Page */
    .astro-dashboard-wrap{max-width:1100px;margin:90px auto 60px;padding:0 20px;}
    .astro-dash-header{background:linear-gradient(135deg,#0d0f1a,#141724);border:1px solid rgba(255,0,60,.2);border-radius:16px;padding:28px;display:flex;align-items:center;gap:24px;margin-bottom:28px;}
    .astro-dash-avatar{width:80px;height:80px;border-radius:50%;border:3px solid #ff003c;box-shadow:0 0 20px rgba(255,0,60,.3);}
    .astro-dash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:28px;}
    .astro-dash-card{background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px;text-align:center;}
    .astro-dash-card h2{font-size:28px;font-weight:800;color:#fff;margin:0 0 4px;}
    .astro-dash-card p{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin:0;}
    
    /* Comment Section */
    .astro-comment-form{background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px;margin-bottom:20px;}
    .astro-comment-input{width:100%;padding:10px 14px;background:#0a0b0f;border:1px solid rgba(255,255,255,.08);color:#fff;border-radius:8px;font-size:13px;font-family:'Space Grotesk',sans-serif;resize:none;box-sizing:border-box;}
    .astro-comment-input:focus{outline:none;border-color:#ff003c;}
    .astro-comment-submit{margin-top:10px;padding:9px 20px;background:#ff003c;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;}
    .astro-comment-card{background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px;margin-bottom:12px;}
    .astro-comment-header{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
    .astro-comment-avatar{width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,0,60,.3);}
    .astro-like-btn{background:transparent;border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;transition:.2s;}
    .astro-like-btn:hover,.astro-like-btn.liked{border-color:#ff003c;color:#ff003c;background:rgba(255,0,60,.1);}

    /* Notification badge */
    ._notifBadge{position:absolute;top:-4px;right:-4px;background:#ff003c;color:#fff;font-size:9px;font-weight:800;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;}
  `;
  document.head.appendChild(s);
}

// ─── TAB SWITCH ───────────────────────────────────────
window.authSwitchTab = function (tab) {
  const fi = document.getElementById('_formSignIn');
  const fu = document.getElementById('_formSignUp');
  const ti = document.getElementById('_tabSignIn');
  const tu = document.getElementById('_tabSignUp');
  const alert = document.getElementById('_authAlert');
  if (alert) alert.style.display = 'none';
  if (tab === 'signin') {
    if (fi) fi.style.display = 'block';
    if (fu) fu.style.display = 'none';
    if (ti) ti.classList.add('active');
    if (tu) tu.classList.remove('active');
  } else {
    if (fi) fi.style.display = 'none';
    if (fu) fu.style.display = 'block';
    if (ti) ti.classList.remove('active');
    if (tu) tu.classList.add('active');
  }
};

function showAuthAlert(msg) {
  const a = document.getElementById('_authAlert');
  if (!a) return;
  a.style.display = 'block';
  a.innerHTML = `❌ ${msg}`;
}

// ─── GOOGLE LOGIN ─────────────────────────────────────
window.authGoogleLogin = async function () {
  const a = document.getElementById('_authAlert');
  if (a) a.style.display = 'none';
  try {
    const creds = await signInWithPopup(auth, googleProvider);
    await setupOrLoadProfile(creds.user);
    astroToast(`Selamat datang, ${creds.user.displayName || 'Player'}! 🌌`, '🌌', '#10b981');
    if (typeof closeLoginModal === 'function') closeLoginModal();
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    console.error('Google login error:', err);
    if (err.code !== 'auth/popup-closed-by-user') {
      showAuthAlert(err.message || 'Google login gagal');
    }
  }
};

// ─── EMAIL SIGN IN ────────────────────────────────────
window.authEmailSignIn = async function (e) {
  e.preventDefault();
  const email = document.getElementById('_siEmail')?.value.trim();
  const pass = document.getElementById('_siPass')?.value;
  const remember = document.getElementById('_rememberMe')?.checked;
  const btn = document.getElementById('_siBtn');

  if (!email || !email.includes('@')) return showAuthAlert('Format email tidak valid.');
  if (!pass || pass.length < 8) return showAuthAlert('Password minimal 8 karakter.');

  if (btn) { btn.disabled = true; btn.textContent = 'MEMPROSES...'; }

  try {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    const creds = await signInWithEmailAndPassword(auth, email, pass);
    if (remember) localStorage.setItem('_astro_rem', email);
    else localStorage.removeItem('_astro_rem');
    await setupOrLoadProfile(creds.user);
    astroToast('Akses diberikan. Selamat datang kembali! 🔑', '🔑', '#10b981');
    if (typeof closeLoginModal === 'function') closeLoginModal();
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    console.error('Sign in error:', err);
    const msg = err.code === 'auth/user-not-found' ? 'Akun tidak ditemukan.'
      : err.code === 'auth/wrong-password' ? 'Password salah.'
        : err.code === 'auth/invalid-credential' ? 'Email atau password tidak valid.'
          : err.message;
    showAuthAlert(msg);
    if (btn) { btn.disabled = false; btn.textContent = 'ESTABLISH CONNECTION'; }
  }
};

// ─── EMAIL SIGN UP ────────────────────────────────────
window.authEmailSignUp = async function (e) {
  e.preventDefault();
  const username = document.getElementById('_suUser')?.value.trim();
  const email = document.getElementById('_suEmail')?.value.trim();
  const pass = document.getElementById('_suPass')?.value;
  const btn = document.getElementById('_suBtn');

  if (!username || username.length < 3) return showAuthAlert('Username minimal 3 karakter.');
  if (!email || !email.includes('@')) return showAuthAlert('Format email tidak valid.');
  if (!pass || pass.length < 8) return showAuthAlert('Password minimal 8 karakter.');

  if (btn) { btn.disabled = true; btn.textContent = 'MEMBUAT AKUN...'; }

  try {
    const creds = await createUserWithEmailAndPassword(auth, email, pass);
    await createNewUserProfile(creds.user, username);
    astroToast('Akun berhasil dibuat! 🎮', '🎮', '#10b981');
    if (typeof closeLoginModal === 'function') closeLoginModal();
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    console.error('Sign up error:', err);
    const msg = err.code === 'auth/email-already-in-use' ? 'Email sudah digunakan. Silahkan Sign In.'
      : err.message;
    showAuthAlert(msg);
    if (btn) { btn.disabled = false; btn.textContent = 'CREATE SECURE ACCOUNT'; }
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────
window.authForgotPassword = async function () {
  const email = document.getElementById('_siEmail')?.value.trim();
  if (!email || !email.includes('@')) {
    alert('Masukkan email kamu dulu di kolom email, lalu klik Forgot Password.');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    astroToast(`Link reset password dikirim ke ${email}`, '📧', '#10b981');
  } catch (err) {
    alert(`Gagal mengirim reset: ${err.message}`);
  }
};

// ─── LOGOUT ───────────────────────────────────────────
window.logoutUser = async function () {
  if (!confirm('Yakin ingin Sign Out?')) return;
  try {
    await signOut(auth);
  } catch (e) { console.warn(e); }
  clearLocalSession();
  astroToast('Berhasil Sign Out.', '🚪', '#ef4444');
  setTimeout(() => { window.location.href = ROOT + 'index.html'; }, 900);
};

// ─── CREATE PROFILE (NEW USER) ────────────────────────
async function createNewUserProfile(user, username) {
  const uid = user.uid;
  const avatarUrl = getDiceBearAvatarUrl(uid);
  const profile = {
    uid,
    username: username || user.displayName || user.email.split('@')[0],
    email: user.email,
    bio: 'Passionate gamer & mod enthusiast di AstroMods. 🎮',
    avatarUrl,
    joinDate: new Date().toISOString(),
    joinDateFormatted: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
    vipStatus: false,
    bookmarkCount: 0,
    modCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, 'users', uid), profile);
  currentProfile = profile;
  saveLocalSession(uid, profile);
  return profile;
}

// ─── SETUP OR LOAD PROFILE (EXISTING USER) ────────────
async function setupOrLoadProfile(user) {
  const uid = user.uid;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      currentProfile = snap.data();
      // Pastikan avatarUrl menggunakan DiceBear jika tidak ada custom
      if (currentProfile.role === "owner") {

        document.getElementById("ownerBadge")?.style.setProperty("display", "inline-block");

        document.getElementById("ownerPanelBtn")?.style.setProperty("display", "block");

        document.getElementById("ownerStats")?.style.setProperty("display", "block");
      }

      if (currentProfile.role === "owner") {
        console.log("👑 OWNER LOGIN");

        document.body.classList.add("owner-mode");
      }

      if (currentProfile.role === "admin") {
        console.log("🛡️ ADMIN LOGIN");

        document.body.classList.add("admin-mode");
      }
      if (!currentProfile.avatarUrl || currentProfile.avatarUrl.includes('i.imgur.com/8Km9tLL')) {
        currentProfile.avatarUrl = getDiceBearAvatarUrl(uid);
        await updateDoc(doc(db, 'users', uid), { avatarUrl: currentProfile.avatarUrl });
      }
      saveLocalSession(uid, currentProfile);
    } else {
      // User baru via Google, buat profil
      const username = user.displayName || user.email.split('@')[0];
      await createNewUserProfile(user, username);
    }
  } catch (err) {
    console.warn('Firestore offline, using local cache:', err);
    loadLocalSession(uid, user);
  }
}

// ─── LOCAL SESSION MANAGEMENT ─────────────────────────
function saveLocalSession(uid, profile) {
  localStorage.setItem('_astro_loggedIn', '1');
  localStorage.setItem('_astro_uid', uid);
  localStorage.setItem('_astro_username', profile.username || '');
  localStorage.setItem('_astro_email', profile.email || '');
  localStorage.setItem('_astro_avatar', profile.avatarUrl || getDiceBearAvatarUrl(uid));
  localStorage.setItem('_astro_vip', profile.vipStatus ? '1' : '0');
  localStorage.setItem('_astro_profile', JSON.stringify(profile));
  // Legacy compat
  localStorage.setItem('astroUserLoggedIn', 'true');
  localStorage.setItem('astroUsername', profile.username || '');
  localStorage.setItem('astroAvatar', profile.avatarUrl || getDiceBearAvatarUrl(uid));
  localStorage.setItem('astro_vip_status', profile.vipStatus ? 'true' : 'false');
  localStorage.setItem('astro_user_id', uid);
}

function loadLocalSession(uid, user) {
  const raw = localStorage.getItem('_astro_profile');
  if (raw) {
    try { currentProfile = JSON.parse(raw); return; } catch (e) { }
  }
  currentProfile = {
    uid,
    username: localStorage.getItem('_astro_username') || user?.displayName || 'Player',
    email: localStorage.getItem('_astro_email') || user?.email || '',
    avatarUrl: getDiceBearAvatarUrl(uid),
    vipStatus: localStorage.getItem('_astro_vip') === '1',
    joinDateFormatted: 'Tidak diketahui'
  };
}

function clearLocalSession() {
  const keys = ['_astro_loggedIn', '_astro_uid', '_astro_username', '_astro_email', '_astro_avatar', '_astro_vip', '_astro_profile',
    'astroUserLoggedIn', 'astroUsername', 'astroAvatar', 'astro_vip_status', 'astro_user_id', 'astroEmail'];
  keys.forEach(k => localStorage.removeItem(k));
}

// ─── SYNC HEADER NAVBAR ───────────────────────────────
function syncNavbar() {
  const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1';
  const username = localStorage.getItem('_astro_username') || 'Player';
  const isVip = localStorage.getItem('_astro_vip') === '1';
  const avatarUrl = localStorage.getItem('_astro_avatar') || getDiceBearAvatarUrl(localStorage.getItem('_astro_uid') || 'guest');

  document.querySelectorAll('#guestButtons').forEach(el => {
    if (isLoggedIn) {
      el.style.display = 'none';
    } else {
      el.style.display = 'flex';
      el.innerHTML = `
        <button class="login" onclick="openLoginModal()" style="font-family:'Orbitron',sans-serif;">Sign In</button>
        <button class="register" onclick="openLoginModalSignUp()" style="font-family:'Orbitron',sans-serif;">Sign Up</button>
      `;
    }
  });

  document.querySelectorAll('#profileSection').forEach(section => {
    if (!isLoggedIn) { section.style.display = 'none'; return; }
    section.style.display = 'flex';

    const pAvatar = section.querySelector('.profile-avatar-trigger');
    if (pAvatar) {
      pAvatar.src = avatarUrl;
      pAvatar.onerror = () => { pAvatar.src = getDiceBearAvatarUrl(localStorage.getItem('_astro_uid') || 'guest'); };
    }

    const dropdown = section.querySelector('#profileDropdown');
    if (dropdown) {
      dropdown.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.05);">
          <img src="${avatarUrl}" style="width:42px;height:42px;border-radius:50%;border:2px solid ${isVip ? '#ffaa00' : '#10b981'};object-fit:cover;" onerror="this.src='${getDiceBearAvatarUrl(localStorage.getItem('_astro_uid') || 'guest')}'">
          <div>
            <div style="font-size:14px;font-weight:700;color:#fff;font-family:'Space Grotesk',sans-serif;">${username}</div>
            <div style="font-size:9px;font-weight:800;color:${isVip ? '#ffaa00' : '#8a9ab0'};text-transform:uppercase;letter-spacing:.5px;">${isVip ? '👑 ELITE VIP' : '🛡️ BASIC CREATOR'}</div>
          </div>
        </div>
        <a href="${ROOT}profile.html" class="dropdown-item"><span class="dropdown-ii">👤</span><span class="dropdown-it">Profile</span></a>
        <a href="${ROOT}dashboard.html" class="dropdown-item"><span class="dropdown-ii">📊</span><span class="dropdown-it">Dashboard</span></a>
        <a href="${ROOT}bookmarks.html" class="dropdown-item"><span class="dropdown-ii">🔖</span><span class="dropdown-it">Bookmarks</span></a>
        <a href="${ROOT}profile.html#profileCreationsListGrid" class="dropdown-item"><span class="dropdown-ii">📁</span><span class="dropdown-it">My Mods</span></a>
        <button class="dropdown-item" onclick="openVipUpgradesModal()" style="color:#ffaa00;font-weight:800;border:none;background:transparent;font-family:inherit;cursor:pointer;width:100%;text-align:left;"><span class="dropdown-ii">⚡</span><span class="dropdown-it">VIP Member</span></button>
        <a href="${ROOT}settings.html" class="dropdown-item"><span class="dropdown-ii">⚙️</span><span class="dropdown-it">Settings</span></a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" onclick="logoutUser()" style="border:none;background:transparent;font-family:inherit;cursor:pointer;width:100%;text-align:left;"><span class="dropdown-ii">🚪</span><span class="dropdown-it">Sign Out</span></button>
      `;
    }
  });
}

// ─── OPEN LOGIN MODAL (SIGN UP TAB) ──────────────────
window.openLoginModalSignUp = function () {
  if (typeof openLoginModal === 'function') openLoginModal();
  setTimeout(() => authSwitchTab('signup'), 100);
};

// ─── BOOKMARK SYSTEM ──────────────────────────────────
window.toggleBookmark = async function (modId, modData) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) {
    if (typeof openLoginModal === 'function') openLoginModal();
    return;
  }
  try {
    const bRef = doc(db, 'bookmarks', `${uid}_${modId}`);
    const snap = await getDoc(bRef);
    if (snap.exists()) {
      await deleteDoc(bRef);
      // Kurangi counter
      await updateDoc(doc(db, 'users', uid), { bookmarkCount: -1 }).catch(() => { });
      astroToast('Bookmark dihapus', '🗑️', '#ef4444');
      return false;
    } else {
      await setDoc(bRef, {
        uid, modId,
        modTitle: modData?.title || '',
        modImg: modData?.img || '',
        modGame: modData?.game || '',
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'users', uid), { bookmarkCount: 1 }).catch(() => { });
      astroToast('Mod di-bookmark! 🔖', '🔖', '#10b981');
      return true;
    }
  } catch (err) {
    console.error('Bookmark error:', err);
    // Fallback localStorage
    const key = `_bm_${uid}`;
    let bms = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = bms.indexOf(modId);
    if (idx > -1) { bms.splice(idx, 1); astroToast('Bookmark dihapus (lokal)', '🗑️', '#ef4444'); }
    else { bms.push(modId); astroToast('Mod di-bookmark! (lokal) 🔖', '🔖', '#10b981'); }
    localStorage.setItem(key, JSON.stringify(bms));
  }
};

window.isBookmarked = async function (modId) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return false;
  try {
    const snap = await getDoc(doc(db, 'bookmarks', `${uid}_${modId}`));
    return snap.exists();
  } catch (e) {
    const bms = JSON.parse(localStorage.getItem(`_bm_${uid}`) || '[]');
    return bms.includes(modId);
  }
};

// ─── COMMENT SYSTEM ───────────────────────────────────
window.submitComment = async function (modId, text) {
  const uid = localStorage.getItem('_astro_uid');
  const username = localStorage.getItem('_astro_username') || 'Player';
  const avatarUrl = localStorage.getItem('_astro_avatar') || getDiceBearAvatarUrl(uid);
  if (!uid) { if (typeof openLoginModal === 'function') openLoginModal(); return; }
  if (!text || text.trim().length < 2) { astroToast('Komentar terlalu pendek', '⚠️', '#f59e0b'); return; }
  try {
    await addDoc(collection(db, 'comments'), {
      modId, uid, username, avatarUrl,
      text: text.trim(),
      likes: 0,
      likedBy: [],
      createdAt: serverTimestamp()
    });
    astroToast('Komentar dikirim! 💬', '💬', '#10b981');
    if (typeof loadComments === 'function') loadComments(modId);
  } catch (err) {
    console.error('Comment error:', err);
    astroToast('Gagal mengirim komentar', '❌', '#ef4444');
  }
};

window.likeComment = async function (commentId) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) { if (typeof openLoginModal === 'function') openLoginModal(); return; }
  try {
    const ref = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const liked = (data.likedBy || []).includes(uid);
    if (liked) {
      await updateDoc(ref, { likes: Math.max(0, (data.likes || 0) - 1), likedBy: arrayRemove(uid) });
    } else {
      await updateDoc(ref, { likes: (data.likes || 0) + 1, likedBy: arrayUnion(uid) });
    }
    if (typeof loadComments === 'function') loadComments(data.modId);
  } catch (err) { console.error(err); }
};

window.loadComments = async function (modId) {
  const container = document.getElementById('_commentsContainer');
  if (!container) return;
  try {
    const q = query(collection(db, 'comments'), where('modId', '==', modId), orderBy('createdAt', 'desc'), limit(30));
    const snaps = await getDocs(q);
    const uid = localStorage.getItem('_astro_uid') || '';
    container.innerHTML = '';
    if (snaps.empty) {
      container.innerHTML = '<p style="color:#64748b;font-size:13px;text-align:center;padding:20px;">Belum ada komentar. Jadilah yang pertama!</p>';
      return;
    }
    snaps.forEach(snap => {
      const d = snap.data();
      const liked = (d.likedBy || []).includes(uid);
      const time = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja';
      container.innerHTML += `
        <div class="astro-comment-card">
          <div class="astro-comment-header">
            <img src="${d.avatarUrl || getDiceBearAvatarUrl(d.uid)}" class="astro-comment-avatar" onerror="this.src='${getDiceBearAvatarUrl(d.uid)}'">
            <div>
              <div style="font-weight:700;font-size:13px;color:#fff;">${d.username}</div>
              <div style="font-size:10px;color:#64748b;">${time}</div>
            </div>
          </div>
          <p style="font-size:13px;color:#cbd5e1;margin:0 0 10px;line-height:1.5;">${d.text}</p>
          <button class="astro-like-btn ${liked ? 'liked' : ''}" onclick="likeComment('${snap.id}')">
            ❤️ ${d.likes || 0}
          </button>
        </div>
      `;
    });
  } catch (err) {
    console.error('Load comments error:', err);
    container.innerHTML = '<p style="color:#64748b;text-align:center;padding:20px;">Gagal memuat komentar.</p>';
  }
};

// ─── NOTIFICATION SYSTEM ──────────────────────────────
async function loadNotifications() {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  try {
    const q = query(collection(db, 'notifications'), where('uid', '==', uid), where('read', '==', false), limit(10));
    const snaps = await getDocs(q);
    const count = snaps.size;
    // Update badge di navbar jika ada
    document.querySelectorAll('._notifCount').forEach(el => {
      el.textContent = count > 0 ? count.toString() : '';
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  } catch (e) { }
}

// ─── EDIT PROFILE MODAL ──────────────────────────────
window.openEditProfileModal = function () {
  if (document.getElementById('_editProfileModal')) return;
  const uid = localStorage.getItem('_astro_uid');
  const profile = currentProfile || {};
  const avatar = localStorage.getItem('_astro_avatar') || getDiceBearAvatarUrl(uid);

  const modal = document.createElement('div');
  modal.id = '_editProfileModal';
  modal.innerHTML = `
    <div class="_editBox">
      <h3>✏️ EDIT PROFILE</h3>
      <div id="_editAlert" style="display:none;color:#f87171;font-size:12px;margin-bottom:12px;"></div>
      
      <div class="_avatarPreviewRow">
        <img src="${avatar}" class="_avatarPreviewImg" id="_editAvatarPreview" onerror="this.src='${getDiceBearAvatarUrl(uid)}'">
        <div>
          <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Avatar menggunakan DiceBear otomatis</div>
          <label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;background:#141724;border:1px solid rgba(255,255,255,.1);padding:8px 14px;border-radius:8px;font-size:11px;color:#fff;">
            <span>🖼️ Upload Custom Avatar</span>
            <input type="file" id="_editAvatarFile" accept="image/*" style="display:none;" onchange="previewEditAvatar(event)">
          </label>
        </div>
      </div>
      
      <div class="_editFormGroup">
        <label>Username</label>
        <input type="text" id="_editUsername" value="${profile.username || ''}" placeholder="Username kamu">
      </div>
      <div class="_editFormGroup">
        <label>Bio</label>
        <textarea id="_editBio" rows="3" placeholder="Ceritakan tentang dirimu...">${profile.bio || ''}</textarea>
      </div>
      <div class="_editFormGroup" style="border-top:1px solid rgba(255,255,255,.06);padding-top:16px;margin-top:4px;">
        <label>Ganti Password (opsional)</label>
        <input type="password" id="_editNewPass" placeholder="Password baru (min 8 karakter)" style="margin-bottom:8px;">
      </div>
      
      <button class="_editSaveBtn" onclick="saveEditProfile()">💾 SIMPAN PERUBAHAN</button>
      <button class="_editCancelBtn" onclick="document.getElementById('_editProfileModal').remove()">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);
};

window.previewEditAvatar = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const preview = document.getElementById('_editAvatarPreview');
    if (preview) preview.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};

window.saveEditProfile = async function () {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  const username = document.getElementById('_editUsername')?.value.trim();
  const bio = document.getElementById('_editBio')?.value.trim();
  const newPass = document.getElementById('_editNewPass')?.value;
  const avatarFile = document.getElementById('_editAvatarFile')?.files[0];

  if (!username || username.length < 3) {
    document.getElementById('_editAlert').style.display = 'block';
    document.getElementById('_editAlert').textContent = 'Username minimal 3 karakter.';
    return;
  }

  let avatarUrl = localStorage.getItem('_astro_avatar') || getDiceBearAvatarUrl(uid);

  // Jika ada file avatar baru, convert ke base64
  if (avatarFile) {
    avatarUrl = await new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target.result);
      reader.readAsDataURL(avatarFile);
    });
  }

  try {
    const updates = { username, bio, avatarUrl, updatedAt: serverTimestamp() };
    await updateDoc(doc(db, 'users', uid), updates);

    // Update password jika diisi
    if (newPass && newPass.length >= 8 && auth.currentUser) {
      await updatePassword(auth.currentUser, newPass);
      astroToast('Password berhasil diperbarui', '🔒', '#10b981');
    }

    if (currentProfile) { currentProfile.username = username; currentProfile.bio = bio; currentProfile.avatarUrl = avatarUrl; }
    saveLocalSession(uid, { ...currentProfile, username, bio, avatarUrl });

    astroToast('Profil berhasil diperbarui! ✅', '✅', '#10b981');
    document.getElementById('_editProfileModal')?.remove();
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    console.error(err);
    // Fallback local
    if (currentProfile) { currentProfile.username = username; currentProfile.bio = bio; currentProfile.avatarUrl = avatarUrl; }
    saveLocalSession(uid, { ...(currentProfile || {}), username, bio, avatarUrl });
    astroToast('Profil disimpan secara lokal', '🔌', '#f59e0b');
    document.getElementById('_editProfileModal')?.remove();
    setTimeout(() => window.location.reload(), 800);
  }
};

// ─── VIP SYSTEM ───────────────────────────────────────
// ─── VIP MODAL STYLES ────────────────────────────────
function injectVipStyles() {
  if (document.getElementById('_vipStyles')) return;
  const s = document.createElement('style');
  s.id = '_vipStyles';
  s.textContent = `
    #_vipModal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
    ._vipBox{background:#0d0f1a;border:2px solid #d97706;border-radius:16px;width:100%;max-width:520px;overflow:hidden;position:relative;max-height:92vh;overflow-y:auto;}
    ._vipHead{background:linear-gradient(135deg,#1a1100 0%,#2a1800 100%);padding:22px 24px 18px;text-align:center;border-bottom:1px solid rgba(217,119,6,.3);}
    ._vipTitle{font-family:'Orbitron',sans-serif;font-size:18px;font-weight:800;color:#fbbf24;letter-spacing:1px;margin:8px 0 0;}
    ._vipPrice{font-size:26px;font-weight:800;color:#fff;margin:8px 0 4px;font-family:'Orbitron',sans-serif;}
    ._vipPriceSub{font-size:11px;color:#92400e;background:#451a03;padding:3px 8px;border-radius:12px;display:inline-block;}
    ._vipBody{padding:20px 22px;}
    ._vipSectionLabel{font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px;}
    ._vipBadgeRow{display:flex;align-items:center;gap:10px;background:#1a1200;border:1px solid rgba(217,119,6,.25);border-radius:8px;padding:10px 14px;margin-bottom:16px;}
    ._vipBadge{background:#d97706;color:#000;font-size:10px;font-weight:800;padding:3px 9px;border-radius:4px;font-family:'Orbitron',sans-serif;letter-spacing:.5px;}
    ._vipFeatGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px;}
    @media(max-width:480px){._vipFeatGrid{grid-template-columns:1fr;}}
    ._vipFeat{display:flex;align-items:flex-start;gap:8px;background:#111520;border:1px solid rgba(255,255,255,.05);border-radius:8px;padding:10px 12px;}
    ._vipFeatIcon{font-size:15px;flex-shrink:0;margin-top:1px;}
    ._vipFeatText{font-size:11.5px;color:#d6d3d1;line-height:1.4;}
    ._vipFeatText b{display:block;font-weight:700;color:#fff;font-size:12px;margin-bottom:2px;}
    ._payTabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;}
    ._payTab{padding:7px 14px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:transparent;font-size:12px;color:#94a3b8;cursor:pointer;transition:.15s;font-family:inherit;}
    ._payTab.active{background:#451a03;border-color:#d97706;color:#fbbf24;}
    ._payGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
    @media(max-width:420px){._payGrid{grid-template-columns:repeat(2,1fr);}}
    ._payItem{border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:10px 6px;text-align:center;cursor:pointer;transition:.15s;background:#111520;}
    ._payItem:hover{border-color:#d97706;background:#1a1200;}
    ._payItem.selected{border:2px solid #d97706;background:#1a1200;}
    ._payItemIcon{font-size:18px;display:block;margin-bottom:4px;}
    ._payItemName{font-size:10.5px;color:#d6d3d1;font-weight:600;}
    ._vipBuyBtn{width:100%;padding:14px;background:#d97706;color:#000;border:none;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;transition:.15s;font-family:'Orbitron',sans-serif;letter-spacing:.5px;margin-top:16px;}
    ._vipBuyBtn:hover{background:#b45309;transform:translateY(-1px);}
    ._vipDisclaimer{font-size:10px;color:#78716c;text-align:center;margin-top:10px;line-height:1.5;}
    ._vipClose{position:absolute;top:12px;right:14px;background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;z-index:10;line-height:1;}
    ._vipClose:hover{color:#fff;}
    ._vipSuccessView{padding:28px 22px;text-align:center;display:none;}
    ._vipSuccessIcon{font-size:48px;display:block;margin-bottom:14px;}
    ._instrBox{background:#0a120a;border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:16px;text-align:left;margin:16px 0;}
    ._instrStep{display:flex;gap:10px;margin-bottom:10px;font-size:12px;color:#d6d3d1;line-height:1.5;}
    ._instrStep:last-child{margin-bottom:0;}
    ._instrNum{background:#d97706;color:#000;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;margin-top:2px;}
    ._ctaBtns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;}
    ._ctaBtn{padding:10px 18px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:700;transition:.15s;font-family:inherit;}
    ._ctaDisc{background:#5865F2;color:#fff;}
    ._ctaDisc:hover{background:#4752c4;}
    ._ctaWa{background:#25D366;color:#000;}
    ._ctaWa:hover{background:#1da851;}
    ._backBtn{background:transparent;border:1px solid rgba(255,255,255,.1);color:#94a3b8;padding:9px 20px;border-radius:8px;cursor:pointer;font-size:12px;margin-top:8px;font-family:inherit;}
    ._backBtn:hover{background:rgba(255,255,255,.05);color:#fff;}
    ._vipAlreadyBadge{display:inline-flex;align-items:center;gap:6px;background:#1a2e1a;border:1px solid rgba(34,197,94,.3);color:#4ade80;font-size:12px;font-weight:700;padding:8px 16px;border-radius:8px;margin-top:12px;}
  `;
  document.head.appendChild(s);
}

window.openVipUpgradesModal = function () {
  injectVipStyles();
  const old = document.getElementById('_vipModal');
  if (old) old.remove();

  const isVip = localStorage.getItem('_astro_vip') === '1' || localStorage.getItem('astro_vip_status') === 'true';

  const m = document.createElement('div');
  m.id = '_vipModal';
  m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });

  m.innerHTML = `
    <div class="_vipBox" id="_vipBoxInner">
      <button class="_vipClose" onclick="document.getElementById('_vipModal').remove()">×</button>

      <!-- HEADER -->
      <div class="_vipHead">
        <div style="font-size:40px;">👑</div>
        <div class="_vipTitle">VIP BUDGET PELAJAR</div>
        <div class="_vipPrice">Rp20.000</div>
        <span class="_vipPriceSub">/ Lifetime Access — Bayar Sekali</span>
        <div style="font-size:11px;color:#78716c;margin-top:6px;">≈ $1.25 USD &bull; Akses selamanya</div>
      </div>

      <!-- MAIN VIEW -->
      <div class="_vipBody" id="_vipMainView">
        ${isVip ? `
          <div style="text-align:center;padding:20px 0;">
            <div style="font-size:36px;margin-bottom:10px;">✅</div>
            <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:6px;">Kamu sudah VIP!</div>
            <div style="font-size:13px;color:#64748b;margin-bottom:14px;">Semua fitur VIP sudah aktif di akunmu.</div>
            <div class="_vipAlreadyBadge">👑 VIP MEMBER AKTIF</div>
          </div>
        ` : `
          <div class="_vipBadgeRow">
            <span class="_vipBadge">👑 VIP</span>
            <span style="font-size:12px;color:#d6d3d1;">Badge eksklusif tampil di profil &amp; semua komentar</span>
          </div>

          <div class="_vipSectionLabel">Yang kamu dapatkan</div>
          <div class="_vipFeatGrid">
            <div class="_vipFeat"><span class="_vipFeatIcon">⚡</span><div class="_vipFeatText"><b>Download Langsung</b>Tanpa safelink, tanpa countdown, tanpa redirect iklan</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">🚫</span><div class="_vipFeatText"><b>Bebas Iklan</b>Semua iklan di website dihilangkan sepenuhnya</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">👑</span><div class="_vipFeatText"><b>Badge VIP</b>Tampil di profil, komentar, dan leaderboard</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">🎨</span><div class="_vipFeatText"><b>Tema Golden Emerald</b>Profil eksklusif tema emas premium</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">🏆</span><div class="_vipFeatText"><b>Prioritas Komentar</b>Komentarmu tampil paling atas</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">🔔</span><div class="_vipFeatText"><b>Early Access</b>Mod baru tersedia 24 jam sebelum publik</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">💬</span><div class="_vipFeatText"><b>Support Prioritas</b>Respons admin lebih cepat via Discord</div></div>
            <div class="_vipFeat"><span class="_vipFeatIcon">📦</span><div class="_vipFeatText"><b>Batch Download</b>Download beberapa mod sekaligus</div></div>
          </div>

          <div class="_vipSectionLabel" style="margin-top:4px;">Pilih metode pembayaran</div>
          <div class="_payTabs">
            <button class="_payTab active" onclick="_vipSwitchTab('id',this)" id="_vtID">🇮🇩 Indonesia</button>
            <button class="_payTab" onclick="_vipSwitchTab('intl',this)" id="_vtIntl">🌐 International</button>
          </div>

          <div id="_vipPayID" class="_payGrid">
            <div class="_payItem selected" onclick="_vipSelectPay(this,'Dana')"><span class="_payItemIcon">💙</span><span class="_payItemName">Dana</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'GoPay')"><span class="_payItemIcon">💚</span><span class="_payItemName">GoPay</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'OVO')"><span class="_payItemIcon">💜</span><span class="_payItemName">OVO</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'ShopeePay')"><span class="_payItemIcon">🛒</span><span class="_payItemName">ShopeePay</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'BCA')"><span class="_payItemIcon">🏦</span><span class="_payItemName">BCA</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'BRI')"><span class="_payItemIcon">🏦</span><span class="_payItemName">BRI</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'Mandiri')"><span class="_payItemIcon">🏦</span><span class="_payItemName">Mandiri</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'BNI')"><span class="_payItemIcon">🏦</span><span class="_payItemName">BNI</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'QRIS')"><span class="_payItemIcon">⬛</span><span class="_payItemName">QRIS</span></div>
          </div>
          <div id="_vipPayIntl" class="_payGrid" style="display:none;">
            <div class="_payItem" onclick="_vipSelectPay(this,'PayPal')"><span class="_payItemIcon">🅿️</span><span class="_payItemName">PayPal</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'Wise')"><span class="_payItemIcon">🔄</span><span class="_payItemName">Wise</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'Crypto')"><span class="_payItemIcon">₿</span><span class="_payItemName">Crypto</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'Payoneer')"><span class="_payItemIcon">💳</span><span class="_payItemName">Payoneer</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'Revolut')"><span class="_payItemIcon">🌀</span><span class="_payItemName">Revolut</span></div>
            <div class="_payItem" onclick="_vipSelectPay(this,'Skrill')"><span class="_payItemIcon">💰</span><span class="_payItemName">Skrill</span></div>
          </div>

          <button class="_vipBuyBtn" onclick="_vipStartPurchase()">👑 BELI VIP — Rp20.000</button>
          <div class="_vipDisclaimer">Harga final. Tidak ada biaya tersembunyi. VIP aktif setelah admin konfirmasi pembayaran (maks. 24 jam). Produk digital tidak dapat di-refund.</div>
        `}
      </div>

      <!-- SUCCESS VIEW -->
      <div class="_vipSuccessView" id="_vipSuccessView">
        <span class="_vipSuccessIcon">🎉</span>
        <div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;">Hampir selesai!</div>
        <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Selesaikan pembayaran via <strong id="_vipPayDisplay" style="color:#fbbf24;"></strong></div>
        <div style="font-size:12px;color:#64748b;margin-bottom:16px;">lalu kirim bukti ke admin AstroMods</div>
        <div class="_instrBox">
          <div class="_instrStep"><span class="_instrNum">1</span><span>Transfer <strong style="color:#fbbf24;">Rp20.000</strong> ke rekening/akun admin (akan dikirim saat kamu hubungi admin via Discord/WhatsApp)</span></div>
          <div class="_instrStep"><span class="_instrNum">2</span><span>Screenshot bukti pembayaran yang berhasil</span></div>
          <div class="_instrStep"><span class="_instrNum">3</span><span>Kirim screenshot + <strong style="color:#fbbf24;">username AstroMods</strong> kamu ke admin</span></div>
          <div class="_instrStep"><span class="_instrNum">4</span><span>Admin aktifkan VIP kamu dalam <strong style="color:#fbbf24;">kurang dari 24 jam</strong> 🚀</span></div>
        </div>
        <div class="_ctaBtns">
          <button class="_ctaBtn _ctaDisc" onclick="_vipContact('discord')">💬 Hubungi via Discord</button>
          <button class="_ctaBtn _ctaWa" onclick="_vipContact('wa')">📱 Hubungi via WhatsApp</button>
        </div>
        <button class="_backBtn" onclick="_vipBackToMain()">← Kembali</button>
      </div>

    </div>
  `;

  document.body.appendChild(m);

  // Init state
  window._vipSelectedPay = 'Dana';
};

// ─── VIP MODAL HELPERS ────────────────────────────────
window._vipSwitchTab = function (tab, el) {
  document.querySelectorAll('._payTab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const idGrid = document.getElementById('_vipPayID');
  const intlGrid = document.getElementById('_vipPayIntl');
  if (idGrid) idGrid.style.display = tab === 'id' ? 'grid' : 'none';
  if (intlGrid) intlGrid.style.display = tab === 'intl' ? 'grid' : 'none';
  window._vipSelectedPay = tab === 'id' ? 'Dana' : 'PayPal';
  document.querySelectorAll('._payItem').forEach(p => p.classList.remove('selected'));
  const activeGrid = tab === 'id' ? idGrid : intlGrid;
  if (activeGrid) {
    const first = activeGrid.querySelector('._payItem');
    if (first) first.classList.add('selected');
  }
};

window._vipSelectPay = function (el, method) {
  const grid = el.closest('._payGrid');
  if (grid) grid.querySelectorAll('._payItem').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  window._vipSelectedPay = method;
};

window._vipStartPurchase = function () {
  const displayEl = document.getElementById('_vipPayDisplay');
  if (displayEl) displayEl.textContent = window._vipSelectedPay || 'metode yang dipilih';
  const main = document.getElementById('_vipMainView');
  const success = document.getElementById('_vipSuccessView');
  if (main) main.style.display = 'none';
  if (success) success.style.display = 'block';
  // Scroll ke atas modal
  const box = document.getElementById('_vipBoxInner');
  if (box) box.scrollTop = 0;
};

window._vipBackToMain = function () {
  const main = document.getElementById('_vipMainView');
  const success = document.getElementById('_vipSuccessView');
  if (main) main.style.display = 'block';
  if (success) success.style.display = 'none';
};

window._vipContact = function (channel) {
  const method = window._vipSelectedPay || 'pilihan kamu';
  const username = localStorage.getItem('_astro_username') || localStorage.getItem('astroUsername') || 'User';
  const msg = `Halo admin AstroMods! 👋\n\nSaya ingin membeli VIP Budget Pelajar.\n\n📋 Detail:\n• Username: ${username}\n• Metode: ${method}\n• Harga: Rp20.000\n\nMohon konfirmasi rekening/nomor untuk transfer. Terima kasih!`;

  if (channel === 'discord') {
    astroToast('Buka Discord server AstroMods dan kirim pesan VIP ke admin!', '💬', '#5865F2');
    if (window.ASTROMODS_DISCORD_URL) {
      window.open(window.ASTROMODS_DISCORD_URL, '_blank');
    } else {
      astroToast('Link Discord belum dikonfigurasi. Hubungi admin secara langsung.', '⚠️', '#f59e0b');
    }
  } else {
    const encoded = encodeURIComponent(msg);
    const waUrl = window.ASTROMODS_WA_NUMBER
      ? `https://wa.me/${window.ASTROMODS_WA_NUMBER}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    astroToast('WhatsApp dibuka! Kirim pesan ke admin.', '📱', '#25D366');
  }
};

// Legacy compat
window.processVipPurchase = window._vipStartPurchase;

// ─── DOWNLOAD TRACKING ────────────────────────────────
window.trackDownload = async function (modId) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  try {
    await addDoc(collection(db, 'downloads'), {
      uid, modId, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'mods', modId), { downloadCount: increment(1) }).catch(() => { });
  } catch (e) { }
};

// ─── FOLLOW SYSTEM ────────────────────────────────────
window.toggleFollow = async function (targetUid) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid || uid === targetUid) return;
  try {
    const ref = doc(db, 'follows', `${uid}_${targetUid}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await deleteDoc(ref);
      astroToast('Unfollow berhasil', '👋', '#64748b');
      return false;
    } else {
      await setDoc(ref, { followerUid: uid, followingUid: targetUid, createdAt: serverTimestamp() });
      astroToast('Following! 🎯', '🎯', '#10b981');
      return true;
    }
  } catch (e) { console.error(e); }
};

// ─── PROFILE PAGE INIT ────────────────────────────────
async function initProfilePage() {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  const profile = currentProfile || JSON.parse(localStorage.getItem('_astro_profile') || '{}');

  // Set avatar
  const avatarImgs = document.querySelectorAll('#profileDashboardAvatar, .profile-avatar, ._profilePageAvatar');
  avatarImgs.forEach(img => {
    img.src = profile.avatarUrl || getDiceBearAvatarUrl(uid);
    img.onerror = () => { img.src = getDiceBearAvatarUrl(uid); };
  });

  // Set username
  document.querySelectorAll('#profileUsernameHeaderTitle, .profile-info h1, #dropdownUserText').forEach(el => {
    el.textContent = profile.username || 'Player';
  });

  // Set bio
  const bioEl = document.querySelector('.profile-info p');
  if (bioEl) bioEl.textContent = '⚡ ' + (profile.bio || 'Minecraft Creator & Mod Explorer');

  // VIP banner
  const banner = document.getElementById('profileDashboardBanner');
  if (banner && profile.vipStatus) {
    banner.classList.add('vip-elite-profile-canvas');
  }

  // Creator rank
  const rankEl = document.getElementById('profileCreatorRank');
  if (rankEl) {
    rankEl.textContent = profile.vipStatus ? 'VIP' : 'PRO';
    rankEl.style.color = profile.vipStatus ? '#ffaa00' : '#fff';
  }

  // Load bookmarks
  loadProfileBookmarks(uid);

  // Edit Profile button
  const editBtn = document.querySelector('.quick-actions button');
  if (editBtn) {
    editBtn.textContent = '✏️ Edit Profile';
    editBtn.onclick = () => openEditProfileModal();
  }
}

async function loadProfileBookmarks(uid) {
  const grid = document.getElementById('profileFavoritesListGrid');
  if (!grid) return;
  try {
    const q = query(collection(db, 'bookmarks'), where('uid', '==', uid), limit(20));
    const snaps = await getDocs(q);
    const count = snaps.size;
    const countEl = document.getElementById('profileFavoritesCount');
    if (countEl) countEl.textContent = count;

    if (count === 0) {
      grid.innerHTML = '<div style="text-align:center;color:#64748b;font-size:13px;padding:40px;grid-column:1/-1;">Belum ada mod yang di-bookmark.</div>';
      return;
    }

    grid.innerHTML = '';
    snaps.forEach(snap => {
      const d = snap.data();
      grid.innerHTML += `
        <div style="background:#131a22;border:1px solid #1e2630;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;">
          <img src="${d.modImg || ''}" style="height:130px;width:100%;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&h=200&fit=crop'">
          <div style="padding:14px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <span style="font-size:10px;background:#1e293b;color:#ffaa00;padding:3px 8px;border-radius:4px;text-transform:uppercase;font-weight:bold;">${d.modGame || 'Mod'}</span>
              <h3 style="font-size:14px;color:#fff;margin:8px 0;">${d.modTitle || 'Untitled Mod'}</h3>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.05);padding-top:10px;margin-top:8px;">
              <a href="${ROOT}detail-mod-minecraft-bedrock/detail-pokemon.html?mod=${d.modId}" style="color:#10b981;font-size:11px;font-weight:bold;">Buka →</a>
              <button onclick="removeBookmark('${snap.id}')" style="background:rgba(239,68,68,.15);color:#f87171;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:10px;">Hapus</button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Load bookmarks error:', err);
    // Fallback localStorage
    const bms = JSON.parse(localStorage.getItem(`_bm_${uid}`) || '[]');
    const countEl = document.getElementById('profileFavoritesCount');
    if (countEl) countEl.textContent = bms.length;
    if (bms.length === 0) {
      grid.innerHTML = '<div style="text-align:center;color:#64748b;font-size:13px;padding:40px;grid-column:1/-1;">Belum ada mod yang di-bookmark.</div>';
    }
  }
}

window.removeBookmark = async function (bookmarkDocId) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'bookmarks', bookmarkDocId));
    astroToast('Bookmark dihapus', '🗑️', '#ef4444');
    setTimeout(() => window.location.reload(), 700);
  } catch (e) {
    console.error(e);
  }
};

// ─── SETTINGS PAGE INIT ───────────────────────────────
async function initSettingsPage() {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) { window.location.href = ROOT + 'index.html'; return; }
  const profile = currentProfile || JSON.parse(localStorage.getItem('_astro_profile') || '{}');

  const usernameInput = document.getElementById('setting-username');
  const bioInput = document.getElementById('setting-bio');
  if (usernameInput) usernameInput.value = profile.username || '';
  if (bioInput) bioInput.value = profile.bio || '';

  // Wire save buttons
  document.querySelectorAll('.save-btn, [onclick="saveProfileSettingsChanges()"]').forEach(btn => {
    btn.removeAttribute('onclick');
    btn.addEventListener('click', saveSettingsForm);
  });

  // Inject security panel
  const pane = document.getElementById('pane-security');
  if (pane && !document.getElementById('_securityPanel')) {
    const panel = document.createElement('div');
    panel.id = '_securityPanel';
    panel.style.marginTop = '20px';
    panel.innerHTML = `
      <div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);padding:18px;border-radius:10px;margin-bottom:16px;">
        <h4 style="color:#ff003c;font-size:13px;font-weight:bold;margin-bottom:12px;">🔒 Ganti Password</h4>
        <input type="password" id="_newPassSettings" placeholder="Password baru (min 8 karakter)" style="width:100%;padding:10px;background:#0a0b0d;border:1px solid rgba(255,255,255,.1);color:#fff;border-radius:6px;font-size:12.5px;box-sizing:border-box;margin-bottom:10px;">
        <button onclick="changePasswordSettings()" style="background:#10b981;color:#fff;border:none;padding:10px 18px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;">Update Password</button>
      </div>
      <div style="background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);padding:18px;border-radius:10px;">
        <h4 style="color:#ef4444;font-size:13px;font-weight:bold;margin-bottom:8px;">⚠️ Hapus Akun</h4>
        <p style="color:#94a3b8;font-size:11.5px;margin-bottom:14px;">Akun akan terhapus permanen termasuk semua data. Tidak bisa dibatalkan.</p>
        <button onclick="deleteAccountSettings()" style="background:#ef4444;color:#fff;border:none;padding:10px 18px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;">Hapus Akun Permanen</button>
      </div>
    `;
    pane.appendChild(panel);
  }
}

async function saveSettingsForm() {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  const username = document.getElementById('setting-username')?.value.trim();
  const bio = document.getElementById('setting-bio')?.value.trim();
  if (!username || username.length < 3) { alert('Username minimal 3 karakter.'); return; }
  try {
    await updateDoc(doc(db, 'users', uid), { username, bio, updatedAt: serverTimestamp() });
    if (currentProfile) { currentProfile.username = username; currentProfile.bio = bio; }
    saveLocalSession(uid, { ...(currentProfile || {}), username, bio });
    astroToast('Profil disimpan! ✅', '✅', '#10b981');
    setTimeout(() => window.location.reload(), 900);
  } catch (err) {
    console.warn(err);
    if (currentProfile) { currentProfile.username = username; currentProfile.bio = bio; }
    saveLocalSession(uid, { ...(currentProfile || {}), username, bio });
    astroToast('Disimpan lokal 🔌', '🔌', '#f59e0b');
    setTimeout(() => window.location.reload(), 900);
  }
}

window.changePasswordSettings = async function () {
  const pass = document.getElementById('_newPassSettings')?.value;
  if (!pass || pass.length < 8) { alert('Password minimal 8 karakter.'); return; }
  if (!auth.currentUser) { alert('Harap login ulang terlebih dahulu untuk mengganti password.'); return; }
  try {
    await updatePassword(auth.currentUser, pass);
    astroToast('Password berhasil diperbarui 🔒', '🔒', '#10b981');
    document.getElementById('_newPassSettings').value = '';
  } catch (err) {
    alert(`Gagal: ${err.message}. Harap login ulang.`);
  }
};

window.deleteAccountSettings = async function () {
  if (!auth.currentUser) return;
  if (!confirm('⚠️ HAPUS AKUN PERMANEN?\n\nSemua data kamu akan terhapus dan tidak bisa dipulihkan!')) return;
  const uid = auth.currentUser.uid;
  try {
    await deleteDoc(doc(db, 'users', uid));
    await deleteUser(auth.currentUser);
    clearLocalSession();
    alert('Akun berhasil dihapus. Terima kasih telah menggunakan AstroMods!');
    window.location.href = ROOT + 'index.html';
  } catch (err) {
    alert(`Gagal hapus akun: ${err.message}. Harap login ulang.`);
  }
};

// ─── DASHBOARD PAGE ───────────────────────────────────
async function initDashboardPage() {
  const uid = localStorage.getItem('_astro_uid');
  const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1';
  if (!isLoggedIn) {
    window.location.href = ROOT + 'index.html?login=required';
    return;
  }

  const profile = currentProfile || JSON.parse(localStorage.getItem('_astro_profile') || '{}');
  const avatarUrl = profile.avatarUrl || getDiceBearAvatarUrl(uid);

  const container = document.getElementById('_dashboardContainer');
  if (!container) return;

  // Get bookmark count
  let bookmarkCount = profile.bookmarkCount || 0;
  let modCount = profile.modCount || 0;
  try {
    const bq = query(collection(db, 'bookmarks'), where('uid', '==', uid));
    const bsnaps = await getDocs(bq);
    bookmarkCount = bsnaps.size;
    const mq = query(collection(db, 'mods'), where('uploaderUid', '==', uid));
    const msnaps = await getDocs(mq);
    modCount = msnaps.size;
  } catch (e) { }

  container.innerHTML = `
    <div class="astro-dash-header">
      <img src="${avatarUrl}" class="astro-dash-avatar" onerror="this.src='${getDiceBearAvatarUrl(uid)}'">
      <div>
        <h1 style="font-family:'Orbitron',sans-serif;font-size:22px;color:#fff;margin:0 0 4px;">${profile.username || 'Player'}</h1>
        <div style="color:#64748b;font-size:13px;margin-bottom:6px;">${profile.email || ''}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="background:#0f111a;border:1px solid rgba(255,0,60,.2);color:#94a3b8;font-size:10px;padding:4px 10px;border-radius:6px;">📅 Bergabung: ${profile.joinDateFormatted || 'Unknown'}</span>
          <span style="background:${profile.vipStatus ? 'rgba(255,170,0,.15)' : '#0f111a'};border:1px solid ${profile.vipStatus ? '#ffaa00' : 'rgba(255,255,255,.08)'};color:${profile.vipStatus ? '#ffaa00' : '#64748b'};font-size:10px;padding:4px 10px;border-radius:6px;">${profile.vipStatus ? '👑 VIP MEMBER' : '🛡️ Member Biasa'}</span>
        </div>
      </div>
    </div>
    <div class="astro-dash-grid">
      <div class="astro-dash-card"><h2>${bookmarkCount}</h2><p>Bookmark</p></div>
      <div class="astro-dash-card"><h2>${modCount}</h2><p>Mod Upload</p></div>
      <div class="astro-dash-card"><h2>${profile.vipStatus ? 'VIP' : 'Free'}</h2><p>Status Akun</p></div>
      <div class="astro-dash-card"><h2>0</h2><p>Total Download</p></div>
    </div>
    <div style="background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px;margin-bottom:20px;">
      <h3 style="color:#fff;font-size:15px;font-weight:700;margin-bottom:14px;font-family:'Orbitron',sans-serif;">⚡ AKSI CEPAT</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button onclick="openEditProfileModal()" style="background:#ff003c;color:#fff;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:bold;">✏️ Edit Profile</button>
        <a href="${ROOT}bookmarks.html" style="background:#141724;color:#fff;border:1px solid rgba(255,255,255,.1);padding:10px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;">🔖 Lihat Bookmark</a>
        <button onclick="openVipUpgradesModal()" style="background:linear-gradient(135deg,#ffaa00,#d97706);color:#000;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:bold;">👑 Upgrade VIP</button>
        <a href="${ROOT}settings.html" style="background:#141724;color:#fff;border:1px solid rgba(255,255,255,.1);padding:10px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:bold;">⚙️ Settings</a>
      </div>
    </div>
    <div style="background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px;">
      <h3 style="color:#fff;font-size:15px;font-weight:700;margin-bottom:14px;font-family:'Orbitron',sans-serif;">📋 AKTIVITAS AKUN</h3>
      <div id="_dashActivity"><div style="color:#64748b;font-size:13px;">Memuat aktivitas...</div></div>
    </div>
  `;
  loadDashboardActivity(uid);
}

async function loadDashboardActivity(uid) {
  const container = document.getElementById('_dashActivity');
  if (!container) return;
  try {
    const q = query(collection(db, 'downloads'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(5));
    const snaps = await getDocs(q);
    if (snaps.empty) {
      container.innerHTML = '<div style="color:#64748b;font-size:13px;">Belum ada aktivitas.</div>';
      return;
    }
    container.innerHTML = '';
    snaps.forEach(snap => {
      const d = snap.data();
      const time = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja';
      container.innerHTML += `
        <div style="background:rgba(255,255,255,.02);border-left:3px solid #10b981;padding:12px;border-radius:4px;margin-bottom:8px;font-size:12px;color:#cbd5e1;display:flex;justify-content:space-between;">
          <span>⬇️ Download: ${d.modId}</span>
          <span style="color:#64748b;">${time}</span>
        </div>
      `;
    });
  } catch (e) {
    container.innerHTML = '<div style="color:#64748b;font-size:13px;">Aktivitas tidak tersedia saat ini.</div>';
  }
}

// ─── DOWNLOAD HISTORY (RIWAYAT DOWNLOAD) ─────────────
window.logDownloadHistory = async function (modId, modTitle) {
  const uid = localStorage.getItem('_astro_uid');
  if (!uid) return;
  try {
    await addDoc(collection(db, 'downloads'), {
      uid, modId, modTitle: modTitle || modId,
      createdAt: serverTimestamp()
    });
  } catch (e) { }
};

// ─── AUTH STATE LISTENER ──────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('🔥 Auth:', user.uid);
    await setupOrLoadProfile(user);
    syncNavbar();
    loadNotifications();

    const path = window.location.pathname;
    if (path.includes('profile.html')) initProfilePage();
    if (path.includes('settings.html')) initSettingsPage();
    if (path.includes('dashboard.html')) initDashboardPage();
    if (path.includes('bookmarks.html')) initBookmarksPage();
  } else {
    const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1';
    if (isLoggedIn) {
      const uid = localStorage.getItem('_astro_uid') || 'guest';
      loadLocalSession(uid, null);
      syncNavbar();
      const path = window.location.pathname;
      if (path.includes('profile.html')) initProfilePage();
      if (path.includes('settings.html')) initSettingsPage();
      if (path.includes('dashboard.html')) initDashboardPage();
      if (path.includes('bookmarks.html')) initBookmarksPage();
    } else {
      clearLocalSession();
      syncNavbar();
      // Redirect ke home jika di halaman yang butuh login
      const protectedPages = ['dashboard.html', 'bookmarks.html'];
      if (protectedPages.some(p => window.location.pathname.includes(p))) {
        window.location.href = ROOT + 'index.html';
      }
    }
  }
});

// ─── BOOKMARKS PAGE ───────────────────────────────────
async function initBookmarksPage() {
  const uid = localStorage.getItem('_astro_uid');
  const isLoggedIn = localStorage.getItem('_astro_loggedIn') === '1';
  if (!isLoggedIn) { window.location.href = ROOT + 'index.html'; return; }

  const container = document.getElementById('_bookmarksGrid');
  if (!container) return;
  container.innerHTML = '<div style="color:#64748b;text-align:center;padding:40px;">Memuat bookmark...</div>';

  try {
    const q = query(collection(db, 'bookmarks'), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(50));
    const snaps = await getDocs(q);
    if (snaps.empty) {
      container.innerHTML = '<div style="text-align:center;color:#64748b;padding:60px;grid-column:1/-1;"><div style="font-size:48px;margin-bottom:12px;">🔖</div><div style="font-size:15px;">Belum ada bookmark</div><p style="font-size:12px;margin-top:8px;">Bookmark mod favorit kamu dari halaman detail mod</p></div>';
      return;
    }
    const countEl = document.getElementById('_bmCount');
    if (countEl) countEl.textContent = snaps.size;
    container.innerHTML = '';
    snaps.forEach(snap => {
      const d = snap.data();
      container.innerHTML += `
        <div style="background:#0d0f1a;border:1px solid rgba(255,255,255,.06);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;transition:.2s;" onmouseover="this.style.borderColor='rgba(255,0,60,.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,.06)'">
          <img src="${d.modImg || ''}" style="height:140px;width:100%;object-fit:cover;" onerror="this.style.display='none'">
          <div style="padding:16px;flex:1;display:flex;flex-direction:column;">
            <span style="font-size:10px;background:#1e293b;color:#ffaa00;padding:3px 8px;border-radius:4px;text-transform:uppercase;font-weight:bold;display:inline-block;width:fit-content;margin-bottom:8px;">${d.modGame || 'Mod'}</span>
            <h3 style="font-size:15px;color:#fff;font-weight:600;margin:0 0 auto;">${d.modTitle || 'Untitled'}</h3>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.05);">
              <a href="${ROOT}detail-mod-minecraft-bedrock/detail-pokemon.html?mod=${d.modId}" style="color:#10b981;font-size:11px;font-weight:bold;text-decoration:none;">Buka Mod →</a>
              <button onclick="removeBookmark('${snap.id}')" style="background:rgba(239,68,68,.15);color:#f87171;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;">🗑️ Hapus</button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="color:#f87171;text-align:center;padding:40px;">Gagal memuat bookmark. Coba refresh halaman.</div>';
  }
}

// ─── WINDOW LOAD ──────────────────────────────────────
window.addEventListener('load', () => {
  injectAuthStyles();
  injectAuthModal();
});

document.getElementById("ownerPanelBtn")?.addEventListener("click", () => {
  alert("👑 Selamat datang di Owner Panel AstroMods");
});