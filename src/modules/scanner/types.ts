import type { Page } from 'playwright'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface RawFinding {
  ruleId: string
  type: 'confirmed' | 'potential'
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  elementSelector: string
  elementHtml: string
  description: string
  ruleHelp: string
  engineName: string
  boundingBox?: BoundingBox
}

export interface ScanEngine {
  name: string
  run(page: Page): Promise<RawFinding[]>
}
