'use client';

import { ScrollReveal } from './scroll-reveal';

const features = [
  {
    title: 'AST-Based Verification',
    description:
      'Tree-sitter parses your code into an abstract syntax tree and checks structural patterns -- not string matching, not regex.',
  },
  {
    title: 'Progressive Feedback',
    description:
      'Three levels of feedback: pass/fail badges, inline error highlights, and assertion-to-line mapping so you know exactly what to fix.',
  },
  {
    title: 'Multi-File Challenges',
    description:
      'Some patterns span multiple files. Challenges can require route handlers, middleware, and config -- each verified independently.',
  },
  {
    title: 'Full Monaco Editor',
    description:
      'The same editor that powers VS Code, with syntax highlighting, autocomplete, Emacs keybindings, and keyboard shortcuts.',
  },
  {
    title: 'Time Tracking',
    description:
      'Every attempt is timed automatically. Watch your speed improve as patterns become second nature.',
  },
  {
    title: 'Draft Autosave',
    description:
      'Work in progress is saved to local storage on every keystroke. Come back to exactly where you left off.',
  },
];

export function FeaturesGrid() {
  return (
    <section>
      <ScrollReveal>
        <p className="eyebrow">Features</p>
        <h2 className="mt-4 font-sans text-[36px] font-normal leading-[1] tracking-[-1.44px] md:text-[48px]">
          Built for deliberate practice
        </h2>
      </ScrollReveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((feature, index) => (
          <ScrollReveal key={feature.title} delay={index * 0.1}>
            <div className="rounded border border-border p-6">
              <span className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-sans text-lg">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
