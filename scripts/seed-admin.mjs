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

// Seeding configuration
const email = "aegisaifoundation@gmail.com";
const password = "adminpassword123"; // You can change this password

async function seedAdmin() {
  console.log("==========================================");
  console.log("AEGIS DATABASE ADMIN SEEDER");
  console.log("==========================================");
  console.log(`Target Email: ${email}`);
  console.log("Starting Firebase Auth & Firestore seeding...\n");

  let uid;
  try {
    // 1. Create User in Firebase Auth
    // Note: Firebase Auth securely hashes the password on Google's authentication servers.
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

  // 2. Create User Profile in Firestore with 'super_admin' role and seed 'admin' collection
  try {
    // Hash the password using SHA-256 for the Firestore 'admin'/'admins' collections
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    // Write to 'admins' collection (plural) for core permissions & profile gating
    const userDocRef = doc(db, "admins", uid);
    await setDoc(userDocRef, {
      uid,
      email,
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      password: hashedPassword
    });
    console.log(`[FIRESTORE] Super Admin profile document created/updated in 'admins' collection (plural).`);

    // Write to 'admin' collection (singular) as requested
    const adminDocRef = doc(db, "admin", email);
    await setDoc(adminDocRef, {
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    console.log(`[FIRESTORE] Admin credentials document created/updated in 'admin' collection (singular).`);
    
    console.log("\n==========================================");
    console.log("SUCCESS: Seeding completed successfully!");
    console.log(`You can now log in as: ${email}`);
    console.log(`Password: ${password}`);
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
