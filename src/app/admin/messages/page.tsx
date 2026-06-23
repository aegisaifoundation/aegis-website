"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Archive, CheckCircle2, ShieldAlert, Reply } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  archived: boolean;
  date: string;
  timestamp: number;
}

export default function AdminMessagesInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [inboxTab, setInboxTab] = useState<"inbox" | "archived">("inbox");

  // Sync Messages from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contact_messages"), (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ContactMessage);
      });

      if (list.length === 0 && snapshot.empty) {
        seedDefaultMessages();
      } else {
        list.sort((a, b) => b.timestamp - a.timestamp);
        setMessages(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Messages list sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const seedDefaultMessages = async () => {
    const defaults: Omit<ContactMessage, "id">[] = [
      {
        name: "Dr. Sarah Jenkins",
        email: "sjenkins@mit.edu",
        subject: "Federated Node Setup for MIT Labs",
        message: "Hello Aegis team,\n\nWe are looking to deploy three localized GPU enclaves at MIT CSAIL. We want to adapt local weights for our neural simulation models. Can you advise on hardware latency benchmarks for cross-cluster LoRA updates?\n\nSincerely,\nSarah Jenkins",
        read: false,
        archived: false,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now() - 10000,
      },
      {
        name: "Thomas Moreau",
        email: "moreau@capgemini.com",
        subject: "Enterprise Partnership Inquiry",
        message: "Hi,\n\nI represent Capgemini's AI engineering group. We have banking clients interested in your decentralized Zero-Knowledge model adaptation consensus. Is there a white-labeled private enterprise capsule version available?\n\nThanks,\nThomas Moreau",
        read: true,
        archived: false,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now() - 20000,
      }
    ];

    try {
      for (const msg of defaults) {
        const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        await setDoc(doc(db, "contact_messages", id), msg);
      }
    } catch (err) {
      console.error("Failed to seed default messages:", err);
    }
  };

  const handleSelectMessage = async (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (!msg.read) {
      try {
        await updateDoc(doc(db, "contact_messages", msg.id), { read: true });
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  const handleToggleArchive = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextArchive = !msg.archived;
      await updateDoc(doc(db, "contact_messages", msg.id), { archived: nextArchive });
      
      // If active, update details view or close
      if (activeMessage?.id === msg.id) {
        setActiveMessage(null);
      }
      
      await logActivity("ARCHIVE_MESSAGE", `${nextArchive ? "Archived" : "Restored"} message from ${msg.email}`);
    } catch (err: any) {
      alert("Failed to archive: " + err.message);
    }
  };

  const handleDeleteMessage = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete the message from "${msg.name}"?`)) {
      try {
        await deleteDoc(doc(db, "contact_messages", msg.id));
        if (activeMessage?.id === msg.id) {
          setActiveMessage(null);
        }
        await logActivity("DELETE_MESSAGE", `Deleted contact message from ${msg.email}`);
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  // Filter messages
  const visibleMessages = messages.filter((msg) => {
    if (inboxTab === "inbox") return !msg.archived;
    return msg.archived;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-75px)]">
      {/* Header */}
      <header className="border-b border-white/10 pb-4 shrink-0 flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-2xl">Contact Messages</h1>
          <p className="text-xs text-gray-500 mt-1">Review contact forms and inquiries submitted by institutions and visitors.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => { setInboxTab("inbox"); setActiveMessage(null); }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              inboxTab === "inbox" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Active Inbox
          </button>
          <button
            onClick={() => { setInboxTab("archived"); setActiveMessage(null); }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              inboxTab === "archived" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Archived
          </button>
        </div>
      </header>

      {/* Inbox Split Pane Layout */}
      <div className="grid lg:grid-cols-[350px_1fr] gap-6 flex-1 min-h-0 overflow-hidden items-stretch">
        
        {/* Messages List Column */}
        <div className="glass-card border border-white/10 bg-[#030712]/30 rounded-2xl flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-white/5 bg-[#030712]/60 shrink-0">
            <span className="text-[10px] font-bold text-[#7DD3FC] uppercase tracking-wider">
              {inboxTab === "inbox" ? "Active Inquiries" : "Archived Inquiries"}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-white/5">
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing inbox messages...</div>
            ) : visibleMessages.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <Mail className="w-10 h-10 text-gray-700" />
                <span className="text-xs text-gray-500">Your {inboxTab} is empty.</span>
              </div>
            ) : (
              visibleMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4.5 transition-all flex flex-col gap-2 hover:bg-white/[0.02] cursor-pointer ${
                    activeMessage?.id === msg.id ? "bg-white/5 border-l-4 border-[#4D7CFE]" : ""
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs truncate max-w-[70%] ${!msg.read ? "text-white font-bold" : "text-gray-300"}`}>
                      {msg.name}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono shrink-0">{msg.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-[#4D7CFE]" />}
                    <span className={`text-xs truncate ${!msg.read ? "text-white font-bold" : "text-gray-400 font-medium"}`}>
                      {msg.subject}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Viewer Details Column */}
        <div className="glass-card border border-white/10 bg-[#030712]/15 rounded-2xl overflow-hidden flex flex-col h-full">
          {activeMessage ? (
            <div className="flex flex-col h-full">
              {/* Toolbar */}
              <div className="p-4 border-b border-white/5 bg-[#030712]/50 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Message Viewer</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleArchive(activeMessage, e)}
                    className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={activeMessage.archived ? "Restore to Active Inbox" : "Archive Message"}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {activeMessage.archived ? "Restore" : "Archive"}
                  </button>
                  <button
                    onClick={(e) => handleDeleteMessage(activeMessage, e)}
                    className="flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Details */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-[#030712]/20">
                <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-white">{activeMessage.subject}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-[#7DD3FC]">{activeMessage.name}</span>
                      <span className="text-xs text-gray-500 font-mono">&lt;{activeMessage.email}&gt;</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{activeMessage.date}</span>
                </div>

                <div className="flex-1 whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-body">
                  {activeMessage.message}
                </div>

                {/* Reply Mock Block */}
                <div className="border-t border-white/5 pt-4 mt-8 flex flex-col gap-3">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Reply className="w-3.5 h-3.5" /> Compose Reply
                  </span>
                  <textarea
                    placeholder={`Reply to ${activeMessage.email}...`}
                    rows={4}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed"
                  />
                  <button 
                    onClick={() => {
                      alert(`Reply dispatched to ${activeMessage.email} successfully! (Mocked relay)`);
                      logActivity("REPLY_MESSAGE", `Mocked reply sent to ${activeMessage.email}`);
                    }}
                    className="self-end rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] px-5 py-2.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6 text-gray-500">
              <MailOpen className="w-12 h-12 text-gray-700 animate-pulse" />
              <p className="text-sm">Select an inquiry from the inbox pane to view message details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
