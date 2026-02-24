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
      { text: 'Operations', link: '/operations/convex-backend' },
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
      '/operations/': [
        {
          text: 'Operations',
          items: [
            { text: 'Convex Backend', link: '/operations/convex-backend' },
            { text: 'Docker & CI', link: '/operations/docker-ci' },
            { text: 'Coolify Runbook', link: '/operations/coolify-runbook' },
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
