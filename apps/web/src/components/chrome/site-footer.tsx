import Image from 'next/image';
import Link from 'next/link';

interface FooterColumn {
  heading: string;
  links: readonly {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

const COLUMNS: readonly FooterColumn[] = [
  {
    heading: 'Practice',
    links: [
      { label: 'Catalog', href: '/' },
      { label: 'Tracks', href: '/tracks' },
      { label: 'Random challenge', href: '/random' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'Docs', href: '/docs', external: true },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Verification engine', href: '/docs#verification', external: true },
    ],
  },
  {
    heading: 'About',
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/spencerjireh/nthtime',
        external: true,
      },
      { label: 'Author tools', href: '/author' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
];

const SOCIAL_LINKS: readonly { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/spencerjireh/nthtime' },
  { label: 'X', href: 'https://x.com/spencerjireh' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-secondary">
      <div className="mx-auto max-w-screen-2xl px-9 py-12">
        <p className="eyebrow mb-10">Footer</p>

        <div className="grid gap-12 md:grid-cols-[auto_repeat(3,1fr)] md:gap-8">
          <div className="flex flex-shrink-0 md:pr-8">
            <Link
              href="/"
              aria-label="nthtime home"
              className="inline-flex items-center gap-3 text-foreground transition-colors hover:text-primary"
            >
              <Image
                src="/logo-mark.png"
                alt=""
                width={48}
                height={48}
                className="dark:invert"
              />
              <span className="font-mono text-sm font-medium uppercase tracking-wider">
                nthtime
              </span>
            </Link>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h3 className="font-sans text-sm font-medium text-foreground">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            &copy; {year} nthtime
          </div>
          <div className="flex items-center gap-4 font-sans text-sm text-muted-foreground">
            {SOCIAL_LINKS.map((social, idx) => (
              <span key={social.href} className="flex items-center gap-4">
                {idx > 0 && <span aria-hidden className="text-border">&middot;</span>}
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-200 hover:text-foreground"
                >
                  {social.label}
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
