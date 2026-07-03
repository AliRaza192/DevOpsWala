import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight} from 'lucide-react';

interface PhaseCardProps {
  phase: number;
  title: string;
  description: string;
  group: string;
}

const groupAccents: Record<string, {dot: string; hover: string}> = {
  foundations: {dot: 'bg-blue-500', hover: 'group-hover:border-blue-500/40'},
  cloud: {dot: 'bg-cyan-500', hover: 'group-hover:border-cyan-500/40'},
  automation: {dot: 'bg-violet-500', hover: 'group-hover:border-violet-500/40'},
  security: {dot: 'bg-amber-500', hover: 'group-hover:border-amber-500/40'},
  ai: {dot: 'bg-purple-500', hover: 'group-hover:border-purple-500/40'},
  career: {dot: 'bg-emerald-500', hover: 'group-hover:border-emerald-500/40'},
};

export default function PhaseCard({phase, title, description, group}: PhaseCardProps): React.JSX.Element {
  const accent = groupAccents[group] || groupAccents.foundations;

  const docPaths: Record<number, string> = {
    0: '/docs/foundations/',
    1: '/docs/linux-networking/',
    2: '/docs/git/',
    3: '/docs/programming/',
    4: '/docs/cloud/',
    5: '/docs/docker/',
    6: '/docs/cicd/',
    7: '/docs/kubernetes/',
    8: '/docs/terraform-ansible/',
    9: '/docs/gitops/',
    10: '/docs/devsecops/',
    11: '/docs/observability/',
    12: '/docs/ai-foundations/',
    13: '/docs/ai-agent-building/',
    14: '/docs/ai-rag-memory/',
    15: '/docs/ai-production/',
    16: '/docs/cloud-native-agents/',
    17: '/docs/career/',
    18: '/docs/ultra-pro/',
  };

  const path = docPaths[phase] || '/docs/intro';

  return (
    <Link to={path} className="no-underline">
      <div className={`phase-card group ${accent.hover}`}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          <span className="text-[0.6875rem] font-medium tracking-wider uppercase text-[hsl(var(--muted-foreground))]">
            Phase {String(phase).padStart(2, '0')}
          </span>
        </div>
        <h3 className="text-sm font-semibold mb-1 text-[hsl(var(--foreground))] leading-snug">
          {title}
        </h3>
        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          {description}
        </p>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">
          Explore <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}
