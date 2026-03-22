import { LandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'nthtime -- Drill code patterns until they are muscle memory',
  description:
    'Write real implementations from scratch against AST-verified assertions. No multiple choice. No copy-paste. Just you, a blank editor, and the patterns that matter.',
};

export default function Landing() {
  return <LandingPage />;
}
