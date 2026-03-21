import { prisma } from '../prisma'
import type { CreateCrawlInput, UpdateCrawlInput } from '../types'

export class PrismaCrawlRepository {
  async create(input: CreateCrawlInput) {
    return prisma.crawl.create({
      data: {
        siteId: input.siteId,
        maxPages: input.maxPages ?? null,
      },
    })
  }

  async findById(id: string) {
    return prisma.crawl.findUnique({
      where: { id },
      include: { site: true },
    })
  }

  async findBySite(siteId: string, options?: { take?: number; skip?: number }) {
    const [crawls, total] = await Promise.all([
      prisma.crawl.findMany({
        where: { siteId },
        orderBy: { createdAt: 'desc' },
        take: options?.take ?? 20,
        skip: options?.skip ?? 0,
      }),
      prisma.crawl.count({ where: { siteId } }),
    ])
    return { crawls, total }
  }

  async update(id: string, input: UpdateCrawlInput) {
    return prisma.crawl.update({ where: { id }, data: input })
  }

  /** Atomically increment enrichedPages and return both new value and totalPages. Prevents race conditions on crawl completion. */
  async incrementEnrichedPages(id: string): Promise<{ enrichedPages: number; totalPages: number }> {
    const result = await prisma.$queryRaw<[{ enriched_pages: number; total_pages: number }]>`
      UPDATE crawls
      SET enriched_pages = enriched_pages + 1, updated_at = NOW()
      WHERE id = ${id}
      RETURNING enriched_pages, total_pages
    `
    if (!result[0]) throw new Error(`Crawl ${id} not found during enrichedPages increment`)
    return { enrichedPages: result[0].enriched_pages, totalPages: result[0].total_pages }
  }

  /** Atomically increment scannedPages. */
  async incrementScannedPages(id: string): Promise<number> {
    const result = await prisma.$queryRaw<[{ scanned_pages: number }]>`
      UPDATE crawls
      SET scanned_pages = scanned_pages + 1, updated_at = NOW()
      WHERE id = ${id}
      RETURNING scanned_pages
    `
    if (!result[0]) throw new Error(`Crawl ${id} not found during scannedPages increment`)
    return result[0].scanned_pages
  }

  /** Find active crawl for a site (for rate limiting: 1 concurrent crawl per site). */
  async findActiveCrawl(siteId: string) {
    return prisma.crawl.findFirst({
      where: {
        siteId,
        status: { in: ['queued', 'discovering', 'scanning'] },
      },
    })
  }
}
