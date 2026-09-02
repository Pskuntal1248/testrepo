---
number: 104
title: Paginate the task listing endpoint
state: open
labels:
  - feature
  - api
impact: breaking-response-change
---

## Background

Task discovery now supports text search and structured filters, but the endpoint still returns every matching task. That response will become expensive for active projects and gives API consumers no predictable way to request manageable result sets.

## Proposed contract

Add one-based pagination to `GET /api/v1/tasks`:

- `page` defaults to `1`.
- `size` defaults to `20` and cannot exceed `100`.
- Search and filters must run before pagination.
- Replace the bare array with `{ data, pagination: { page, size, total, totalPages } }`.

This is an intentional response-shape change. `total` should count all tasks matching the discovery criteria, while `data` contains only the selected page.

## Acceptance criteria

- [ ] Default requests use page 1 and size 20.
- [ ] Custom pages preserve repository ordering.
- [ ] Search/filter totals are calculated before slicing.
- [ ] Invalid pages and sizes return validation errors.
- [ ] Size 100 is accepted and 101 is rejected.
- [ ] Existing task-list tests and documentation use the new envelope.
- [ ] OpenAPI defines pagination inputs and output metadata.

## Edge cases

An empty result has `total: 0` and `totalPages: 0`. Requesting a page beyond the last page returns an empty `data` array without changing aggregate totals.
