---
number: 103
title: Filter the task collection by workflow fields
state: open
labels:
  - feature
  - api
milestone: task-discovery
---

## Context

Task search helps users locate text, but clients still receive unrelated work when they need a focused view such as completed urgent tasks or tasks assigned to one teammate. Every consumer currently repeats this filtering after downloading the collection.

## Desired behavior

Extend `GET /api/v1/tasks` with optional filters:

- `status` using the existing task status values
- `priority` using the existing priority values
- `assignee` containing a user UUID and matching `assigneeId`

All supplied filters should combine with each other and with `search` using AND semantics. Preserve insertion order and the plain-array response shape.

## Acceptance criteria

- [ ] Each filter works independently.
- [ ] Multiple filters narrow the same result set.
- [ ] Search and structured filters can be used together.
- [ ] Unsupported enum values and malformed assignee IDs return `400` validation errors.
- [ ] Omitting filters retains the current task-list behavior.
- [ ] OpenAPI, examples, and automated tests cover the contract.

## Scope note

This issue does not add pagination, sorting, unassigned-task syntax, or validation that an assignee UUID currently exists.
