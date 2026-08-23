"use client";

import { useState } from "react";
import {
  Search, Bookmark, Star, ChevronRight, CheckCircle2, Shield, Wrench, ChevronDown,
  LayoutGrid, List, Lock, CheckCircle, HelpCircle, Layers, Cpu, Box, Share2,
  Database, Globe, Terminal, Code2, Bot, Sliders, Activity, Sparkles, BookOpen, Key
} from "lucide-react";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<"discover" | "categories" | "wishlist" | "installed" | "updates">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  return (
    <div className="flex flex-col gap-5 text-white font-body px-1">
      {/* Sub-Navigation Tabs & Search Bar Row */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
        <div className="flex gap-8 text-xs font-semibold text-white/40">
          {[
            { id: "discover", label: "Discover" },
            { id: "categories", label: "Categories" },
            { id: "wishlist", label: "Wishlist" },
            { id: "installed", label: "Installed" },
            { id: "updates", label: "Updates" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-white text-white font-bold"
                  : "border-transparent hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-[#161616] border border-white/[0.08] rounded-xl px-3 py-1.5 w-full max-w-xs focus-within:border-white/20 transition-colors">
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages, models, agents..."
            className="w-full bg-transparent text-xs text-white placeholder:text-white/30 outline-none"
          />
          <span className="text-[9px] text-white/20 font-mono px-1 py-0.2 rounded border border-white/10">/</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "discover" ? (
        <DiscoverView />
      ) : activeTab === "categories" ? (
        <CategoriesView selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      ) : (
        <div className="py-20 text-center text-xs text-white/30">
          No items found in {activeTab}.
        </div>
      )}
    </div>
  );
}

{/* DISCOVER TAB COMPONENT */}
function DiscoverView() {
  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      {/* Left / Main Section (9 Cols on xl) */}
      <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
        {/* Featured Hero Banner with marketplacebg1.png Background */}
        <div
          className="relative rounded-2xl border border-white/[0.08] p-7 overflow-hidden flex items-center justify-between min-h-[230px] bg-cover bg-center shadow-2xl"
          style={{ backgroundImage: "url('/assets/marketplacebg1.png')" }}
        >
          {/* Subtle dark gradient overlay for crystal clear text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-0" />

          {/* Left Text Content */}
          <div className="flex flex-col items-start max-w-md z-10">
            <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">
              FEATURED
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Federated Learning Engine
            </h2>
            <p className="text-xs text-white/60 leading-relaxed mt-2 font-normal">
              Distributed training infrastructure for secure, privacy-preserving machine learning.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-sm">
                View Details
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white font-medium text-xs rounded-xl transition-all cursor-pointer">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Add to Wishlist</span>
              </button>
            </div>
          </div>

          {/* Right 3D Cube Graphic Illustration */}
          <div className="hidden md:flex items-center justify-center relative w-64 h-44 z-0">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="grid grid-cols-3 gap-2 transform -rotate-12 scale-90 opacity-90">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center transition-all ${
                    i === 4
                      ? "bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] border-white/40"
                      : "bg-white/[0.03] backdrop-blur-sm"
                  }`}
                >
                  {i === 4 && <Sparkles className="w-5 h-5 text-white" />}
                </div>
              ))}
            </div>
          </div>

          {/* Slider Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full bg-white" />
            <span className="w-1.5 h-1 rounded-full bg-white/20" />
            <span className="w-1.5 h-1 rounded-full bg-white/20" />
            <span className="w-1.5 h-1 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Popular on AEGIS */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">Popular on AEGIS</h3>
            <button className="text-xs text-white/40 hover:text-white font-medium transition-colors cursor-pointer">
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 relative">
            {[
              { name: "@aegis/federated-learning", author: "AEGIS Foundation", rating: "4.8", installs: "2.4K", icon: Share2 },
              { name: "@aegis/knowledge-sync", author: "AEGIS Foundation", rating: "4.7", installs: "1.8K", icon: Box },
              { name: "@aegis/secure-aggregator", author: "AEGIS Foundation", rating: "4.9", installs: "1.2K", icon: Shield, green: true },
              { name: "@aegis/runtime", author: "AEGIS Foundation", rating: "4.6", installs: "3.2K", icon: Cpu },
              { name: "@aegis/vector-store", author: "AEGIS Foundation", rating: "4.7", installs: "945", icon: Database },
            ].map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#141414] border border-white/[0.07] hover:border-white/20 p-3.5 rounded-2xl flex flex-col justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl border border-white/10 ${item.green ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-white/70"}`}>
                      <ItemIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">{item.author}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/40 mt-4 pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-white font-semibold text-[10px]">{item.rating}</span>
                      <span className="text-[9px] text-white/30 ml-1">{item.installs} installs</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] mt-2 font-medium">
                    <span className="text-white/60">Free</span>
                    <Bookmark className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New & Updated */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">New & Updated</h3>
            <button className="text-xs text-white/40 hover:text-white font-medium transition-colors cursor-pointer">
              View all
            </button>
          </div>

          <div className="flex flex-col bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
            {[
              { name: "@deepmind/graph-reasoner", desc: "Graph-based reasoning engine", ver: "v1.0.0", time: "2 days ago", icon: Share2, purple: true },
              { name: "@aegis/lora-trainer", desc: "LoRA fine-tuning toolkit", ver: "v0.9.1", time: "3 days ago", icon: Sliders, green: true },
              { name: "@aegis/network-kernel", desc: "High-performance network layer", ver: "v2.1.0", time: "5 days ago", icon: Cpu, amber: true },
              { name: "@aegis/monitoring-suite", desc: "Monitoring and observability", ver: "v1.3.2", time: "6 days ago", icon: Activity },
            ].map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl border border-white/10 ${
                      item.purple ? "bg-purple-500/10 text-purple-400" :
                      item.green ? "bg-emerald-500/10 text-emerald-400" :
                      item.amber ? "bg-amber-500/10 text-amber-400" :
                      "bg-white/[0.04] text-white/70"
                    }`}>
                      <ItemIcon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      <span className="text-[10px] text-white/40 truncate">{item.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-xs text-white/40 font-mono shrink-0">
                    <span className="text-[11px]">{item.ver}</span>
                    <span className="text-[11px] font-sans text-white/30">{item.time}</span>
                    <span className="text-[11px] font-sans text-white/60">Free</span>
                    <Bookmark className="w-3.5 h-3.5 text-white/30 hover:text-white cursor-pointer" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Assurance Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#141414] border border-white/[0.07] text-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Verified & Secure</span>
              <span className="text-[9px] text-white/30">All packages are verified and scanned</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Cryptographically Signed</span>
              <span className="text-[9px] text-white/30">Integrity and authenticity guaranteed</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Compatibility Tested</span>
              <span className="text-[9px] text-white/30">Tested across AEGIS runtime environments</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Developer Support</span>
              <span className="text-[9px] text-white/30">Community and official support available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar (3 Cols on xl) */}
      <div className="col-span-12 xl:col-span-3 flex flex-col gap-6">
        {/* Categories List Widget */}
        <div className="bg-[#141414] border border-white/[0.07] p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Categories</h3>
            <button className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer">
              View all
            </button>
          </div>
          <div className="flex flex-col text-xs font-medium text-white/60 divide-y divide-white/[0.03]">
            {[
              { label: "AI Agents", count: "128", icon: Bot },
              { label: "Models", count: "246", icon: Share2 },
              { label: "Packages", count: "186", icon: Box },
              { label: "Tools", count: "142", icon: Wrench },
              { label: "Datasets", count: "93", icon: Database },
              { label: "Compute", count: "67", icon: Cpu },
              { label: "Security", count: "54", icon: Shield },
              { label: "Infrastructure", count: "76", icon: Layers },
              { label: "Developer", count: "111", icon: Code2 },
            ].map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <div key={idx} className="flex items-center justify-between py-2 hover:text-white cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <CatIcon className="w-3.5 h-3.5 text-white/30" />
                    <span>{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-white/40 font-mono">
                    <span>{cat.count}</span>
                    <ChevronRight className="w-3 h-3 text-white/20" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Authors Widget */}
        <div className="bg-[#141414] border border-white/[0.07] p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Popular Authors</h3>
            <button className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer">
              View all
            </button>
          </div>
          <div className="flex flex-col text-xs font-medium text-white/70 gap-2.5">
            {[
              { name: "AEGIS Foundation", count: "24 packages", icon: "A" },
              { name: "DeepMind", count: "18 packages", icon: "🌀" },
              { name: "OpenMined", count: "11 packages", icon: "🟢" },
              { name: "Meta AI", count: "9 packages", icon: "♾️" },
              { name: "Hugging Face", count: "7 packages", icon: "🤗" },
            ].map((author, idx) => (
              <div key={idx} className="flex items-center justify-between hover:text-white cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold">{author.icon}</span>
                  <span className="text-xs font-semibold text-white">{author.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-white/40" />
                </div>
                <span className="text-[10px] text-white/30 font-sans">{author.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Widget */}
        <div className="bg-[#141414] border border-white/[0.07] p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Top Rated</h3>
            <button className="text-[10px] text-white/40 hover:text-white transition-colors cursor-pointer">
              View all
            </button>
          </div>
          <div className="flex flex-col text-xs font-medium text-white/70 gap-2.5">
            {[
              { name: "@aegis/secure-aggregator", rating: "4.9", icon: Shield },
              { name: "@aegis/federated-learning", rating: "4.8", icon: Share2 },
              { name: "@aegis/knowledge-sync", rating: "4.7", icon: Box },
              { name: "@aegis/runtime", rating: "4.6", icon: Cpu },
              { name: "@deepmind/graph-reasoner", rating: "4.6", icon: Share2 },
            ].map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between hover:text-white cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <ItemIcon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <span className="text-[11px] font-semibold text-white truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-white">{item.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

{/* CATEGORIES TAB COMPONENT (IMAGE 2 MATCHING) */}
function CategoriesView({
  selectedCategory,
  setSelectedCategory
}: {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      {/* Left Sidebar Menu */}
      <div className="col-span-12 lg:col-span-3 bg-[#141414] border border-white/[0.07] p-4 rounded-2xl flex flex-col gap-4 font-sans text-xs">
        <div className="flex items-center justify-between text-white font-bold pb-2 border-b border-white/[0.06]">
          <span>All Categories</span>
          <span className="text-[11px] text-white/40 font-mono">1,234</span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Group 1 */}
          <div className="flex flex-col gap-1.5">
            {[
              { label: "AI & Intelligence", count: "386", icon: Share2 },
              { label: "Agents", count: "128", icon: Bot },
              { label: "Foundation Models", count: "98", icon: Box },
              { label: "Training & Fine-tuning", count: "74", icon: Sliders },
              { label: "Inference", count: "65", icon: Cpu },
              { label: "Federated Learning", count: "48", icon: Share2 },
              { label: "Knowledge Systems", count: "56", icon: Database },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedCategory === cat.label
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-white/30" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">{cat.count}</span>
                </button>
              );
            })}
          </div>

          {/* Group 2 */}
          <div className="flex flex-col gap-1.5 border-t border-white/[0.06] pt-3">
            {[
              { label: "Infrastructure", count: "312", icon: Layers },
              { label: "Compute", count: "67", icon: Cpu },
              { label: "Storage", count: "50", icon: Database },
              { label: "Networking", count: "42", icon: Globe },
              { label: "Monitoring", count: "44", icon: Activity },
              { label: "Security", count: "54", icon: Shield },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedCategory === cat.label
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-white/30" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">{cat.count}</span>
                </button>
              );
            })}
          </div>

          {/* Group 3 */}
          <div className="flex flex-col gap-1.5 border-t border-white/[0.06] pt-3">
            {[
              { label: "Developer", count: "244", icon: Code2 },
              { label: "SDKs & Libraries", count: "82", icon: Terminal },
              { label: "APIs", count: "59", icon: Key },
              { label: "CLI Tools", count: "41", icon: Terminal },
              { label: "Runtime Extensions", count: "62", icon: Layers },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedCategory === cat.label
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-white/30" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Grid Content */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-5">
        {/* Header & Controls */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h2 className="text-base font-bold text-white">Browse Categories</h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="text-[11px] text-white/40">Sort by</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161616] border border-white/[0.08] rounded-xl text-xs text-white font-semibold">
                <span>Popular</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#161616] p-1 border border-white/[0.08] rounded-xl">
              <button className="p-1 bg-white/10 rounded-lg text-white">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-1 text-white/40 hover:text-white">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 12 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "AI & Intelligence", desc: "Models, agents and intelligence systems for AEGIS.", count: "386 packages", icon: Share2, purple: true },
            { title: "Agents", desc: "Autonomous agents and multi-agent systems.", count: "128 packages", icon: Bot, green: true },
            { title: "Foundation Models", desc: "Pre-trained models for a wide range of capabilities.", count: "98 packages", icon: Box, blue: true },
            { title: "Training & Fine-tuning", desc: "Tools and frameworks for training and fine-tuning models.", count: "74 packages", icon: Sliders, amber: true },
            { title: "Inference", desc: "Inference engines and optimization tools.", count: "65 packages", icon: Cpu, teal: true },
            { title: "Federated Learning", desc: "Distributed training and federated learning tools.", count: "48 packages", icon: Share2, purple: true },
            { title: "Knowledge Systems", desc: "Knowledge graphs, RAG systems and retrieval tools.", count: "56 packages", icon: Database, orange: true },
            { title: "Infrastructure", desc: "Core infrastructure components for AEGIS networks.", count: "312 packages", icon: Layers, blue: true },
            { title: "Developer", desc: "SDKs, libraries and developer tools for building on AEGIS.", count: "244 packages", icon: Code2, green: true },
            { title: "Security", desc: "Security, privacy and trust components.", count: "54 packages", icon: Shield, purple: true },
            { title: "Data", desc: "Datasets, embeddings and data management tools.", count: "158 packages", icon: Database, amber: true },
            { title: "Tools & Utilities", desc: "Productivity tools and utilities for developers and operators.", count: "81 packages", icon: Wrench, teal: true },
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-[#141414] border border-white/[0.07] hover:border-white/20 p-4 rounded-2xl flex flex-col justify-between min-h-[160px] transition-all cursor-pointer group"
              >
                <div>
                  <div className={`p-2.5 rounded-xl border border-white/10 w-fit ${
                    cat.purple ? "bg-purple-500/10 text-purple-400" :
                    cat.green ? "bg-emerald-500/10 text-emerald-400" :
                    cat.blue ? "bg-blue-500/10 text-blue-400" :
                    cat.amber ? "bg-amber-500/10 text-amber-400" :
                    cat.teal ? "bg-teal-500/10 text-teal-400" :
                    cat.orange ? "bg-orange-500/10 text-orange-400" :
                    "bg-white/[0.04] text-white/70"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-white mt-3 group-hover:text-white/90">{cat.title}</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-1">{cat.desc}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/30 mt-4 pt-2 border-t border-white/[0.04]">
                  <span>{cat.count}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Assurance Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#141414] border border-white/[0.07] text-xs mt-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Verified & Secure</span>
              <span className="text-[9px] text-white/30">All packages are verified and scanned</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Cryptographically Signed</span>
              <span className="text-[9px] text-white/30">Integrity and authenticity guaranteed</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Quality Assured</span>
              <span className="text-[9px] text-white/30">Tested for compatibility and reliability</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white/40 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[11px]">Built for AEGIS</span>
              <span className="text-[9px] text-white/30">Designed for distributed intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
