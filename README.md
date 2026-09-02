# TaskFlow API

TaskFlow API v1.0.0 is a professional baseline REST service for managing users, projects, tasks, assignments, and task comments. It uses TypeScript, Express, Zod, and an in-memory repository/service architecture.

> Data is intentionally ephemeral and is reset whenever the process restarts.

## Requirements

- Node.js 20+
- npm 10+

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The server listens on `http://localhost:3000` by default. The baseline does **not** provide `GET /health`.

## Authentication

All `/api/v1` endpoints use HTTP Basic authentication. Defaults are intended for local development only:

- Username: `admin`
- Password: `taskflow`

Set `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` in production. Never use the defaults on a public deployment, and terminate TLS at the application edge because Basic credentials are only encoded, not encrypted.

```bash
curl -u admin:taskflow http://localhost:3000/api/v1/tasks
```

## API

- Base URL: `/api/v1`
- OpenAPI 3.1: `/openapi.json`
- Static documentation landing page: `/docs`
- Detailed examples: [`docs/api.md`](docs/api.md)

Task records use the field **`name`** in v1.0.0 and may include up to 10 normalized labels. Task listing supports case-insensitive text search plus combinable `status`, `priority`, and `assignee` filters, and returns `{ data, pagination }` with a default page size of 20.

## Architecture

```text
src/
├── domain/        # Models and Zod request schemas
├── middleware/    # Basic auth, validation, and errors
├── repositories/  # Generic in-memory persistence
├── routes/        # Express transport adapters
├── services/      # Business and relationship rules
├── app.ts         # Composable application factory
└── server.ts      # Process entry point
```

`createApp()` accepts optional repositories, making the API easy to isolate in tests or embed in another process.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run with automatic TypeScript reload |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled output |
| `npm test` | Run Vitest once |
| `npm run test:coverage` | Generate test coverage |
| `npm run typecheck` | Check TypeScript without emitting |
| `npm run check` | Typecheck, test, and build |

## Scope

Included: users, projects, tasks, task labels, task text search, filters and pagination, fixed statuses/priorities, assignment validation, comments, Basic auth, validation/errors, and OpenAPI documentation.

Not included in this baseline: health endpoint, persistence, or templates.

## License

[MIT](LICENSE)
