---
number: 101
title: Add labels to tasks
state: open
labels:
  - feature
  - api
assignee: unassigned
---

## Problem

Teams using TaskFlow can set status and priority, but they cannot add lightweight domain context such as `backend`, `customer-request`, or `release`. Consumers currently keep this information outside TaskFlow, which makes task handoffs harder and leads to inconsistent naming.

## Proposed behavior

Add a `labels` array to task create, update, and response payloads.

- New tasks default to an empty array.
- Normalize incoming labels to lowercase.
- Reject invalid, duplicate, or excessive labels.
- Updating labels replaces the current set; an empty array clears it.
- Keep task listing as a plain array and do not add label filtering in this issue.

## Acceptance criteria

- [ ] Task responses always include `labels`.
- [ ] Create and patch operations apply the same validation.
- [ ] Case variants are considered duplicates after normalization.
- [ ] OpenAPI and user-facing documentation describe the constraints.
- [ ] Automated tests cover defaults, normalization, updates, and invalid input.

## Out of scope

Searching or filtering tasks by label, label administration endpoints, colors, and project-level label catalogs are intentionally deferred.
