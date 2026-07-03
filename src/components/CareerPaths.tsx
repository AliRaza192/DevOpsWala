import React from 'react';
import {Server, Cloud, Shield, Brain} from 'lucide-react';

const paths = [
  {
    icon: Server,
    title: 'DevOps Engineer',
    salary: '$80K - $150K',
    skills: ['Linux', 'Docker', 'K8s', 'CI/CD', 'Terraform'],
    phases: 'Phase 0-11',
    color: 'bg-cyan-500',
  },
  {
    icon: Cloud,
    title: 'Cloud Architect',
    salary: '$120K - $200K',
    skills: ['AWS/Azure/GCP', 'IaC', 'Networking', 'Security'],
    phases: 'Phase 4-11',
    color: 'bg-blue-500',
  },
  {
    icon: Shield,
    title: 'DevSecOps Engineer',
    salary: '$100K - $170K',
    skills: ['Trivy', 'SBOM', 'Kyverno', 'Secret Scanning'],
    phases: 'Phase 10-11',
    color: 'bg-amber-500',
  },
  {
    icon: Brain,
    title: 'AI/ML Platform Engineer',
    salary: '$130K - $250K',
    skills: ['LangGraph', 'RAG', 'MLOps', 'Agent Systems'],
    phases: 'Phase 12-16',
    color: 'bg-purple-500',
  },
];

export default function CareerPaths(): React.JSX.Element {
  return (
    <section className="py-16 md:py-20 border-t border-[hsl(var(--border))]">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Career Paths Jo Ban Sakte Ho
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
            Ye roadmap complete karne ke baad ye career paths open honge — salary data US market ke hisaab se.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.title}
                className="group p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:shadow-lg transition-all duration-200">
                <div className={`w-10 h-10 rounded-lg ${path.color} flex items-center justify-center mb-4`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold mb-1 text-[hsl(var(--foreground))]">
                  {path.title}
                </h3>
                <div className="text-lg font-bold text-[hsl(var(--primary))] mb-3">
                  {path.salary}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {path.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[0.625rem] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-[0.6875rem] text-[hsl(var(--muted-foreground))]">
                  {path.phases}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
