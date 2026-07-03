import React from 'react';
import Link from '@docusaurus/Link';

const levels = [
  {
    phase: '00-03',
    title: 'Foundations',
    subtitle: 'Beginner',
    description: 'Computer basics, Linux, Git, Python/Bash — sab kuch zero se.',
    color: 'bg-blue-500',
    border: 'border-blue-500/30',
    time: '6-8 weeks',
  },
  {
    phase: '04-07',
    title: 'Cloud & Containers',
    subtitle: 'Intermediate',
    description: 'AWS/Azure/GCP, Docker, CI/CD, Kubernetes — production ready bano.',
    color: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    time: '10-12 weeks',
  },
  {
    phase: '08-11',
    title: 'Automation & Security',
    subtitle: 'Advanced',
    description: 'Terraform, Ansible, GitOps, DevSecOps, Observability — scale karo.',
    color: 'bg-violet-500',
    border: 'border-violet-500/30',
    time: '8-10 weeks',
  },
  {
    phase: '12-16',
    title: 'Agentic AI',
    subtitle: 'Expert',
    description: 'LLMs, RAG, Multi-Agent, Production AI — future ready bano.',
    color: 'bg-purple-500',
    border: 'border-purple-500/30',
    time: '12-14 weeks',
  },
  {
    phase: '17-18',
    title: 'Career & Mastery',
    subtitle: 'Ultra-Pro',
    description: 'Certifications, Portfolio, System Design, Platform Engineering.',
    color: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    time: '4-6 weeks',
  },
];

export default function LearningJourney(): React.JSX.Element {
  return (
    <section className="py-16 md:py-20 border-t border-[hsl(var(--border))]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Aapka DevOps Journey
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
            Beginner se Ultra-Pro Expert tak — har level pe real skills milenge.
          </p>
        </div>

        <div className="space-y-4">
          {levels.map((level, i) => (
            <div
              key={level.phase}
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl border ${level.border} bg-[hsl(var(--card))] hover:shadow-md transition-all duration-200`}>
              {/* Level number */}
              <div className={`w-10 h-10 rounded-full ${level.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    {level.title}
                  </h3>
                  <span className="text-[0.625rem] font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                    {level.subtitle}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {level.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[0.6875rem] font-mono text-[hsl(var(--muted-foreground))]">
                  Phase {level.phase}
                </span>
                <span className="text-[0.6875rem] text-[hsl(var(--muted-foreground))]">
                  {level.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/docs/roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[hsl(var(--primary))] hover:opacity-90 text-white font-medium text-sm transition-all no-underline">
            Poora Roadmap Dekho
          </Link>
        </div>
      </div>
    </section>
  );
}
