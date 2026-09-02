# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Normalized, unique labels on task create and update operations.
- Case-insensitive task search across names and descriptions.
- Combinable task filters for status, priority, and assignee.
- Pagination controls for task listing.

### Changed

- Task list responses now use a `{ data, pagination }` envelope instead of a plain array.

## [1.0.0] - 2026-09-03

### Added

- TypeScript and Express REST API with Basic authentication.
- In-memory repository and service architecture for users, projects, tasks, and comments.
- Task statuses, priorities, project validation, and active-user assignment validation.
- Zod request validation and consistent JSON error responses.
- OpenAPI 3.1 document and API usage documentation.
- Vitest and Supertest integration tests.
- Typechecking, build, coverage, and CI workflows.

[1.0.0]: https://example.invalid/taskflow/releases/tag/v1.0.0
