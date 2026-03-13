import type { Page } from 'playwright'

export interface RawFinding {
  ruleId: string
  type: 'confirmed' | 'potential'
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
  wcagLevel: 'A' | 'AA'
  elementSelector: string
  elementHtml: string
  description: string
  engineName: string
}

export interface ScanEngine {
  name: string
  run(page: Page): Promise<RawFinding[]>
}
