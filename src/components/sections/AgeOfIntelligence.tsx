"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Metric {
  value: string;
  label: string;
}

interface Block {
  title: string;
  desc: string;
}

interface Topic {
  title: string;
  desc: string;
  href: string;
}

export default function AgeOfIntelligence() {
  const metrics: Metric[] = [
    { value: "100B+", label: "Connected Devices" },
    { value: "1T+", label: "Daily Decisions" },
    { value: "Infinite", label: "Knowledge Sources" },
    { value: "24/7", label: "Distributed Intelligence" }
  ];

  const blocks: Block[] = [
    { title: "INTELLIGENCE", desc: "Machines reason. Humans collaborate. Knowledge compounds." },
    { title: "CONNECTION", desc: "Networks matter more than isolated systems." },
    { title: "COORDINATION", desc: "The future belongs to systems capable of organizing intelligence." }
  ];

  const topics: Topic[] = [
    { title: "The Problem", desc: "Why current intelligence systems remain centralized.", href: "#problem" },
    { title: "Architecture", desc: "How intelligence can emerge through networks.", href: "#architecture" },
    { title: "Agent Ecosystem", desc: "Specialized intelligence working together.", href: "#agents" }
  ];

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1] as const // clean Apple ease-out
      }
    }
  };

  return (
    <section 
      id="age-of-intelligence" 
      className="relative min-h-[120vh] w-full flex flex-col justify-center bg-transparent py-48 overflow-hidden select-none border-b border-white/5"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        className="max-w-[80rem] mx-auto w-full px-6 md:px-12 flex flex-col gap-24 relative z-10"
      >
        
        {/* Section Header */}
        <motion.div variants={itemVariants} className="w-full text-left">
          <span className="font-heading text-xs font-bold tracking-[0.3em] text-[#4D7CFE] block mb-4 uppercase">
            THE AGE OF INTELLIGENCE
          </span>
          <p className="font-heading text-lg sm:text-xl text-gray-400 font-light max-w-2xl leading-relaxed">
            Human civilization is entering an era where intelligence itself becomes infrastructure.
          </p>
        </motion.div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 lg:gap-8 items-center w-full">
          
          {/* Left Column (60%) */}
          <motion.div variants={itemVariants} className="lg:col-span-6 flex flex-col gap-10 max-w-[700px]">
            <div className="flex flex-col gap-4">
              <span className="font-heading text-[10px] font-extrabold tracking-[0.25em] text-[#4D7CFE] uppercase">
                THE AGE OF INTELLIGENCE
              </span>
              <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.1] max-w-2xl">
                Intelligence Is Becoming<br />
                A Fundamental Layer<br />
                Of Civilization
              </h2>
            </div>

            <div className="flex flex-col gap-6 font-body text-[15px] sm:text-base text-gray-400 leading-relaxed font-light">
              <p>Electricity transformed industry.</p>
              <p>The internet transformed communication.</p>
              <p>Artificial intelligence transforms decision-making.</p>
              <p>The next infrastructure is not roads, cables, or data centers alone. It is intelligence itself.</p>
              <p>Every organization, institution, and individual is becoming part of an emerging intelligence network.</p>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 w-full">
              {metrics.map((m) => (
                <div 
                  key={m.label} 
                  className="flex flex-col gap-2 p-5 rounded-[32px] bg-white/[0.015] border border-white/[0.06] select-none text-left transition-colors duration-300 hover:border-white/10"
                >
                  <span className="font-heading text-2xl font-extrabold text-white tracking-tight">
                    {m.value}
                  </span>
                  <span className="font-body text-[10px] text-gray-500 font-light tracking-wide leading-normal">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column (40%) */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-4 flex items-center justify-center w-full relative min-h-[380px]"
          >
            <IntelligenceSphere />
          </motion.div>

        </div>

        {/* Horizontal Blocks */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-16 w-full"
        >
          {blocks.map((b) => (
            <div key={b.title} className="flex flex-col gap-3 text-left">
              <h3 className="font-heading font-bold text-xs tracking-[0.3em] text-[#4D7CFE] uppercase">
                {b.title}
              </h3>
              <p className="font-body text-[13.5px] sm:text-sm text-gray-400 font-light leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Related Topics Exploration */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col gap-8 items-center text-center mt-8 w-full"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-heading text-[10px] font-bold tracking-[0.4em] text-gray-500 uppercase">
              Continue Exploring
            </span>
            <span className="text-gray-600 text-sm animate-bounce">↓</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
            {topics.map((t) => (
              <Link 
                key={t.title} 
                href={t.href} 
                className="group flex flex-col gap-2 text-center py-4 px-6 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all duration-300"
              >
                <span className="font-heading text-xs font-bold text-[#7DD3FC] group-hover:text-white transition-colors uppercase tracking-wider">
                  {t.title}
                </span>
                <span className="font-body text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors font-light leading-normal">
                  {t.desc}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}

function IntelligenceSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 360;
    let height = 360;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    interface Point3D {
      x: number;
      y: number;
      z: number;
      px: number;
      py: number;
    }

    const points: Point3D[] = [];
    const numPoints = 85;
    const sphereRadius = 135;

    // Generate points uniformly distributed on sphere surface
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      points.push({
        x: sphereRadius * Math.sin(phi) * Math.cos(theta),
        y: sphereRadius * Math.sin(phi) * Math.sin(theta),
        z: sphereRadius * Math.cos(phi),
        px: 0,
        py: 0
      });
    }

    // Parallax mouse variables
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;
      targetMouseX = (e.clientX - canvasCenterX) / window.innerWidth;
      targetMouseY = (e.clientY - canvasCenterY) / window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Rotation angles per frame
    const rotY = 0.0018;
    const rotX = 0.0006;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const sphereCenterX = width / 2 + mouseX * 35;
      const sphereCenterY = height / 2 + mouseY * 35;

      // Cosine and Sine coefficients for rotations
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Rotate and Project points
      points.forEach((pt) => {
        // Y-axis rotation
        const x1 = pt.x * cosY - pt.z * sinY;
        const z1 = pt.z * cosY + pt.x * sinY;

        // X-axis rotation
        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + pt.y * sinX;

        pt.x = x1;
        pt.y = y2;
        pt.z = z2;

        // Perspective divide
        const fov = 350;
        const scale = fov / (fov + pt.z);
        pt.px = pt.x * scale + sphereCenterX;
        pt.py = pt.y * scale + sphereCenterY;
      });

      // Render connections (Thin lines)
      ctx.lineWidth = 0.65;
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          // Check 3D distance
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 80) {
            // Distance opacity factor
            const distFactor = (80 - dist) / 80;
            // Depth opacity factor (so background lines are fainter)
            const depthFactor = (1 - (p1.z + p2.z) / (sphereRadius * 2)) * 0.5;
            
            // Faint blue line - max brightness 10% (opacity 0.08)
            const opacity = distFactor * depthFactor * 0.08;
            if (opacity > 0) {
              ctx.strokeStyle = `rgba(77, 124, 254, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }

      // Render points
      points.forEach((pt) => {
        // Size scales slightly with depth (z: -sphereRadius is front, +sphereRadius is back)
        const sizeFactor = (1.5 - pt.z / sphereRadius) * 0.8;
        const size = Math.max(0.4, sizeFactor);
        
        // Depth opacity
        const depthOpacity = (1.2 - pt.z / sphereRadius) * 0.4;
        // Faint blue/white dot - max opacity 0.1
        const opacity = Math.min(0.1, depthOpacity * 0.08);

        ctx.fillStyle = `rgba(125, 211, 252, ${opacity})`;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-[360px] h-[360px] flex items-center justify-center">
      {/* Very faint soft glow in center of sphere background */}
      <div 
        className="absolute inset-0 w-full h-full rounded-full opacity-[0.03] blur-[40px] pointer-events-none animate-pulse" 
        style={{
          background: "radial-gradient(circle, rgba(77, 124, 254, 0.4) 0%, rgba(77, 124, 254, 0) 70%)",
          animationDuration: "8s"
        }}
      />
      <canvas ref={canvasRef} className="relative z-10 pointer-events-none" />
    </div>
  );
}
