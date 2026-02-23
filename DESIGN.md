# DESIGN.md -- nthtime Visual Design System

Reference implementation: [factory.ai](https://factory.ai/)

This document is a comprehensive design specification for replicating Factory.ai's
visual language across the nthtime application. It covers philosophy, tokens, typography,
components, motion, theming, and per-page mapping.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Borders & Surfaces](#5-borders--surfaces)
6. [Buttons & Interactive Elements](#6-buttons--interactive-elements)
7. [Motion & Transitions](#7-motion--transitions)
8. [Iconography & Visual Accents](#8-iconography--visual-accents)
9. [Navigation & Header](#9-navigation--header)
10. [Footer](#10-footer)
11. [Cards & Content Blocks](#11-cards--content-blocks)
12. [Page Mapping: nthtime Views](#12-page-mapping-nthtime-views)
13. [Theme Switching](#13-theme-switching)
14. [Implementation Notes](#14-implementation-notes)

---

## 1. Design Philosophy

Factory.ai embodies a design ethos that sits at the intersection of developer tooling
and high-end product design. The core principles:

### 1.1 Restraint Over Decoration

The palette is almost achromatic. A 12-stop neutral gray scale provides all surface,
text, and border colors. The only chromatic color is a single burnt-orange accent
(#EF6F2E) used with extreme economy -- status dots, active tab indicators, "New" badges,
and the occasional highlighted link. This restraint creates a sense of calm authority.

There are no gradients on surfaces, no colored backgrounds for sections, no shadows for
depth cues. The visual hierarchy is achieved through typography scale, spacing, and
sparse color punctuation alone.

### 1.2 Monospace as a Design Element

Navigation labels, section eyebrows, tag/badge text, footer links, and CTAs all use
a monospace typeface (Geist Mono) at 12px uppercase with tight letter-spacing (-0.24px).
This gives the entire interface a "terminal" feel without being gimmicky. It signals
"this is a tool for engineers" at the typographic level.

### 1.3 Generous Negative Space

Sections breathe. Hero areas have 40px top margin and 120px bottom margin. Cards use
48px vertical padding. The content never feels crowded. The grid gutter is 24px. Inline
padding on the main content area is 36px (matching a comfortable reading width on
wide screens).

### 1.4 Flat, Borderline Brutalist Surfaces

Cards and containers rely on 1px solid borders against near-black or near-white
backgrounds. There are no box-shadows, no blur effects, no glassmorphism. When a
surface needs to stand out, it uses a slightly different neutral step, not a shadow.

### 1.5 Dual-Theme Parity

Light and dark themes are not afterthoughts -- they share identical structure. The
light theme uses #EEEEEE as its base, not pure white. The dark theme uses #020202, not
pure black. Both feel warm and slightly muted compared to typical #FFF / #000 themes.
The orange accent is identical across both themes.

---

## 2. Color System

### 2.1 CSS Custom Properties (Direct from Factory.ai)

```css
:root {
  --radius: 0.625rem;        /* 10px -- global border-radius token */

  /* Accent: burnt orange */
  --accent-100: #ef6f2e;      /* Primary accent (dots, badges, active indicators) */
  --accent-200: #ee6018;      /* Hover / emphasis */
  --accent-300: #d15010;      /* Pressed / darker variant */

  /* Dark theme base */
  --dark-base-primary: #020202;    /* Page background (dark) */
  --dark-base-secondary: #101010;  /* Elevated surfaces (dark) */

  /* Light theme base */
  --light-base-primary: #eeeeee;   /* Page background (light) */
  --light-base-secondary: #fafafa; /* Elevated surfaces / footer (light) */

  /* Neutral scale (shared across themes) */
  --neutral-100: #d6d3d2;    /* Lightest text on dark / borders on light */
  --neutral-200: #ccc9c7;
  --neutral-300: #b8b3b0;    /* Secondary borders (light theme) */
  --neutral-400: #a49d9a;    /* Muted nav text (dark), secondary text (light) */
  --neutral-500: #8a8380;    /* Muted text, footer links */
  --neutral-600: #5c5855;    /* Subtle borders (dark) */
  --neutral-700: #4d4947;    /* Borders (dark), nav text (light) */
  --neutral-800: #3d3a39;    /* Card borders (dark) */
  --neutral-900: #2e2c2b;    /* Elevated bg elements (dark) */
  --neutral-1000: #1f1d1c;   /* Button bg (dark), code block bg */
}
```

### 2.2 Semantic Color Mapping

| Role                    | Dark Theme              | Light Theme              |
|-------------------------|-------------------------|--------------------------|
| Page background         | #020202                 | #EEEEEE                  |
| Surface / card bg       | #020202 (same as page)  | #EEEEEE (same as page)   |
| Elevated surface        | #101010                 | #FAFAFA                  |
| Footer background       | (transparent/page)      | #FAFAFA                  |
| Primary text            | #EEEEEE                 | #020202                  |
| Secondary text          | #A49D9A (neutral-400)   | #4D4947 (neutral-700)    |
| Muted text              | #8A8380 (neutral-500)   | #8A8380 (neutral-500)    |
| Nav link (default)      | #A49D9A                 | #4D4947                  |
| Nav link (hover)        | #EEEEEE                 | #020202                  |
| Card border             | #3D3A39 (neutral-800)   | #B8B3B0 (neutral-300)    |
| Subtle border           | #5C5855 (neutral-600)   | #CCC9C7 (neutral-200)    |
| Active tab indicator    | #3D3A39 (neutral-800)   | #B8B3B0 (neutral-300)    |
| Accent dot / badge      | #EF6F2E (accent-100)    | #EF6F2E (accent-100)     |
| Accent hover            | #EE6018 (accent-200)    | #EE6018 (accent-200)     |
| Accent pressed          | #D15010 (accent-300)    | #D15010 (accent-300)     |
| Active tab text         | #EF6F2E                 | #EF6F2E                  |
| Primary button bg       | #FAFAFA                 | #101010                  |
| Primary button text     | #EEEEEE (inherits)      | (inherits)               |
| Secondary button bg     | #1F1D1C (neutral-1000)  | #EEEEEE                  |
| Secondary button border | transparent             | #A49D9A (neutral-400)    |

### 2.3 nthtime Adaptation: Semantic Colors to Preserve

nthtime has domain-specific semantic colors that Factory.ai does not need. These should
be retained but adjusted to harmonize with the neutral palette:

| Role                  | Value (keep)                | Notes                      |
|-----------------------|-----------------------------|----------------------------|
| Pass / success        | HSL(158, 64%, 42%)          | Green -- verification pass |
| Fail / error          | HSL(0, 72%, 55%)            | Red -- verification fail   |
| Difficulty: beginner  | HSL(166, 60%, 42%)          | Teal-green badge           |
| Difficulty: intermediate | HSL(38, 92%, 50%)        | Amber badge                |
| Difficulty: advanced  | HSL(346, 77%, 55%)          | Rose badge                 |

The orange accent (#EF6F2E) should NOT overlap with the difficulty-intermediate amber.
Use orange exclusively for UI chrome (dots, active states). Use amber only for
difficulty badges.

---

## 3. Typography

### 3.1 Font Stack

Factory.ai uses [Geist](https://vercel.com/font) (sans) and Geist Mono (monospace),
both by Vercel. For nthtime, the closest equivalents that are already in use:

| Role        | Factory.ai         | nthtime Equivalent        | Notes                |
|-------------|--------------------|-----------------------------|----------------------|
| Sans-serif  | Geist              | **Geist** (adopt directly) | Available via `next/font/google` or Vercel's package |
| Monospace   | Geist Mono         | **Geist Mono** (adopt)     | Replace JetBrains Mono in editor chrome; keep JetBrains Mono for Monaco only |

**Action:** Replace Inter with Geist. Replace JetBrains Mono in UI chrome with
Geist Mono. Keep JetBrains Mono exclusively inside the Monaco editor.

### 3.2 Type Scale

All sizes measured from computed styles on factory.ai:

| Element          | Font           | Size  | Weight | Line Height | Letter Spacing | Transform  |
|------------------|----------------|-------|--------|-------------|----------------|------------|
| h1 (hero)        | Geist          | 60px  | 400    | 60px (1.0)  | -2.88px        | none       |
| h2 (section)     | Geist          | 48px  | 400    | 48px (1.0)  | -1.44px        | none       |
| h2 (card title)  | Geist          | 32px* | 400    | 36px        | -0.96px        | none       |
| h3 (sub-section) | Geist          | 24px* | 400    | 28px        | -0.48px        | none       |
| Body text        | Geist Mono     | 16px  | 400    | 24px (1.5)  | normal         | none       |
| Body (secondary) | Geist Mono     | 14px  | 400    | 20px        | normal         | none       |
| Eyebrow / label  | Geist Mono     | 12px  | 400    | 12px (1.0)  | -0.24px        | uppercase  |
| Nav link         | Geist Mono     | 12px  | 400    | 12px        | -0.24px        | uppercase  |
| Button label     | Geist Mono     | 12px  | 400    | 12px        | -0.24px        | uppercase  |
| Code snippet     | Geist Mono     | 14px  | 400    | 20px        | normal         | none       |
| Pricing ($)      | Geist          | 48px  | 400    | 48px        | -1.44px        | none       |
| Footer link      | Geist          | 14px  | 400    | 20px        | normal         | none       |
| Footer category  | Geist          | 14px  | 500    | 20px        | normal         | none       |

*Estimated from visual inspection; not directly measured.

### 3.3 Key Typographic Patterns

**Eyebrow pattern:** A small orange dot (8x8px circle) followed by a Geist Mono 12px
uppercase label. Used above every major section heading.

```
[orange dot] VISION
Agent-Native Software Development
```

**Numbered list pattern:** "01", "02", etc. in Geist Mono 12px, colored with the accent
orange, followed by the item name in uppercase monospace.

**Body copy in monospace:** Factory.ai uses Geist Mono for most body paragraphs, not
just code. This is a deliberate design choice that reinforces the developer-tool
identity. Adopt this for descriptive copy. Use Geist (sans) for headings only.

---

## 4. Spacing & Layout

### 4.1 Grid & Container

- **Max content width:** No explicit max-width on the main container. Content is
  constrained by generous inline padding.
- **Inline padding (page edges):** 36px
- **Column gap:** 24px (used in multi-column grid sections)
- **Scroll padding:** 80px top (accounts for sticky header)

### 4.2 Section Spacing

| Section Type          | Margin Top | Margin Bottom | Padding Vertical |
|-----------------------|-----------|---------------|------------------|
| Hero                  | 40px      | 120px         | 0px              |
| Feature section       | 120px     | 120px         | 48px (with border-top) |
| Card grid             | 80px      | 120px         | 0px              |
| News/CTA band         | 0px       | 0px           | 48px             |
| Footer                | 0px       | 0px           | 48px             |

### 4.3 Responsive Breakpoints

Factory.ai is a Tailwind CSS project. While exact breakpoints were not extracted, the
observed behavior is:

- **Desktop (>1024px):** Full multi-column layouts, side-by-side hero + illustration.
- **Tablet (~768-1024px):** Stacked layouts, reduced horizontal padding.
- **Mobile (<768px):** Single column, hamburger nav, reduced type sizes.

### 4.4 Common Spacing Tokens

Based on Tailwind usage patterns observed in class names:

| Token   | Value  | Usage                                    |
|---------|--------|------------------------------------------|
| `p-4`   | 16px   | Dropdown padding, card internal spacing  |
| `p-6`   | 24px   | Card padding, section internal spacing   |
| `px-3`  | 12px   | Button horizontal padding                |
| `px-9`  | 36px   | Page-level inline padding                |
| `gap-6` | 24px   | Grid column gap                          |
| `mb-30` | 120px  | Large section bottom margin              |
| `mt-10` | 40px   | Hero top margin                          |
| `mt-20` | 80px   | Secondary section top margin             |

---

## 5. Borders & Surfaces

### 5.1 Border Patterns

Factory.ai uses five distinct border patterns. Each has a specific semantic meaning:

| Pattern                           | Dark Theme Color    | Light Theme Color   | Usage                                  |
|-----------------------------------|---------------------|---------------------|----------------------------------------|
| 1px solid (card)                  | #3D3A39 (n-800)     | #B8B3B0 (n-300)     | Card outlines, pricing cards           |
| 1px solid (subtle)                | #5C5855 (n-600)     | #CCC9C7 (n-200)     | Section dividers, code block borders   |
| 1px solid (interactive)           | #4D4947 (n-700)     | #4D4947 (n-700)     | Tag/badge borders, tab pill borders    |
| 1px solid (accent)                | #D15010 (a-300)     | #D15010 (a-300)     | Active tab pill border                 |
| 1px dashed                        | #8A8380 (n-500)     | #8A8380 (n-500)     | Dashed dividers (pricing tiers)        |

### 5.2 Border Radius

| Token         | Value | Usage                                           |
|---------------|-------|-------------------------------------------------|
| `--radius`    | 10px  | Large cards, dropdown panels                    |
| `rounded-lg`  | 8px   | Cards, dropdown container, feature blocks       |
| `rounded-md`  | 6px   | Dashed dividers                                 |
| `rounded`     | 4px   | Buttons, tags, badges, pills, tab indicators    |

### 5.3 Surface Elevation (No Shadows)

Factory.ai does not use box-shadow for depth. Instead, it uses:

1. **Background color stepping:** Slightly lighter/darker neutrals for nested surfaces.
2. **Border enclosure:** 1px borders define container boundaries.
3. **Spacing isolation:** Generous margin creates visual separation.

This is a deliberate departure from Material Design's shadow-based elevation model.
Adopt this flat approach across nthtime.

---

## 6. Buttons & Interactive Elements

### 6.1 Button Variants

#### Primary Button (CTA)

```
Dark:  bg: #FAFAFA  |  text: inherits  |  border: 1px solid transparent  |  radius: 4px
Light: bg: #101010  |  text: inherits  |  border: 1px solid transparent  |  radius: 4px
```

Used for: "Log In", "Sign Up", primary CTAs.
Font: Geist Mono, 12px, uppercase, letter-spacing: -0.24px.
Padding: 0px 12px (horizontal), auto vertical (line-height driven ~32-36px total height).
Arrow icon appended on "action" buttons (right-pointing arrow).

#### Secondary Button (Ghost/Outline)

```
Dark:  bg: #1F1D1C  |  text: #EEEEEE  |  border: 1px solid transparent  |  radius: 4px
Light: bg: #EEEEEE  |  text: #020202  |  border: 1px solid #A49D9A      |  radius: 4px
```

Used for: "Contact Sales", "Quickstart Guide", secondary actions.
Same typography as primary.

#### Text Link Button

```
Font: Geist Mono, 12px, uppercase, letter-spacing: -0.24px
Color: inherits from context (primary text or secondary text)
Decoration: none (no underline)
Arrow: right-pointing arrow icon suffix
```

Used for: "Learn more ->", in-card CTAs, footer-adjacent actions.

### 6.2 Tag / Badge / Pill

```
Font: Geist Mono, 12px, uppercase
Border: 1px solid neutral-700
Radius: 4px
Padding: ~4px 8px
Background: transparent
```

Used for: Category tags ("ENGINEERING", "PRODUCT"), filter pills ("ALL NEWS").

Special case: "New" badge uses accent border (#D15010) and accent text (#EF6F2E).

### 6.3 Tab / Step Indicator

The "01 TERMINAL / IDE", "02 WEB BROWSER" etc. list uses:

```
Font: Geist Mono, 12px/14px, uppercase
Active item: accent-colored (#EF6F2E) text
Inactive: neutral-500 (#8A8380) text
Progress bar: thin (2-3px) horizontal bar with orange fill for active step
```

### 6.4 OS Toggle (macOS / Windows)

```
Active tab:  bg: neutral-800 (#3D3A39)  |  border: 1px solid neutral-700  |  text: primary
Inactive:    bg: transparent            |  border: 1px solid neutral-700  |  text: muted
Radius: 4px
Font: Geist Mono, 12px, uppercase
```

---

## 7. Motion & Transitions

### 7.1 Easing Function

Factory.ai uses a single easing curve for nearly all transitions:

```css
cubic-bezier(0.4, 0, 0.2, 1)
```

This is the standard "ease-out" curve from Material Design, which gives a quick start
and gentle deceleration. It is used for color, opacity, transform, and layout transitions.

### 7.2 Transition Durations

| Type                    | Duration | Property                          |
|-------------------------|----------|-----------------------------------|
| Color transitions       | 200ms    | color, background-color, border-color, fill, stroke |
| Opacity fades           | 250ms    | opacity                           |
| Slower opacity          | 300ms    | opacity (section reveals)         |
| Transform / scale       | 200ms    | transform, translate, scale       |
| Fast interactions       | 150ms    | Hover micro-feedback              |
| Logo carousel           | 400ms    | Linear (continuous scroll)        |
| General (catch-all)     | 300ms    | Custom easing: cubic-bezier(0, 0, 0.2, 1) |

### 7.3 Animations

| Name              | Behavior                                          |
|-------------------|---------------------------------------------------|
| `slidePattern`    | Infinite horizontal scroll for the logo carousel  |
| `progress-slide`  | Step progress bar fill animation                  |

### 7.4 Hover States

- **Nav links:** Color transitions from neutral-400 to primary text (200ms).
- **Cards (news list):** Subtle opacity or background shift. No scale transform.
- **Buttons:** Background-color shift (200ms). No scale, no shadow.
- **Links with arrows:** Arrow may translate-x slightly on hover (2-4px).

### 7.5 Scroll Behavior

```css
html { scroll-padding-top: 80px; }
```

Smooth scroll is not forced via CSS (no `scroll-behavior: smooth`). The sticky header
is accounted for with scroll-padding.

---

## 8. Iconography & Visual Accents

### 8.1 Orange Status Dot

The most distinctive visual motif on Factory.ai is a small filled circle in #EF6F2E,
placed to the left of section eyebrow labels:

```
Width: 8px
Height: 8px
Border-radius: 50%
Background: var(--accent-100)
Margin-right: 8-12px
Vertical alignment: middle (with the eyebrow text baseline)
```

This dot appears before: "VISION", "PRODUCT", "ENTERPRISE", "CUSTOMERS", "NEWS",
"FOOTER", "PLANS", "START BUILDING", etc.

**nthtime adaptation:** Use this dot before section eyebrows on catalog, pack detail,
and challenge views.

### 8.2 Arrow Right Icon

A simple right-pointing arrow (->), rendered as an SVG icon, appended to CTA text.
It is the same color as the button/link text. On hover, it may shift 2-4px right.

### 8.3 Decorative Illustrations

Factory.ai's hero section features a subtle, schematic illustration (nodes, connections,
code editor outlines) rendered in thin strokes using neutral colors with occasional
orange accent dots. These are page-specific and would be custom for nthtime.

For nthtime, consider: abstract code-block outlines, tree structures (matching the
Tree-sitter verification engine concept), or circuit-board patterns.

### 8.4 Logo Carousel

An infinite horizontal scrolling band of grayscale client logos. Uses CSS animation
(`slidePattern`) with linear timing and duplicated DOM for seamless looping.

---

## 9. Navigation & Header

### 9.1 Structure

```
[Logo]  [Nav Links...]                                    [Log In] [Contact Sales]
```

- **Position:** Sticky top (with scroll-padding: 80px).
- **Background:** Transparent (inherits page background). No blur/glass.
- **Border:** No bottom border by default.
- **Height:** ~60-64px (driven by padding + content).
- **Max width:** Full-width with 36px inline padding.

### 9.2 Logo

Factory.ai uses a custom SVG logo mark (asterisk/flower shape) + wordmark "FACTORY"
in Geist at ~16px. For nthtime, use the nthtime logotype.

### 9.3 Nav Links

- Font: Geist Mono, 12px, uppercase, letter-spacing: -0.24px.
- Color (default): neutral-400 (dark) / neutral-700 (light).
- Color (hover): primary text (#EEEEEE dark / #020202 light).
- Transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1).
- Spacing: ~32px between items (Tailwind `space-x-8`).

### 9.4 Dropdown Menu (Product)

- **Trigger:** Text + chevron-down icon.
- **Panel:** Absolutely positioned, 20px top offset from trigger.
- **Container:** bg-background, 1px border (neutral-800 dark / neutral-300 light),
  border-radius: 8px, padding: 16px.
- **Layout:** 2-column grid of icon + label + description items.
- **Item hover:** Subtle background tint shift.
- **Animation:** Origin top-center, scale + opacity transition.

### 9.5 CTA Buttons (Header)

Two buttons, right-aligned:

1. **Log In:** Primary button style (filled).
2. **Contact Sales:** Secondary button style (outlined in light, dark-filled in dark).

Font: Geist Mono, 12px, uppercase.
Padding: 0px 12px, border-radius: 4px.

---

## 10. Footer

### 10.1 Layout

```
[Section eyebrow: orange dot + "FOOTER"]

[Logo mark (large, ~80px)]                 [Resources]  [Company]  [Legal]
                                           News          Careers    Privacy Policy
                                           Docs          Enterprise Terms of Service
                                           Contact Sales Security   SLA
                                           Open Source              DPA
                                                                    BAA

                                           [Theme switcher: Dark | Light | System]

[Logo (bottom-left)]                       X (Twitter), LinkedIn, GitHub
                                           @Factory 2026. All rights reserved.
```

### 10.2 Styling

- **Background:** Elevated surface (#FAFAFA light / page bg dark).
- **Padding:** 48px vertical, 36px inline.
- **Link font:** Geist, 14px, weight 400, color: neutral-500.
- **Category headings:** Geist, 14px, weight 500, color: primary text.
- **Social links:** Comma-separated text links, not icon buttons.
- **Theme switcher:** 3-button pill group (Dark | Light | System) with icons.
  Active button has label text visible; inactive show icon only.

---

## 11. Cards & Content Blocks

### 11.1 Feature Card (Homepage)

```
+------------------------------------------+
| [orange dot]    SECTION LABEL (mono 12px) |
|                                           |
| [Illustration / screenshot]               |
|                                           |
| Heading (Geist, 32px)                     |
| Description (Geist Mono, 14-16px, muted)  |
|                                           |
| LEARN MORE ->                             |
+------------------------------------------+
```

- Border: 1px solid neutral-800 (dark) / neutral-300 (light)
- Border-radius: 8px
- Padding: 24-32px
- Background: page background (no fill distinction)

### 11.2 Pricing Card

```
+------------------------------------------+
| 01  PRO                   (accent + mono) |
|                                           |
| Pro               $20 /mo                 |
| Description text (mono, muted)            |
|                                           |
| -------- dashed divider --------          |
|                                           |
| Category heading (Geist, 16px, bold)      |
| * Bullet item (Geist, 14px)              |
| * Bullet item                             |
|                                           |
| [SIGN UP ->]                              |
+------------------------------------------+
```

- Border: 1px solid neutral-800 / neutral-300
- Dashed internal divider: 1px dashed neutral-500, border-radius: 6px
- Bullet: orange dot (#EF6F2E), 6px diameter
- Price: Geist 48px, weight 400
- "/mo" suffix: Geist Mono 14px, muted color

### 11.3 News Article Card

```
+--[Image thumbnail (rounded-lg)]--+
|                                   |
| [TAG] [TAG]         (pill badges) |
|                                   |
| Headline (Geist, 24px)           |
| Excerpt (Geist Mono, 14px,       |
|   muted, 2-3 lines, truncated)   |
|                                   |
| LEARN MORE ->                     |
+-----------------------------------+
```

- Featured article: Larger layout, image left + content right.
- Grid articles: Vertical card, image on top.
- Image: Aspect ratio ~16:10, rounded-lg, overflow hidden.
- Hover: Entire card is clickable. Subtle highlight on hover.

### 11.4 News Item (Homepage Sidebar List)

```
+------------------------------------------+
| [Category]  [New badge]                   |
|                                           |
| Title (Geist, 18px)                       |
| Excerpt (Geist Mono, 14px, 2-line clamp) |
|                                           |
| Learn more ->                             |
+------------------------------------------+
```

- Displayed as a horizontal scrolling list or vertical stacked list.
- Separated by subtle borders.

### 11.5 Testimonial / Quote Card

```
"Factory has nearly doubled my productivity..."

[Avatar] Name
Role, Company
```

- Quote text: Geist Mono, 16-18px, light weight.
- Attribution: Avatar (32-40px circle) + name (Geist, 14px bold) + role (mono, muted).
- Navigation: Dot indicators (like a carousel).

### 11.6 Case Study Card

```
[CASE STUDY]  [NEW badge, optional]
[Client logo -- grayscale/white]
Title (Geist Mono, 16px)
LEARN MORE ->
```

- Vertical card, minimal.
- Client logo: Displayed in a neutral/monochrome treatment.

---

## 12. Page Mapping: nthtime Views

### 12.1 Catalog (Home Page: `/`)

Factory equivalent: Homepage hero + feature grid.

| Factory Pattern              | nthtime Element                     | Notes                            |
|------------------------------|-------------------------------------|----------------------------------|
| Hero + eyebrow               | Catalog header + "PRACTICE" eyebrow| "Practice coding challenges"     |
| Logo carousel                | Language icon band (optional)       | JS, TS, Python, HTML, CSS icons  |
| Feature card grid            | Pack card grid                      | 3-column grid, same border style |
| Filter pills (news page)     | Language + difficulty filter pills  | Same pill styling as Factory tags|
| Search                       | Search input                        | Geist Mono, subtle border        |

**Pack Card Design:**

```
+--------------------------------------+
| [Language icon]     [DIFFICULTY pill] |
|                                      |
| Pack Title (Geist, 24px)            |
| Description (Geist Mono, 14px)      |
|                                      |
| 10 challenges   3/10 completed      |
|                                      |
| START ->                             |
+--------------------------------------+
```

- Border: 1px solid card-border color
- Border-radius: 8px
- Progress: Thin progress bar (2px) in accent orange for completed challenges

### 12.2 Pack Detail (`/pack/[slug]`)

Factory equivalent: Product sub-page with numbered list.

| Factory Pattern              | nthtime Element                     |
|------------------------------|-------------------------------------|
| Eyebrow + hero heading       | Pack name + "CHALLENGES" eyebrow    |
| Numbered step list (01-05)   | Challenge list with numbered rows   |
| Step description panel       | Challenge preview (description)     |
| "Learn more" links           | "Start" / "Continue" buttons        |

**Challenge Row Design:**

```
01  function-declarations    [PASSED] or [NOT STARTED]    ->
```

- Number: Geist Mono 12px, accent orange.
- Title: Geist Mono 14px, primary text.
- Status badge: pill with pass/fail/neutral styling.
- Entire row is clickable. Hover highlights row.

### 12.3 Challenge Editor (`/challenge/[id]`)

Factory equivalent: No direct equivalent (Factory is not a coding challenge tool).
Borrow the terminal/IDE section styling.

Layout: 3-panel CSS Grid (already implemented).

| Panel          | Factory Influence                          |
|----------------|--------------------------------------------|
| Prompt panel   | Dark card (neutral-1000 bg), mono body text, eyebrow heading with orange dot |
| Editor panel   | Code block styling -- dark bg, mono font, subtle border |
| Output panel   | Terminal output style -- mono, dark bg      |

**Prompt Panel Styling:**
- Background: neutral-1000 (#1F1D1C) dark / neutral-100 light
- Heading: Geist, 24px, primary text
- Body: Geist Mono, 14px, muted text
- Assertions list: Numbered like Factory's step list (01, 02, 03...)

**Submit Button:**
- Primary button style (filled), full width at panel bottom
- "SUBMIT" in Geist Mono 12px uppercase
- Disabled state: neutral-600 bg, neutral-400 text

### 12.4 Results View

Factory equivalent: Security/Enterprise feature cards.

| Factory Pattern              | nthtime Element                     |
|------------------------------|-------------------------------------|
| Pass/fail section heading    | Results banner (pass green / fail red) |
| Feature bullet list          | Assertion results list              |
| Dashed dividers              | Between assertion groups            |
| "Learn more" link            | "Retry" / "Next Challenge" buttons  |

**Results Banner:**
- Full-width bar at top of results panel
- Pass: #28A668 bg, white text, "ALL TESTS PASSED"
- Fail: #D94444 bg, white text, "X/Y TESTS FAILED"
- Font: Geist Mono 12px uppercase

**Assertion Row:**
```
[pass/fail dot]  Assertion description (Geist Mono, 14px)
                 Hint text (Geist Mono, 12px, muted)     -- L2+
                 Expected: ... Got: ...                    -- L3+
```

### 12.5 Settings Dialog

Factory equivalent: Footer theme switcher.

- Modal overlay with dark scrim (opacity 0.5).
- Panel: card styling (border, radius 8px, padding 24px).
- Section headings: Geist Mono 12px uppercase eyebrow.
- Controls: Same toggle/pill pattern as OS switcher (macOS/Linux/Windows).
- Theme picker: 3-button pill group identical to Factory's Dark/Light/System.

---

## 13. Theme Switching

### 13.1 Implementation

Factory.ai uses a theme switcher in the footer with three options:

1. **Dark** -- forces dark theme
2. **Light** -- forces light theme
3. **System** -- follows OS preference

The active option shows its label text; inactive options show only an icon.

### 13.2 CSS Strategy

Factory.ai uses CSS custom properties on `:root` with a `data-theme` attribute or
class-based toggling. The nthtime approach (class-based via `darkMode: ['class']`)
is compatible -- just update the token values.

### 13.3 Migration from Current nthtime Tokens

Current nthtime uses HSL-formatted tokens (`--background: 0 0% 100%`). Factory.ai
uses hex. The migration should:

1. Replace HSL values with the hex equivalents from the Factory palette.
2. Maintain the `hsl(var(--token))` pattern in Tailwind config if desired, OR
   switch to direct hex references.
3. Update `global.css` `:root` and `.dark` blocks.

Recommended approach: Keep the CSS variable names (--background, --foreground, etc.)
but swap their values to the Factory hex palette. This minimizes changes in component
code while completely changing the visual output.

```css
/* Example migration */
:root {
  --background: #eeeeee;         /* was: 0 0% 100% (white) */
  --foreground: #020202;         /* was: 220 14% 10% */
  --card: #eeeeee;               /* was: 0 0% 100% */
  --card-foreground: #020202;    /* was: 220 14% 10% */
  --primary: #ef6f2e;            /* was: 175 70% 38% (teal) -- NOW ORANGE */
  --primary-foreground: #fafafa;
  --secondary: #fafafa;          /* was: 220 14% 94% */
  --muted: #a49d9a;              /* was: 220 10% 46% */
  --muted-foreground: #8a8380;
  --border: #b8b3b0;             /* was: 220 13% 90% */
  --ring: #ef6f2e;               /* was: 175 70% 38% */
  --radius: 0.625rem;            /* was: 0.5rem -- increased to match Factory */
}

.dark {
  --background: #020202;
  --foreground: #eeeeee;
  --card: #020202;
  --card-foreground: #eeeeee;
  --primary: #ef6f2e;
  --secondary: #1f1d1c;
  --muted: #5c5855;
  --muted-foreground: #a49d9a;
  --border: #3d3a39;
  --ring: #ef6f2e;
}
```

**Important:** If switching primary from teal to orange, every place in the UI that
uses `text-primary`, `bg-primary`, `border-primary`, `ring-primary` will change.
Audit all usages before migrating.

---

## 14. Implementation Notes

### 14.1 Font Installation

```bash
pnpm add geist   # Vercel's Geist font package for Next.js
```

In `apps/web/src/app/layout.tsx`:

```tsx
import { GeistSans, GeistMono } from 'geist/font';

// Apply to <html> or <body>
<body className={`${GeistSans.variable} ${GeistMono.variable}`}>
```

Update `tailwind.config.js`:

```js
fontFamily: {
  sans: ['var(--font-geist-sans)', ...defaultTheme.fontFamily.sans],
  mono: ['var(--font-geist-mono)', ...defaultTheme.fontFamily.mono],
},
```

### 14.2 Tailwind Config: New Neutral Scale

Add the full neutral scale as custom colors:

```js
colors: {
  accent: {
    100: '#ef6f2e',
    200: '#ee6018',
    300: '#d15010',
  },
  neutral: {
    100: '#d6d3d2',
    200: '#ccc9c7',
    300: '#b8b3b0',
    400: '#a49d9a',
    500: '#8a8380',
    600: '#5c5855',
    700: '#4d4947',
    800: '#3d3a39',
    900: '#2e2c2b',
    1000: '#1f1d1c',
  },
  'base-dark': {
    primary: '#020202',
    secondary: '#101010',
  },
  'base-light': {
    primary: '#eeeeee',
    secondary: '#fafafa',
  },
  // Keep semantic colors
  pass: { DEFAULT: 'hsl(158, 64%, 42%)', foreground: '#ffffff' },
  fail: { DEFAULT: 'hsl(0, 72%, 55%)', foreground: '#ffffff' },
}
```

### 14.3 Global CSS: Eyebrow Component

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
  color: var(--foreground);
}

.eyebrow::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-100, #ef6f2e);
  flex-shrink: 0;
}
```

### 14.4 Transition Utility

Add a default transition to Tailwind config:

```js
transitionTimingFunction: {
  factory: 'cubic-bezier(0.4, 0, 0.2, 1)',
},
transitionDuration: {
  factory: '200ms',
},
```

### 14.5 Priority of Changes

When implementing, work in this order:

1. **Fonts** -- Install Geist, replace Inter and JetBrains Mono in UI chrome.
2. **Color tokens** -- Update `global.css` with the new palette.
3. **Eyebrow pattern** -- Create the reusable dot + label component.
4. **Button styles** -- Update button variants (primary, secondary, ghost).
5. **Card borders** -- Replace shadows with 1px borders, update radius.
6. **Typography scale** -- Adjust heading sizes and letter-spacing.
7. **Navigation** -- Restyle header with monospace links + dropdown.
8. **Footer** -- Rebuild with Factory's column layout + theme switcher.
9. **Page-specific** -- Apply patterns to catalog, pack, challenge, results.
10. **Motion** -- Add transition utilities, hover states, scroll behavior.

---

## Appendix: Measured Values Reference

All values below were extracted directly from factory.ai using `getComputedStyle()`
on 2026-02-23.

### A.1 Header CTA Buttons (Dark Theme)

| Button          | Background  | Color   | Border                      | Radius | Padding    |
|-----------------|-------------|---------|-----------------------------|--------|------------|
| Log In          | #FAFAFA     | #EEEEEE | 1px solid transparent       | 4px    | 0px 12px   |
| Contact Sales   | #1F1D1C     | #EEEEEE | 1px solid transparent       | 4px    | 0px 12px   |
| Start Building  | #1F1D1C     | #EEEEEE | 1px solid transparent       | 4px    | 0px 14px   |
| Learn More      | #FAFAFA     | #EEEEEE | 1px solid transparent       | 4px    | 0px 12px   |

### A.2 Header CTA Buttons (Light Theme)

| Button          | Background  | Color   | Border                      | Radius | Padding    |
|-----------------|-------------|---------|-----------------------------|--------|------------|
| Log In          | #101010     | #020202 | 1px solid transparent       | 4px    | 0px 12px   |
| Contact Sales   | #EEEEEE     | #020202 | 1px solid #A49D9A           | 4px    | 0px 12px   |

### A.3 Section Spacing (Measured)

| Section                     | Padding         | Margin               |
|-----------------------------|-----------------|----------------------|
| Hero                        | 0px 36px        | 40px 0px 120px       |
| Feature (with border-top)   | 48px 0px        | 120px 36px           |
| Card grid                   | 0px 36px        | 80px 0px 120px       |

### A.4 Border Patterns (Measured)

| Element Type      | Border                          | Radius |
|-------------------|---------------------------------|--------|
| Card outline      | 1px solid #3D3A39 (dark)        | 8px    |
| Tag/pill          | 1px solid #4D4947               | 4px    |
| Interactive card  | 1px solid #8A8380               | 8px    |
| Dashed divider    | 1px dashed #8A8380              | 6px    |
| Active tab pill   | 1px solid #D15010               | 4px    |
