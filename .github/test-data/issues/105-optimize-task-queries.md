---
number: 105
title: Reduce full scans in in-memory task queries
state: open
labels:
  - performance
  - internal
component: repository
---

## Technical context

Task listing now supports search, structured filters, and pagination. The current service always calls `findAll()` and evaluates every task, even when an exact status, priority, or assignee filter could narrow the candidate set substantially. Project and user deletion guards also repeat full task scans.

This is acceptable for the initial baseline but scales poorly as the in-memory dataset grows and makes every structured query O(n) before text matching or page slicing.

## Proposed approach

Introduce a task-specific repository with secondary indexes for:

- project ID
- status
- priority
- assignee ID

For multi-filter queries, begin with the smallest available candidate set and verify remaining predicates against only those IDs. Preserve repository insertion order in returned results and keep indexes synchronized with create, update, delete, and clear operations.

## Acceptance criteria

- [ ] Public API payloads, validation, filtering semantics, and pagination remain unchanged.
- [ ] Structured task-list filters use repository query support rather than `findAll()`.
- [ ] Text search runs only over candidates selected by structured filters.
- [ ] Project/user reference checks use indexed lookups.
- [ ] Updates cannot leave stale index entries.
- [ ] Tests exercise large candidate sets, index intersections, mutation maintenance, and stable ordering.

## Non-goals

No external database, full-text index, caching layer, public performance guarantee, or API contract change is required.
