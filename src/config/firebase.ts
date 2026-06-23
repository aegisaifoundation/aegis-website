import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWXQDhgvhbhRK5OsKcVAVtY6Q5abtAc_A",
  authDomain: "aegis-b071c.firebaseapp.com",
  projectId: "aegis-b071c",
  storageBucket: "aegis-b071c.firebasestorage.app",
  messagingSenderId: "139684986381",
  appId: "1:139684986381:web:dd3839ffc0d1dd3e62df44",
  measurementId: "G-RXVSF1ZERG"
};

// Initialize Firebase for SSR / client compatibility
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
