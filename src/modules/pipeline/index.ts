import { prisma } from '@/modules/db/prisma'
import { PrismaScanRepository } from '@/modules/db'
import type { PipelineContext, PipelineStage } from './types'
import type { ProgressReporter } from './progress'

export class CancelledError extends Error {
  constructor(scanId: string) {
    super(`Scan ${scanId} was cancelled`)
    this.name = 'CancelledError'
  }
}

export class PipelineOrchestrator {
  private readonly stages: PipelineStage[]
  private readonly progressReporter: ProgressReporter
  private rendererCleanup: (() => Promise<void>) | null = null

  constructor(stages: PipelineStage[], progressReporter: ProgressReporter) {
    this.stages = stages
    this.progressReporter = progressReporter
  }

  /** Register a cleanup function for the renderer (called on error or completion). */
  onCleanup(fn: () => Promise<void>): void {
    this.rendererCleanup = fn
  }

  async run(initialContext: PipelineContext): Promise<PipelineContext> {
    let context = initialContext

    try {
      for (const stage of this.stages) {
        // Check if the scan has been cancelled before starting this stage
        await this.checkCancelled(context.scanId)

        // Report progress
        await this.progressReporter.report(stage.progress, stage.name)

        // Execute the stage
        context = await stage.execute(context)
      }

      return context
    } catch (error) {
      if (error instanceof CancelledError) {
        console.log(`[Pipeline] Scan ${context.scanId} was cancelled`)
        throw error
      }

      // Update scan to failed status
      const scanRepo = new PrismaScanRepository()
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      await scanRepo.updateStatus(context.scanId, {
        status: 'failed',
        errorMessage,
      })

      throw error
    } finally {
      // Always clean up the renderer
      await this.cleanup()
    }
  }

  private async checkCancelled(scanId: string): Promise<void> {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      select: { status: true },
    })

    if (scan?.status === 'cancelled') {
      throw new CancelledError(scanId)
    }
  }

  private async cleanup(): Promise<void> {
    if (this.rendererCleanup) {
      try {
        await this.rendererCleanup()
      } catch (error) {
        console.error(
          '[Pipeline] Cleanup error:',
          error instanceof Error ? error.message : String(error)
        )
      }
    }
  }
}

export { ProgressReporter } from './progress'
export { FetchStage } from './stages/fetch'
export { AnalyzeStage } from './stages/analyze'
export { CustomChecksStage } from './stages/custom-checks'
export { ElementLocateStage } from './stages/element-locate'
export { EnrichStage } from './stages/enrich'
export { StoreStage } from './stages/store'
export type { PipelineContext, PipelineStage } from './types'
