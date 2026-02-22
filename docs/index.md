---
layout: home

hero:
  name: nthtime
  tagline: A code challenge platform with Tree-sitter verification, Convex backend, and a Monaco-powered editor.
  actions:
    - theme: primary
      text: Get Started
      link: /guide/getting-started
    - theme: secondary
      text: Architecture
      link: /guide/architecture

features:
  - title: AST Verification
    details: Tree-sitter WASM grammars parse code in the browser. 12 evaluators check assertions against the AST -- no code execution needed.
  - title: Challenge Packs
    details: Curated packs with scaffold templates, reference solutions, and progressive difficulty. Author your own with JSON and validate locally.
  - title: Nx Monorepo
    details: Nx 22 with pnpm workspaces, Crystal plugins for zero-config targets, and affected-only CI. Four libraries with clean boundaries.
  - title: Convex Backend
    details: Real-time data layer with GitHub OAuth, rate-limited mutations, and search indexes. Falls back to mock data when offline.
---
