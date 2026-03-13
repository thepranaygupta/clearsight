import { prisma } from '../prisma'
import type {
  ScanRepository,
  CreateScanInput,
  UpdateScanStatusInput,
  UpdateScanProgressInput,
  FindManyScansOptions,
  FindManyScansResult,
  ScanWithRelations,
} from '../types'
import type { Scan } from '@/generated/prisma/client'

export class PrismaScanRepository implements ScanRepository {
  async create(input: CreateScanInput): Promise<Scan> {
    try {
      return await prisma.scan.create({
        data: {
          url: input.url,
          metadata: input.metadata ?? undefined,
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to create scan: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async findById(id: string): Promise<ScanWithRelations | null> {
    try {
      return await prisma.scan.findUnique({
        where: { id },
        include: {
          issues: true,
          summary: true,
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to find scan ${id}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async findMany(options: FindManyScansOptions = {}): Promise<FindManyScansResult> {
    const {
      skip = 0,
      take = 20,
      orderBy = 'createdAt',
      order = 'desc',
      status,
    } = options

    const where = status ? { status } : {}

    try {
      const [scans, total] = await Promise.all([
        prisma.scan.findMany({
          where,
          skip,
          take,
          orderBy: { [orderBy]: order },
        }),
        prisma.scan.count({ where }),
      ])

      return { scans, total }
    } catch (error) {
      throw new Error(
        `Failed to find scans: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async updateStatus(id: string, input: UpdateScanStatusInput): Promise<Scan> {
    try {
      return await prisma.scan.update({
        where: { id },
        data: {
          status: input.status,
          errorMessage: input.errorMessage ?? undefined,
          completedAt: input.completedAt ?? undefined,
          pageTitle: input.pageTitle ?? undefined,
          pageScreenshot: input.pageScreenshot ?? undefined,
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to update scan status ${id}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async updateProgress(id: string, input: UpdateScanProgressInput): Promise<Scan> {
    try {
      return await prisma.scan.update({
        where: { id },
        data: {
          progress: input.progress,
          currentStage: input.currentStage ?? undefined,
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to update scan progress ${id}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async findStaleJobs(thresholdMs: number): Promise<Scan[]> {
    const threshold = new Date(Date.now() - thresholdMs)

    try {
      return await prisma.scan.findMany({
        where: {
          status: 'running',
          updatedAt: { lt: threshold },
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to find stale jobs: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async incrementRetry(id: string): Promise<Scan> {
    try {
      return await prisma.scan.update({
        where: { id },
        data: {
          retryCount: { increment: 1 },
        },
      })
    } catch (error) {
      throw new Error(
        `Failed to increment retry for scan ${id}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
