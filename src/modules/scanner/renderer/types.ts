import type { Page } from 'playwright'

export interface RenderedPage {
  page: Page
  title: string
  metaDescription: string
  url: string
  redirectCount: number
  pageLoadTimeMs: number
  totalElements: number
}

export interface PageRenderer {
  render(url: string): Promise<RenderedPage>
  screenshot(): Promise<Buffer>
  close(): Promise<void>
}
