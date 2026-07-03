import React from 'react';
import Layout from '@theme/Layout';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import PhaseCard from '../components/PhaseCard';
import ComparisonTable from '../components/ComparisonTable';

const phases = [
  {phase: 0, title: 'Computer & Mindset Foundations', description: 'Computer basics, AI-era mindset, typing speed, file systems.', group: 'foundations'},
  {phase: 1, title: 'Linux + Networking + Terminal', description: 'Linux filesystem, shell scripting, networking, troubleshooting.', group: 'foundations'},
  {phase: 2, title: 'Git & Version Control', description: 'Branching, merging, PRs, Git workflows, conflict resolution.', group: 'foundations'},
  {phase: 3, title: 'Programming: Python + Bash', description: 'Type-driven Python, Bash scripting, YAML, testing, automation.', group: 'foundations'},
  {phase: 4, title: 'Cloud Fundamentals (AWS + Azure + GCP)', description: 'IAM, EC2, VPC, S3, Lambda, Azure DevOps, GCP awareness.', group: 'cloud'},
  {phase: 5, title: 'Docker & Containers', description: 'Dockerfile, Compose, multi-stage builds, registries.', group: 'cloud'},
  {phase: 7, title: 'Kubernetes + Helm', description: 'Pods, Deployments, Services, Helm charts, RBAC, HPA.', group: 'cloud'},
  {phase: 6, title: 'CI/CD: GitHub Actions + Azure DevOps', description: 'Pipelines, secret management, automated testing, deployments.', group: 'automation'},
  {phase: 8, title: 'Terraform + Ansible', description: 'IaC modules, remote state, playbooks, idempotency.', group: 'automation'},
  {phase: 9, title: 'GitOps + ArgoCD', description: 'Git as source of truth, ArgoCD sync, progressive delivery.', group: 'automation'},
  {phase: 10, title: 'DevSecOps', description: 'Trivy, SBOM, Kyverno, secret scanning, pipeline security.', group: 'security'},
  {phase: 11, title: 'Observability + SRE + AIOps', description: 'Prometheus, Grafana, OpenTelemetry, SLO/SLA, chaos engineering.', group: 'security'},
  {phase: 12, title: 'Agentic AI: Foundations', description: 'LLMs, prompt engineering, spec-driven development, context engineering.', group: 'ai'},
  {phase: 13, title: 'Agentic AI: Agent Building', description: 'LangGraph, OpenAI SDK, MCP, Google ADK, tool calling.', group: 'ai'},
  {phase: 14, title: 'Agentic AI: RAG, Memory, Multi-Agent', description: 'Vector DBs, pgvector, agent memory, A2A orchestration.', group: 'ai'},
  {phase: 15, title: 'Agentic AI: Production & Digital FTEs', description: 'Eval-driven dev, guardrails, payment agents, cost tracking.', group: 'ai'},
  {phase: 16, title: 'Cloud-Native Agent Deployment', description: 'Agents on K8s, event-driven architecture, BullMQ, CI/CD for AI.', group: 'ai'},
  {phase: 17, title: 'Career, Certification & Portfolio', description: 'Free certs, portfolio strategy, interview prep, monetization.', group: 'career'},
  {phase: 18, title: 'Ultra-Pro Expert Track', description: 'System design, chaos engineering, FinOps, platform engineering.', group: 'career'},
];

const comparisonRows = [
  {feature: 'Focus', colA: 'Sirf Agentic AI', colB: 'DevOps + AI Merged'},
  {feature: 'Language', colA: 'English', colB: 'Roman Urdu + English'},
  {feature: 'Incident Scenarios', colA: false, colB: true},
  {feature: 'Hands-on Exercises', colA: true, colB: true},
  {feature: 'Cloud Coverage (AWS/Azure/GCP)', colA: false, colB: true},
  {feature: 'Career Guidance', colA: 'Limited', colB: 'Full (Phase 17)'},
  {feature: 'Target Audience', colA: 'AI Developers', colB: 'DevOps + AI Engineers'},
  {feature: 'Price', colA: 'Paid Courses', colB: '100% Free'},
];

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="DevOps + Agentic AI Roadmap"
      description="DevOps + Agentic AI merged roadmap — Phase 0 se Ultra-Pro Expert tak, Roman Urdu mein. 19 phases, 95 incident scenarios, 100% free.">
      <Hero />
      <StatsBar />

      {/* Phases Grid */}
      <section className="py-14 md:py-16">
        <div className="max-w-[1140px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              19 Phases — Beginner se Architect tak
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
              Har phase ek complete learning unit hai — concept, hands-on, checkpoint, aur real-world incidents.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {phases.map((p) => (
              <PhaseCard key={p.phase} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-14 md:py-16 border-t border-[hsl(var(--border))]">
        <div className="max-w-[900px] mx-auto px-6">
          <ComparisonTable
            title="Traditional Learning vs DevOps Wala"
            colA="Traditional"
            colB="DevOps Wala"
            rows={comparisonRows}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-16 text-center border-t border-[hsl(var(--border))]">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Ab Se Shuru Karo
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-md mx-auto">
            Phase 0 se start karo. Koi registration nahi, koi payment nahi —
            seedha padho aur hands-on karo.
          </p>
          <a
            href="/docs/foundations/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[hsl(var(--primary))] hover:opacity-90 text-white font-medium text-sm transition-all no-underline">
            Phase 0 Shuru Karo
          </a>
        </div>
      </section>
    </Layout>
  );
}
