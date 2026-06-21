"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  speedY: number;
  speedX: number;
  depth: number; // 0 = far, 1 = mid, 2 = near
}

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    
    // Config counts
    const countFar = 1200;
    const countMid = 120;
    const countNear = 20;

    // Parallax state
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const initStars = (width: number, height: number) => {
      stars = [];

      // 1. Far background stars: tiny, static, white/faint blue, negligible movement
      for (let i = 0; i < countFar; i++) {
        const isBlue = Math.random() < 0.08;
        const color = isBlue ? "173, 216, 230" : "255, 255, 255";
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 0.6 + 0.15,
          color,
          opacity: Math.random() * 0.4 + 0.05,
          speedY: Math.random() * 0.003 + 0.001, // extremely slow drifting
          speedX: (Math.random() - 0.5) * 0.001,
          depth: 0
        });
      }

      // 2. Middle depth particles: slow drifting, 20% opacity
      for (let i = 0; i < countMid; i++) {
        const isBlue = Math.random() < 0.12;
        const color = isBlue ? "125, 211, 252" : "255, 255, 255";
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 0.9 + 0.4,
          color,
          opacity: 0.20, // fixed 20% opacity as requested
          speedY: Math.random() * 0.04 + 0.01,
          speedX: (Math.random() - 0.5) * 0.015,
          depth: 1
        });
      }

      // 3. Near particles: very sparse, slightly brighter, high parallax
      for (let i = 0; i < countNear; i++) {
        const isBlue = Math.random() < 0.15;
        const color = isBlue ? "125, 211, 252" : "255, 255, 255";
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.8,
          color,
          opacity: Math.random() * 0.25 + 0.25, // 0.25 to 0.50 opacity
          speedY: Math.random() * 0.08 + 0.03,
          speedX: (Math.random() - 0.5) * 0.03,
          depth: 2
        });
      }
    };

    const resizeCanvas = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
      initStars(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse positions relative to screen center (-0.5 to 0.5)
      targetMouseX = (e.clientX / window.innerWidth) - 0.5;
      targetMouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    const draw = () => {
      if (!canvas || !ctx) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for parallax movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      stars.forEach((star) => {
        // Calculate parallax displacement based on depth layer
        let parallaxX = 0;
        let parallaxY = 0;

        if (star.depth === 0) {
          // Far background
          parallaxX = mouseX * 8;
          parallaxY = mouseY * 8;
        } else if (star.depth === 1) {
          // Middle depth
          parallaxX = mouseX * 24;
          parallaxY = mouseY * 24;
        } else {
          // Near particles
          parallaxX = mouseX * 52;
          parallaxY = mouseY * 52;
        }

        // Apply base drift speed
        star.y += star.speedY;
        star.x += star.speedX;

        // Wrap around screen edges
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        } else if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        if (star.x > width) {
          star.x = 0;
          star.y = Math.random() * height;
        } else if (star.x < 0) {
          star.x = width;
          star.y = Math.random() * height;
        }

        // Draw star
        const drawX = star.x + parallaxX;
        const drawY = star.y + parallaxY;

        ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    
    resizeCanvas();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
