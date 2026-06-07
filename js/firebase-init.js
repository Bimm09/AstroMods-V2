// =====================================================
// ASTROMODS FIREBASE INIT - v3.0
// Inisialisasi Firebase SDK dan ekspor semua utilitas
// =====================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── FIREBASE CONFIG ─────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBN8gjvMMVfJoKhgD-BowXFoo6rMkfKOPY",
  authDomain: "astromods-5d01d.firebaseapp.com",
  projectId: "astromods-5d01d",
  storageBucket: "astromods-5d01d.firebasestorage.app",
  messagingSenderId: "1384064915001",
  appId: "1:1384064915001:web:2872176d6133bba1bafe8"
};

// ─── INITIALIZE APP ───────────────────────────────────
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ─── DICEBEAR AVATAR UTILITY ──────────────────────────
/**
 * Generate DiceBear adventurer-neutral avatar URL dari UID user.
 * Avatar TETAP menggunakan UID agar tidak berubah walau username diganti.
 */
export function getDiceBearAvatarUrl(uid) {
  if (!uid) return 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=default';
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${uid}`;
}

// ─── ERROR HANDLER ────────────────────────────────────
export const OperationType = {
  CREATE: 'create', UPDATE: 'update', DELETE: 'delete',
  LIST: 'list', GET: 'get', WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = { error: error instanceof Error ? error.message : String(error), operationType, path };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  arrayUnion, arrayRemove,
  collection, getDocs, addDoc,
  query, where, orderBy, limit,
  serverTimestamp, Timestamp, increment, onSnapshot,
  signInWithPopup, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updatePassword, deleteUser,
  reauthenticateWithCredential, EmailAuthProvider,
  onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence, browserSessionPersistence
};
