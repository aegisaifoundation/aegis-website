"use client";

import { useDashboard } from "../DashboardContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search, Bell, ChevronDown, BookOpen, MessageSquare, Activity, ArrowRight,
  FileText, ChevronRight, ShieldCheck, Clock, Mail, Phone, MessageCircle, Lightbulb
} from "lucide-react";

export default function SupportPage() {
  const { openWorkflow } = useDashboard();
  const router = useRouter();

  // Search input keydown helper to trigger command palette
  const triggerCommandPalette = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col text-slate-800 font-sans min-h-screen bg-[#f8fafc]">
      
      {/* Top Banner (Dark Header Block) with suportbg.png background illustration */}
      <div 
        className="w-full bg-[#050814] text-white px-10 py-14 relative flex flex-col justify-between overflow-hidden min-h-[300px] border-b border-white/5 shrink-0"
        style={{ 
          backgroundImage: 'url(/assets/suportbg.png)', 
          backgroundPosition: 'right 40px center', 
          backgroundSize: '360px', 
          backgroundRepeat: 'no-repeat' 
        }}
      >
        {/* Custom Header Controls (replacing default layout header in dark mode) */}
        <div className="absolute top-6 right-8 flex items-center gap-4.5 z-20">
          <button 
            onClick={() => router.push("/dashboard/settings")}
            className="relative p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          <button 
            onClick={() => router.push("/dashboard/settings")}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-full border border-white/5 text-white transition-colors cursor-pointer text-xs font-bold font-sans"
          >
            <span className="grid h-6.5 w-6.5 place-items-center rounded-full bg-slate-800 text-white text-[10px] font-bold border border-white/10">
              OP
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
          </button>
        </div>

        {/* Support welcome text */}
        <div className="max-w-xl z-10 mt-2">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white">Support</h1>
          <p className="text-xs text-slate-400 font-semibold mt-2.5 leading-relaxed">
            We're here to help. Find answers, solve issues, and connect with our team.
          </p>
        </div>

        {/* Integrated Command Palette search bar */}
        <div className="relative max-w-xl mt-8 z-10">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input 
            type="text" 
            onClick={triggerCommandPalette}
            placeholder="Search for articles, topics, and guides..." 
            className="w-full pl-11 pr-16 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-[#4D7CFE] focus:bg-white/[0.06] transition-all cursor-pointer select-none"
            readOnly
          />
          <div className="absolute right-3.5 top-2.5 px-2 py-1.5 bg-white/10 rounded-lg text-[9px] font-bold text-slate-300 select-none flex items-center gap-0.5 border border-white/5">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

      </div>

      {/* Main content pane (with white/light-gray bg) */}
      <div className="p-10 flex flex-col gap-8 -mt-10 relative z-10 flex-1">
        
        {/* Row 2: 4 Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 -mt-16 relative z-25">
          
          {/* Card 1: Browse Knowledge Base */}
          <div className="bg-white border border-slate-200/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-full shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Browse Knowledge Base</h4>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#4D7CFE] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                Find answers to common questions and technical guides.
              </p>
            </div>
          </div>

          {/* Card 2: Contact Support */}
          <div 
            onClick={() => openWorkflow("support")}
            className="bg-white border border-slate-200/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Contact Support</h4>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#4D7CFE] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                Submit a ticket or start a conversation with our support team.
              </p>
            </div>
          </div>

          {/* Card 3: System Status */}
          <div className="bg-white border border-slate-200/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="p-3 bg-violet-50 border border-violet-100 text-violet-600 rounded-full shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">System Status</h4>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#4D7CFE] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                Check the current status of AEGIS services and incidents.
              </p>
            </div>
          </div>

          {/* Card 4: Downloads & Resources */}
          <div 
            onClick={() => router.push("/dashboard/downloads")}
            className="bg-white border border-slate-200/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="p-3 bg-orange-50 border border-orange-100 text-orange-600 rounded-full shrink-0">
              <DownloadIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">Downloads & Resources</h4>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#4D7CFE] group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                Access documentation, release notes, and useful resources.
              </p>
            </div>
          </div>

        </div>

        {/* Row 3: Grid - Popular Topics, Get Help, System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1: Popular Topics (4/12 width) */}
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4 lg:col-span-4 min-h-[350px]">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider">Popular Topics</h3>
            </div>

            <div className="flex flex-col mt-2 flex-1">
              {[
                { title: "Getting Started with AEGIS", desc: "Learn the basics and set up your first node" },
                { title: "Node Installation Guide", desc: "Step-by-step installation instructions" },
                { title: "Managing Nodes", desc: "How to monitor and manage your nodes" },
                { title: "Troubleshooting", desc: "Solutions to common issues" },
                { title: "API Documentation", desc: "Integrate and automate with AEGIS APIs" },
              ].map((topic, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/40 px-2 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#4D7CFE] transition-colors">{topic.title}</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">{topic.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </div>
              ))}
            </div>

            <button 
              className="text-xs font-bold text-[#4D7CFE] hover:text-[#3b66d9] mt-3 pl-2 flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
            >
              <span>View all articles</span>
              <ArrowRight className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Column 2: Get Help dark card (5/12 width) */}
          <div className="flex flex-col gap-3 lg:col-span-5 min-h-[350px]">
            <h3 className="font-heading font-extrabold text-slate-900 text-sm uppercase tracking-wider pl-1">Get Help</h3>
            
            <div className="bg-[#0B0F19] text-white p-5 rounded-2xl border border-white/5 shadow-md flex flex-col justify-between flex-1 gap-4">
              
              {/* Row 1: Submit a Ticket */}
              <div 
                onClick={() => openWorkflow("support")}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.035] rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl shrink-0">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#7DD3FC] transition-colors">Submit a Ticket</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                      Submit a ticket and our team will respond as soon as possible.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>

              {/* Row 2: Live Chat */}
              <div 
                onClick={() => openWorkflow("support")}
                className="flex items-center justify-between p-3.5 border-t border-b border-white/[0.04] hover:bg-white/[0.035] rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl shrink-0">
                    <MessageCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#7DD3FC] transition-colors">Live Chat</h4>
                      <span className="text-[9px] font-extrabold text-emerald-400 capitalize tracking-wider">
                        Available 24/7
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                      Chat with our support team in real-time.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>

              {/* Row 3: Request a Feature */}
              <div 
                onClick={() => openWorkflow("request")}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.035] rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl shrink-0">
                    <Lightbulb className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#7DD3FC] transition-colors">Request a Feature</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                      Suggest a new feature or improvement.
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>

            </div>
          </div>

          {/* Column 3: System Status & Support Hours (3/12 width) */}
          <div className="flex flex-col gap-6 lg:col-span-3 min-h-[350px]">
            
            {/* Box 1: System Status */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-3.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</h4>
              <div className="flex items-start gap-3 mt-1">
                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">All Systems Operational</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">All services are running normally.</p>
                </div>
              </div>
              <button 
                className="text-[10px] font-bold text-[#4D7CFE] hover:text-[#3b66d9] mt-2 flex items-center gap-1 transition-colors cursor-pointer text-left w-fit"
              >
                <span>View Status Page</span>
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Box 2: Support Hours */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-3 flex-1 justify-between">
              <h3 className="font-heading font-extrabold text-slate-900 text-xs uppercase tracking-wider">Support Hours</h3>
              
              <div className="flex flex-col gap-3 mt-1.5">
                
                {/* 24/7 Hours info */}
                <div className="flex items-start gap-2 text-[10.5px] font-bold text-slate-500 leading-normal">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Our support team is available 24/7 for critical issues and incidents.</span>
                </div>
                
                {/* Email support */}
                <a 
                  href="mailto:support@aegis.ai"
                  className="flex items-center gap-2.5 text-[10.5px] font-bold text-[#4D7CFE] hover:text-[#3b66d9] transition-colors cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>support@aegis.ai</span>
                </a>

                {/* Phone support */}
                <a 
                  href="tel:+14155550198"
                  className="flex items-center gap-2.5 text-[10.5px] font-bold text-[#4D7CFE] hover:text-[#3b66d9] transition-colors cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>+1 (415) 555-0198</span>
                </a>

                {/* Average response time */}
                <div className="flex items-center gap-2.5 text-[10.5px] font-bold text-slate-400 border-t border-slate-50 pt-2 mt-1">
                  <Clock className="h-4 w-4 text-slate-350 shrink-0" />
                  <span>Response Time ~ 15 min</span>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Row 4: Footer Help callout banner */}
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Need more help?</h4>
            <p className="text-[11.5px] text-slate-400 font-semibold mt-1">
              Can't find what you're looking for? Our team is here to assist you.
            </p>
          </div>
          <button 
            onClick={() => openWorkflow("support")}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

      </div>

    </div>
  );
}

// Local wrapper icon to avoid import issues
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
