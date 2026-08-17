"use client";

import { sectionCatalog, DashboardView, WorkflowType } from "./sectionCatalog";
import { Plus, ArrowRight } from "lucide-react";
import { PendingRequest } from "./DashboardContext";

export default function SectionPage({
  section,
  onOpenWorkflow,
  userRequests,
}: {
  section: (typeof sectionCatalog)[Exclude<DashboardView, "dashboard" | "settings" | "my-nodes">];
  onOpenWorkflow: (workflow: WorkflowType) => void;
  userRequests: PendingRequest[];
}) {
  const Icon = section.icon;

  return (
    <div className="bg-[#0d111a] text-white p-8 rounded-3xl border border-white/[0.08] shadow-inner space-y-5">
      <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-violet-300">{section.eyebrow}</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white">{section.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{section.description}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenWorkflow(section.workflow as any)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-400 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {section.primaryAction}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {section.filters.map((filter, index) => (
            <button
              key={filter}
              className={`rounded-full border border-white/[0.08] px-3.5 py-1.5 text-xs transition-colors cursor-pointer ${
                index === 0 ? "bg-white/[0.055] text-white" : "text-slate-400 hover:border-violet-300/30 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {section.cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <article key={card.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:bg-white/[0.045]">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
                  <CardIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-sm font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-[11px] text-slate-500">{card.meta}</p>
                  <p className="mt-3 text-xs leading-5 text-slate-400">{card.description}</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-400 cursor-pointer">
                    {card.action}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
        <h2 className="font-heading text-sm font-semibold text-white">Item Records</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-white/[0.08]">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Details</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {section.table.map((row) => (
                <tr key={row.name} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-3 font-semibold text-white">{row.name}</td>
                  <td className="px-3 py-3">{row.detail}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-violet-500/12 px-2.5 py-1 text-[10px] text-violet-200">{row.status}</span>
                  </td>
                  <td className="px-3 py-3">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
