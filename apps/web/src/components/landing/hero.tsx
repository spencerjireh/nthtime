'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './scroll-reveal';
import { EditorDemo } from './editor-demo';

export function Hero() {
  return (
    <section className="pt-16 md:pt-24">
      <ScrollReveal>
        <p className="eyebrow">Practice</p>
        <h1 className="mt-4 font-sans text-[36px] font-normal leading-[1] tracking-[-1.44px] md:text-[48px] lg:text-[60px] lg:tracking-[-2.88px]">
          Drill code patterns until they&apos;re muscle memory.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Write real implementations from scratch against AST-verified assertions. No
          multiple choice. No copy-paste. Just you, a blank editor, and the patterns that
          matter.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">
              Browse Challenges
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="mx-auto mt-16 max-w-[800px]">
          <EditorDemo />
        </div>
      </ScrollReveal>
    </section>
  );
}
