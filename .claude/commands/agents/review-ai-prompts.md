# AI & LLM Prompts Review Agent

Review Azure OpenAI integration, prompt engineering, and AI enrichment patterns in ClearSight.

## What to Check

### LLM Provider (`src/modules/ai/providers/azure-openai.ts`)
- API endpoint URL constructed correctly (uses `AZURE_OPENAI_ENDPOINT` directly)
- API key sent in correct header (`api-key` for Azure, not `Authorization: Bearer`)
- Request timeout configured (LLM calls can hang)
- Response parsing handles malformed JSON gracefully
- Token limits respected (don't send more context than the model supports)
- Rate limiting / retry logic for 429 responses

### Prompt Quality (`src/modules/ai/prompts/`)
- **enrich-issues**: Prompt produces structured output (descriptions, fix suggestions, confidence scores)
- **generate-summary**: Prompt produces overallScore, topPriorities, positiveFindings
- **report-narrative**: Prompt produces human-readable report text
- Prompts include clear output format instructions (JSON schema)
- Prompts don't leak sensitive user data unnecessarily
- System prompt establishes role and constraints
- Few-shot examples included where output format is complex

### Token Efficiency
- Issue batching: multiple issues sent in one LLM call (not one call per issue)
- HTML snippets truncated before sending to LLM (no full page HTML)
- Only relevant issue fields sent (not raw axe output)
- Response size is bounded

### Fallback Handling
- If LLM call fails, scan completes with `completed_partial` status (not `failed`)
- Raw axe-core findings preserved even without AI enrichment
- Timeout on LLM calls prevents indefinite hanging
- Network errors vs API errors vs malformed response errors handled differently

### Output Validation
- LLM response parsed and validated before storing
- Confidence scores clamped to 0-1 range
- Overall score clamped to 0-100
- Missing/null fields in LLM response don't crash the pipeline

### Cost Awareness
- No unnecessary LLM calls (e.g., don't re-enrich already-enriched issues)
- Prompt length is reasonable (not sending entire page source)
- Model selection appropriate for task (GPT-4.1 for quality, could use smaller model for simple tasks)

## Files to Focus On
- `src/modules/ai/providers/azure-openai.ts` — LLM provider
- `src/modules/ai/prompts/` — All prompt templates
- `src/modules/pipeline/stages/` — Enrich stage
- `src/worker/processors/ai-enrichment.processor.ts` — AI job processor

## Output Format
List findings as:
- **[BLOCKER]** or **[SUGGESTION]** or **[GOOD]**
- File path and line number
- Brief explanation and fix recommendation
