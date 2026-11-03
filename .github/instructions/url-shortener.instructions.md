---
applyTo: "**/*.{ts,tsx}"
---

# URL Shortener Project Instructions

## Technology Stack
- Next.js with App Router
- TypeScript
- Neon PostgreSQL

## Database Rules
- Use the existing public.links table.
- Columns: id, original_url, short_code, title, created_at.
- PostgreSQL automatically generates id and created_at.
- Never hardcode database credentials.
- Use environment variables for database connections.

## Coding Rules
- Follow the installed Next.js documentation.
- Use TypeScript for new application code.
- Validate URLs before saving them.
- Handle database errors gracefully.
- Explain important code changes.

## Redirect Rules
- Look up links using short_code.
- Redirect to the corresponding original_url.
- Return a 404 response when a short code is missing.
- Do not redirect to unsafe URL schemes.
