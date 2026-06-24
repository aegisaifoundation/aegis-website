"use client";

import { useState, useEffect } from "react";
import { KeyRound, Plus, Trash2, ShieldAlert, Check, Copy, RefreshCw } from "lucide-react";
import { db } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

interface ApiToken {
  id: string;
  name: string;
  scope: string;
  rateLimit: number;
  status: "active" | "revoked";
  tokenValue: string;
  createdAt: string;
  timestamp: number;
  usageCount: number;
}

export default function AdminApiTokenManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [scope, setScope] = useState("general_queries");
  const [rateLimit, setRateLimit] = useState(60);
  const [newGeneratedToken, setNewGeneratedToken] = useState<string | null>(null);

  // Sync Tokens from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "api_tokens"), (snapshot) => {
      const list: ApiToken[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ApiToken);
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setTokens(list);
      setLoading(false);
    }, (err) => {
      console.error("API tokens sync failed:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate token string
    const randHex = Array.from({ length: 20 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const generatedStr = `ags_live_${randHex}`;

    try {
      const id = `token-${Date.now()}`;
      const item: ApiToken = {
        id,
        name: name.trim(),
        scope,
        rateLimit,
        status: "active",
        tokenValue: generatedStr,
        createdAt: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        usageCount: 0,
      };

      await setDoc(doc(db, "api_tokens", id), item);
      setNewGeneratedToken(generatedStr);
      setName("");
      
      await logActivity("GENERATE_API_TOKEN", `Generated API access token: ${name}`);
    } catch (err: any) {
      alert("Failed to generate token: " + err.message);
    }
  };

  const handleRevokeToken = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently revoke API Token "${name}"? External integrations using this key will immediately lose access.`)) {
      try {
        await deleteDoc(doc(db, "api_tokens", id));
        alert("Token revoked successfully.");
        await logActivity("REVOKE_API_TOKEN", `Revoked API access token: ${name}`);
      } catch (err: any) {
        alert("Failed to revoke token: " + err.message);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-8 font-body">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <h1 className="font-heading font-bold text-3xl">API Access Key Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Issue and revoke authentication keys for external applications querying the AEGIS consensus routing mesh.</p>
      </header>

      {/* Generate token panel */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <KeyRound className="w-5 h-5 text-[#7DD3FC]" />
          <h2 className="font-heading font-bold text-lg">Generate Developer API Key</h2>
        </div>

        <form onSubmit={handleGenerateToken} className="grid md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Application / Client Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Healthcare Analytics Widget"
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Access Scope Limit</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] cursor-pointer"
            >
              <option value="general_queries">General Queries</option>
              <option value="clinical_nodes_access">Clinical Nodes Access</option>
              <option value="financial_audits">Financial Ledger Audits</option>
              <option value="research_download">Research Database Sync</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Rate Limit (Requests / Min)</label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
              min={10}
              max={1000}
              className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              required
            />
          </div>

          <button className="md:col-span-4 rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer flex items-center justify-center gap-2 mt-2">
            <Plus className="w-4 h-4" /> GENERATE NEW API KEY
          </button>
        </form>

        {newGeneratedToken && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-2 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400">Key successfully generated! Copy it now. For security, it will not be shown again.</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newGeneratedToken);
                  alert("API token copied to clipboard!");
                }}
                className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-3 py-1 rounded flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
              >
                <Copy className="w-3 h-3" /> Copy Key
              </button>
            </div>
            <code className="text-xs font-mono text-white p-3 bg-black/40 border border-white/5 rounded-lg select-all break-all">{newGeneratedToken}</code>
          </div>
        )}
      </div>

      {/* Keys Registry Table */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <KeyRound className="w-5 h-5 text-purple-400" />
          <h2 className="font-heading font-bold text-lg">Active Authorization Registry</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 animate-pulse">Syncing key registry...</div>
        ) : tokens.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-gray-600" />
            <p className="text-sm text-gray-500">No active developer API tokens issued.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-heading text-[10px] tracking-wider uppercase font-extrabold">
                  <th className="py-3 px-4">Key Client Name</th>
                  <th className="py-3 px-4">Scope Scope</th>
                  <th className="py-3 px-4">Rate Limits</th>
                  <th className="py-3 px-4">Issued Date</th>
                  <th className="py-3 px-4">Cumulative Queries</th>
                  <th className="py-3 px-4">Hashed Identifier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      {token.name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-purple-500/10 text-[#c084fc] border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                        {token.scope}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs font-mono">
                      {token.rateLimit} RPM
                    </td>
                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">
                      {token.createdAt}
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-xs">
                      {token.usageCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-600">
                      {token.tokenValue.substring(0, 12)}...{token.tokenValue.substr(-4)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleRevokeToken(token.id, token.name)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Revoke and delete API Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
