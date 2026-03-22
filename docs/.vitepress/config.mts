import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'nthtime',
  description: 'Developer documentation for the nthtime code challenge platform',
  base: '/nthtime/',
  appearance: 'dark',
  cleanUrls: true,

  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/fontsource/fonts/geist:vf@latest/latin-wght-normal.css',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/fontsource/fonts/geist-mono:vf@latest/latin-wght-normal.css',
      },
    ],
  ],

  themeConfig: {
    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Authoring', link: '/authoring/pack-authoring' },
      { text: 'API', link: '/api/shared' },
      { text: 'Specs', link: '/specs/00-monorepo-foundation' },
      { text: 'Operations', link: '/operations/spring-boot-backend' },
      { text: 'GitHub', link: 'https://github.com/spencerjireh/nthtime' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Challenge Flow', link: '/guide/challenge-flow' },
          ],
        },
      ],
      '/authoring/': [
        {
          text: 'Authoring',
          items: [
            { text: 'Pack Authoring', link: '/authoring/pack-authoring' },
            { text: 'Verification Engine', link: '/authoring/verification-engine' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Shared Types', link: '/api/shared' },
            { text: 'Verification', link: '/api/verification' },
            { text: 'Editor Store', link: '/api/editor' },
            { text: 'Data Access', link: '/api/data-access' },
          ],
        },
      ],
      '/specs/': [
        {
          text: 'Feature Specs',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/specs/' },
            { text: '00 - Monorepo Foundation', link: '/specs/00-monorepo-foundation' },
            { text: '01 - Design System & Types', link: '/specs/01-design-system-shared-types' },
            { text: '02 - Verification Engine', link: '/specs/02-verification-engine' },
            { text: '03 - Auth & Data Access', link: '/specs/03-auth-schema-data-access' },
            { text: '04 - Editor Shell', link: '/specs/04-editor-shell' },
            { text: '05 - Catalog Browse', link: '/specs/05-catalog-browse' },
            { text: '06 - Drafts & Settings', link: '/specs/06-drafts-settings-timer' },
            { text: '07 - Challenge Flow', link: '/specs/07-challenge-flow' },
            { text: '08 - Launch Packs', link: '/specs/08-launch-packs' },
            { text: '09 - Polish & Deploy', link: '/specs/09-polish-e2e-deploy' },
            { text: '10 - Author Web UI', link: '/specs/10-author-web-ui' },
            { text: '11 - CLI', link: '/specs/11-cli' },
            { text: '12 - Scaffold Removal', link: '/specs/12-scaffold-removal' },
          ],
        },
      ],
      '/operations/': [
        {
          text: 'Infrastructure',
          items: [
            { text: 'Spring Boot Backend', link: '/operations/spring-boot-backend' },
            { text: 'Docker & CI', link: '/operations/docker-ci' },
            { text: 'Coolify Runbook', link: '/operations/coolify-runbook' },
          ],
        },
        {
          text: 'Development',
          items: [
            { text: 'Design System', link: '/operations/design-system' },
            { text: 'Contributing', link: '/operations/contributing' },
          ],
        },
      ],
    },

    outline: {
      level: [2, 3],
    },

    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright 2026 nthtime contributors',
    },
  },
});
