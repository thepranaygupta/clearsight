import { prisma } from '../prisma'
import type { CreateSiteInput } from '../types'

export class PrismaSiteRepository {
  async create(input: CreateSiteInput) {
    return prisma.site.create({ data: input })
  }

  async findById(id: string) {
    return prisma.site.findUnique({
      where: { id },
      include: {
        crawls: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { pages: true } },
      },
    })
  }

  async findByHostname(hostname: string) {
    return prisma.site.findUnique({ where: { hostname } })
  }

  async findMany() {
    return prisma.site.findMany({
      include: {
        crawls: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { pages: true, crawls: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findOrCreate(hostname: string, name?: string) {
    return prisma.site.upsert({
      where: { hostname },
      update: {},
      create: { hostname, name: name ?? hostname },
    })
  }

  async delete(id: string) {
    return prisma.site.delete({ where: { id } })
  }
}
