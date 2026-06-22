"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, LogOut, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { CardContent, defaultCardContent, readCardContent, saveCardContent } from "@/config/cardContent";

type Collection = keyof CardContent;
type CardItem = CardContent[Collection][number];
const labels: Record<Collection, string> = { technology: "Technology cards", sectors: "Sector cards", revenue: "Revenue cards", agents: "Agent ecosystem cards", agentFaqs: "Agent ecosystem FAQs" };
const newItem = (collection: Collection): CardItem => {
  const id = `new-${Date.now()}`;
  if (collection === "technology") return { id, title: "New technology", desc: "Describe this technology.", spec: "Protocol specification" };
  if (collection === "revenue") return { id, title: "New revenue model", desc: "Describe this revenue model." };
  if (collection === "agents") return { id, title: "New agent", class: "AEGIS-NEW-01", desc: "Describe this agent.", inputs: "Data source", consensus: "Describe how the agent reaches consensus.", coordination: "Related Agent", kpis: "Metric|Value" };
  if (collection === "agentFaqs") return { id, question: "New question", answer: "Add the answer to this frequently asked question." };
  return { id, title: "New sector", category: "Healthcare", problem: "Describe the problem.", benefits: "Describe the benefit.", revenue: "$0 potential size", details: "Add the technical details for this sector." };
};

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => typeof window !== "undefined" && sessionStorage.getItem("aegis_admin_session") === "active");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [content, setContent] = useState<CardContent>(() => typeof window !== "undefined" ? readCardContent() : defaultCardContent);
  const [collection, setCollection] = useState<Collection>("technology");
  const [selectedId, setSelectedId] = useState<string>(defaultCardContent.technology[0].id);
  const [saved, setSaved] = useState(false);

  const cards = content[collection];
  const selected = useMemo(() => cards.find((card) => card.id === selectedId) || cards[0], [cards, selectedId]);

  const login = (event: FormEvent) => {
    event.preventDefault();
    const expected = localStorage.getItem("aegis_admin_password") || "admin";
    if (username === "admin" && password === expected) { sessionStorage.setItem("aegis_admin_session", "active"); setLoggedIn(true); setError(""); }
    else setError("Invalid username or password.");
  };
  const updateSelected = (field: string, value: string) => {
    if (!selected) return;
    setSaved(false);
    setContent((current) => ({ ...current, [collection]: current[collection].map((card) => card.id === selected.id ? { ...card, [field]: value } : card) } as CardContent));
  };
  const addCard = () => { const card = newItem(collection); setContent((current) => ({ ...current, [collection]: [...current[collection], card] } as CardContent)); setSelectedId(card.id); setSaved(false); };
  const deleteCard = () => {
    if (!selected) return;
    const nextContent = { ...content, [collection]: content[collection].filter((card) => card.id !== selected.id) } as CardContent;
    setContent(nextContent);
    setSelectedId(nextContent[collection][0]?.id || "");
    saveCardContent(nextContent);
    setSaved(true);
  };
  const save = () => { saveCardContent(content); setSaved(true); };
  const changeCollection = (next: Collection) => { setCollection(next); setSelectedId(content[next][0]?.id || ""); setSaved(false); };
  const fields = selected ? Object.entries(selected).filter(([key]) => key !== "id") : [];

  if (!loggedIn) return <main className="min-h-screen bg-black text-white flex items-center justify-center p-6"><form onSubmit={login} className="glass-card w-full max-w-md p-8 flex flex-col gap-5 border border-white/10"><div className="text-center"><Lock className="w-8 h-8 text-[#7DD3FC] mx-auto mb-3"/><h1 className="font-heading font-bold text-2xl">Admin access</h1><p className="text-sm text-gray-500 mt-2">Sign in to manage the website cards.</p></div><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none" required/><input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none" required/>{error && <p className="text-sm text-red-400">{error}</p>}<button className="rounded-lg bg-[#4D7CFE] py-3 text-sm font-bold">SIGN IN</button><Link href="/" className="text-center text-sm text-gray-400 hover:text-white">Back to website</Link></form></main>;

  return <main className="min-h-screen bg-black text-white p-5 md:p-10 font-body"><div className="max-w-7xl mx-auto"><header className="flex flex-col md:flex-row gap-5 justify-between md:items-center border-b border-white/10 pb-7 mb-8"><div className="flex items-center gap-4"><Link href="/" className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4"/></Link><div><h1 className="font-heading font-bold text-2xl">Website content</h1><p className="text-sm text-gray-500 mt-1">Edit the cards displayed on the public site.</p></div></div><div className="flex gap-3"><button onClick={() => { setContent(defaultCardContent); setSaved(false); }} className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 hover:text-white"><RotateCcw className="w-4 h-4"/> Reset defaults</button><button onClick={() => { sessionStorage.removeItem("aegis_admin_session"); setLoggedIn(false); }} className="flex items-center gap-2 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 hover:text-white"><LogOut className="w-4 h-4"/> Logout</button></div></header><div className="grid lg:grid-cols-[280px_1fr] gap-7"><aside className="glass-card p-3 h-fit"><p className="px-3 py-2 text-[10px] font-bold tracking-widest text-gray-500">CARD COLLECTIONS</p>{(Object.keys(labels) as Collection[]).map((key) => <button key={key} onClick={() => changeCollection(key)} className={`block text-left w-full rounded-lg px-3 py-3 text-sm ${collection === key ? "bg-[#4D7CFE] text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>{labels[key]} <span className="float-right opacity-60">{content[key].length}</span></button>)}<button onClick={addCard} className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#4D7CFE]/50 text-[#7DD3FC] py-3 text-xs font-bold"><Plus className="w-4 h-4"/> ADD CARD</button></aside><section className="grid xl:grid-cols-[260px_1fr] gap-6"><div className="glass-card p-3 max-h-[67vh] overflow-y-auto"><p className="px-3 py-2 text-[10px] font-bold tracking-widest text-gray-500">{labels[collection].toUpperCase()}</p>{cards.map((card) => <button key={card.id} onClick={() => setSelectedId(card.id)} className={`block w-full text-left p-3 rounded-lg mb-1 ${card.id === selected?.id ? "bg-white/10" : "hover:bg-white/5"}`}><span className="block text-sm font-semibold">{"title" in card ? card.title : card.question}</span><span className="block text-xs text-gray-500 truncate mt-1">{"desc" in card ? card.desc : "problem" in card ? card.problem : "answer" in card ? card.answer : ""}</span></button>)}</div><div className="glass-card p-6 md:p-8"><div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 mb-6"><div><p className="text-[10px] font-bold tracking-widest text-[#7DD3FC]">EDIT CARD</p><h2 className="font-heading font-bold text-xl mt-1">{selected ? ("title" in selected ? selected.title : selected.question) : "No card selected"}</h2></div><button onClick={deleteCard} disabled={!selected} className="flex items-center gap-2 text-xs text-red-400 disabled:opacity-30"><Trash2 className="w-4 h-4"/> Delete</button></div>{selected ? <><div className="grid gap-5">{fields.map(([field, value]) => <label key={field} className="block"><span className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">{field}</span>{String(value).length > 70 || ["desc", "problem", "benefits", "details", "answer"].includes(field) ? <textarea value={String(value)} onChange={(e) => updateSelected(field, e.target.value)} rows={field === "details" ? 5 : 3} className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-white outline-none focus:border-[#4D7CFE]"/> : <input value={String(value)} onChange={(e) => updateSelected(field, e.target.value)} className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-white outline-none focus:border-[#4D7CFE]"/>}</label>)}</div><div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between"><p className="text-xs text-emerald-400">{saved ? "Saved. Refresh the public site to see changes." : "Unsaved changes"}</p><button onClick={save} className="flex items-center gap-2 bg-[#4D7CFE] rounded-lg px-5 py-3 text-xs font-bold"><Save className="w-4 h-4"/> SAVE CHANGES</button></div></> : <div className="py-12 text-center text-sm text-gray-500">There are no cards in this collection. Add one to begin.</div>}</div></section></div></div></main>;
}
