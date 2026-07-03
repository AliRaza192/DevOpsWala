import React from 'react';
import {BookOpen, Code, Cloud, Shield, Briefcase, Gift} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Roman Urdu Mein',
    description: 'Computer science ki samajh apni zuban mein. English aur Roman Urdu — dono ke saath.',
    tag: 'Language',
  },
  {
    icon: Shield,
    title: '95+ Incident Scenarios',
    description: 'Real-world production incidents — Kubernetes crashes se lekar cloud outages tak.',
    tag: 'Practice',
  },
  {
    icon: Code,
    title: 'Hands-on Exercises',
    description: 'Har phase ke saath practical exercises. Sirf theory nahi — code karo, deploy karo.',
    tag: 'Practical',
  },
  {
    icon: Cloud,
    title: 'Cloud Coverage (AWS/Azure/GCP)',
    description: 'Teenon major clouds ka coverage — AWS, Azure, GCP. Multi-cloud strategy seekho.',
    tag: 'Cloud',
  },
  {
    icon: Briefcase,
    title: 'Career Roadmap',
    description: 'Free certifications, portfolio strategy, interview prep, aur monetization tips.',
    tag: 'Career',
  },
  {
    icon: Gift,
    title: '100% Free',
    description: 'Koi registration nahi, koi payment nahi — seedha padho aur hands-on karo.',
    tag: 'Price',
  },
];

export default function WhyLearn(): React.JSX.Element {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Kyun Padho?
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
            DevOps Wala kya alag karta hai — ye 6 pillars hain jo ise special banate hain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                    <Icon size={18} className="text-[hsl(var(--primary))]" />
                  </div>
                  <span className="text-[0.625rem] font-medium tracking-wider uppercase text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))]">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1.5 text-[hsl(var(--foreground))]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
