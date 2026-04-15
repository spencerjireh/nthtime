'use client';

import { Button } from '@/components/ui/button';
import type { SettingsPanelProps } from './settings-dialog';

interface IntroSettingsProps extends SettingsPanelProps {
  onClose: () => void;
}

export function IntroSettings({ onClose }: IntroSettingsProps) {
  const handleReplay = () => {
    try {
      localStorage.removeItem('nthtime:seen-boot');
    } catch {
      // ignore
    }
    onClose();
    // Full-page reload: `router.push('/')` is a no-op when already on `/`,
    // and `router.refresh()` re-fetches RSC data but preserves client
    // component state, which means `HomeDashboard`'s `useEffect` gate
    // never re-runs. A hard reload guarantees the boot re-mounts.
    setTimeout(() => {
      window.location.assign('/');
    }, 120);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Intro animation</h3>
        <p className="text-xs text-muted-foreground">
          The terminal boot sequence plays the first time you visit the home page. Replay it for a
          refresher or to test changes you&apos;re making.
        </p>
      </section>

      <section className="space-y-2">
        <Button variant="outline" onClick={handleReplay}>
          Replay intro
        </Button>
        <p className="text-xs text-muted-foreground">
          Clears the {`'nthtime:seen-boot'`} flag and reloads the home page.
        </p>
      </section>
    </div>
  );
}
