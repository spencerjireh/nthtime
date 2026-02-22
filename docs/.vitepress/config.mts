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
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: '',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    ],
  ],

  themeConfig: {
    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/shared' },
      { text: 'Deep Dives', link: '/deep-dives/verification-engine' },
      { text: 'GitHub', link: 'https://github.com/spencerjireh/nthtime' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Contributing', link: '/guide/contributing' },
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
      '/deep-dives/': [
        {
          text: 'Deep Dives',
          items: [
            { text: 'Verification Engine', link: '/deep-dives/verification-engine' },
            { text: 'Pack Authoring', link: '/deep-dives/pack-authoring' },
            { text: 'Convex Backend', link: '/deep-dives/convex-backend' },
            { text: 'Docker & CI', link: '/deep-dives/docker-ci' },
            { text: 'Design System', link: '/deep-dives/design-system' },
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
