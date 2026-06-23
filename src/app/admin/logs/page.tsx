"use client";

import { useEffect, useState } from "react";
import { History, Search, Filter, ShieldAlert } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

interface LogEntry {
  id: string;
  action: string;
  user: string;
  time: string;
  details: string;
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  useEffect(() => {
    const q = query(
      collection(db, "activity_logs"),
      orderBy("time", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: LogEntry[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as LogEntry);
      });
      setLogs(list);
      setLoading(false);
    }, (err) => {
      console.error("Activity logs sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Collect unique action types for filter options
  const actionTypes = ["ALL", ...Array.from(new Set(logs.map((log) => log.action)))];

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">System Activity Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Audit trail tracking all website customizations, user updates, and approvals.</p>
      </header>

      {/* Filter Controls Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/10 bg-[#030712]/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4 text-[#7DD3FC]" />
          <span className="text-xs font-semibold uppercase tracking-wider">Search and Filter</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user or details..."
              className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#4D7CFE]"
            />
          </div>

          {/* Action Filter Select */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
          >
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act === "ALL" ? "All Actions" : act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <History className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">Audit Trail</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No activity logs found matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Action</th>
                  <th className="py-3 px-4">Initiated By</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {log.time ? new Date(log.time).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border ${
                        log.action.startsWith("DELETE") || log.action.startsWith("CLEAR") || log.action.startsWith("RESET")
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : log.action.startsWith("ADD") || log.action.startsWith("APPROVE") || log.action.startsWith("RESTORE")
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-300 text-xs">
                      {log.user}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
