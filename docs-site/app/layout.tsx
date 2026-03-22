import 'nextra-theme-docs/style.css'
import './globals.css'
import type { Metadata } from 'next'
import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import themeConfig from '../theme.config'

export const metadata: Metadata = {
  title: {
    default: 'ClearSight Docs',
    template: '%s — ClearSight Docs',
  },
  description: 'Documentation for ClearSight accessibility checker',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head color={{ hue: 355, saturation: 100, lightness: { light: 45, dark: 55 } }} />
      <body>
        <Layout
          navbar={<Navbar logo={themeConfig.logo} projectLink={themeConfig.project?.link} />}
          footer={null}
          pageMap={await getPageMap()}
          docsRepositoryBase={themeConfig.docsRepositoryBase}
          feedback={{ content: null }}
          editLink="Edit this page on GitHub"
          sidebar={themeConfig.sidebar}
          toc={themeConfig.toc}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
