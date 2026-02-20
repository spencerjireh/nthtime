'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsDialog } from './settings-dialog';

export function SettingsTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
      <SettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
