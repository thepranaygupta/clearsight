import type { RenderedPage } from '../scanner/renderer/types'
import type { RawFinding } from '../scanner/types'
import type { EnrichedIssue, ScanSummary } from '../ai/types'

export interface PipelineContext {
  scanId: string
  url: string
  renderedPage?: RenderedPage
  screenshot?: Buffer
  rawFindings: RawFinding[]
  enrichedIssues: EnrichedIssue[]
  summary?: ScanSummary
  pageHtml?: string
  crawlId?: string
  pageId?: string
  siteId?: string
  llmFailed?: boolean
}

export interface PipelineStage {
  name: string
  progress: number
  execute(context: PipelineContext): Promise<PipelineContext>
}
