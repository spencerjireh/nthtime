# Challenge Flow

This guide walks through the full user journey: browsing the catalog, picking a pack, working a challenge, and understanding feedback.

## Browsing the Catalog

The home page (`/`) is the catalog. It displays all available challenge packs as a grid of cards. Each card shows the pack name, language, difficulty level, and challenge count.

### Search and Filters

Two filter mechanisms help narrow the catalog:

- **Search** -- Matches against pack and challenge titles. Backed by a PostgreSQL tsvector index for fast results.
- **Language filter** -- Filter by JavaScript, TypeScript, Python, HTML, or CSS.
- **Difficulty filter** -- Filter by beginner, intermediate, or advanced.

Filter state is stored in URL search parameters, so filtered views are shareable.

## Selecting a Pack

Clicking a pack card navigates to the pack detail page (`/packs/[slug]`). This page lists all challenges in the pack with their current status:

| Status | Meaning |
|--------|---------|
| Not started | No attempt recorded |
| In progress | Draft saved but not submitted |
| Passed | All assertions passed on latest attempt |
| Failed | Latest submission did not pass all assertions |

Click any challenge row to open the editor.

## Working a Challenge

The challenge view (`/packs/[packSlug]/challenges/[challengeSlug]`) uses a three-panel layout:

### Prompt Panel (left)

Displays the challenge description, instructions, and the list of assertions that will be checked. Read this carefully before writing code -- the assertions tell you exactly what the verification engine is looking for.

### Editor Panel (center)

A Monaco editor workspace. Challenges can have one or more files, shown as tabs above the editor. The editor supports:

- **Syntax highlighting** for JavaScript, TypeScript, TSX, Python, HTML, and CSS
- **Vim and Emacs keybindings** (configurable in settings)
- **Autocomplete** (off by default -- this is a recall drill)
- **Tab size and indentation style** (configurable in settings)

The timer starts on your first keystroke and tracks elapsed time.

### Output Panel (right)

Shows verification results after submission. Before submitting, this panel displays instructions or is empty.

### Submitting

Press `Cmd+Enter` (or click the Submit button) to submit your code. The verification engine runs client-side using Tree-sitter WASM -- no server round-trip needed. Your code is parsed into an AST, and 12 evaluators check its structure against the challenge assertions.

## Understanding Feedback Levels

The feedback level controls how much detail you see in the results. Configure this in the settings dialog. Lower levels test pure recall; higher levels help you learn.

| Level | Name | What You See | Best For |
|-------|------|-------------|----------|
| L0 | Banner only | Pass/fail banner, no assertion details | Testing raw recall |
| L1 | Pass/fail per assertion | Each assertion shown as passed or failed | Identifying weak spots |
| L2 | Hints | L1 plus hint text for failed assertions | Guided practice |
| L3 | Full details | L2 plus expected values and code locations | Learning new patterns |
| L4 | Diff view | L3 plus a side-by-side diff against the reference solution | Understanding exact differences |

The diff view at L4 uses Monaco's built-in diff editor with a side-by-side or inline toggle.

## Retrying

After viewing results, click **Retry** to return to the editor with your submitted code intact. Your timer resets but your code is preserved, so you can iterate on your solution.

Click **Back to pack** to return to the pack detail page, or **Next challenge** to advance to the next challenge in the pack.

## Drafts

Your work is automatically saved as a draft in local storage. If you navigate away and come back, the editor restores your latest draft. Drafts are saved with a 500ms debounce on every keystroke.

Drafts are stored per challenge under the key pattern `nthtime:draft:{challengeId}`. They persist across browser sessions but are local to the device.

## Navigation

The `?pack=slug` query parameter threads pack context through the entire flow. This means:

- The "Back to pack" button in results knows which pack you came from
- The "Next challenge" button advances within the same pack
- The breadcrumb trail stays consistent

If you navigate directly to a challenge URL without a pack parameter, navigation defaults to standalone mode without pack-relative controls.
