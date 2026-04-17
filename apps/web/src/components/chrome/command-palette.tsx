'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Box,
  Clock,
  Languages,
  LogIn,
  LogOut,
  Moon,
  PenLine,
  Shuffle,
  Sun,
  Target,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useAuthSession } from '@/hooks/use-auth-session';
import { usePackList } from '@/hooks/use-packs';
import { authorPacksHref, packHref } from '@/lib/routes';
import { useRecentlyVisited } from '@/hooks/use-recently-visited';
import { useTrackList } from '@/hooks/use-tracks';
import { isFeatureEnabled } from '@/lib/feature-flags';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LANGUAGE_FILTERS: readonly {
  label: string;
  language: string;
}[] = [
  { label: 'JavaScript', language: 'javascript' },
  { label: 'TypeScript', language: 'typescript' },
  { label: 'Python', language: 'python' },
];

const DIFFICULTY_FILTERS: readonly {
  label: string;
  difficulty: string;
}[] = [
  { label: 'Beginner', difficulty: 'beginner' },
  { label: 'Intermediate', difficulty: 'intermediate' },
  { label: 'Advanced', difficulty: 'advanced' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { status: authStatus } = useAuthSession();
  const authEnabled = isFeatureEnabled('auth');

  const { tracks } = useTrackList();
  const { packs } = usePackList({});
  const { entries: recentEntries, record: recordRecent } = useRecentlyVisited();

  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) setValue('');
  }, [open]);

  const runCommand = useCallback(
    (fn: () => void) => {
      onOpenChange(false);
      // Defer to the next tick so the dialog close animation doesn't fight
      // with the navigation / state update.
      setTimeout(fn, 0);
    },
    [onOpenChange],
  );

  const navigateTo = useCallback(
    (href: string, entry?: Parameters<typeof recordRecent>[0]) => {
      if (entry) recordRecent(entry);
      router.push(href);
    },
    [router, recordRecent],
  );

  const sortedPacks = useMemo(
    () => [...packs].sort((a, b) => a.name.localeCompare(b.name)),
    [packs],
  );
  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => a.title.localeCompare(b.title)),
    [tracks],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
    >
      <CommandInput
        placeholder="Search packs, tracks, and actions..."
        value={value}
        onValueChange={setValue}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        {recentEntries.length > 0 && (
          <CommandGroup heading="Recently visited">
            {recentEntries.map((entry) => (
              <CommandItem
                key={entry.href}
                value={`recent ${entry.label}`}
                onSelect={() => runCommand(() => navigateTo(entry.href))}
              >
                <Clock aria-hidden />
                <span>{entry.label}</span>
                <CommandShortcut>{entry.kind}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Tracks">
          {sortedTracks.map((track) => (
            <CommandItem
              key={track.slug}
              value={`track ${track.title} ${track.tags.join(' ')}`}
              onSelect={() =>
                runCommand(() =>
                  navigateTo(`/tracks/${track.slug}`, {
                    kind: 'track',
                    label: track.title,
                    href: `/tracks/${track.slug}`,
                  }),
                )
              }
            >
              <Target aria-hidden />
              <span>{track.title}</span>
              <CommandShortcut>{track.packCount} packs</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Packs">
          {sortedPacks.map((pack) => (
            <CommandItem
              key={pack.slug}
              value={`pack ${pack.name} ${pack.language} ${pack.tags.join(' ')}`}
              onSelect={() =>
                runCommand(() =>
                  navigateTo(packHref(pack.slug), {
                    kind: 'pack',
                    label: pack.name,
                    href: packHref(pack.slug),
                  }),
                )
              }
            >
              <Box aria-hidden />
              <span>{pack.name}</span>
              <CommandShortcut>{pack.language}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Filters">
          {LANGUAGE_FILTERS.map((filter) => (
            <CommandItem
              key={`lang-${filter.language}`}
              value={`filter language ${filter.label}`}
              onSelect={() =>
                runCommand(() => navigateTo(`/?language=${filter.language}`))
              }
            >
              <Languages aria-hidden />
              <span>Language: {filter.label}</span>
            </CommandItem>
          ))}
          {DIFFICULTY_FILTERS.map((filter) => (
            <CommandItem
              key={`diff-${filter.difficulty}`}
              value={`filter difficulty ${filter.label}`}
              onSelect={() =>
                runCommand(() =>
                  navigateTo(`/?difficulty=${filter.difficulty}`),
                )
              }
            >
              <Target aria-hidden />
              <span>Difficulty: {filter.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="action random challenge"
            onSelect={() => runCommand(() => navigateTo('/random'))}
          >
            <Shuffle aria-hidden />
            <span>Random challenge</span>
          </CommandItem>
          <CommandItem
            value="action theme light"
            onSelect={() => runCommand(() => setTheme('light'))}
          >
            <Sun aria-hidden />
            <span>Theme: Light</span>
          </CommandItem>
          <CommandItem
            value="action theme dark"
            onSelect={() => runCommand(() => setTheme('dark'))}
          >
            <Moon aria-hidden />
            <span>Theme: Dark</span>
          </CommandItem>
          {authEnabled && authStatus === 'authenticated' && (
            <>
              <CommandItem
                value="action author tools"
                onSelect={() => runCommand(() => navigateTo(authorPacksHref()))}
              >
                <PenLine aria-hidden />
                <span>Author tools</span>
              </CommandItem>
              <CommandItem
                value="action sign out"
                onSelect={() =>
                  runCommand(() => {
                    window.location.href = '/api/auth/signout';
                  })
                }
              >
                <LogOut aria-hidden />
                <span>Sign out</span>
              </CommandItem>
            </>
          )}
          {authEnabled && authStatus === 'unauthenticated' && (
            <CommandItem
              value="action sign in"
              onSelect={() =>
                runCommand(() => {
                  window.location.href = '/api/auth/signin';
                })
              }
            >
              <LogIn aria-hidden />
              <span>Sign in with GitHub</span>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
