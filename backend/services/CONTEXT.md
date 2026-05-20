# backend/services/ — AI Provider Integration (DEPRECATED)

## Status: MERGED INTO api/index.ts

AI provider logic is now inline in `api/index.ts`:
- `callOpenRouter(model, systemPrompt, input)` function
- Uses OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`)
- Three models: GPT-OSS 120B, Nemotron 3 Super 120B, DeepSeek V4 Flash
- All free tier, auth via `OPENROUTER_API_KEY`

This folder can be ignored.
