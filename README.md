# BrokeBot

Phase 1 foundation for a local-first job automation assistant.

## Available Scripts

- `npm run dev` - start the API in watch mode
- `npm run db:migrate` - initialize the SQLite schema
- `npm run build` - compile TypeScript
- `npm run typecheck` - run TypeScript checks
- `npm run test` - run tests once
- `npm run test:watch` - run tests in watch mode

## Current API

- `GET /`
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/settings`
- `GET /api/settings/:key`
- `POST /api/settings`

## Current Hardening

- Standardized success and error envelopes
- Request IDs on every response
- Malformed JSON handling
- Zod validation for settings payloads
- Duplicate key protection in settings writes
- SQLite busy timeout
- Basic dashboard aggregation endpoint

## Example Settings Payload

```json
{
  "settings": [
    { "key": "dailyLimit", "value": 50 },
    { "key": "salaryThresholdLpa", "value": 18 },
    {
      "key": "roleKeywords",
      "value": ["software engineer", "frontend engineer"]
    }
  ]
}
```
