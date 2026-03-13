import { PlaywrightRenderer } from '@/modules/scanner'
import type { PipelineContext, PipelineStage } from '../types'

export class FetchStage implements PipelineStage {
  readonly name = 'Fetching page'
  readonly progress = 20

  private renderer: PlaywrightRenderer | null = null

  /** Returns the renderer instance so it can be closed during cleanup. */
  getRenderer(): PlaywrightRenderer | null {
    return this.renderer
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    this.renderer = new PlaywrightRenderer()

    try {
      const renderedPage = await this.renderer.render(context.url)
      const screenshot = await this.renderer.screenshot()

      return {
        ...context,
        renderedPage,
        screenshot,
      }
    } catch (error) {
      // Close the renderer on failure to avoid leaked browser processes
      await this.renderer.close()
      this.renderer = null

      if (error instanceof Error) {
        if (error.message.includes('net::ERR_NAME_NOT_RESOLVED') ||
            error.message.includes('net::ERR_CONNECTION_REFUSED') ||
            error.message.includes('net::ERR_ADDRESS_UNREACHABLE')) {
          throw new Error(`Page unreachable: Could not connect to ${context.url}`)
        }

        if (error.message.includes('net::ERR_CERT') ||
            error.message.includes('SSL_ERROR') ||
            error.message.includes('ERR_SSL')) {
          throw new Error(`SSL error: Could not establish a secure connection to ${context.url}`)
        }

        if (error.message.includes('Timeout') || error.message.includes('timeout')) {
          throw new Error(`Timeout: Page at ${context.url} took too long to load`)
        }
      }

      throw error
    }
  }
}
