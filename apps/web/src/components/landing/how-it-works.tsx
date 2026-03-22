'use client';

import { ScrollReveal } from './scroll-reveal';

const steps = [
  {
    title: 'Pick a challenge',
    description: 'Browse a growing library of challenge packs across frameworks and languages. Each pack builds on the one before it.',
  },
  {
    title: 'Write from a blank canvas',
    description: 'No starter code. No scaffolding. Write the implementation from scratch, the way you would on the job.',
  },
  {
    title: 'Get instant feedback',
    description: 'Tree-sitter AST analysis verifies your code structure in real time. Every assertion maps to a specific pattern.',
  },
];

export function HowItWorks() {
  return (
    <section>
      <ScrollReveal>
        <p className="eyebrow">Workflow</p>
        <h2 className="mt-4 font-sans text-[36px] font-normal leading-[1] tracking-[-1.44px] md:text-[48px]">
          Three steps to fluency
        </h2>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 0.15}>
            <div>
              <span className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-sans text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
