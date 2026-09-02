---
number: 5
title: "perf: optimize task queries"
labels:
  - performance
  - internal
closes: "#105"
base: main
head: perf/105-optimize-task-queries
status: ready-for-review
api_change: none
---

## Summary

Replaces full task scans for structured criteria with a specialized in-memory `TaskRepository`. The repository maintains secondary indexes keyed by project, status, priority, and assignee while retaining the generic repository interface used by services.

## Query strategy

`TaskRepository.query()` resolves each supplied indexed predicate to an ID set, selects the smallest set as its starting point, and checks the remaining criteria only against those candidates. Candidate IDs are sorted by a stable insertion ordinal so query optimization does not alter API ordering. A query without structured predicates intentionally falls back to `findAll()` because every record is a candidate.

The task service now asks the repository for status/priority/assignee candidates before applying case-insensitive name and description search. Pagination and aggregate totals continue to operate on the final matched set.

## Index consistency

Repository mutation methods maintain all indexes:

- `create` replaces stale entries safely if an ID already exists.
- `update` removes old keys before registering new values.
- `delete` removes index and ordering state.
- `clear` resets records, indexes, and sequence state.

Project deletion and assigned-user deletion checks now use project and assignee indexes instead of scanning task arrays.

## Verification

Added repository-level tests with 600 records to compare a four-index intersection against an independently filtered expected result. A spy asserts that filtered queries never invoke `findAll()`. Additional mutation tests cover index migration, deletion, clearing, and insertion-order stability after updates. Existing API integration tests verify the unchanged search/filter/pagination contract.

Run: `npm run check`

## Risk and rollback

The primary risk is stale secondary-index state after mutation. Focused lifecycle tests guard that behavior, and reverting to `InMemoryRepository<Task>` plus service-side filtering remains straightforward because no HTTP types or payloads changed.

## Related issue

Closes #105.
