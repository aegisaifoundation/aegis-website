"use client";

import { useState, useEffect } from "react";
import { BarChart3, Download, TrendingUp, DollarSign, Cpu, FileSpreadsheet, RefreshCw } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface PayoutTransaction {
  id: string;
  nodeName: string;
  operator: string;
  computeHours: number;
  tokensPaid: number;
  date: string;
  status: "settled" | "pending";
  timestamp?: number;
}

export default function AdminRevenueAudits() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [stats, setStats] = useState({
    cumulativeDataProcessedGB: 0,
    totalTokensDistributed: 0,
    activeBillingNodes: 0,
    averageComputePayoutRate: 0
  });

  // Sync Payout Transactions & Compute Stats
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payout_transactions"), (snapshot) => {
      const list: PayoutTransaction[] = [];
      let totalGB = 0;
      let totalAGS = 0;
      let totalHours = 0;
      const billingNodes = new Set<string>();
      
      snapshot.forEach((d) => {
        const tx = { id: d.id, ...d.data() } as any;
        list.push(tx);
        totalGB += (tx.computeHours || 0) * 1184;
        totalAGS += (tx.tokensPaid || 0);
        totalHours += (tx.computeHours || 0);
        if (tx.nodeName) {
          billingNodes.add(tx.nodeName);
        }
      });

      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setTransactions(list);
      
      setStats({
        cumulativeDataProcessedGB: parseFloat(totalGB.toFixed(1)),
        totalTokensDistributed: parseFloat(totalAGS.toFixed(4)),
        activeBillingNodes: billingNodes.size,
        averageComputePayoutRate: totalHours > 0 ? parseFloat((totalAGS / totalHours).toFixed(3)) : 0
      });
      setLoading(false);
    }, (err) => {
      console.error("Payout transactions sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getLast5Days = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (4 - i));
      return d.toLocaleDateString();
    });
  };

  const last5Days = getLast5Days();
  const dailyVolumes = last5Days.map((dateStr) => {
    return transactions
      .filter((tx) => tx.date === dateStr)
      .reduce((sum, tx) => sum + tx.tokensPaid, 0);
  });

  const maxVolume = Math.max(...dailyVolumes, 1);

  const handleExportCSV = () => {
    // Generate CSV string
    const headers = ["Transaction ID", "Node Name", "Operator", "Compute Hours", "Tokens Paid (AGS)", "Date", "Status"];
    const rows = transactions.map((t) => [
      t.id, t.nodeName, t.operator, t.computeHours.toString(), t.tokensPaid.toString(), t.date, t.status
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((r) => r.map(field => `"${field}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegis-billing-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl">Network Revenue & Audits</h1>
          <p className="text-sm text-gray-500 mt-1">Audit token payouts, download compute logs, and inspect token distribution metrics.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-lg px-4 py-2.5 transition-all text-white cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#7DD3FC]" /> EXPORT BILLING DATA
        </button>
      </header>

      {/* Overview Stat Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC] shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight">{stats.cumulativeDataProcessedGB.toLocaleString()} GB</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Total Data Processed</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-emerald-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-emerald-400">{stats.totalTokensDistributed.toFixed(2)} AGS</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Tokens Distributed</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-purple-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-purple-400">{stats.activeBillingNodes}</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Billing Nodes</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-amber-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight">{stats.averageComputePayoutRate} AGS</span>
            <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Average Payout / Hr</span>
          </div>
        </div>
      </div>

      {/* SVG Bar chart mapping reads/writes */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
        <h2 className="text-sm font-heading font-semibold uppercase tracking-wider text-white">Daily Network Billing Volume (Last 5 Days)</h2>
        <div className="relative h-44 w-full flex items-end">
          <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="white" strokeOpacity="0.05" strokeDasharray="3,3" />

            {/* Bars */}
            {dailyVolumes.map((vol, idx) => {
              const height = (vol / maxVolume) * 110;
              const y = 140 - height;
              return (
                <rect 
                  key={idx} 
                  x={50 + idx * 100} 
                  y={y} 
                  width="30" 
                  height={height} 
                  rx="2" 
                  fill="#4D7CFE" 
                  fillOpacity="0.8" 
                />
              );
            })}

            {/* Labels */}
            {last5Days.map((dateStr, idx) => (
              <text key={idx} x={65 + idx * 100} y={152} fill="#6b7280" fontSize="9" textAnchor="middle">
                {dateStr.split("/").slice(0, 2).join("/")}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Payout Transactions List */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#7DD3FC]" />
            <h2 className="font-heading font-bold text-lg">Billing Payouts Ledger</h2>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 600);
            }}
            className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Compute Provider</th>
                  <th className="py-2.5 px-4">System Operator</th>
                  <th className="py-2.5 px-4">Active Hours</th>
                  <th className="py-2.5 px-4">Tokens Dispatched</th>
                  <th className="py-2.5 px-4">Settled Date</th>
                  <th className="py-2.5 px-4">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500">{tx.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{tx.nodeName}</td>
                    <td className="py-3.5 px-4 text-gray-300 text-xs">{tx.operator}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                      {tx.computeHours} hrs
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-emerald-400 font-bold">
                      {tx.tokensPaid.toFixed(3)} AGS
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${
                        tx.status === "settled" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${tx.status === "settled" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {tx.status.toUpperCase()}
                      </span>
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
