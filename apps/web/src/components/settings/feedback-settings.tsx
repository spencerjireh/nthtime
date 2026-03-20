import { Checkbox } from '@/components/ui/checkbox';
import { isFeatureEnabled } from '@/lib/feature-flags';
import type { SettingsPanelProps } from './settings-dialog';
import type { FeedbackConfig } from '@nthtime/shared';

const ALL_FEEDBACK_FLAGS: { key: keyof FeedbackConfig; label: string }[] = [
  { key: 'showPassFail', label: 'Show pass/fail per assertion' },
  { key: 'showHints', label: 'Show hints' },
  { key: 'showAssertionDetails', label: 'Show assertion details and line numbers' },
  { key: 'showDiff', label: 'Show diff (your code vs reference solution)' },
  { key: 'showSolution', label: 'Show reference solution' },
];

const FEEDBACK_FLAGS = isFeatureEnabled('solutionView')
  ? ALL_FEEDBACK_FLAGS
  : ALL_FEEDBACK_FLAGS.filter((f) => f.key !== 'showSolution');

export function FeedbackSettings({ store, settings }: SettingsPanelProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Feedback</h3>
      <div className="space-y-2">
        {FEEDBACK_FLAGS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox
              id={`feedback-${key}`}
              checked={settings.feedback[key]}
              onCheckedChange={(checked) =>
                store.getState().setFeedback({ [key]: checked === true })
              }
            />
            <label htmlFor={`feedback-${key}`} className="text-sm text-foreground">
              {label}
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
