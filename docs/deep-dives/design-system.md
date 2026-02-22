# Design System

The nthtime design system is built on Tailwind CSS v3, shadcn/ui components, and CSS custom properties. It uses a teal/cyan primary palette with class-based dark mode via `next-themes`. Typography pairs Inter (body) with JetBrains Mono (code). Custom glow effects and semantic color tokens give the UI a distinctive look.

## HSL Color Palette

All colors are defined as CSS custom properties using HSL **channel format** (space-separated, without the `hsl()` wrapper). This format allows Tailwind to inject opacity modifiers like `bg-primary/50`:

```css
/* apps/web/src/app/global.css */
@layer base {
  :root {
    --primary: 175 70% 38%;
    --primary-foreground: 0 0% 100%;
    /* ... */
  }

  .dark {
    --primary: 175 65% 46%;
    --primary-foreground: 222 28% 7%;
    /* ... */
  }
}
```

Tailwind references these variables through `hsl(var(--...))` in the config:

```js
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
}
```

### Light Mode Palette

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `0 0% 100%` | Page background (white) |
| `--foreground` | `220 14% 10%` | Primary text (near-black) |
| `--primary` | `175 70% 38%` | Teal -- buttons, links, accents |
| `--primary-foreground` | `0 0% 100%` | Text on primary (white) |
| `--secondary` | `220 14% 94%` | Secondary surfaces |
| `--muted` | `220 14% 96%` | Disabled/muted backgrounds |
| `--muted-foreground` | `220 10% 46%` | Muted text |
| `--border` | `220 13% 90%` | Border color |
| `--ring` | `175 70% 38%` | Focus ring (matches primary) |

### Dark Mode Palette

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `222 28% 7%` | Page background (deep navy) |
| `--foreground` | `210 20% 92%` | Primary text (off-white) |
| `--primary` | `175 65% 46%` | Teal -- slightly brighter for contrast |
| `--primary-foreground` | `222 28% 7%` | Text on primary (dark) |
| `--secondary` | `220 18% 16%` | Secondary surfaces |
| `--card` | `222 24% 10%` | Card backgrounds |
| `--border` | `220 16% 18%` | Border color |
| `--ring` | `175 65% 46%` | Focus ring |

## Semantic Colors

### Difficulty

Difficulty badges use a green-amber-red gradient mapped to skill level:

```css
:root {
  --difficulty-beginner: 166 60% 42%;
  --difficulty-intermediate: 38 92% 50%;
  --difficulty-advanced: 346 77% 55%;
}

.dark {
  --difficulty-beginner: 166 60% 46%;
  --difficulty-intermediate: 38 92% 55%;
  --difficulty-advanced: 346 77% 58%;
}
```

Referenced in Tailwind:

```js
difficulty: {
  beginner: 'hsl(var(--difficulty-beginner))',
  intermediate: 'hsl(var(--difficulty-intermediate))',
  advanced: 'hsl(var(--difficulty-advanced))',
},
```

Usage in components:

```tsx
<span className="text-difficulty-beginner">Beginner</span>
<span className="text-difficulty-intermediate">Intermediate</span>
<span className="text-difficulty-advanced">Advanced</span>
```

### Pass / Fail

Verification results use green (pass) and red (fail):

```css
:root {
  --pass: 158 64% 42%;
  --pass-foreground: 0 0% 100%;
  --fail: 0 72% 55%;
  --fail-foreground: 0 0% 100%;
}

.dark {
  --pass: 158 64% 46%;
  --pass-foreground: 222 28% 7%;
  --fail: 0 72% 58%;
  --fail-foreground: 0 0% 100%;
}
```

Referenced in Tailwind:

```js
pass: {
  DEFAULT: 'hsl(var(--pass))',
  foreground: 'hsl(var(--pass-foreground))',
},
fail: {
  DEFAULT: 'hsl(var(--fail))',
  foreground: 'hsl(var(--fail-foreground))',
},
```

## Typography

Two font families are used throughout the application:

```js
// tailwind.config.js
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: [
    'JetBrains Mono',
    'ui-monospace',
    'SFMono-Regular',
    'monospace',
  ],
},
```

- **Inter** (`font-sans`) -- All body text, headings, UI labels, buttons. Clean and highly legible at small sizes.
- **JetBrains Mono** (`font-mono`) -- Code blocks, Monaco editor, assertion descriptions, file paths, terminal output. Designed for code readability with ligature support.

## Tailwind Configuration

The full `tailwind.config.js` at `apps/web/tailwind.config.js` extends the default Tailwind theme:

```js
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

module.exports = {
  darkMode: ['class'],
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other semantic colors
        pass: {
          DEFAULT: 'hsl(var(--pass))',
          foreground: 'hsl(var(--pass-foreground))',
        },
        fail: {
          DEFAULT: 'hsl(var(--fail))',
          foreground: 'hsl(var(--fail-foreground))',
        },
        difficulty: {
          beginner: 'hsl(var(--difficulty-beginner))',
          intermediate: 'hsl(var(--difficulty-intermediate))',
          advanced: 'hsl(var(--difficulty-advanced))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glow: '0 0 12px -2px hsl(175 65% 46% / 0.35)',
        'glow-lg': '0 0 24px -4px hsl(175 65% 46% / 0.4)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

Key points:

- `darkMode: ['class']` -- Dark mode is toggled by adding/removing the `dark` class on the root element (managed by `next-themes`).
- `createGlobPatternsForDependencies(__dirname)` -- Nx helper that includes Tailwind classes used in library dependencies.
- `borderRadius` uses the `--radius` CSS variable (`0.5rem`) so all rounded corners are consistent.
- `tailwindcss-animate` plugin provides animation utilities used by shadcn/ui components.

## shadcn/ui Components

UI components are built with [shadcn/ui](https://ui.shadcn.com/) which provides unstyled, accessible primitives styled via Tailwind and `class-variance-authority` (CVA).

### class-variance-authority

CVA defines component variants as a configuration object. This pattern is used across buttons, badges, alerts, and other components:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

### Badge Variants

Badges are used for difficulty levels, language tags, and challenge status:

```tsx
// Difficulty badge
<Badge className="bg-difficulty-beginner text-white">Beginner</Badge>
<Badge className="bg-difficulty-intermediate text-white">Intermediate</Badge>
<Badge className="bg-difficulty-advanced text-white">Advanced</Badge>

// Status badge
<Badge className="bg-pass text-pass-foreground">Passed</Badge>
<Badge className="bg-fail text-fail-foreground">Failed</Badge>

// Language badge
<Badge variant="outline">JavaScript</Badge>
<Badge variant="outline">Python</Badge>
```

## Dark Mode

Dark mode is class-based, managed by `next-themes`:

```tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>
```

The `attribute="class"` setting adds or removes the `dark` class on the `<html>` element. All color tokens swap via the `.dark` selector in `global.css`:

```css
:root {
  --background: 0 0% 100%;     /* white */
}
.dark {
  --background: 222 28% 7%;    /* deep navy */
}
```

The default theme is `dark`, which suits the code-focused nature of the application. Users can override this through the settings dialog, which persists the choice via the `darkMode` field in `userSettings`.

## Glow Effects

The design system includes custom glow box shadows using the teal primary color:

```js
boxShadow: {
  glow: '0 0 12px -2px hsl(175 65% 46% / 0.35)',
  'glow-lg': '0 0 24px -4px hsl(175 65% 46% / 0.4)',
},
```

These are used on hover states and hero buttons to create a subtle luminous effect:

```tsx
<button className="shadow-glow hover:shadow-glow-lg transition-shadow">
  Start Challenge
</button>
```

The glow color (`175 65% 46%`) matches the dark mode primary, ensuring visual consistency with the overall teal palette.

## Monaco Editor Styling

The Monaco code editor uses custom decoration classes defined in `global.css` for marking failed assertion locations (at feedback level L3 and above):

```css
/* Monaco editor decorations for failed assertions (L3 feedback) */
.decoration-fail-line {
  background-color: rgba(239, 68, 68, 0.08);
}
.decoration-fail-glyph {
  background-color: rgb(239, 68, 68);
  border-radius: 50%;
  width: 8px !important;
  height: 8px !important;
  margin-top: 6px;
  margin-left: 4px;
}
```

- **`decoration-fail-line`** -- Applied as a full-line decoration. Adds a subtle red tint to the background of lines where assertions failed.
- **`decoration-fail-glyph`** -- Applied as a glyph margin decoration. Renders a small red dot in the gutter next to failed lines.

These classes are referenced programmatically when creating Monaco `IModelDeltaDecoration` objects:

```ts
const decorations = failedLocations.map((loc) => ({
  range: new monaco.Range(loc.line, 1, loc.line, 1),
  options: {
    isWholeLine: true,
    className: 'decoration-fail-line',
    glyphMarginClassName: 'decoration-fail-glyph',
  },
}));
```

The `!important` on the glyph dimensions is necessary to override Monaco's default glyph sizing.
