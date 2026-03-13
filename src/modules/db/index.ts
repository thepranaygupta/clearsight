export { prisma } from './prisma'
export { PrismaScanRepository } from './repositories/scan.repository'
export { PrismaIssueRepository } from './repositories/issue.repository'
export { PrismaSummaryRepository } from './repositories/summary.repository'
export type {
  ScanRepository,
  IssueRepository,
  SummaryRepository,
  ScanWithRelations,
  CreateScanInput,
  UpdateScanStatusInput,
  UpdateScanProgressInput,
  CreateIssueInput,
  CreateSummaryInput,
  FindManyScansOptions,
  FindManyScansResult,
} from './types'
