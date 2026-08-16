import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import crypto from "crypto";

const firebaseConfig = {
  apiKey: "AIzaSyDWXQDhgvhbhRK5OsKcVAVtY6Q5abtAc_A",
  authDomain: "aegis-b071c.firebaseapp.com",
  projectId: "aegis-b071c",
  storageBucket: "aegis-b071c.firebasestorage.app",
  messagingSenderId: "139684986381",
  appId: "1:139684986381:web:dd3839ffc0d1dd3e62df44",
  measurementId: "G-RXVSF1ZERG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Seeding configuration from environment variables
const email = process.env.ADMIN_SEED_EMAIL;
const password = process.env.ADMIN_SEED_PASSWORD;

if (!email || !password) {
  console.error("ERROR: ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD environment variables must be set.");
  process.exit(1);
}

async function seedAdmin() {
  console.log("==========================================");
  console.log("AEGIS DATABASE ADMIN SEEDER");
  console.log("==========================================");
  console.log(`Target Email: ${email}`);
  console.log("Starting Firebase Auth & Firestore seeding...\n");

  let uid;
  try {
    // 1. Create User in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    uid = userCredential.user.uid;
    console.log(`[AUTH] User registered successfully in Firebase Authentication.`);
    console.log(`[AUTH] UID: ${uid}`);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log(`[AUTH] User ${email} already exists in Firebase Auth. Attempting login to write/sync Firestore profile...`);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        console.log(`[AUTH] Login successful. UID: ${uid}`);
      } catch (signInError) {
        console.error(`[AUTH] Login failed: ${signInError.message}`);
        process.exit(1);
      }
    } else {
      console.error(`[AUTH] Registration failed: ${error.message}`);
      process.exit(1);
    }
  }

  // 2. Create User Profile in Firestore with 'super_admin' role
  try {
    // Write to 'admins' collection (plural) for core permissions & profile gating
    // Note: We do NOT store password hashes in Firestore.
    const userDocRef = doc(db, "admins", uid);
    await setDoc(userDocRef, {
      uid,
      email,
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    console.log(`[FIRESTORE] Super Admin profile document created/updated in 'admins' collection (plural).`);
    
    console.log("\n==========================================");
    console.log("SUCCESS: Seeding completed successfully!");
    console.log(`You can now log in as: ${email}`);
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n==========================================");
    console.error("ERROR: Firestore write failed!");
    console.error(error.message);
    console.error("\n👉 IMPORTANT ACTION REQUIRED:");
    console.error("Please copy the security rules from 'walkthrough.md' and paste them into your");
    console.error("Firebase Console > Firestore Database > Rules tab to grant writing permissions.");
    console.error("==========================================");
    process.exit(1);
  }
}

seedAdmin();
