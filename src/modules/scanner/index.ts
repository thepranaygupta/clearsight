import type { Page } from 'playwright'
import type { RawFinding, ScanEngine } from './types'
import { AxeCoreEngine } from './engines/axe-core'
import { LinkTextEngine } from './engines/custom/link-text'
import { TouchTargetEngine } from './engines/custom/touch-targets'

export class ScanOrchestrator {
  private engines: ScanEngine[]

  constructor(engines: ScanEngine[]) {
    this.engines = engines
  }

  /** Creates an orchestrator with the default set of scan engines. */
  static createDefault(): ScanOrchestrator {
    return new ScanOrchestrator([
      new AxeCoreEngine(),
      new LinkTextEngine(),
      new TouchTargetEngine(),
    ])
  }

  /** Runs all scan engines against the provided page and collects findings. */
  async run(page: Page): Promise<RawFinding[]> {
    const results = await Promise.allSettled(
      this.engines.map((engine) => engine.run(page))
    )

    const findings: RawFinding[] = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === 'fulfilled') {
        findings.push(...result.value)
      } else {
        console.error(
          `[ScanOrchestrator] Engine "${this.engines[i].name}" failed:`,
          result.reason
        )
      }
    }

    return findings
  }
}

export type { RawFinding, ScanEngine } from './types'
export type { RenderedPage, PageRenderer } from './renderer/types'
export { PlaywrightRenderer } from './renderer/playwright'
export { AxeCoreEngine } from './engines/axe-core'
export { LinkTextEngine } from './engines/custom/link-text'
export { TouchTargetEngine } from './engines/custom/touch-targets'
