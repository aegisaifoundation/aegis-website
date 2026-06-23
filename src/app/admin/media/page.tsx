"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Folder, Plus, Search, Link as LinkIcon, Copy, Trash2, FileText, Globe } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  folder: "logos" | "heroes" | "cards" | "documents" | "research";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  timestamp: number;
}

const folders = ["ALL", "logos", "heroes", "cards", "documents", "research"] as const;

export default function AdminMediaLibrary() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<typeof folders[number]>("ALL");

  // Add Media form state
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newFolder, setNewFolder] = useState<MediaItem["folder"]>("cards");
  const [newSize, setNewSize] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Sync Media Collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "media"), (snapshot) => {
      const list: MediaItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as MediaItem);
      });

      // Seed default items if collection is empty
      if (list.length === 0 && snapshot.empty) {
        seedDefaultMedia();
      } else {
        list.sort((a, b) => b.timestamp - a.timestamp);
        setMediaList(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Media list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const seedDefaultMedia = async () => {
    const defaults: Omit<MediaItem, "id">[] = [
      {
        name: "AEGIS Corporate Logo",
        url: "/assets/logo.png",
        folder: "logos",
        size: "24 KB",
        uploadedBy: "system",
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now() - 5000,
      },
      {
        name: "Deep Space Quantum Grid",
        url: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop",
        folder: "heroes",
        size: "1.2 MB",
        uploadedBy: "system",
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now() - 4000,
      },
      {
        name: "Multi-Agent Synapse Connect",
        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop",
        folder: "cards",
        size: "340 KB",
        uploadedBy: "system",
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now() - 3000,
      },
      {
        name: "Federated Learning Gradient Analysis",
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
        folder: "research",
        size: "450 KB",
        uploadedBy: "system",
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now() - 2000,
      }
    ];

    try {
      for (const item of defaults) {
        const id = `media-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await setDoc(doc(db, "media", id), item);
      }
    } catch (err) {
      console.error("Failed to seed default media:", err);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const name = newName.trim();
    const url = newUrl.trim();
    const size = newSize.trim() || "N/A";

    if (!name || !url) {
      setFormError("Title and URL are required.");
      return;
    }

    try {
      const id = `media-${Date.now()}`;
      const item: MediaItem = {
        id,
        name,
        url,
        folder: newFolder,
        size,
        uploadedBy: auth.currentUser?.email || "admin",
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      await setDoc(doc(db, "media", id), item);
      setFormSuccess(`Successfully indexed "${name}".`);
      setNewName("");
      setNewUrl("");
      setNewSize("");
      
      await logActivity("ADD_MEDIA", `Indexed new media asset: ${name} in category ${newFolder}`);
    } catch (err: any) {
      setFormError(err.message || "Failed to index media asset.");
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the index for "${name}"?`)) {
      try {
        await deleteDoc(doc(db, "media", id));
        alert("Index removed.");
        await logActivity("DELETE_MEDIA", `Removed index for media asset: ${name}`);
      } catch (err: any) {
        alert("Failed to delete media index: " + err.message);
      }
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Copied URL to Clipboard!");
  };

  // Filter List
  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === "ALL" || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">Media Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Catalog image resources, copy URLs for components, and preview assets. (Firebase Storage integration is deferred).</p>
      </header>

      {/* Index Media Asset Form */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Plus className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">Index New Asset Image URL</h2>
        </div>

        <form onSubmit={handleAddMedia} className="grid md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Image URL (Hosted Asset)</label>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or /assets/custom-img.png"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Asset Name / Title</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Hero background structure"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Folder Category</label>
            <select
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value as MediaItem["folder"])}
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
            >
              <option value="logos">logos</option>
              <option value="heroes">heroes</option>
              <option value="cards">cards</option>
              <option value="documents">documents</option>
              <option value="research">research</option>
            </select>
          </div>

          <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer h-[42px] flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> INDEX ASSET
          </button>
        </form>
        {formError && <p className="text-xs text-red-400 mt-1">{formError}</p>}
        {formSuccess && <p className="text-xs text-emerald-400 mt-1">{formSuccess}</p>}
      </div>

      {/* Media Browser workspace */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-white/5 pb-4">
          {/* Folders navigation */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {folders.map((fold) => (
              <button
                key={fold}
                onClick={() => setActiveFolder(fold)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeFolder === fold
                    ? "bg-white/15 text-white border border-white/10"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                {fold}
              </button>
            ))}
          </div>

          {/* Search asset */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search indexed assets..."
              className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 animate-pulse">Syncing media files...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <ImageIcon className="w-12 h-12 text-gray-600 animate-bounce" />
            <p className="text-sm text-gray-500">No media assets found in this folder directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <div 
                key={item.id} 
                className="glass-card rounded-2xl overflow-hidden border border-white/10 bg-[#030712]/30 flex flex-col group transition-all duration-300 hover:border-white/20 hover:shadow-2xl"
              >
                {/* Thumbnail Preview */}
                <div className="h-40 bg-black/50 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                  {item.url.startsWith("http") || item.url.startsWith("/") ? (
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // fallback display for broken links
                        (e.target as HTMLElement).style.display = 'none';
                        const p = (e.target as HTMLElement).nextSibling as HTMLElement;
                        if (p) p.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/80 flex-col items-center justify-center gap-2 hidden group-hover:flex transition-opacity">
                    <button 
                      onClick={() => handleCopyLink(item.url)}
                      className="flex items-center gap-1.5 bg-[#4D7CFE] hover:bg-[#3b66d9] text-white px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> COPY LINK
                    </button>
                    <button 
                      onClick={() => window.open(item.url, '_blank')}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" /> OPEN IMAGE
                    </button>
                  </div>
                  {/* Fallback broken image placeholder */}
                  <div className="hidden flex-col items-center gap-2 text-gray-500 font-mono text-[10px]">
                    <FileText className="w-8 h-8 text-gray-600" />
                    <span>Non-Visual Asset / Document</span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-white truncate max-w-[80%]">{item.name}</span>
                    <button 
                      onClick={() => handleDeleteMedia(item.id, item.name)}
                      className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                      title="Remove from Media Index"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1 border-t border-white/5 pt-2">
                    <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase font-bold text-[8px] tracking-wider text-[#7DD3FC]">
                      {item.folder}
                    </span>
                    <span className="font-mono">{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
