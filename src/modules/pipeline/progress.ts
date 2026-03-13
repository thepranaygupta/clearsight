import { prisma } from '@/modules/db/prisma'

export class ProgressReporter {
  constructor(private readonly scanId: string) {}

  async report(progress: number, stage: string): Promise<void> {
    try {
      await prisma.scan.update({
        where: { id: this.scanId },
        data: {
          progress,
          currentStage: stage,
        },
      })
    } catch (error) {
      console.error(
        `[ProgressReporter] Failed to update progress for scan ${this.scanId}:`,
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}
