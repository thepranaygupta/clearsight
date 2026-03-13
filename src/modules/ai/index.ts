import { AzureOpenAIProvider } from './providers/azure-openai'
import type { AIProvider } from './types'

export type {
  AIProvider,
  EnrichedIssue,
  PageContext,
  ScanSummary,
} from './types'

export function createAIProvider(): AIProvider {
  return new AzureOpenAIProvider()
}
