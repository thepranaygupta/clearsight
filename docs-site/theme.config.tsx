const config = {
  logo: (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="ClearSight" width={22} height={22} />
      <span style={{ fontWeight: 700, fontSize: 14 }}>ClearSight Docs</span>
    </span>
  ),
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
