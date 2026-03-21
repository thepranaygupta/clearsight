import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700, fontSize: 14 }}>ClearSight Docs</span>,
  project: {
    link: 'https://github.com/thepranaygupta/clearsight',
  },
  docsRepositoryBase: 'https://github.com/thepranaygupta/clearsight/tree/main/docs-site',
  footer: {
    content: 'ClearSight — WCAG 2.1 Accessibility Checker',
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  toc: {
    backToTop: true,
  },
}

export default config
