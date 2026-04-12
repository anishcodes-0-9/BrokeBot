# BrokeBot

Phase 2.1 adds base resume schema validation and resume storage APIs.

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
- `GET /api/resume`
- `GET /api/resume/meta`
- `POST /api/resume`
- `DELETE /api/resume`

## Current Hardening

- Standardized success and error envelopes
- Request IDs on every response
- Malformed JSON handling
- Zod validation for settings and resume payloads
- Duplicate key protection in settings writes
- SQLite busy timeout
- Basic dashboard aggregation endpoint

## Resume Payload Shape

```json
{
  "basics": {
    "fullName": "Anish Krishnan",
    "email": "anish@example.com",
    "phone": "+91 9876543210",
    "location": "Kochi, India",
    "linkedin": "https://www.linkedin.com/in/anishkrishnan",
    "github": "https://github.com/anishkrishnan",
    "portfolio": "https://anishkrishnan.dev"
  },
  "summary": "Frontend and full stack engineer with experience building user-facing applications and support systems.",
  "skills": [
    {
      "category": "Frontend",
      "items": ["React", "TypeScript", "Tailwind CSS"]
    }
  ],
  "experience": [
    {
      "company": "Acme Tech",
      "title": "Frontend Engineer",
      "location": "Remote",
      "startDate": "2023-01",
      "endDate": "2024-12",
      "bullets": [
        "Built production-ready React interfaces for internal tooling."
      ]
    }
  ],
  "projects": [
    {
      "name": "BrokeBot",
      "link": "https://github.com/anishkrishnan/brokebot",
      "bullets": [
        "Built a local-first job automation tool with Node.js and React."
      ],
      "technologies": ["Node.js", "React", "SQLite", "Playwright"]
    }
  ],
  "education": [
    {
      "institution": "Example University",
      "degree": "Bachelor of Technology",
      "field": "Computer Science",
      "startDate": "2019",
      "endDate": "2023",
      "grade": "8.4 CGPA"
    }
  ]
}
```

---

## Verify

Run:

```bash
npm run typecheck
npm run test
npm run dev
```
