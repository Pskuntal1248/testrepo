---
number: 2
title: "feat: add task search"
labels:
  - feature
related: "#102"
closes: "#102"
base: main
head: feature/102-task-search
review_state: ready
---

## Summary

Adds an optional `search` query to the task collection endpoint. Validated search text is passed into the task service, which checks normalized task names and descriptions while retaining repository order and the existing array response.

## Implementation notes

The in-memory repository remains responsible only for storage. Search is a business-facing list operation, so filtering lives in `TaskService`; this keeps the repository reusable and avoids coupling persistence to HTTP query syntax. Zod rejects blank, repeated/non-string, oversized, and unknown query values at the route boundary.

## Verification

Integration tests create tasks with the target phrase in different fields and verify mixed-case, whitespace-trimmed matching. They also exercise empty results and invalid query objects. The full typecheck, test suite, and build run through `npm run check`.

## Documentation

The OpenAPI parameter definition, API guide, README scope, and changelog describe the new behavior and its limits.

## Tracking

Related to #102. Closes #102.
