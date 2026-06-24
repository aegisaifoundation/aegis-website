"use client";

import { useState, useEffect } from "react";
import { HelpCircle, MessageSquare, AlertCircle, Trash2, CheckCircle2, RefreshCw, Send } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  issueType: "downtime" | "hardware_error" | "sync_lag" | "general_inquiry";
  message: string;
  status: "open" | "investigating" | "resolved";
  date: string;
  timestamp: number;
}

export default function AdminHelpdeskSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");

  // Sync Tickets from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "support_tickets"), (snapshot) => {
      const list: SupportTicket[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SupportTicket);
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setTickets(list);
      setLoading(false);
    }, (err) => {
      console.error("Support tickets sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSelectTicket = async (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    if (ticket.status === "open") {
      try {
        await updateDoc(doc(db, "support_tickets", ticket.id), { status: "investigating" });
        await logActivity("INVESTIGATE_TICKET", `Investigating support ticket from ${ticket.email}`);
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
  };

  const handleResolveTicket = async (ticket: SupportTicket, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, "support_tickets", ticket.id), { status: "resolved" });
      if (activeTicket?.id === ticket.id) {
        setActiveTicket(null);
      }
      alert("Ticket marked as resolved.");
      await logActivity("RESOLVE_TICKET", `Resolved support ticket from ${ticket.email}`);
    } catch (err: any) {
      alert("Failed to resolve ticket: " + err.message);
    }
  };

  const handleDeleteTicket = async (ticket: SupportTicket, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete support ticket from "${ticket.name}"?`)) {
      try {
        await deleteDoc(doc(db, "support_tickets", ticket.id));
        if (activeTicket?.id === ticket.id) {
          setActiveTicket(null);
        }
        await logActivity("DELETE_TICKET", `Deleted support ticket from ${ticket.email}`);
      } catch (err: any) {
        alert("Failed to delete ticket: " + err.message);
      }
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;
    alert(`Reply dispatched to operator ${activeTicket.email} successfully!`);
    setReplyText("");
    logActivity("REPLY_SUPPORT_TICKET", `Sent support reply to ${activeTicket.email}`);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
      investigating: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-75px)] font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-4 shrink-0 flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-2xl">Helpdesk Operator Support</h1>
          <p className="text-xs text-gray-500 mt-1">Review operational queries, system warnings, and debug logs submitted by node operators.</p>
        </div>
      </header>

      {/* Ticket split pane layout */}
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 flex-1 min-h-0 overflow-hidden items-stretch">
        
        {/* Left Ticket column */}
        <div className="glass-card border border-white/10 bg-[#030712]/30 rounded-2xl flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-white/5 bg-[#030712]/60 shrink-0">
            <span className="text-[10px] font-bold text-[#7DD3FC] uppercase tracking-wider">Active Operator Tickets</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-white/5">
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing support tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <HelpCircle className="w-10 h-10 text-gray-700" />
                <span className="text-xs text-gray-500">No support tickets active.</span>
              </div>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`w-full text-left p-4 transition-all flex flex-col gap-2 hover:bg-white/[0.02] cursor-pointer ${
                    activeTicket?.id === t.id ? "bg-white/5 border-l-4 border-[#4D7CFE]" : ""
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[70%]">{t.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono shrink-0">{t.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-block border text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium truncate">{t.issueType.replace("_", " ")}</span>
                  </div>

                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {t.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Details column */}
        <div className="glass-card border border-white/10 bg-[#030712]/15 rounded-2xl overflow-hidden flex flex-col h-full">
          {activeTicket ? (
            <div className="flex flex-col h-full">
              {/* Toolbar */}
              <div className="p-4 border-b border-white/5 bg-[#030712]/50 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ticket Details</span>
                <div className="flex items-center gap-2">
                  {activeTicket.status !== "resolved" && (
                    <button
                      onClick={(e) => handleResolveTicket(activeTicket, e)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Ticket
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteTicket(activeTicket, e)}
                    className="flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5 text-xs font-semibold px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Ticket Details Body */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 bg-[#030712]/20">
                <div className="flex justify-between items-start gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-base font-heading font-bold text-white uppercase tracking-wider">
                      Issue: {activeTicket.issueType.replace("_", " ")}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-[#7DD3FC]">{activeTicket.name}</span>
                      <span className="text-xs text-gray-500 font-mono">&lt;{activeTicket.email}&gt;</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{activeTicket.date}</span>
                </div>

                <div className="flex-1 whitespace-pre-wrap text-xs text-gray-300 leading-relaxed font-body font-light">
                  {activeTicket.message}
                </div>

                {/* Reply panel */}
                <div className="border-t border-white/5 pt-4 mt-8 flex flex-col gap-3">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Draft Support Response
                  </span>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeTicket.email}...`}
                    rows={4}
                    className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] leading-relaxed"
                  />
                  <button
                    onClick={handleSendReply}
                    className="self-end rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] px-5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6 text-gray-500">
              <HelpCircle className="w-12 h-12 text-gray-700 animate-pulse" />
              <p className="text-sm">Select an active ticket from the left panel to review log specifications.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
