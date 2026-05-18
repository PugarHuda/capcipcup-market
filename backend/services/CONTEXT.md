# backend/services/ — AI Provider Proxy Logic

> **For AI agents:** Contains the logic for calling external AI APIs and returning results.

## Files

### aiProviders.ts
Core proxy logic. Maps CapCipCup service IDs to external AI provider configurations.

**SERVICE_CONFIGS** — Hardcoded service definitions (for hackathon MVP):
- Service 1: "Text Summarizer" — Groq, llama-3.1-8b-instant
- Service 2: "Sentiment Analyzer" — Groq, llama-3.1-8b-instant
- Service 3: "Code Explainer" — Groq, llama-3.3-70b-versatile

**Key functions:**
- `callProvider(serviceId, input)` → calls the right AI API, returns `InferenceResult`
- `getServiceConfig(id)` → returns config for a service
- `getAllServiceConfigs()` → returns all service configs

**InferenceResult type:**
```typescript
{ output: string, model: string, responseTimeMs: number, success: boolean, error?: string }
```

## Supported Providers

### Groq (Primary)
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Auth: `Authorization: Bearer ${GROQ_API_KEY}`
- OpenAI-compatible API format
- Models: llama-3.1-8b-instant (fast), llama-3.3-70b-versatile (quality)
- Free API key at console.groq.com

### HuggingFace (Not yet implemented)
- Endpoint: `https://api-inference.huggingface.co/models/{model}`
- Auth: `Authorization: Bearer ${HUGGINGFACE_API_KEY}`
- Different request/response format per model

## Adding a New AI Service
1. Add entry to `SERVICE_CONFIGS` with unique ID
2. Set provider, model, systemPrompt
3. If new provider (not Groq), implement `callNewProvider()` function
4. Update free tier config in `db/database.ts`
5. Update service count in frontend if needed
