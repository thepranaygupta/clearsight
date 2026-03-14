import { prisma } from '../prisma'
import type { IssueRepository, CreateIssueInput } from '../types'

export class PrismaIssueRepository implements IssueRepository {
  async createMany(issues: CreateIssueInput[]): Promise<{ count: number }> {
    if (issues.length === 0) {
      return { count: 0 }
    }

    try {
      const result = await prisma.issue.createMany({
        data: issues.map((issue) => ({
          scanId: issue.scanId,
          type: issue.type,
          severity: issue.severity,
          confidenceScore: issue.confidenceScore ?? null,
          wcagCriterion: issue.wcagCriterion,
          wcagLevel: issue.wcagLevel,
          elementSelector: issue.elementSelector,
          elementHtml: issue.elementHtml,
          description: issue.description,
          fixSuggestion: issue.fixSuggestion,
          axeRuleId: issue.axeRuleId ?? null,
          ruleId: issue.ruleId ?? null,
          ruleHelp: issue.ruleHelp ?? null,
          elementBoundingBox: issue.elementBoundingBox ?? undefined,
        })),
      })

      return { count: result.count }
    } catch (error) {
      throw new Error(
        `Failed to create issues: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
