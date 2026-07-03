import React from 'react';
import Layout from '@theme/Layout';
import Hero from '../components/Hero';
import WhyLearn from '../components/WhyLearn';
import ComparisonTable from '../components/ComparisonTable';
import LearningJourney from '../components/LearningJourney';
import CareerPaths from '../components/CareerPaths';

const comparisonRows = [
  {feature: 'Focus', colA: 'Sirf Agentic AI', colB: 'DevOps + AI Merged'},
  {feature: 'Language', colA: 'English', colB: 'Roman Urdu + English'},
  {feature: 'Incident Scenarios', colA: false, colB: true},
  {feature: 'Hands-on Exercises', colA: true, colB: true},
  {feature: 'Cloud Coverage (AWS/Azure/GCP)', colA: false, colB: true},
  {feature: 'Career Guidance', colA: 'Limited', colB: 'Full (Phase 17)'},
  {feature: 'Target Audience', colA: 'AI Developers', colB: 'DevOps + AI Engineers'},
  {feature: 'Price', colA: 'Paid Courses', colB: '100% Free'},
  {feature: 'Time to Complete', colA: 'Varies', colB: '~40 Weeks Structured'},
  {feature: 'Real-world Projects', colA: false, colB: true},
];

export default function Home(): React.JSX.Element {
  return (
    <Layout
      title="DevOps + Agentic AI Roadmap"
      description="DevOps + Agentic AI merged roadmap — Phase 0 se Ultra-Pro Expert tak, Roman Urdu mein. 19 phases, 95 incident scenarios, 100% free.">
      <Hero />
      <WhyLearn />

      {/* Comparison Table */}
      <section className="py-16 md:py-20 border-t border-[hsl(var(--border))]">
        <div className="max-w-[900px] mx-auto px-6">
          <ComparisonTable
            title="Traditional Learning vs DevOps Wala"
            colAHeader="Traditional"
            colBHeader="DevOps Wala"
            rows={comparisonRows}
          />
        </div>
      </section>

      <LearningJourney />
      <CareerPaths />

      {/* CTA */}
      <section className="py-16 md:py-20 text-center border-t border-[hsl(var(--border))]">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Ab Se Shuru Karo
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-md mx-auto">
            Phase 0 se start karo. Koi registration nahi, koi payment nahi —
            seedha padho aur hands-on karo.
          </p>
          <a
            href="/docs/foundations/overview"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[hsl(var(--primary))] hover:opacity-90 text-white font-medium text-sm transition-all no-underline">
            START READING
          </a>
        </div>
      </section>
    </Layout>
  );
}
