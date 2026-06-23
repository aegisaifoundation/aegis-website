"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { useGeneralContent } from "@/config/generalContent";
import { addNodeRequest } from "@/config/adminSubmissions";

export default function JoinNetwork() {
  const { joinNetwork } = useGeneralContent();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    institution: "",
    role: "Developer",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = ["Student", "Researcher", "Developer", "Partner", "Investor", "Contributor"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setLoading(true);
    // Persist request to admin dashboard
    addNodeRequest({
      name: formData.name,
      email: formData.email,
      country: formData.country,
      institution: formData.institution,
      role: formData.role,
    });

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const getSuccessDesc = () => {
    const desc = joinNetwork.successDesc || "Thank you, {name}. Our coordination aggregators will review your node request for {institution} and contact you soon.";
    return desc
      .replace("{name}", formData.name)
      .replace("{institution}", formData.institution || "independent deployment");
  };

  return (
    <section 
      className="relative min-h-screen py-40 flex flex-col items-center justify-center bg-transparent border-b border-white/5 overflow-hidden"
      id="join"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(77,124,254,0.02)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] mb-4 block uppercase"
          >
            {joinNetwork.badge}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight"
          >
            {joinNetwork.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-gray-400 font-light leading-relaxed"
          >
            {joinNetwork.description}
          </motion.p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 glass-card p-8 md:p-10 rounded-[32px] border border-white/6 bg-[rgba(255,255,255,0.015)]"
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Name */}
                <div className="flex flex-col items-start gap-2">
                  <label htmlFor="name" className="font-heading text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 input-glass border border-white/10 rounded-xl font-body text-sm text-white focus:outline-none focus:border-[#4D7CFE] transition-all duration-300 placeholder:text-gray-600"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col items-start gap-2">
                  <label htmlFor="email" className="font-heading text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3.5 input-glass border border-white/10 rounded-xl font-body text-sm text-white focus:outline-none focus:border-[#4D7CFE] transition-all duration-300 placeholder:text-gray-600"
                    placeholder="you@institution.org"
                  />
                </div>

                {/* Country and Institution row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col items-start gap-2">
                    <label htmlFor="country" className="font-heading text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3.5 input-glass border border-white/10 rounded-xl font-body text-sm text-white focus:outline-none focus:border-[#4D7CFE] transition-all duration-300 placeholder:text-gray-600"
                      placeholder="e.g. United States"
                    />
                  </div>
                  
                  <div className="flex flex-col items-start gap-2">
                    <label htmlFor="institution" className="font-heading text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Institution
                    </label>
                    <input
                      type="text"
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full px-4 py-3.5 input-glass border border-white/10 rounded-xl font-body text-sm text-white focus:outline-none focus:border-[#4D7CFE] transition-all duration-300 placeholder:text-gray-600"
                      placeholder="e.g. Stanford University"
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div className="flex flex-col items-start gap-2">
                  <label htmlFor="role" className="font-heading text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Role Category
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3.5 input-glass border border-white/10 rounded-xl font-body text-sm text-white focus:outline-none focus:border-[#4D7CFE] transition-all duration-300 cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 font-heading font-semibold text-xs tracking-widest text-white bg-gradient-to-r from-[#4D7CFE] to-[#00a8ff] px-8 py-4.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(77,124,254,0.35)] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    "PROV_SUBMISSION_ACTIVE..."
                  ) : (
                    <>
                      {joinNetwork.submitText}
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-xl text-white tracking-wider mb-3">
                  {joinNetwork.successTitle}
                </h3>
                <p className="font-body text-sm text-gray-400 font-light leading-relaxed max-w-sm mb-8">
                  {getSuccessDesc()}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="group flex items-center justify-center gap-2 font-heading font-semibold text-[10px] tracking-widest text-white border border-white/10 hover:border-white/20 bg-transparent hover:bg-white/5 px-6 py-3 rounded-full transition-all duration-350"
                >
                  SUBMIT ANOTHER
                  <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
