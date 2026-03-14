import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import type { PageRenderer, RenderedPage } from './types'

const MAX_REDIRECTS = 10
const NAVIGATION_TIMEOUT_MS = 90_000
const POST_LOAD_SETTLE_MS = 3_000
const MAX_ELEMENT_COUNT_CHECK = 5_000

export class PlaywrightRenderer implements PageRenderer {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null

  async render(url: string): Promise<RenderedPage> {
    const startTime = Date.now()

    this.browser = await chromium.launch({ headless: true })
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ignoreHTTPSErrors: true,
    })
    this.page = await this.context.newPage()
    this.page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS)

    let redirectCount = 0
    this.page.on('response', (response) => {
      const status = response.status()
      if (status >= 300 && status < 400) {
        redirectCount++
      }
    })

    if (redirectCount > MAX_REDIRECTS) {
      throw new Error(
        `Too many redirects (${redirectCount}) when navigating to ${url}`
      )
    }

    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT_MS,
    })

    // Give JS-heavy SPAs time to render after DOM is loaded
    await this.page.waitForTimeout(POST_LOAD_SETTLE_MS)

    if (redirectCount > MAX_REDIRECTS) {
      throw new Error(
        `Too many redirects (${redirectCount}) when navigating to ${url}`
      )
    }

    const pageLoadTimeMs = Date.now() - startTime

    const title = await this.page.title()

    const metaDescription = await this.page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]')
      return meta?.getAttribute('content') ?? ''
    })

    const totalElements = await this.page.evaluate((cap: number) => {
      return Math.min(document.querySelectorAll('*').length, cap)
    }, MAX_ELEMENT_COUNT_CHECK)

    return {
      page: this.page,
      title,
      metaDescription,
      url: this.page.url(),
      redirectCount,
      pageLoadTimeMs,
      totalElements,
    }
  }

  async screenshot(): Promise<Buffer> {
    if (!this.page) {
      throw new Error('No page rendered yet. Call render() first.')
    }

    const buffer = await this.page.screenshot({
      type: 'png',
      fullPage: true,
    })

    return Buffer.from(buffer)
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close().catch(() => {})
      this.page = null
    }
    if (this.context) {
      await this.context.close().catch(() => {})
      this.context = null
    }
    if (this.browser) {
      await this.browser.close().catch(() => {})
      this.browser = null
    }
  }
}
