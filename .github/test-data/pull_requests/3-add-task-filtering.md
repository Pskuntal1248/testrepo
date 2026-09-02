---
number: 3
title: "feat: add task filtering"
labels:
  - feature
closes: "#103"
base: main
head: feature/103-task-filtering
status: ready-for-review
---

## What changed

Task listing now accepts `status`, `priority`, and `assignee` alongside the existing `search` parameter. The Zod query schema validates workflow enums and requires a UUID for assignee input. `TaskService` evaluates every provided criterion against each task using AND semantics.

## Design rationale

Filtering remains in the service layer because the repository is a generic in-memory store and should not know about API-specific discovery options. A well-formed but unknown assignee UUID returns no matches, while malformed UUIDs fail at the request boundary.

## Test coverage

The integration suite creates tasks spanning multiple statuses, priorities, and owners. It verifies each filter separately, a four-criterion search/filter combination, stable result ordering, and validation failures for every invalid filter type.

## API documentation

OpenAPI exposes three reusable query parameter definitions. The API guide includes a parameter table and combined curl example, while the README and changelog reflect the expanded task-list capabilities.

## Related work

Closes #103.
