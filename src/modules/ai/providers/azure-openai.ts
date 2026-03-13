import { config } from '@/config'
import type { RawFinding } from '../../scanner/types'
import type {
  AIProvider,
  EnrichedIssue,
  PageContext,
  ScanSummary,
} from '../types'
import { buildEnrichIssuesPrompt } from '../prompts/enrich-issues'
import { buildGenerateSummaryPrompt } from '../prompts/generate-summary'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AzureOpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const MODEL_DEPLOYMENT = 'gpt-4.1'
const MAX_RETRIES = 1
const RETRY_DELAY_MS = 1000

export class AzureOpenAIProvider implements AIProvider {
  private endpoint: string
  private apiKey: string
  private apiVersion: string

  constructor() {
    this.endpoint = config.ai.endpoint
    this.apiKey = config.ai.apiKey
    this.apiVersion = config.ai.apiVersion
  }

  async enrichIssues(
    rawFindings: RawFinding[],
    pageContext: PageContext,
  ): Promise<EnrichedIssue[]> {
    if (rawFindings.length === 0) return []

    const { system, user } = buildEnrichIssuesPrompt(rawFindings, pageContext)
    const messages: ChatMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]

    const responseText = await this.chatCompletion(messages)
    const parsed = JSON.parse(responseText)

    if (!Array.isArray(parsed)) {
      throw new Error(
        `Expected JSON array from enrich-issues response, got ${typeof parsed}`,
      )
    }

    return parsed as EnrichedIssue[]
  }

  async generateSummary(
    issues: EnrichedIssue[],
    pageContext: PageContext,
  ): Promise<ScanSummary> {
    const { system, user } = buildGenerateSummaryPrompt(issues, pageContext)
    const messages: ChatMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]

    const responseText = await this.chatCompletion(messages)
    const parsed = JSON.parse(responseText)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(
        `Expected JSON object from generate-summary response, got ${typeof parsed}`,
      )
    }

    return parsed as ScanSummary
  }

  private async chatCompletion(messages: ChatMessage[]): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${MODEL_DEPLOYMENT}/chat/completions?api-version=${this.apiVersion}`

    const body = {
      messages,
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: 'json_object' as const },
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(
            `Azure OpenAI API error (${response.status}): ${errorBody}`,
          )
        }

        const data = (await response.json()) as AzureOpenAIResponse

        const choice = data.choices?.[0]
        if (!choice) {
          throw new Error('Azure OpenAI returned no choices in response')
        }

        if (choice.finish_reason === 'content_filter') {
          throw new Error(
            'Azure OpenAI content filter triggered; response was blocked',
          )
        }

        const content = choice.message?.content
        if (!content) {
          throw new Error('Azure OpenAI returned empty message content')
        }

        return content
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }
    }

    throw new Error(
      `Azure OpenAI request failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`,
    )
  }
}
