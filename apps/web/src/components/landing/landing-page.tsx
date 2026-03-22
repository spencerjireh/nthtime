'use client';

import { Hero } from './hero';
import { FeaturesGrid } from './features-grid';
import { HowItWorks } from './how-it-works';
import { LandingCta } from './landing-cta';

export function LandingPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-9">
      <Hero />
      <div className="mt-[120px]">
        <FeaturesGrid />
      </div>
      <div className="mt-[120px]">
        <HowItWorks />
      </div>
      <div className="mt-[120px]">
        <LandingCta />
      </div>
    </div>
  );
}
