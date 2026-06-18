# 📦 ASTROMODS V2 — PANDUAN INSTALASI & STRUKTUR LENGKAP

## ✅ Fitur Baru yang Ditambahkan

1. **Download Counter** — auto increment saat tombol download ditekan
2. **Wishlist / Bookmark** — simpan mod ke wishlist, tampil di dashboard
3. **Rating System** — bintang 1–5, anti-duplicate, rata-rata otomatis
4. **Like System** — toggle like/unlike, realtime, satu user satu like
5. **Comment System Upgrade** — reply, edit, hapus, timestamp, avatar
6. **Notification Center** — icon lonceng realtime, mark as read
7. **Mod Approval System** — status pending/approved/rejected
8. **Admin Panel** — halaman `admin.html` lengkap dengan tabel dan filter
9. **Moderator Role** — role owner/admin/moderator/user
10. **Report Mod** — tombol 🚩 Report dengan collection Firestore
11. **Real-time Owner Dashboard** — statistik lengkap dari Firestore
12. **Verified Creator** — badge ✔ Verified di profil
13. **Follow Creator** — follow/unfollow, counter followers/following
14. **Security Improvement** — Firestore Rules ketat
15. **UI Improvement** — spacing, responsive, cards lebih rapi

---

## 📁 STRUKTUR FILE BARU

```
AstroMods V2/
├── admin.html                        ← BARU: Halaman Admin Panel
├── firestore.rules                   ← BARU: Security Rules Firestore
├── INSTALL.md                        ← BARU: Panduan ini
│
├── js/
│   ├── firebase-init.js              ← EXISTING (tidak diubah)
│   ├── firebase-auth.js              ← EXISTING (tidak diubah)
│   ├── astro-features.js             ← BARU: Core features module
│   ├── notification-bell.js          ← BARU: Bell notifikasi realtime
│   ├── mod-interactions.js           ← BARU: Rating, Like, Wishlist, Report
│   ├── owner-dashboard.js            ← BARU: Dashboard realtime owner
│   ├── mod-approval.js               ← EXISTING (tidak diubah)
│   ├── comments-firebase.js          ← EXISTING (tidak diubah)
│   └── dashboard-analytics.js        ← EXISTING (tidak diubah)
```

---

## 🗃️ STRUKTUR COLLECTION FIRESTORE

### `users/{uid}`
```json
{
  "uid": "string",
  "username": "string",
  "email": "string",
  "avatarUrl": "string",
  "role": "user | moderator | admin | owner",
  "isOwner": false,
  "vipStatus": false,
  "verified": false,
  "joinDate": "timestamp",
  "joinDateFormatted": "string",
  "bookmarkCount": 0,
  "modCount": 0
}
```

### `mod_submissions/{modId}`
```json
{
  "title": "string",
  "description": "string",
  "game": "string",
  "coverUrl": "string",
  "downloadUrl": "string",
  "submittedBy": "uid",
  "status": "pending | approved | rejected",
  "downloadCount": 0,
  "likeCount": 0,
  "averageRating": 0.0,
  "ratingCount": 0,
  "submittedAt": "timestamp",
  "reviewedAt": "timestamp | null",
  "reviewedBy": "uid | null",
  "rejectionReason": "string | null"
}
```

### `bookmarks/{docId}`
```json
{
  "uid": "string",
  "modId": "string",
  "modTitle": "string",
  "modImg": "string",
  "modGame": "string",
  "createdAt": "timestamp"
}
```

### `ratings/{docId}`
```json
{
  "uid": "string",
  "modId": "string",
  "rating": 1,
  "createdAt": "timestamp"
}
```

### `likes/{uid_modId}`
```json
{
  "uid": "string",
  "modId": "string",
  "createdAt": "timestamp"
}
```

### `comments/{commentId}`
```json
{
  "modId": "string",
  "uid": "string",
  "username": "string",
  "avatarUrl": "string",
  "text": "string",
  "parentId": "null | commentId",
  "edited": false,
  "editedAt": "timestamp | null",
  "createdAt": "timestamp"
}
```

### `notifications/{notifId}`
```json
{
  "userUid": "string",
  "title": "string",
  "message": "string",
  "read": false,
  "createdAt": "timestamp"
}
```

### `reports/{reportId}`
```json
{
  "reporterUid": "string",
  "modId": "string",
  "reason": "string",
  "status": "pending | resolved",
  "createdAt": "timestamp"
}
```

### `follows/{followerUid_creatorUid}`
```json
{
  "followerUid": "string",
  "creatorUid": "string",
  "createdAt": "timestamp"
}
```

### `downloads/{docId}`
```json
{
  "uid": "string",
  "modId": "string",
  "modTitle": "string",
  "createdAt": "timestamp"
}
```

---

## 🚀 LANGKAH INSTALASI

### Step 1: Copy File Baru
Copy semua file berikut ke project kamu:
- `admin.html`
- `firestore.rules`
- `js/astro-features.js`
- `js/notification-bell.js`
- `js/mod-interactions.js`
- `js/owner-dashboard.js`

### Step 2: Update Firestore Rules
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project `astromods-5d01d`
3. Firestore Database → Rules
4. Copy-paste isi `firestore.rules` ke editor
5. Klik **Publish**

### Step 3: Tambahkan Script ke Halaman HTML

#### Untuk `dashboard.html`, tambahkan di `<head>` atau sebelum `</body>`:
```html
<script type="module" src="js/owner-dashboard.js"></script>
<script type="module" src="js/notification-bell.js"></script>
```

#### Untuk halaman detail mod (`detail-pokemon.html`, `minecraft.html`, dll):
```html
<script type="module" src="../js/astro-features.js"></script>
<script type="module" src="../js/notification-bell.js"></script>
<script type="module" src="../js/mod-interactions.js"></script>
```

Lalu tambahkan div ini di halaman detail mod:
```html
<!-- Mod Interaction Bar (rating, like, wishlist, download, report) -->
<div id="_modInteractionsBar"></div>

<!-- Creator Card -->
<div id="_creatorCard"></div>
```

Dan panggil di akhir script:
```html
<script type="module">
  // Ganti 'MOD_ID_KAMU' dengan ID mod yang sebenarnya
  const modId = 'MOD_ID_KAMU';
  const modData = { title: 'Nama Mod', game: 'Minecraft', coverUrl: '...', downloadUrl: '...' };
  
  // Init interactions
  await renderModInteractions(modId, modData);
  await renderCreatorCard('CREATOR_UID', '_creatorCard');
</script>
```

#### Untuk semua halaman (index.html, bookmarks.html, settings.html, dll):
```html
<script type="module" src="js/astro-features.js"></script>
<script type="module" src="js/notification-bell.js"></script>
```

### Step 4: Tambahkan Link Admin Panel ke Navbar
Di `dashboard.html` atau navbar:
```html
<a href="admin.html">🛡️ Admin Panel</a>
```

### Step 5: Set Owner Role di Firestore
1. Buka Firebase Console → Firestore
2. Buka collection `users`
3. Cari dokumen user Owner kamu
4. Tambahkan field:
   - `role` → `"owner"` (string)
   - `isOwner` → `true` (boolean)

### Step 6: Deploy ke Vercel
```bash
# Tidak ada perubahan di vercel.json
# Langsung push ke GitHub, Vercel auto-deploy
git add .
git commit -m "feat: tambah 15 fitur baru AstroMods v2"
git push origin main
```

---

## 🔒 CATATAN KEAMANAN

- **Rating**: Anti-duplicate lewat Firestore Rules + query check
- **Like**: Anti-duplicate lewat document ID `{uid}_{modId}`
- **Report**: Anti-duplicate lewat query check
- **Role**: Tidak bisa self-promote ke owner
- **Owner**: Tidak bisa di-downgrade oleh siapapun (termasuk admin)
- **Moderator**: Bisa hapus komentar & approve/reject mod, tidak bisa ubah owner

---

## ⚡ CARA PENGGUNAAN FITUR

### Dari halaman detail mod:
```javascript
// Download dengan counter
handleDownload('modId', 'Nama Mod', 'https://link-download.com');

// Toggle wishlist
toggleWishlist('modId', { title: 'Nama', img: '...', game: 'Minecraft' });

// Toggle like
toggleLike('modId');

// Submit rating
submitRating('modId', 5); // 1-5

// Report mod
reportMod('modId');

// Follow creator
toggleFollow('creatorUid');
```

### Notification:
```javascript
// Kirim notifikasi manual
sendNotification('targetUid', 'Judul', 'Pesan notifikasi');

// Load notifikasi user
loadNotifications();

// Mark semua dibaca
markAllNotifsRead();
```

---

## 📞 SUPPORT

Jika ada error, cek:
1. Firebase Console → Firestore → Rules sudah di-publish
2. Browser Console untuk pesan error spesifik
3. Network tab untuk melihat request Firestore yang gagal
