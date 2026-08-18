"use client";

import { useDashboard } from "../DashboardContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Crown, DollarSign, TrendingUp, CreditCard, Info, Download, Mail, ChevronDown, ArrowRight
} from "lucide-react";

export default function BillingPage() {
  const { openWorkflow } = useDashboard();
  const router = useRouter();
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Stacked bar chart mock data
  const chartData = [
    { day: "May 1", compute: 145, storage: 60, transfer: 30, other: 22, showLabel: true },
    { day: "May 2", compute: 132, storage: 65, transfer: 28, other: 20, showLabel: false },
    { day: "May 3", compute: 155, storage: 70, transfer: 34, other: 25, showLabel: true },
    { day: "May 4", compute: 162, storage: 75, transfer: 32, other: 28, showLabel: false },
    { day: "May 5", compute: 198, storage: 85, transfer: 42, other: 30, showLabel: true },
    { day: "May 6", compute: 150, storage: 70, transfer: 35, other: 24, showLabel: false },
    { day: "May 7", compute: 172, storage: 78, transfer: 38, other: 28, showLabel: true },
    { day: "May 8", compute: 210, storage: 90, transfer: 48, other: 34, showLabel: false },
    { day: "May 9", compute: 168, storage: 76, transfer: 36, other: 26, showLabel: true },
    { day: "May 10", compute: 142, storage: 68, transfer: 32, other: 22, showLabel: false },
    { day: "May 11", compute: 180, storage: 82, transfer: 40, other: 30, showLabel: true },
    { day: "May 12", compute: 195, storage: 88, transfer: 44, other: 32, showLabel: false },
    { day: "May 13", compute: 160, storage: 74, transfer: 35, other: 26, showLabel: true },
    { day: "May 14", compute: 152, storage: 70, transfer: 30, other: 22, showLabel: false },
    { day: "May 15", compute: 225, storage: 95, transfer: 50, other: 38, showLabel: true },
  ];

  const maxTotal = 600; // max Y-axis value

  // Invoices mock data
  const invoices = [
    { id: "INV-2025-00045", period: "Apr 1 – Apr 30, 2025", status: "Paid", due: "May 16, 2025", amount: "$5,482.10" },
    { id: "INV-2025-00044", period: "Mar 1 – Mar 31, 2025", status: "Paid", due: "Apr 16, 2025", amount: "$5,121.80" },
    { id: "INV-2025-00043", period: "Feb 1 – Feb 28, 2025", status: "Paid", due: "Mar 16, 2025", amount: "$4,932.40" },
    { id: "INV-2025-00042", period: "Jan 1 – Jan 31, 2025", status: "Paid", due: "Feb 16, 2025", amount: "$4,682.30" },
    { id: "INV-2024-00041", period: "Dec 1 – Dec 31, 2024", status: "Paid", due: "Jan 16, 2025", amount: "$4,256.75" },
  ];

  // Plan & Usage mock data
  const usageMetrics = [
    { name: "Compute Hours", value: "12,540 / 20,000 Core Hrs", percentage: 62.7, color: "bg-[#4D7CFE]" },
    { name: "GPU Hours", value: "3,920 / 8,000 GPU Hrs", percentage: 49.0, color: "bg-[#ab47bc]" },
    { name: "Storage", value: "48.6 / 100 TB", percentage: 48.6, color: "bg-[#14b8a6]" },
    { name: "Data Transfer", value: "2.14 / 5 TB", percentage: 42.8, color: "bg-[#f97316]" },
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-800 font-sans">
      
      {/* Header Info */}
      <div className="-mt-2 mb-2">
        <p className="text-xs text-slate-500 font-medium font-sans">
          Manage your subscription, billing, and payment details.
        </p>
      </div>

      {/* Row 1: Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Current Plan */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[125px] transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-50 border border-violet-100 text-violet-600 rounded-xl shrink-0">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Plan</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Enterprise</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Renews on Jun 16, 2025</p>
            </div>
          </div>
          <button 
            onClick={() => openWorkflow("upgrade")}
            className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] mt-3.5 pl-0.5 flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
          >
            <span>View Plan Details</span>
            <ArrowRight className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Card 2: Current Month Spend */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[125px] transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Month Spend</span>
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">$2,842.60</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">May 1 – May 16, 2025</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-3.5 pl-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="rotate-180">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span>14.8% vs Apr 1 – Apr 30</span>
          </span>
        </div>

        {/* Card 3: Month-to-Date Forecast */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[125px] transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month-to-Date Forecast</span>
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">$5,685.20</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">Based on current usage</p>
            </div>
          </div>
          <button 
            className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] mt-3.5 pl-0.5 flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
          >
            <span>View Forecast</span>
            <ArrowRight className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Card 4: Unpaid Balance */}
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-sm min-h-[125px] transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unpaid Balance</span>
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">$0.00</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">All invoices are paid</p>
            </div>
          </div>
          <button 
            className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] mt-3.5 pl-0.5 flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
          >
            <span>View Invoices</span>
            <ArrowRight className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>

      </div>

      {/* Row 2: Spend Graph & Invoices Table VS Sidebar Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (8/12): Spending Overview + Recent Invoices */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card 1: Spending Overview */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Spending Overview</h3>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">$2,842.60</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total spend</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors cursor-pointer">
                  <span>This Month (May 1 – May 16)</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors cursor-pointer">
                  <span>Group by: Service</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-600 transition-colors cursor-pointer shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Bars Graph + Grid Lines */}
            <div className="flex gap-6 mt-2 items-stretch flex-col md:flex-row">
              
              {/* Stacked Bars Component */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex h-56 items-stretch relative">
                  
                  {/* Y-Axis Labels */}
                  <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 w-10 pr-2 shrink-0 pb-6 text-right select-none">
                    <span>$600</span>
                    <span>$450</span>
                    <span>$300</span>
                    <span>$150</span>
                    <span>$0</span>
                  </div>

                  {/* Graph Canvas */}
                  <div className="flex-1 flex items-end justify-between border-b border-slate-200 pb-1.5 relative px-2 gap-1.5 sm:gap-2.5">
                    
                    {/* Dotted Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pr-2">
                      <div className="w-full border-t border-dashed border-slate-100 h-0" />
                      <div className="w-full border-t border-dashed border-slate-100 h-0" />
                      <div className="w-full border-t border-dashed border-slate-100 h-0" />
                      <div className="w-full border-t border-dashed border-slate-100 h-0" />
                      <div className="w-full h-0" />
                    </div>

                    {/* Columns Render */}
                    {chartData.map((d, index) => {
                      const total = d.compute + d.storage + d.transfer + d.other;
                      const percentHeight = Math.min((total / maxTotal) * 100, 100);
                      
                      const compH = (d.compute / total) * 100;
                      const storH = (d.storage / total) * 100;
                      const tranH = (d.transfer / total) * 100;
                      const othH = (d.other / total) * 100;

                      return (
                        <div 
                          key={index} 
                          className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                        >
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full mb-2 bg-[#0F172A] text-white text-[9px] font-bold rounded-lg px-2.5 py-1.5 shadow-lg hidden group-hover:block z-30 pointer-events-none min-w-[110px]">
                            <p className="text-slate-400 uppercase tracking-widest text-[8px] font-bold">{d.day}</p>
                            <div className="flex justify-between gap-2 mt-1">
                              <span>Compute:</span> <span>${d.compute}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span>Storage:</span> <span>${d.storage}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span>Transfer:</span> <span>${d.transfer}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span>Other:</span> <span>${d.other}</span>
                            </div>
                            <div className="flex justify-between gap-2 border-t border-white/10 pt-1 mt-1 font-extrabold">
                              <span>Total:</span> <span>${total}</span>
                            </div>
                          </div>

                          {/* Stacked Bar container */}
                          <div 
                            className="w-full rounded-t-sm flex flex-col justify-end overflow-hidden transition-all duration-300 group-hover:scale-x-110" 
                            style={{ height: `${percentHeight}%` }}
                          >
                            <div className="bg-[#cbd5e1] hover:brightness-95 transition-all" style={{ height: `${othH}%` }} />
                            <div className="bg-[#14b8a6] hover:brightness-95 transition-all" style={{ height: `${tranH}%` }} />
                            <div className="bg-[#ab47bc] hover:brightness-95 transition-all" style={{ height: `${storH}%` }} />
                            <div className="bg-[#4D7CFE] hover:brightness-95 transition-all" style={{ height: `${compH}%` }} />
                          </div>

                          {/* Label below graph */}
                          <span className={`text-[9px] font-bold text-slate-400 absolute top-full mt-1 select-none ${
                            d.showLabel ? "visible" : "hidden sm:hidden md:hidden lg:hidden"
                          }`}>
                            {d.day.split(" ")[1]}
                          </span>
                        </div>
                      );
                    })}

                  </div>

                </div>
              </div>

              {/* Legend List on Right */}
              <div className="w-full md:w-44 shrink-0 flex flex-col gap-3.5 justify-center pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFE]" />
                    Compute
                  </span>
                  <span className="font-mono font-bold text-slate-900">$1,642.20</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ab47bc]" />
                    Storage
                  </span>
                  <span className="font-mono font-bold text-slate-900">$642.10</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
                    Data Transfer
                  </span>
                  <span className="font-mono font-bold text-slate-900">$321.40</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
                    Other Services
                  </span>
                  <span className="font-mono font-bold text-slate-900">$236.90</span>
                </div>
              </div>

            </div>

          </div>

          {/* Card 2: Recent Invoices */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Recent Invoices</h3>
              <button 
                className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All Invoices</span>
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[9px] pb-2.5 font-sans">
                    <th className="py-2.5">Invoice ID</th>
                    <th className="py-2.5">Billing Period</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Due Date</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-900">{inv.id}</td>
                      <td className="py-3 text-slate-500">{inv.period}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50 rounded uppercase tracking-wider">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">{inv.due}</td>
                      <td className="py-3 font-mono text-slate-800 font-bold">{inv.amount}</td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => {
                            setCopiedInvoiceId(inv.id);
                            setTimeout(() => setCopiedInvoiceId(null), 2000);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer relative"
                          title="Download Invoice"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {copiedInvoiceId === inv.id && (
                            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Triggered
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4 mt-2 font-sans select-none">
              <span>Showing 1 to 5 of 12 invoices</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 cursor-pointer">&lt;</button>
                <button className="px-3 py-1.5 border border-[#4D7CFE] bg-blue-50 text-[#4D7CFE] rounded-lg cursor-pointer">1</button>
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">2</button>
                <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer">3</button>
                <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 cursor-pointer">&gt;</button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4/12): Plan & Usage, Payment, Billing Address, Help */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card 1: Plan & Usage */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Plan & Usage</h3>
              <button 
                onClick={() => openWorkflow("upgrade")}
                className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Plan Details</span>
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mt-1">
              <span className="text-xs font-bold text-slate-700">Enterprise Plan</span>
              <span className="text-xs font-bold text-slate-800 font-mono">$8,000.00 / month</span>
            </div>

            <div className="flex flex-col gap-4.5 mt-2">
              {usageMetrics.map((metric) => (
                <div key={metric.name} className="flex flex-col gap-1 text-[11px] font-bold">
                  <div className="flex justify-between text-slate-500">
                    <span className="text-slate-700 font-bold">{metric.name}</span>
                    <span className="text-slate-400 font-semibold font-mono">{metric.value}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.color} rounded-full transition-all duration-500`} 
                        style={{ width: `${metric.percentage}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 w-10 text-right font-mono">
                      {metric.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => router.push("/dashboard/usage")}
              className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] mt-3 pl-0.5 flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
            >
              <span>View Full Usage</span>
              <ArrowRight className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Card 2: Payment Method */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Payment Method</h3>
              <button 
                onClick={() => openWorkflow("upgrade")}
                className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] transition-colors cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="flex items-center gap-3 mt-1 p-3 border border-slate-150 rounded-xl bg-slate-50/50">
              <div className="bg-[#1A1F71] text-white px-2 py-1 rounded text-[10px] font-extrabold italic font-sans tracking-tighter select-none">
                VISA
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Visa •••• 4242</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded uppercase tracking-wider">
                    Primary
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Expires 04 / 2027</p>
              </div>
            </div>
          </div>

          {/* Card 3: Billing Information */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Billing Information</h3>
              <button 
                onClick={() => openWorkflow("upgrade")}
                className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] transition-colors cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500 leading-relaxed mt-1 flex flex-col gap-1">
              <p className="text-slate-850 font-bold">AEGIS Technologies Inc.</p>
              <p>123 Security Way</p>
              <p>San Francisco, CA 94107</p>
              <p>United States</p>
              <p className="mt-2 text-slate-400 font-bold uppercase tracking-wider text-[9px]">Tax ID: <span className="font-mono text-slate-700 font-bold normal-case text-xs">98-7654321</span></p>
            </div>
          </div>

          {/* Card 4: Need Help? */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Need Help?</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Contact our billing team for any questions.</p>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              <a 
                href="mailto:billing@aegis.ai"
                className="flex items-center gap-2.5 text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] transition-colors cursor-pointer"
              >
                <Mail className="h-4.5 w-4.5 text-slate-400" />
                <span>billing@aegis.ai</span>
              </a>
              <button 
                onClick={() => router.push("/dashboard/support")}
                className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
              >
                <span>View Billing FAQ</span>
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
