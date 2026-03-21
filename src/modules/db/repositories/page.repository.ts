import { prisma } from '../prisma'
import type { CreatePageInput } from '../types'

export class PrismaPageRepository {
  async create(input: CreatePageInput) {
    return prisma.page.create({ data: input })
  }

  async findOrCreate(input: CreatePageInput) {
    return prisma.page.upsert({
      where: {
        siteId_url: { siteId: input.siteId, url: input.url },
      },
      update: { updatedAt: new Date() },
      create: input,
    })
  }

  async findBySite(siteId: string, options?: { take?: number; skip?: number }) {
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where: { siteId },
        orderBy: { updatedAt: 'desc' },
        take: options?.take ?? 50,
        skip: options?.skip ?? 0,
        include: {
          scans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { summary: true, _count: { select: { issues: true } } },
          },
        },
      }),
      prisma.page.count({ where: { siteId } }),
    ])
    return { pages, total }
  }

  async findById(id: string) {
    return prisma.page.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { summary: true },
        },
      },
    })
  }
}
