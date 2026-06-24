"use client";

import { useState, useEffect } from "react";
import { FileText, PlusCircle, ShieldAlert, GitCommit, RefreshCw, Trash2 } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface ChangelogEntry {
  id: string;
  version: string;
  author: string;
  description: string; // comma-separated changes list
  commitHash: string;
  date: string;
  timestamp: number;
}

export default function AdminChangelog() {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [version, setVersion] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [commitHash, setCommitHash] = useState("");

  // Sync Changelogs from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "changelogs"), (snapshot) => {
      const list: ChangelogEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ChangelogEntry);
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setChangelogs(list);
      setLoading(false);
    }, (err) => {
      console.error("Changelogs list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleRegisterVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !description.trim()) return;

    const hash = commitHash.trim() || Math.random().toString(16).substr(2, 7);

    try {
      const id = `change-${Date.now()}`;
      const item: ChangelogEntry = {
        id,
        version: version.trim(),
        author: author.trim() || "operator@aegis.com",
        description: description.trim(),
        commitHash: hash,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
      };

      await setDoc(doc(db, "changelogs", id), item);
      setVersion("");
      setDescription("");
      setCommitHash("");
      
      await logActivity("REGISTER_CHANGELOG_VERSION", `Registered changelog version tag: ${item.version}`);
    } catch (err: any) {
      alert("Failed to save changelog version: " + err.message);
    }
  };

  const handleDeleteChangelog = async (id: string, versionTag: string) => {
    if (confirm(`Are you sure you want to permanently delete changelog version entry "${versionTag}"?`)) {
      try {
        await deleteDoc(doc(db, "changelogs", id));
        alert("Version log removed successfully.");
        await logActivity("DELETE_CHANGELOG_VERSION", `Deleted changelog version log entry: ${versionTag}`);
      } catch (err: any) {
        alert("Failed to delete log entry: " + err.message);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">System Version Changelog</h1>
        <p className="text-sm text-gray-500 mt-1">Audit deployment commits, track database package upgrades, and register software release version tags.</p>
      </header>

      {/* Register Version Form */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <PlusCircle className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">Register Deployment Version Tag</h2>
        </div>

        <form onSubmit={handleRegisterVersion} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Version Tag</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v0.2.0-beta"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Commit SHA-1 Hash</label>
            <input
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
              placeholder="e.g. b3c7f92 (optional)"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Author Email</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. lead_developer@aegis.com"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-4">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Version Changes Description Summary</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Specify all bug fixes, library additions, and server customizations..."
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed"
              required
            />
          </div>

          <button className="md:col-span-4 rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer flex items-center justify-center gap-2 mt-2">
            <GitCommit className="w-4 h-4" /> REGISTER SOFTWARE RELEASE
          </button>
        </form>
      </div>

      {/* Changelogs timeline list */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <FileText className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">System Releases History</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing changelog files...</div>
        ) : changelogs.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No version changelog releases registered.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {changelogs.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-xl border border-white/5 bg-[#030712]/10 flex flex-col gap-3 text-left relative overflow-hidden group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-heading font-extrabold text-base tracking-wide uppercase">{item.version}</span>
                      <span className="text-[10px] text-gray-500 font-mono">SHA: {item.commitHash}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 font-mono">Released by {item.author} on {item.date}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteChangelog(item.id, item.version)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                    title="Remove release log entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-light whitespace-pre-wrap">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
