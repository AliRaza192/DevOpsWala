import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DevOps Wala',
  tagline: 'DevOps + Agentic AI — Phase 0 se Ultra-Pro Expert tak, Roman Urdu mein',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://devopswala.com',
  baseUrl: '/',

  organizationName: 'devopswala',
  projectName: 'devopswala-platform',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/devopswala-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DevOps Wala',
      logo: {
        alt: 'DevOps Wala Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'roadmapSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/roadmap',
          label: 'Roadmap',
          position: 'left',
        },
        {
          href: 'https://github.com/AliRaza192/DevOpsWala',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            { label: 'Start Reading', to: '/docs/foundations/overview' },
            { label: 'Roadmap', to: '/docs/roadmap' },
            { label: 'Curriculum', to: '/docs/roadmap' },
          ],
        },
        {
          title: 'Phases',
          items: [
            { label: 'DevOps Foundations', to: '/docs/foundations/overview' },
            { label: 'Cloud & Containers', to: '/docs/cloud/overview' },
            { label: 'Agentic AI', to: '/docs/ai-foundations/overview' },
            { label: 'Career & Mastery', to: '/docs/career/overview' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/AliRaza192/DevOpsWala' },
            { label: 'About', to: '/docs/about' },
          ],
        },
      ],
      copyright: `Copyright \u00a9 ${new Date().getFullYear()} DevOps Wala. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'python', 'json', 'hcl', 'docker'],
    },
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'devopswala',
      placeholder: 'Search docs...',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
