import { LinkTextEngine, TouchTargetEngine } from '@/modules/scanner'
import { ScanOrchestrator } from '@/modules/scanner'
import type { PipelineContext, PipelineStage } from '../types'

export class CustomChecksStage implements PipelineStage {
  readonly name = 'Running custom checks'
  readonly progress = 55

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.renderedPage) {
      throw new Error('CustomChecksStage requires a rendered page. Did the FetchStage run?')
    }

    const orchestrator = new ScanOrchestrator([
      new LinkTextEngine(),
      new TouchTargetEngine(),
    ])

    const customFindings = await orchestrator.run(context.renderedPage.page)

    return {
      ...context,
      rawFindings: [...context.rawFindings, ...customFindings],
    }
  }
}
