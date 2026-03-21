import { prisma } from '@/modules/db/prisma'

/**
 * Compare issues between current crawl and previous crawl.
 * Updates issue statuses and returns diff counts.
 */
export async function computeIssueDiff(
  siteId: string,
  currentCrawlId: string,
): Promise<{ newIssues: number; fixedIssues: number; recurring: number }> {
  // Get the previous completed crawl
  const previousCrawl = await prisma.crawl.findFirst({
    where: {
      siteId,
      status: 'completed',
      id: { not: currentCrawlId },
    },
    orderBy: { completedAt: 'desc' },
  })

  // Get current crawl's issue hashes
  const currentIssues = await prisma.issue.findMany({
    where: {
      scan: { crawlId: currentCrawlId },
      issueHash: { not: null },
    },
    select: { id: true, issueHash: true },
  })

  const currentHashes = new Set(currentIssues.map((i) => i.issueHash!))

  if (!previousCrawl) {
    // First crawl — all issues are new
    return { newIssues: currentHashes.size, fixedIssues: 0, recurring: 0 }
  }

  // Get previous crawl's issue hashes with their statuses
  const previousIssues = await prisma.issue.findMany({
    where: {
      scan: { crawlId: previousCrawl.id },
      issueHash: { not: null },
    },
    select: { id: true, issueHash: true, issueStatus: true },
  })

  const previousHashes = new Set(previousIssues.map((i) => i.issueHash!))

  // Build lookup of previous issue statuses by hash
  const previousStatusByHash = new Map<string, string>()
  for (const prev of previousIssues) {
    if (prev.issueHash) {
      previousStatusByHash.set(prev.issueHash, prev.issueStatus)
    }
  }

  // Compute diff
  let newIssues = 0
  let recurring = 0
  const carryOverUpdates: { id: string; issueStatus: string }[] = []

  for (const current of currentIssues) {
    if (!current.issueHash) continue
    if (previousHashes.has(current.issueHash)) {
      recurring++
      // Carry over dismissed/cant_fix status from previous crawl
      const prevStatus = previousStatusByHash.get(current.issueHash)
      if (prevStatus === 'dismissed' || prevStatus === 'cant_fix') {
        carryOverUpdates.push({ id: current.id, issueStatus: prevStatus })
      }
    } else {
      newIssues++
    }
  }

  // Apply status carryover (dismissed/cant_fix issues stay dismissed)
  if (carryOverUpdates.length > 0) {
    await prisma.$transaction(
      carryOverUpdates.map((update) =>
        prisma.issue.update({
          where: { id: update.id },
          data: { issueStatus: update.issueStatus as 'dismissed' | 'cant_fix' },
        })
      )
    )
  }

  // Update lastSeenScanId for recurring issues in current crawl
  const recurringHashes = currentIssues
    .filter((c) => c.issueHash && previousHashes.has(c.issueHash))
    .map((c) => c.id)

  if (recurringHashes.length > 0) {
    // Get the scan IDs for these issues to set lastSeenScanId
    const issuesWithScans = await prisma.issue.findMany({
      where: { id: { in: recurringHashes } },
      select: { id: true, scanId: true },
    })

    await prisma.$transaction(
      issuesWithScans.map((issue) =>
        prisma.issue.update({
          where: { id: issue.id },
          data: { lastSeenScanId: issue.scanId },
        })
      )
    )
  }

  // Fixed: in previous but not in current (and was open)
  const fixedHashes: string[] = []
  for (const prev of previousIssues) {
    if (
      prev.issueHash &&
      !currentHashes.has(prev.issueHash) &&
      prev.issueStatus === 'open'
    ) {
      fixedHashes.push(prev.issueHash)
    }
  }
  const fixedIssues = fixedHashes.length

  // Mark fixed issues
  if (fixedHashes.length > 0) {
    await prisma.issue.updateMany({
      where: {
        issueHash: { in: fixedHashes },
        scan: { crawlId: previousCrawl.id },
        issueStatus: 'open',
      },
      data: {
        issueStatus: 'fixed',
        fixedAtCrawlId: currentCrawlId,
      },
    })
  }

  return { newIssues, fixedIssues, recurring }
}
