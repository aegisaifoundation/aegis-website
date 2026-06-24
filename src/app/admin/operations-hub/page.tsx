"use client";

import { useEffect, useState } from "react";
import { DollarSign, Landmark, BarChart3, Plus, Trash2, ShieldCheck, Cpu, Clock, Sliders, FileText } from "lucide-react";
import { db, auth } from "@/config/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

interface Payout {
  id: string;
  operatorEmail: string;
  amount: number;
  nodeRef: string;
  status: "Completed" | "Pending" | "Rejected";
  timestamp: number;
}

interface CalibrationConfig {
  ratePerGpuHour: number;
  baseOperationalCost: number;
  stakingMultiplier: number;
  lastUpdated: string;
  updatedBy: string;
}

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
  timestamp: number;
}

export default function OperationsFinanceHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"payouts" | "calibrations" | "invoices">("payouts");

  // Lists
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [calibration, setCalibration] = useState<CalibrationConfig>({
    ratePerGpuHour: 0.85,
    baseOperationalCost: 1500,
    stakingMultiplier: 1.15,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System Default"
  });

  // Payout Transaction form state
  const [operatorEmail, setOperatorEmail] = useState("");
  const [amount, setAmount] = useState(500);
  const [nodeRef, setNodeRef] = useState("node-101");
  const [status, setStatus] = useState<"Completed" | "Pending" | "Rejected">("Pending");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Calibration Form state
  const [ratePerGpuHour, setRatePerGpuHour] = useState(0.85);
  const [baseCost, setBaseCost] = useState(1500);
  const [multiplier, setMultiplier] = useState(1.15);
  const [savingCalib, setSavingCalib] = useState(false);

  // Invoice form state
  const [clientName, setClientName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(1200);
  const [invoiceDue, setInvoiceDue] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<"Paid" | "Unpaid" | "Overdue">("Unpaid");
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const prof = await getOrCreateUserProfile(user.uid, user.email || "");
          setProfile(prof);
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync Payout Transactions
  useEffect(() => {
    const q = query(collection(db, "payout_transactions"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Payout[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Payout);
      });
      setPayouts(list);
    }, (err) => console.error("Payouts sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Billing Calibrations document
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "site_settings", "billing_calibrations"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CalibrationConfig;
        setCalibration(data);
        setRatePerGpuHour(data.ratePerGpuHour);
        setBaseCost(data.baseOperationalCost);
        setMultiplier(data.stakingMultiplier);
      } else {
        const defaultCalib: CalibrationConfig = {
          ratePerGpuHour: 0.85,
          baseOperationalCost: 1500,
          stakingMultiplier: 1.15,
          lastUpdated: new Date().toISOString(),
          updatedBy: "System Initializer"
        };
        setDoc(doc(db, "site_settings", "billing_calibrations"), defaultCalib);
      }
    }, (err) => console.error("Calibrations sync failed:", err));

    return unsubscribe;
  }, []);

  // Sync Invoices
  useEffect(() => {
    const q = query(collection(db, "invoices"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Invoice[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Invoice);
      });
      setInvoices(list);
    }, (err) => console.error("Invoices sync failed:", err));

    return unsubscribe;
  }, []);

  const handleRegisterPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingPayout(true);

    try {
      const payoutId = `payout-${Date.now()}`;
      await setDoc(doc(db, "payout_transactions", payoutId), {
        operatorEmail: operatorEmail.trim().toLowerCase(),
        amount: Number(amount),
        nodeRef: nodeRef.trim(),
        status: status,
        timestamp: Date.now()
      });

      await logActivity("REGISTER_PAYOUT", `Registered payout transaction of $${amount} to ${operatorEmail}`);
      await addNotification("FINANCE", `Payout registered: $${amount}`);

      setOperatorEmail("");
      setNodeRef("");
      alert("Payout logged.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleDeletePayout = async (id: string, operator: string) => {
    if (confirm(`Remove payout record for ${operator}?`)) {
      try {
        await deleteDoc(doc(db, "payout_transactions", id));
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingCalib(true);

    try {
      await setDoc(doc(db, "site_settings", "billing_calibrations"), {
        ratePerGpuHour: Number(ratePerGpuHour),
        baseOperationalCost: Number(baseCost),
        stakingMultiplier: Number(multiplier),
        lastUpdated: new Date().toISOString(),
        updatedBy: profile.email
      });

      await logActivity("CALIBRATE_BILLING", `Calibrated billing parameters: GPU = $${ratePerGpuHour}`);
      alert("Billing parameters committed successfully.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSavingCalib(false);
    }
  };

  const handleRegisterInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingInvoice(true);

    try {
      const id = `invoice-${Date.now()}`;
      await setDoc(doc(db, "invoices", id), {
        id,
        client: clientName.trim(),
        amount: Number(invoiceAmount),
        dueDate: invoiceDue || new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(),
        status: invoiceStatus,
        timestamp: Date.now()
      });

      await logActivity("CREATE_INVOICE", `Generated invoice for $${invoiceAmount} to ${clientName}`);
      await addNotification("FINANCE", `Billing Invoice of $${invoiceAmount} issued for ${clientName}`);

      setClientName("");
      alert("Invoice logged.");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleDeleteInvoice = async (id: string, client: string) => {
    if (confirm(`Delete invoice for "${client}"?`)) {
      try {
        await deleteDoc(doc(db, "invoices", id));
        await logActivity("DELETE_INVOICE", `Deleted invoice: ${id}`);
      } catch (err: any) {
        alert("Failed: " + err.message);
      }
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Completed":
      case "Paid":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected":
      case "Overdue":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Syncing Operations ledger parameters...
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-10 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative glass-card p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-yellow-950/20 to-black overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wide text-white uppercase">
              Operations & Finance Hub
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              CFO ledger control center. Clear operator payouts, configure GPU rewards coefficients, and registry client invoices.
            </p>
          </div>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 font-body">
          <button
            onClick={() => setActiveSubTab("payouts")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "payouts" ? "bg-yellow-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" /> Payouts
          </button>
          <button
            onClick={() => setActiveSubTab("calibrations")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "calibrations" ? "bg-yellow-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Calibrations
          </button>
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "invoices" ? "bg-yellow-500 text-black font-extrabold" : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Invoices
          </button>
        </div>
      </div>

      {/* Tab Content: Payouts */}
      {activeSubTab === "payouts" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleRegisterPayout} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-400" /> Log Payout Transaction
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Operator Email</label>
                <input
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  placeholder="operator@labs.com"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={nodeRef} onChange={(e) => setNodeRef(e.target.value)} placeholder="Node Ref ID" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white" />
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded bg-[#030712] border border-white/10 px-3 py-2 text-xs text-gray-300">
                  <option value="Pending">Pending Audit</option>
                  <option value="Completed">Completed Transfer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <button type="submit" disabled={submittingPayout} className="rounded bg-yellow-500 hover:bg-yellow-600 text-black py-2.5 text-xs font-bold cursor-pointer">
                {submittingPayout ? "LOGGING..." : "LOG PAYOUT"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <Landmark className="w-4 h-4 text-yellow-400" /> Payout Transactions Ledger
            </h2>
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {payouts.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-white text-xs block font-heading font-body">{p.operatorEmail}</strong>
                      <span className="text-[8px] text-gray-500 font-mono">Node ID: {p.nodeRef}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">${p.amount}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-500 border-t border-white/5 pt-2">
                    <span>TXID: {p.id}</span>
                    <button onClick={() => handleDeletePayout(p.id, p.operatorEmail)} className="text-red-400 hover:text-red-300 font-semibold font-body cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Calibrations */}
      {activeSubTab === "calibrations" && (
        <form onSubmit={handleSaveCalibration} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-5 max-w-xl mx-auto w-full">
          <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-yellow-400" /> Calibrate Payout Rewards Rate
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">GPU Hour Rate ($/hr)</label>
              <input type="number" step="0.01" value={ratePerGpuHour} onChange={(e) => setRatePerGpuHour(Number(e.target.value))} className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Staking Multiplier</label>
              <input type="number" step="0.01" value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Target Operational Cap ($)</label>
            <input type="number" value={baseCost} onChange={(e) => setBaseCost(Number(e.target.value))} className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white" />
          </div>
          <button type="submit" disabled={savingCalib} className="rounded bg-yellow-500 hover:bg-yellow-600 text-black py-2.5 text-xs font-bold cursor-pointer">
            {savingCalib ? "COMMITTING..." : "COMMIT CALIBRATIONS"}
          </button>
          <div className="text-[9px] font-mono text-gray-500 flex justify-between border-t border-white/5 pt-3">
            <span>Calibrated By: {calibration.updatedBy.split("@")[0]}</span>
            <span>{new Date(calibration.lastUpdated).toLocaleDateString()}</span>
          </div>
        </form>
      )}

      {/* Tab: Invoices */}
      {activeSubTab === "invoices" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <form onSubmit={handleRegisterInvoice} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
              <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-yellow-400" /> Log Billing Invoice
              </h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Helix Research Group"
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Due Date</label>
                  <input type="text" value={invoiceDue} onChange={(e) => setInvoiceDue(e.target.value)} placeholder="MM/DD/YYYY" className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Status</label>
                  <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value as any)} className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-gray-300 outline-none">
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Invoiced Amount ($)</label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  className="rounded bg-black border border-white/10 px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <button type="submit" disabled={submittingInvoice} className="rounded bg-yellow-500 hover:bg-yellow-600 text-black py-2.5 text-xs font-bold cursor-pointer">
                {submittingInvoice ? "LOGGING..." : "LOG INVOICE"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 font-mono text-xs">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2 font-body">
              <FileText className="w-4 h-4 text-yellow-400" /> Operational Invoicing Ledger
            </h2>
            <div className="flex flex-col gap-3">
              {invoices.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 font-mono">No invoices registered.</div>
              ) : (
                invoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2 font-body">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block font-heading">{inv.client}</strong>
                        <span className="text-[8px] text-gray-500 font-mono">Due: {inv.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">${inv.amount}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] text-gray-500 border-t border-white/5 pt-2">
                      <span>INV-ID: {inv.id}</span>
                      <button onClick={() => handleDeleteInvoice(inv.id, inv.client)} className="text-red-400 hover:text-red-300 font-semibold font-mono cursor-pointer">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
