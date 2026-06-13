// =====================================================
// ASTROMODS MOD APPROVAL SYSTEM - v1.0
// Firestore-based mod submission & admin approval flow
// =====================================================

import {
  db, auth, onAuthStateChanged,
  collection, addDoc, getDocs, doc, updateDoc, getDoc,
  query, where, orderBy, serverTimestamp
} from './firebase-init.js';

// ─── CONSTANTS ────────────────────────────────────────
const OWNER_UID = localStorage.getItem('astroOwnerUID') || null;
const MODS_COLLECTION = 'mod_submissions';

// ─── SUBMIT MOD TO FIRESTORE (dipanggil dari upload-mod.html) ──
/**
 * Simpan mod baru ke Firestore dengan status "pending".
 * Dipanggil setelah validasi form berhasil di upload-mod.html.
 * @param {object} modData - Data mod yang sudah divalidasi
 * @param {string} userId  - UID user yang submit
 * @returns {Promise<string>} - ID dokumen Firestore yang dibuat
 */
export async function submitModForApproval(modData, userId) {
  try {
    const payload = {
      ...modData,
      submittedBy: userId,
      status: 'pending',          // pending | approved | rejected
      submittedAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    };

    const docRef = await addDoc(collection(db, MODS_COLLECTION), payload);
    console.log('✅ Mod submitted for approval:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('❌ Failed to submit mod:', err);
    throw err;
  }
}

// ─── LOAD SEMUA MOD (untuk halaman admin) ─────────────
/**
 * Ambil semua mod submissions dari Firestore.
 * @param {'all'|'pending'|'approved'|'rejected'} statusFilter
 * @returns {Promise<Array>}
 */
export async function fetchModSubmissions(statusFilter = 'all') {
  try {
    let q;
    if (statusFilter === 'all') {
      q = query(collection(db, MODS_COLLECTION), orderBy('submittedAt', 'desc'));
    } else {
      q = query(
        collection(db, MODS_COLLECTION),
        where('status', '==', statusFilter),
        orderBy('submittedAt', 'desc')
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('❌ Failed to fetch mod submissions:', err);
    throw err;
  }
}

// ─── APPROVE MOD ──────────────────────────────────────
/**
 * Tandai mod sebagai "approved" di Firestore.
 * @param {string} modDocId    - ID dokumen Firestore
 * @param {string} reviewerUid - UID admin yang approve
 */
export async function approveMod(modDocId, reviewerUid) {
  await updateDoc(doc(db, MODS_COLLECTION, modDocId), {
    status: 'approved',
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerUid,
    rejectionReason: null,
  });
}

// ─── REJECT MOD ───────────────────────────────────────
/**
 * Tandai mod sebagai "rejected" di Firestore.
 * @param {string} modDocId    - ID dokumen Firestore
 * @param {string} reviewerUid - UID admin yang reject
 * @param {string} reason      - Alasan penolakan
 */
export async function rejectMod(modDocId, reviewerUid, reason) {
  await updateDoc(doc(db, MODS_COLLECTION, modDocId), {
    status: 'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerUid,
    rejectionReason: reason || 'No reason given.',
  });
}

// ─── CEK APAKAH USER ADALAH OWNER/ADMIN ───────────────
export async function isAdminUser(uid) {
  if (!uid) return false;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return false;
    const data = userDoc.data();
    return data.role === 'admin' || data.role === 'owner' || data.isOwner === true;
  } catch {
    return false;
  }
}

// ─── FORMAT TIMESTAMP ─────────────────────────────────
export function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
