'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from './scroll-reveal';

export function LandingCta() {
  return (
    <section className="border-t border-border pb-[120px] pt-[120px] text-center">
      <ScrollReveal>
        <h2 className="font-sans text-[36px] font-normal leading-[1] tracking-[-1.44px] md:text-[48px]">
          Start drilling
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          New challenge packs added regularly across frameworks and languages.
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
    </section>
  );
}
