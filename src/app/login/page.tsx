"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Cpu, ShieldCheck } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

// Helper to hash password using SHA-256
async function hashSHA256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper to generate a session ID
function generateSessionId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let session = "";
  for (let i = 0; i < 32; i++) {
    session += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return session;
}

export default function UserLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const activeSession = localStorage.getItem("aegis_user_session_id");
    if (activeSession) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const inputName = username.trim();
    if (!inputName || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      // 1. Query Firestore for the user doc by userId
      const qUser = query(collection(db, "users"), where("userId", "==", inputName));
      const snapUser = await getDocs(qUser);
      let userDoc = null;

      if (snapUser.empty) {
        // Fallback: Query by email
        const qEmail = query(collection(db, "users"), where("email", "==", inputName.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          userDoc = snapEmail.docs[0];
        }
      } else {
        userDoc = snapUser.docs[0];
      }

      if (!userDoc) {
        setError("Invalid username or password.");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      
      // Check if user account is active
      if (userData.status === "disabled") {
        setError("Your account has been disabled. Please contact support.");
        setLoading(false);
        return;
      }

      // 2. Hash input password and verify
      const hashedInput = await hashSHA256(password);
      if (userData.password !== hashedInput) {
        setError("Invalid username or password.");
        setLoading(false);
        return;
      }

      // 3. Create session record in Firestore
      const newSessionId = generateSessionId();
      const sessionRef = doc(db, "sessions", newSessionId);
      
      await setDoc(sessionRef, {
        sessionId: newSessionId,
        userId: userData.userId,
        email: userData.email,
        role: userData.role || "node_operator",
        createdAt: new Date().toISOString(),
      });

      // 4. Save session ID to browser
      localStorage.setItem("aegis_user_session_id", newSessionId);
      localStorage.setItem("aegis_user_id", userData.userId);
      localStorage.setItem("aegis_user_email", userData.email);

      // 5. Fire event to trigger Navbar updates
      window.dispatchEvent(new Event("aegis-user-login-changed"));

      // 6. Redirect to operator dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login verification failed:", err);
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-body">
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="glass-card w-full max-w-md p-8 flex flex-col gap-6 border border-white/10 relative overflow-hidden bg-[#030712]/50">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-[#4D7CFE]/5 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-[#7DD3FC]/5 blur-3xl" />

        <div className="text-center relative z-10">
          <div className="p-3 bg-white/5 w-fit rounded-2xl mx-auto mb-4 border border-white/5">
            <Cpu className="w-7 h-7 text-[#7DD3FC] animate-pulse" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl tracking-[0.1em] bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent uppercase">
            OPERATOR LOGIN
          </h1>
          <p className="text-xs text-gray-500 mt-2">Access your decentralized compute node portal</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Operator User ID or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. node_operator_1234"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3.5 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3.5 text-xs text-white outline-none focus:border-[#4D7CFE] transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold border border-red-500/10 bg-red-500/5 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] disabled:bg-gray-700 py-3.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              "AUTHENTICATING..."
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> ENTER PORTAL
              </>
            )}
          </button>
        </form>

        <div className="border-t border-white/5 pt-4 text-center text-[10px] text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AEGIS Secure Network Interface</span>
        </div>
      </div>
    </main>
  );
}
