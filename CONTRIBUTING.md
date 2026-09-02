# Contributing

Thank you for contributing to TaskFlow API.

## Development setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` if you need non-default settings.
4. Run `npm run dev` for local development.

## Quality checks

Before opening a pull request, run:

```bash
npm run check
```

Add or update Vitest tests for behavior changes. Keep route handlers thin, place business rules in services, and access state through repositories. Validate all external input with Zod and preserve the standard error envelope.

## Changes and releases

- Keep changes focused and document user-visible behavior in `CHANGELOG.md`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) where practical.
- Follow Semantic Versioning. Breaking API changes require a major version.
- Never commit credentials, generated coverage, `dist/`, or `node_modules/`.

## Pull requests

Explain the motivation, behavior impact, and validation performed. All CI checks must pass. By contributing, you agree that your work is licensed under the MIT License.
