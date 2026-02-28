# Feature Specs

This directory contains feature specifications for the nthtime code challenge platform. Each spec documents one phase of development with user flows, testable acceptance criteria, technical context, and test coverage mappings.

## Prefix Registry

Every acceptance criterion has a stable ID in the format `{PREFIX}-{NN}`. Register prefixes here before writing criteria to prevent collisions.

| Prefix | File | Criteria | Phase |
|--------|------|----------|-------|
| FOUND | [00-monorepo-foundation.md](./00-monorepo-foundation.md) | 8 | 0 |
| DSST | [01-design-system-shared-types.md](./01-design-system-shared-types.md) | 9 | 1 |
| VRFY | [02-verification-engine.md](./02-verification-engine.md) | 20 | 2 |
| AUTH | [03-auth-schema-data-access.md](./03-auth-schema-data-access.md) | 15 | 3 |
| EDIT | [04-editor-shell.md](./04-editor-shell.md) | 20 | 4 |
| CTLG | [05-catalog-browse.md](./05-catalog-browse.md) | 10 | 5 |
| DRFT | [06-drafts-settings-timer.md](./06-drafts-settings-timer.md) | 13 | 6 |
| CHAL | [07-challenge-flow.md](./07-challenge-flow.md) | 18 | 7 |
| PACK | [08-launch-packs.md](./08-launch-packs.md) | 10 | 8 |
| DPLO | [09-polish-e2e-deploy.md](./09-polish-e2e-deploy.md) | 11 | 9 |
| ATHR | [10-author-web-ui.md](./10-author-web-ui.md) | 23 | 10 |
| CLI | [11-cli.md](./11-cli.md) | 17 | 11 |
| SCAF | [12-scaffold-removal.md](./12-scaffold-removal.md) | 8 | 12 |

**Total: 182 criteria across 13 specs**

## Conventions

### ID Format

- `{PREFIX}-{NN}` -- 3-4 character uppercase prefix + 2-digit zero-padded number
- Exception: `CLI` uses 3 characters since it is universally understood
- Example: `VRFY-03`, `AUTH-12`, `CLI-05`

### Append-Only IDs

IDs are **never reused**. If a criterion is removed, its ID is retired. Gaps in numbering are expected and acceptable. This prevents stale cross-references from silently pointing to unrelated criteria.

### Test Linking

Place a `// PREFIX-NN` comment before each `test()` or `it()` block that covers a criterion:

```typescript
// VRFY-03
it('handles cross-file assertions', async () => {
  // ...
});
```

### Cross-References

Use bracket notation to reference criteria from other specs:

```markdown
This flow depends on [AUTH-02] (session management) and [EDIT-01] (store initialization).
```

### Checkbox Protocol

Criteria use markdown checkboxes:

- `- [ ]` -- behavior is specified but not yet verified (default for retroactive specs)
- `- [x]` -- behavior is implemented AND covered by a passing test

Mark `[x]` only when both conditions are met. A passing implementation without a test remains `[ ]`.

### Functional Criteria Only

Criteria describe **observable behavior**, not implementation details. Avoid prescribing specific UI elements, CSS classes, or internal data structures unless they are part of the public contract.

### Adding New Specs

1. Choose a 3-4 character prefix not already in the registry
2. Add the prefix to the registry table above
3. Create the spec file following `_template.md`
4. Number criteria starting at `01`
