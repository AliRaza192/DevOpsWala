import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight, Zap} from 'lucide-react';

export default function Hero(): React.JSX.Element {
  return (
    <section className="hero-section relative">
      <div className="max-w-[1140px] mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left — Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium mb-6 tracking-wide uppercase">
              <Zap size={12} className="text-amber-400" />
              <span>DevOps + Agentic AI Roadmap</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-5 text-white">
              THE DEVOPS
              <br />
              <span className="text-[#7fb7ff]">+ AI WALA</span>
            </h1>

            <p className="text-base md:text-lg max-w-xl mb-8 text-white/60 leading-relaxed">
              Computer basics se lekar Cloud Architect aur Agentic AI Engineer tak —
              19 phases, 95 incident scenarios, hands-on exercises, sab free.
              Roman Urdu mein, beginner se ultra-pro expert tak.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#4f91e2] hover:bg-[#3982dc] text-white font-medium text-sm transition-all no-underline"
                to="/docs/foundations/overview">
                START READING
                <ArrowRight size={14} />
              </Link>
              <Link
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 text-white/80 font-medium text-sm transition-all no-underline"
                to="/docs/roadmap">
                Explore Roadmap
              </Link>
            </div>

            {/* Stats inline */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10">
              <div>
                <div className="text-xl font-bold text-white">19</div>
                <div className="text-xs text-white/50">Phases</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">95+</div>
                <div className="text-xs text-white/50">Incident Scenarios</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">100%</div>
                <div className="text-xs text-white/50">Free</div>
              </div>
            </div>
          </div>

          {/* Right — Visual Card (like AgentFactory book cover) */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              {/* Main card */}
              <div className="w-[320px] rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl">
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">Phase Roadmap</div>
                <div className="space-y-2">
                  {[
                    {phase: '00-03', label: 'Foundations', color: 'bg-blue-500'},
                    {phase: '04-07', label: 'Cloud & Containers', color: 'bg-cyan-500'},
                    {phase: '08-09', label: 'Automation & GitOps', color: 'bg-violet-500'},
                    {phase: '10-11', label: 'Security & Observability', color: 'bg-amber-500'},
                    {phase: '12-16', label: 'Agentic AI', color: 'bg-purple-500'},
                    {phase: '17-18', label: 'Career & Mastery', color: 'bg-emerald-500'},
                  ].map((item) => (
                    <div key={item.phase} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs font-mono text-white/50 w-14">{item.phase}</span>
                      <span className="text-sm text-white/80">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <span className="text-xs text-white/40">Roman Urdu + English</span>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#4f91e2] text-white text-xs font-semibold shadow-lg">
                100% Free
              </div>
            </div>
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
