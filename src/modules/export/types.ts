import type { ScanWithRelations } from '../db'

export type ExportFormat = 'pdf' | 'excel'

export interface ExportOptions {
  scan: ScanWithRelations
  executiveSummary?: string | null
}

export interface ReportGenerator {
  generate(options: ExportOptions): Promise<Buffer>
  contentType: string
  fileExtension: string
}
