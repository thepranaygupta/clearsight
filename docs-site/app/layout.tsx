import 'nextra-theme-docs/style.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'ClearSight Docs',
    template: '%s — ClearSight Docs',
  },
  description: 'Documentation for ClearSight accessibility checker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
