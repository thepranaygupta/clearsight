import { ScanOrchestrator, AxeCoreEngine } from '@/modules/scanner'
import type { PipelineContext, PipelineStage } from '../types'

export class AnalyzeStage implements PipelineStage {
  readonly name = 'Analyzing accessibility'
  readonly progress = 40

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.renderedPage) {
      throw new Error('AnalyzeStage requires a rendered page. Did the FetchStage run?')
    }

    const orchestrator = new ScanOrchestrator([new AxeCoreEngine()])
    const rawFindings = await orchestrator.run(context.renderedPage.page)

    return {
      ...context,
      rawFindings,
    }
  }
}
