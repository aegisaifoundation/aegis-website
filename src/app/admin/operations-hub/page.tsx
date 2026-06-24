"use client";

import { useEffect, useState } from "react";
import { DollarSign, Landmark, BarChart3, Plus, Trash2, ShieldCheck, Cpu, Clock, Sliders } from "lucide-react";
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

export default function OperationsFinanceHub() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Lists
  const [payouts, setPayouts] = useState<Payout[]>([]);
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
        // Initialize if not exists
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

  const handleRegisterPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingPayout(true);

    try {
      const payoutId = `payout-${Date.now()}`;
      const payoutData = {
        operatorEmail: operatorEmail.trim().toLowerCase(),
        amount: Number(amount),
        nodeRef: nodeRef.trim(),
        status: status,
        timestamp: Date.now()
      };

      await setDoc(doc(db, "payout_transactions", payoutId), payoutData);
      await logActivity("REGISTER_PAYOUT", `Registered payout transaction of $${amount} to ${operatorEmail}`);
      await addNotification("FINANCE", `Payout transaction of $${amount} registered in registry status [${status}]`);

      setOperatorEmail("");
      setNodeRef("");
      alert("Payout transaction logged successfully.");
    } catch (err: any) {
      alert("Failed to log payout: " + err.message);
    } finally {
      setSubmittingPayout(false);
    }
  };

  const handleDeletePayout = async (id: string, operator: string) => {
    if (confirm(`Remove payout record for ${operator}?`)) {
      try {
        await deleteDoc(doc(db, "payout_transactions", id));
        await logActivity("DELETE_PAYOUT", `Deleted payout record ${id}`);
        alert("Payout record removed.");
      } catch (err: any) {
        alert("Failed to delete payout: " + err.message);
      }
    }
  };

  const handleSaveCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingCalib(true);

    try {
      const calibData: CalibrationConfig = {
        ratePerGpuHour: Number(ratePerGpuHour),
        baseOperationalCost: Number(baseCost),
        stakingMultiplier: Number(multiplier),
        lastUpdated: new Date().toISOString(),
        updatedBy: profile.email
      };

      await setDoc(doc(db, "site_settings", "billing_calibrations"), calibData);
      await logActivity("CALIBRATE_BILLING", `Calibrated core rate: GPU/hr = $${ratePerGpuHour}, Base cost = $${baseCost}`);
      await addNotification("FINANCE", `Billing payouts calibration updated by Finance Office.`);
      
      alert("Compute payout parameters calibrated successfully.");
    } catch (err: any) {
      alert("Failed to calibrate rates: " + err.message);
    } finally {
      setSavingCalib(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
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
              CFO and COO control panel. Monitor GPU payout ledgers, audit compute provider payouts, and calibrate system-wide staking multipliers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payout Registration & Calibration forms */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Calibrate Billing Form */}
          <form onSubmit={handleSaveCalibration} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-yellow-400" /> Calibrate Payout Rates
            </h2>
            <p className="text-[10px] text-gray-400">
              Calibrate core system coefficients used to calculate provider rewards.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">GPU Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={ratePerGpuHour}
                  onChange={(e) => setRatePerGpuHour(Number(e.target.value))}
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Staking Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  value={multiplier}
                  onChange={(e) => setMultiplier(Number(e.target.value))}
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Target Operational Cap ($)</label>
              <input
                type="number"
                value={baseCost}
                onChange={(e) => setBaseCost(Number(e.target.value))}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingCalib}
              className="rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 py-2 text-xs font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] mt-2 cursor-pointer text-black"
            >
              {savingCalib ? "SAVING CALIBRATION..." : "COMMIT CALIBRATIONS"}
            </button>

            <div className="text-[8px] text-gray-500 mt-1 flex justify-between font-mono">
              <span>Last Sync: {calibration.updatedBy.split("@")[0]}</span>
              <span>{new Date(calibration.lastUpdated).toLocaleDateString()}</span>
            </div>
          </form>

          {/* Log Payout Transaction */}
          <form onSubmit={handleRegisterPayout} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-4">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-yellow-400" /> Log Payout Transaction
            </h2>
            <p className="text-[10px] text-gray-400">
              Register payouts cleared to nodes operators.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Operator email address</label>
              <input
                type="email"
                value={operatorEmail}
                onChange={(e) => setOperatorEmail(e.target.value)}
                placeholder="e.g. operator@labs.com"
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Node Reference ID</label>
                <input
                  type="text"
                  value={nodeRef}
                  onChange={(e) => setNodeRef(e.target.value)}
                  placeholder="e.g. node-109"
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Cleared Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="rounded-lg bg-[#030712] border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-gray-300"
                >
                  <option value="Pending">Pending Audit</option>
                  <option value="Completed">Completed Transfer</option>
                  <option value="Rejected">Rejected Audit</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Payout Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-yellow-500 text-xs text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingPayout}
              className="rounded-lg bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 py-2.5 text-xs font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] mt-2 cursor-pointer text-black"
            >
              {submittingPayout ? "LOGGING TRANSACTION..." : "LOG PAYOUT"}
            </button>
          </form>
        </div>

        {/* Right Columns: Ledger Tracking */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6 font-mono text-xs">
          <div className="flex justify-between items-center font-body">
            <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-yellow-400" /> Payout Transactions Ledger
            </h2>
            <BarChart3 className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex flex-col gap-3 max-h-[650px] overflow-y-auto pr-1">
            {payouts.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No payout transactions in ledger database.
              </div>
            ) : (
              payouts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <strong className="text-white text-xs font-heading font-body">{p.operatorEmail}</strong>
                      <span className="text-[9px] text-gray-500 block">Target: {p.nodeRef}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white font-heading">${p.amount}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[8px] text-gray-500 font-mono">
                    <span>TXID: {p.id}</span>
                    <span>{new Date(p.timestamp).toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleDeletePayout(p.id, p.operatorEmail)}
                    className="text-[9px] text-red-400 hover:text-red-300 self-end font-semibold font-body cursor-pointer mt-1"
                  >
                    Delete Record
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
