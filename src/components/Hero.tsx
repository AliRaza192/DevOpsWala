import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight, Zap} from 'lucide-react';

export default function Hero(): React.JSX.Element {
  return (
    <section className="hero-section relative">
      <div className="max-w-[1140px] mx-auto px-6 py-20 md:py-24">
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium mb-6 tracking-wide uppercase">
            <Zap size={12} className="text-amber-400" />
            <span>DevOps + Agentic AI Roadmap</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-5 text-white">
            DevOps + AI Roadmap
            <br />
            <span className="text-[#7fb7ff]">Roman Urdu Mein</span>
          </h1>

          <p className="text-base md:text-lg max-w-2xl mx-auto mb-8 text-white/60 leading-relaxed">
            Computer basics se lekar Cloud Architect aur Agentic AI Engineer tak —
            19 phases, 95 incident scenarios, hands-on exercises, sab free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#4f91e2] hover:bg-[#3982dc] text-white font-medium text-sm transition-all no-underline"
              to="/docs/foundations/">
              Shuru Karo — Phase 0
              <ArrowRight size={14} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 text-white/80 font-medium text-sm transition-all no-underline"
              to="/docs/roadmap">
              Poora Roadmap Dekho
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </section>
  );
}
