"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Landmark, Sprout, GraduationCap, Microscope, ShieldCheck, Factory, ShoppingCart, Zap, Truck, Phone, TreePine, Building2, Scale, Play, UserCheck, Home, Blocks, FlaskConical } from "lucide-react";

export default function Sectors() {
  const sectors = [
    { title: "Healthcare", icon: Activity, problem: "Data siloes impede accurate diagnoses.", benefits: "Privacy-preserving model fine-tuning.", revenue: "$240B potential size" },
    { title: "Banking", icon: Landmark, problem: "Rampant transaction fraud leaks capital.", benefits: "Real-time outlier network alerts.", revenue: "$180B potential size" },
    { title: "Agriculture", icon: Sprout, problem: "Erratic local crop yield yields.", benefits: "Localized soil & weather sensor models.", revenue: "$90B potential size" },
    { title: "Education", icon: GraduationCap, problem: "Rigid static course curricula.", benefits: "Dynamic personalized student models.", revenue: "$120B potential size" },
    { title: "Research", icon: Microscope, problem: "Slow empirical validation cycles.", benefits: "Automated simulation synthesis.", revenue: "$150B potential size" },
    { title: "Insurance", icon: ShieldCheck, problem: "High claim validation backlogs.", benefits: "Dynamic actuarial model assessment.", revenue: "$140B potential size" },
    { title: "Manufacturing", icon: Factory, problem: "Unplanned device system failures.", benefits: "Predictive asset lifecycle tracking.", revenue: "$165B potential size" },
    { title: "Retail", icon: ShoppingCart, problem: "Mismatched supply and demands.", benefits: "Dynamic predictive ordering pipelines.", revenue: "$210B potential size" },
    { title: "Energy", icon: Zap, problem: "Inefficient electrical distribution.", benefits: "Smart grid flow load prediction.", revenue: "$130B potential size" },
    { title: "Transportation", icon: Truck, problem: "Sub-optimal vehicle routes.", benefits: "Federated coordinate navigation.", revenue: "$115B potential size" },
    { title: "Telecom", icon: Phone, problem: "Bandwidth drop-offs during spikes.", benefits: "Dynamic cell router allocations.", revenue: "$95B potential size" },
    { title: "Environment", icon: TreePine, problem: "Delayed forest fire warning times.", benefits: "Sensor networks processing locally.", revenue: "$80B potential size" },
    { title: "Government", icon: Building2, problem: "High administrative filing friction.", benefits: "Automated document sorting pipelines.", revenue: "$175B potential size" },
    { title: "Legal", icon: Scale, problem: "Laborious document review cycles.", benefits: "Fast precedent search & matching.", revenue: "$85B potential size" },
    { title: "Media", icon: Play, problem: "Low context recommendations.", benefits: "Deep semantic interest vectoring.", revenue: "$110B potential size" },
    { title: "HR", icon: UserCheck, problem: "Out-of-date candidate reviews.", benefits: "Automated resume parsing/ranking.", revenue: "$70B potential size" },
    { title: "Real Estate", icon: Home, problem: "Mismatched property valuations.", benefits: "Predictive yield modeling indices.", revenue: "$105B potential size" },
    { title: "Supply Chain", icon: Blocks, problem: "Frequent port delivery backlogs.", benefits: "Consensus cargo routing vectors.", revenue: "$160B potential size" },
    { title: "Pharmaceuticals", icon: FlaskConical, problem: "Long molecular discovery timelines.", benefits: "Automated chemical screening loops.", revenue: "$225B potential size" },
  ];

  return (
    <section 
      className="relative min-h-screen py-24 flex flex-col items-center justify-center bg-[#020408] border-b border-white/5"
      id="sectors"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            APPLICATIONS
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            Sectors Empowered By AEGIS
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            Aegis provides specialized solutions tailored for global industries. Select a sector to view detailed infrastructure details.
          </motion.p>
        </div>

        {/* 19-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full mb-16">
          {sectors.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <motion.div
                key={sec.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
              >
                <Link
                  href={`/sectors/${sec.title.toLowerCase().replace(" ", "-")}`}
                  className="group block h-full glass-card p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-[#4D7CFE]/30 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(77,124,254,0.03)] hover:-translate-y-1"
                >
                  {/* Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-[#7DD3FC] flex items-center justify-center group-hover:bg-[#4D7CFE]/5 group-hover:text-white transition-all duration-300 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-white tracking-wider uppercase group-hover:text-[#7DD3FC] transition-colors duration-300">
                      {sec.title}
                    </h3>
                  </div>

                  {/* Details Spec Sheet */}
                  <div className="flex flex-col gap-2.5 text-left border-t border-white/5 pt-3">
                    <div>
                      <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase block mb-0.5">
                        PROBLEM
                      </span>
                      <p className="font-body text-[10px] text-gray-400 leading-normal font-light">
                        {sec.problem}
                      </p>
                    </div>
                    <div>
                      <span className="font-heading text-[8px] font-extrabold tracking-widest text-gray-500 uppercase block mb-0.5">
                        BENEFIT
                      </span>
                      <p className="font-body text-[10px] text-[#7DD3FC]/80 leading-normal font-light">
                        {sec.benefits}
                      </p>
                    </div>
                    <div>
                      <span className="font-heading text-[8px] font-extrabold tracking-widest text-[#4D7CFE] uppercase block">
                        REVENUE POTENTIAL
                      </span>
                      <p className="font-heading text-[10px] font-bold text-white tracking-wider">
                        {sec.revenue}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Learn More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/sectors"
            className="group inline-flex items-center gap-2 text-xs font-heading font-bold tracking-widest text-[#7DD3FC] hover:text-white transition-all duration-350"
          >
            LEARN MORE ABOUT ALL SECTORS
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
