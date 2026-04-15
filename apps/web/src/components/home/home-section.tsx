import { cn } from '@/lib/utils';

interface HomeSectionProps {
  eyebrow: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function HomeSection({ eyebrow, className, contentClassName, children }: HomeSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <p className="eyebrow">{eyebrow}</p>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
