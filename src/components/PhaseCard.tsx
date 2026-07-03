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
    0: '/docs/foundations/overview',
    1: '/docs/linux-networking/overview',
    2: '/docs/git/overview',
    3: '/docs/programming/overview',
    4: '/docs/cloud/overview',
    5: '/docs/docker/overview',
    6: '/docs/cicd/overview',
    7: '/docs/kubernetes/overview',
    8: '/docs/terraform-ansible/overview',
    9: '/docs/gitops/overview',
    10: '/docs/devsecops/overview',
    11: '/docs/observability/overview',
    12: '/docs/ai-foundations/overview',
    13: '/docs/ai-agent-building/overview',
    14: '/docs/ai-rag-memory/overview',
    15: '/docs/ai-production/overview',
    16: '/docs/cloud-native-agents/overview',
    17: '/docs/career/overview',
    18: '/docs/ultra-pro/overview',
  };

  const path = docPaths[phase] || '/docs/foundations/overview';

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
