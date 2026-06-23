"use client";

import { useEffect, useState } from "react";
import { Settings, Download, Upload, ShieldAlert, Cpu, Heart, Check, Database, RefreshCw, Save, Trash2 } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, getDocs, writeBatch, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { logActivity, addNotification } from "@/config/activityLogger";
import { getOrCreateUserProfile, UserProfile, hasRoleAccess } from "@/config/userRoles";

// Helper to hash password client-side using Web Crypto
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface SiteSettings {
  title: string;
  description: string;
  contactEmail: string;
  linkedin: string;
  github: string;
  xLink: string;
  theme: string;
  logoUrl: string;
}

interface BackupRecord {
  id: string;
  name: string;
  timestamp: number;
  date: string;
  createdBy: string;
  data: string; // JSON string of state
}

const defaultSettings: SiteSettings = {
  title: "AEGIS - Decentralized Intelligence Network Infrastructure",
  description: "AEGIS is a cooperative public computing intelligence grid owned and operated by the global communities that use it.",
  contactEmail: "contact@aegis.com",
  linkedin: "https://linkedin.com/company/aegis-protocol",
  github: "https://github.com/aegisaifoundation/aegis-website",
  xLink: "https://x.com/aegis_protocol",
  theme: "dark-cyber",
  logoUrl: "/assets/logo.png",
};

export default function AdminSettingsBackup() {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form edit states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [xLink, setXLink] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Password Change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Monitoring Telemetry states (Mock dynamic updates)
  const [telemetry, setTelemetry] = useState({
    reads: 142,
    writes: 38,
    latency: 22,
    uptime: 99.99,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        reads: prev.reads + Math.floor(Math.random() * 5) - 2,
        writes: prev.writes + Math.floor(Math.random() * 2) - 1,
        latency: Math.max(15, prev.latency + Math.floor(Math.random() * 3) - 1),
        uptime: 99.99,
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Profile
  useEffect(() => {
    async function loadCurrent() {
      const user = auth.currentUser;
      if (user) {
        const prof = await getOrCreateUserProfile(user.uid, user.email || "");
        setCurrentUserProfile(prof);
      }
    }
    loadCurrent();
  }, []);

  // Sync Settings
  useEffect(() => {
    const docRef = doc(db, "website_data", "settings");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings(data);
        
        setTitle(data.title || "");
        setDescription(data.description || "");
        setContactEmail(data.contactEmail || "");
        setLinkedin(data.linkedin || "");
        setGithub(data.github || "");
        setXLink(data.xLink || "");
        setLogoUrl(data.logoUrl || "");
      } else {
        setDoc(docRef, defaultSettings).catch(console.error);
        setSettings(defaultSettings);
      }
    }, (err) => console.error("Settings sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Backups collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "backups"), (snapshot) => {
      const list: BackupRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as BackupRecord);
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setBackups(list);
      setLoading(false);
    }, (err) => {
      console.error("Backups list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess("");
    setFormError("");

    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "admin")) {
      setFormError("Permission Denied. Admin permissions required.");
      return;
    }

    try {
      const item: SiteSettings = {
        title: title.trim(),
        description: description.trim(),
        contactEmail: contactEmail.trim(),
        linkedin: linkedin.trim(),
        github: github.trim(),
        xLink: xLink.trim(),
        theme: settings.theme,
        logoUrl: logoUrl.trim(),
      };

      await setDoc(doc(db, "website_data", "settings"), item);
      setFormSuccess("Site settings saved successfully.");
      await logActivity("UPDATE_SETTINGS", "Updated site SEO metadata and contact social links.");
    } catch (err: any) {
      setFormError(err.message || "Failed to update settings.");
    }
  };

  // Compile entire site state to a JSON object
  const compileSiteBackupData = async () => {
    const data: Record<string, any> = {};
    
    // Fetch all collections
    const collections = ["website_data", "research", "nodes", "media", "website_pages"];
    for (const colName of collections) {
      const snap = await getDocs(collection(db, colName));
      data[colName] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    
    return data;
  };

  const handleExportJSON = async () => {
    try {
      const data = await compileSiteBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aegis-site-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      await logActivity("EXPORT_BACKUP_JSON", "Exported complete site database configuration as JSON file.");
    } catch (err: any) {
      alert("Failed to export JSON backup: " + err.message);
    }
  };

  const handleCreateSnapshotBackup = async () => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "admin")) {
      alert("Permission Denied.");
      return;
    }

    try {
      const data = await compileSiteBackupData();
      const backupString = JSON.stringify(data);
      const id = `backup-${Date.now()}`;
      
      const record: BackupRecord = {
        id,
        name: `Automated System Snapshot - ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        createdBy: currentUserProfile.email,
        data: backupString,
      };

      await setDoc(doc(db, "backups", id), record);
      alert("Database snapshot created and stored in Firestore backups!");
      await logActivity("CREATE_SNAPSHOT_BACKUP", "Created internal database snapshot backup.");
    } catch (err: any) {
      alert("Failed to save snapshot: " + err.message);
    }
  };

  const handleRestoreSnapshot = async (backup: BackupRecord) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "super_admin")) {
      alert("Permission Denied. Super Admin role required to restore backups.");
      return;
    }

    if (confirm("WARNING: Restoring this backup will overwrite ALL current database collections. Are you sure you want to proceed?")) {
      try {
        const backupData = JSON.parse(backup.data);
        await restoreDatabaseJSON(backupData);
        alert("Database successfully restored from snapshot!");
        await logActivity("RESTORE_SNAPSHOT_BACKUP", `Restored database to snapshot from ${backup.date}`);
      } catch (err: any) {
        alert("Failed to restore: " + err.message);
      }
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "super_admin")) {
      alert("Permission Denied.");
      return;
    }
    if (confirm("Delete this backup record permanently?")) {
      try {
        await deleteDoc(doc(db, "backups", id));
        alert("Backup record deleted.");
      } catch (err: any) {
        alert("Failed to delete backup: " + err.message);
      }
    }
  };

  const restoreDatabaseJSON = async (data: Record<string, any[]>) => {
    const batch = writeBatch(db);

    for (const [colName, docsList] of Object.entries(data)) {
      // First, clear existing documents in this collection
      const existingSnap = await getDocs(collection(db, colName));
      existingSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Write new documents
      docsList.forEach((item) => {
        const { id, ...docData } = item;
        const docRef = doc(db, colName, id);
        batch.set(docRef, docData);
      });
    }

    await batch.commit();
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUserProfile || !hasRoleAccess(currentUserProfile.role, "super_admin")) {
      alert("Permission Denied. Only Super Admins can import database files.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm("Are you sure you want to import this JSON file? All current collections will be overwritten.")) {
          await restoreDatabaseJSON(json);
          alert("Import complete. All database tables updated successfully!");
          await logActivity("IMPORT_BACKUP_JSON", `Imported database JSON configurations file: ${file.name}`);
          window.location.reload();
        }
      } catch (err: any) {
        alert("Failed to import JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setPwError("You must be logged in to change your password.");
      return;
    }

    try {
      const userRef = doc(db, "admins", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userDoc = userSnap.data();
        const hashedCurrent = await hashPasswordSHA256(currentPassword);
        
        // If password field is present, verify it
        if (userDoc.password && userDoc.password !== hashedCurrent) {
          setPwError("Incorrect current password.");
          return;
        }
      }

      // Re-authenticate user first (required by Firebase before updating sensitive credentials like password)
      const credential = EmailAuthProvider.credential(user.email || "", currentPassword);
      await reauthenticateWithCredential(user, credential);

      const hashedNew = await hashPasswordSHA256(newPassword);

      // 1. Update in Firebase Auth
      await updatePassword(user, newPassword);

      // 2. Update in Firestore
      await updateDoc(userRef, { password: hashedNew });

      setPwSuccess("Password updated successfully in Auth and Firestore!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      await logActivity("CHANGE_PASSWORD", `Administrator ${user.email} successfully updated their password.`);
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPwError(err.message || "Failed to update password. You may need to log out and log in again to authenticate.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">Site Settings & backups</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global variables, backup site state, and monitor database telemetry.</p>
      </header>

      {/* Grid: Settings Form vs System Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Settings Fields Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings className="w-5 h-5 text-[#7DD3FC]" />
            <h2 className="font-heading font-bold text-lg">Site Details & Social Links</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Site Title (Metadata)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Brand Corporate Logo URL</label>
                <input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Metadata Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Contact Admin Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">LinkedIn Profile Page</label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">GitHub Repository Link</label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">X Link (Twitter Profile)</label>
                <input
                  value={xLink}
                  onChange={(e) => setXLink(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                />
              </div>
            </div>

            <button className="self-end rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] px-8 py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer mt-2 flex items-center gap-2">
              <Save className="w-4 h-4" /> SAVE SETTINGS
            </button>
          </form>
          {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
          {formSuccess && <p className="text-xs text-emerald-400 mt-1">{formSuccess}</p>}
        </div>

        {/* Database Telemetry */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="font-heading font-bold text-lg">System Telemetry</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-gray-500 font-medium">Server status</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> Active Node Mesh
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-gray-500 font-medium">Uptime Guarantee</span>
              <span className="text-xs text-white font-mono font-bold">{telemetry.uptime}%</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-gray-500 font-medium">Database Response Latency</span>
              <span className="text-xs text-[#7DD3FC] font-mono font-bold">{telemetry.latency} ms</span>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-gray-500 font-medium">Firestore Operations / Sec</span>
              <div className="flex gap-4 font-mono text-xs text-gray-400 font-bold">
                <span>R: {telemetry.reads}</span>
                <span>W: {telemetry.writes}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pb-2">
              <span className="text-xs text-gray-500 font-medium">Cloud Health Check</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-current" /> Healthy state
              </span>
            </div>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="font-heading font-bold text-lg">Change Admin Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                required
              />
            </div>

            <button className="rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 py-3 text-xs font-bold text-red-200 transition-all cursor-pointer flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> UPDATE PASSWORD
            </button>
          </form>
          {pwSuccess && <p className="text-xs text-emerald-400 mt-1">{pwSuccess}</p>}
          {pwError && <p className="text-xs text-red-400 mt-1">{pwError}</p>}
        </div>

      </div>

      {/* Backup and Restore Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Import/Export Backup Buttons */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Database className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading font-bold text-lg">JSON Backup & Restore</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Download your entire database config (cards, settings, papers, registry) as a single JSON file, or overwrite current database values by importing a backup template.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            {/* Export */}
            <button
              onClick={handleExportJSON}
              className="flex-1 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold py-3.5 transition-all cursor-pointer flex items-center justify-center gap-2 text-white"
            >
              <Download className="w-4 h-4" /> EXPORT SITE CONFIG
            </button>

            {/* Import */}
            <label className="flex-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold py-3.5 text-amber-400 hover:text-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 text-center">
              <Upload className="w-4 h-4" /> IMPORT SITE CONFIG
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Snapshot Backups in Firestore */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#7DD3FC]" />
              <h2 className="font-heading font-bold text-lg">Cloud Database Snapshots</h2>
            </div>
            <button
              onClick={handleCreateSnapshotBackup}
              className="text-[10px] text-[#7DD3FC] hover:text-white font-bold tracking-widest uppercase cursor-pointer"
            >
              + Create Snapshot
            </button>
          </div>

          <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto">
            {backups.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">No system snapshots created yet.</div>
            ) : (
              backups.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{b.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">{new Date(b.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreSnapshot(b)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold border border-emerald-500/10 hover:border-emerald-500/35 bg-emerald-500/5 px-2.5 py-1.5 rounded cursor-pointer"
                      title="Restore database to this backup state"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteSnapshot(b.id)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold border border-red-500/10 hover:border-red-500/35 bg-red-500/5 p-1.5 rounded cursor-pointer"
                      title="Delete Backup Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
