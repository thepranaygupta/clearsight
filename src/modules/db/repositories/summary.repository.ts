import { prisma } from '../prisma'
import type { SummaryRepository, CreateSummaryInput } from '../types'
import type { ScanSummary } from '@/generated/prisma/client'

export class PrismaSummaryRepository implements SummaryRepository {
  async create(input: CreateSummaryInput): Promise<ScanSummary> {
    try {
      return await prisma.scanSummary.create({
        data: {
          scanId: input.scanId,
          overallScore: input.overallScore,
          summary: input.summary,
          topPriorities: input.topPriorities,
          positiveFindings: input.positiveFindings,
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to create summary: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
