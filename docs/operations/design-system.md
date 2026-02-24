# Design System

The nthtime visual language is inspired by [Factory.ai](https://factory.ai/) -- an achromatic palette with a single burnt-orange accent, monospace body copy, flat surfaces without shadows, and generous negative space. This page documents the system as implemented.

## Color System

### Accent

A single chromatic color used with restraint -- active states, badges, links, and selection highlights.

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-100` | `#EF6F2E` | Primary accent (dots, badges, active indicators) |
| `--accent-200` | `#EE6018` | Hover state |
| `--accent-300` | `#D15010` | Pressed / darker variant |

The accent is identical across light and dark themes.

### Neutral Scale

A 12-stop warm gray scale shared across both themes. The scale has a slight warm undertone (brown/taupe) rather than cool blue-gray.

| Token | Value | Usage |
|-------|-------|-------|
| `neutral-100` | `#D6D3D2` | Lightest text (dark), borders (light) |
| `neutral-200` | `#CCC9C7` | Subtle borders (light) |
| `neutral-300` | `#B8B3B0` | Card borders (light) |
| `neutral-400` | `#A49D9A` | Secondary text (dark), nav text (light) |
| `neutral-500` | `#8A8380` | Muted text, footer links |
| `neutral-600` | `#5C5855` | Subtle borders (dark) |
| `neutral-700` | `#4D4947` | Borders (dark), nav text (light) |
| `neutral-800` | `#3D3A39` | Card borders (dark) |
| `neutral-900` | `#2E2C2B` | Elevated elements (dark) |
| `neutral-1000` | `#1F1D1C` | Button bg (dark), code block bg |

### Base Colors

| Role | Dark | Light |
|------|------|-------|
| Page background | `#020202` | `#EEEEEE` |
| Elevated surface | `#101010` | `#FAFAFA` |
| Primary text | `#EEEEEE` | `#020202` |
| Secondary text | `#A49D9A` | `#4D4947` |
| Muted text | `#8A8380` | `#8A8380` |

Neither theme uses pure white or pure black. The light base is a warm off-white; the dark base is near-black with minimal blue.

### Semantic Colors

Domain-specific colors retained from the original system, adjusted to harmonize with the neutral palette:

| Role | Value | Notes |
|------|-------|-------|
| Pass / success | `hsl(158, 64%, 42%)` | Green -- verification pass |
| Fail / error | `hsl(0, 72%, 55%)` | Red -- verification fail |
| Difficulty: beginner | `hsl(166, 60%, 42%)` | Teal-green badge |
| Difficulty: intermediate | `hsl(38, 92%, 50%)` | Amber badge |
| Difficulty: advanced | `hsl(346, 77%, 55%)` | Rose badge |

The orange accent does not overlap with the difficulty-intermediate amber. Orange is reserved for UI chrome; amber is reserved for difficulty badges.

## Typography

### Font Stack

| Role | Font | Variable Name |
|------|------|---------------|
| Sans-serif (headings) | Geist | `--font-geist-sans` |
| Monospace (body, UI, code) | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via Fontsource (jsDelivr CDN for the docs site, `geist` npm package for the Next.js app).

### Type Scale

| Element | Font | Size | Weight | Letter Spacing | Transform |
|---------|------|------|--------|----------------|-----------|
| h1 (hero) | Geist | 60px | 400 | -2.88px | none |
| h2 (section) | Geist | 48px | 400 | -1.44px | none |
| h3 | Geist | 24px | 400 | -0.48px | none |
| Body text | Geist Mono | 16px | 400 | normal | none |
| Body (secondary) | Geist Mono | 14px | 400 | normal | none |
| Eyebrow / label | Geist Mono | 12px | 400 | -0.24px | uppercase |
| Nav link | Geist Mono | 12px | 400 | -0.24px | uppercase |
| Button label | Geist Mono | 12px | 400 | -0.24px | uppercase |

### Eyebrow Pattern

A small orange dot (8x8px circle) followed by a Geist Mono 12px uppercase label. Used above section headings.

```css
.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-geist-mono);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: -0.24px;
  text-transform: uppercase;
}

.eyebrow::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-100, #ef6f2e);
}
```

## Borders and Surfaces

### No Shadows

The design system does not use `box-shadow` for depth. Visual hierarchy comes from:

1. **Background color stepping** -- slightly lighter/darker neutrals for nested surfaces
2. **Border enclosure** -- 1px borders define container boundaries
3. **Spacing isolation** -- generous margin creates visual separation

### Border Patterns

| Pattern | Dark Color | Light Color | Usage |
|---------|-----------|-------------|-------|
| Card border | `#3D3A39` | `#B8B3B0` | Card outlines, pricing cards |
| Subtle border | `#5C5855` | `#CCC9C7` | Section dividers, code blocks |
| Interactive border | `#4D4947` | `#4D4947` | Tags, pills, tab borders |
| Accent border | `#D15010` | `#D15010` | Active tab indicator |
| Dashed border | `#8A8380` | `#8A8380` | Internal dividers |

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| Large | 10px | Dropdown panels, large cards |
| Medium | 8px | Cards, feature blocks |
| Small | 4px | Buttons, tags, badges, pills |

## Buttons

### Primary (CTA)

Inverted foreground/background for maximum contrast. Monospace 12px uppercase text.

```
Dark:   bg: #FAFAFA   text: inherits   border: transparent   radius: 4px
Light:  bg: #101010   text: inherits   border: transparent   radius: 4px
```

### Secondary (Outline)

```
Dark:   bg: #1F1D1C   text: #EEEEEE   border: transparent   radius: 4px
Light:  bg: #EEEEEE   text: #020202   border: #A49D9A       radius: 4px
```

### Text Link

Monospace 12px uppercase, inherits color from context. No underline. Arrow suffix on action links.

## Motion

### Easing

A single easing curve for all transitions:

```css
cubic-bezier(0.4, 0, 0.2, 1)
```

Standard ease-out -- quick start, gentle deceleration.

### Durations

| Type | Duration |
|------|----------|
| Color transitions | 200ms |
| Opacity fades | 250ms |
| Transform / scale | 200ms |
| Fast hover feedback | 150ms |

### Hover States

- **Nav links**: Color transition from muted to primary text (200ms)
- **Cards**: Border-color transition only -- no scale, no shadow
- **Buttons**: Background-color shift (200ms) -- no scale, no shadow
- **Links with arrows**: Arrow may shift 2-4px right on hover

### Scroll Behavior

```css
html {
  scroll-padding-top: 80px;
}
```

No `scroll-behavior: smooth` is set. The sticky header is accounted for with scroll-padding.

## Implementation Notes

### CSS Variables

The app uses CSS custom properties in `global.css` with `:root` and `.dark` blocks. Colors are defined as HSL channel values (space-separated, without the `hsl()` wrapper) for Tailwind opacity modifier support:

```css
:root {
  --background: #eeeeee;
  --foreground: #020202;
  --primary: #ef6f2e;
  --border: #b8b3b0;
}

.dark {
  --background: #020202;
  --foreground: #eeeeee;
  --primary: #ef6f2e;
  --border: #3d3a39;
}
```

### Tailwind Config

The Tailwind config at `apps/web/tailwind.config.js` maps CSS variables to Tailwind utility classes:

```js
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: { DEFAULT: 'hsl(var(--primary))' },
  border: 'hsl(var(--border))',
}
```

### shadcn/ui

UI components use shadcn/ui with `class-variance-authority` (CVA) for variant definitions. Component styles reference the CSS variable tokens, so the entire theme updates when token values change.

### Dark Mode

Class-based toggle via `next-themes` with `darkMode: ['class']` in Tailwind config. The `dark` class on `<html>` swaps all token values. Default theme is dark.
