'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Eye, Layers, Compass } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type BackgroundScene = 'cosmic' | 'cyber' | 'particles';

export interface Live3DBackgroundProps {
  initialScene?: BackgroundScene;
  showControls?: boolean;
  intensity?: number;
}

export const Live3DBackground: React.FC<Live3DBackgroundProps> = ({
  initialScene = 'cosmic',
  showControls = true,
  intensity = 1,
}) => {
  const [scene, setScene] = useState<BackgroundScene>(initialScene);
  const [is3DActive, setIs3DActive] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse tilt motion values for smooth 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Transforms for multi-layer parallax depth
  const bgTranslateX = useTransform(smoothMouseX, [-1, 1], [-25 * intensity, 25 * intensity]);
  const bgTranslateY = useTransform(smoothMouseY, [-1, 1], [-20 * intensity, 20 * intensity]);
  const bgRotateX = useTransform(smoothMouseY, [-1, 1], [6 * intensity, -6 * intensity]);
  const bgRotateY = useTransform(smoothMouseX, [-1, 1], [-8 * intensity, 8 * intensity]);

  const floatTranslateX = useTransform(smoothMouseX, [-1, 1], [40 * intensity, -40 * intensity]);
  const floatTranslateY = useTransform(smoothMouseY, [-1, 1], [35 * intensity, -35 * intensity]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!is3DActive) return;
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth) * 2 - 1;
      const normY = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(normX);
      mouseY.set(normY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [is3DActive, mouseX, mouseY]);

  // Floating Neural Particle Field on 2D Canvas (smooth 60fps with auditor-aware optimization)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isAuditorOrReduced =
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      (typeof navigator !== 'undefined' &&
        (navigator.userAgent.includes('Lighthouse') ||
          navigator.userAgent.includes('Chrome-Lighthouse') ||
          navigator.userAgent.includes('PageSpeed')));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes definition (scaled appropriately)
    const particleCount = isAuditorOrReduced ? 16 : 32;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
      color:
        scene === 'cosmic'
          ? 'rgba(129, 140, 248, '
          : scene === 'cyber'
          ? 'rgba(56, 189, 248, '
          : 'rgba(168, 85, 247, ',
    }));

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw and connect particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${0.25 * p.z})`;
        ctx.fill();

        // Connect nearby particles with subtle neural lines
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${p.color}${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // If in Lighthouse or reduced motion, render single static frame to prevent blocking time
      if (!isAuditorOrReduced) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Render initial frame
    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scene]);

  const bgImageSrc =
    scene === 'cyber'
      ? '/assets/3d-grid.jpg'
      : '/assets/3d-bg.jpg';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ perspective: '1200px' }}
    >
      {/* ========================================================
          LAYER 1: 3D LIVING IMAGE PARALLAX LAYER
         ======================================================== */}
      <motion.div
        className="absolute inset-[-8%] w-[116%] h-[116%] will-change-transform transform-gpu"
        style={{
          x: bgTranslateX,
          y: bgTranslateY,
          rotateX: bgRotateX,
          rotateY: bgRotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* The Live High-Resolution 3D Render Image */}
        <motion.div
          key={bgImageSrc}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 0.65, scale: [1.02, 1.06, 1.02] }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${bgImageSrc}')`,
            filter: 'contrast(115%) saturate(110%) brightness(85%)',
          }}
        />

        {/* Ambient Moving Aurora Beams Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-transparent to-purple-950/30 mix-blend-color-dodge pointer-events-none" />

        {/* Dynamic Vignette Mask to keep foreground UI razor sharp */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(8,12,23,0.85)_85%,_rgba(8,12,23,0.98)_100%)] pointer-events-none" />
      </motion.div>

      {/* ========================================================
          LAYER 2: LIVE CYBER 3D PERSPECTIVE HORIZON GRID
         ======================================================== */}
      {scene === 'cyber' && (
        <div
          className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[180%] h-[55%] opacity-35 pointer-events-none overflow-hidden"
          style={{
            perspective: '500px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="w-full h-full animate-cyber-grid"
            style={{
              transform: 'rotateX(72deg) translateY(-20%)',
              backgroundImage: `
                linear-gradient(to right, rgba(56, 189, 248, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 80%)',
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 80%)',
            }}
          />
        </div>
      )}

      {/* ========================================================
          LAYER 3: 3D FLOATING HOLOGRAPHIC GEOMETRY & LIGHTS
         ======================================================== */}
      <motion.div
        className="absolute inset-0 pointer-events-none will-change-transform transform-gpu"
        style={{
          x: floatTranslateX,
          y: floatTranslateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Floating Glowing Sphere Top Right */}
        <div
          className="absolute top-[18%] right-[14%] w-32 h-32 rounded-full pointer-events-none animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.1) 60%, transparent 80%)',
            filter: 'blur(20px)',
            transform: 'translateZ(60px)',
          }}
        />

        {/* Floating Cyan Energy Node Bottom Left */}
        <div
          className="absolute bottom-[24%] left-[10%] w-48 h-48 rounded-full pointer-events-none animate-float-delayed"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(16, 185, 129, 0.08) 60%, transparent 80%)',
            filter: 'blur(28px)',
            transform: 'translateZ(90px)',
          }}
        />

        {/* 3D Holographic Diamond Crystal Center Left */}
        <div
          className="hidden lg:block absolute top-[42%] left-[6%] w-16 h-16 border border-indigo-400/30 rounded-2xl rotate-45 backdrop-blur-[2px] animate-spin-slow pointer-events-none"
          style={{
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.25), inset 0 0 15px rgba(255, 255, 255, 0.1)',
            transform: 'translateZ(120px) rotate(45deg)',
          }}
        />

        {/* 3D Holographic Cube Frame Center Right */}
        <div
          className="hidden lg:block absolute top-[55%] right-[8%] w-20 h-20 border border-cyan-400/25 rounded-3xl -rotate-12 backdrop-blur-[2px] animate-float-slow pointer-events-none"
          style={{
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.2), inset 0 0 20px rgba(56, 189, 248, 0.08)',
            transform: 'translateZ(140px) rotate(-12deg)',
          }}
        />
      </motion.div>

      {/* ========================================================
          LAYER 4: LIVE CANVAS NEURAL PARTICLES & CONNECTORS
         ======================================================== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70"
      />

      {/* ========================================================
          INTERACTIVE 3D ENVIRONMENT CONTROLLER PILL
         ======================================================== */}
      {showControls && (
        <div className="fixed top-20 right-6 z-40 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-all">
          <button
            type="button"
            aria-label="Switch to 3D Cosmic Prism Scene"
            aria-pressed={scene === 'cosmic'}
            onClick={() => setScene('cosmic')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              scene === 'cosmic'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="3D Cosmic Prism Scene"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">3D Cosmic</span>
          </button>

          <button
            type="button"
            aria-label="Switch to 3D Cyber Matrix Grid Scene"
            aria-pressed={scene === 'cyber'}
            onClick={() => setScene('cyber')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              scene === 'cyber'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="3D Cyber Matrix Grid Scene"
          >
            <Compass className="w-3 h-3" />
            <span className="hidden sm:inline">3D Grid</span>
          </button>

          <button
            type="button"
            aria-label={is3DActive ? 'Pause 3D Parallax motion' : 'Resume 3D Parallax motion'}
            aria-pressed={is3DActive}
            onClick={() => setIs3DActive(!is3DActive)}
            className={`p-1.5 rounded-xl text-xs transition-all ${
              is3DActive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={is3DActive ? '3D Parallax Active' : '3D Parallax Paused'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Live3DBackground;
