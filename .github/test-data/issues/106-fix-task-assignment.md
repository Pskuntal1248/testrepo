---
number: 106
title: Active users without a display name cannot be assigned
state: open
labels:
  - bug
  - api
severity: medium
---

## Problem

Creating or updating a task with an active assignee can return `400` when that user's optional `displayName` is empty. The error says the assignee must be active even though the referenced user exists and has `active: true`.

This makes assignment behavior depend on profile completeness rather than account eligibility. Users imported from systems that provide an email but no display name are affected.

## Reproduction

1. Create a user with a valid email, `displayName: ""`, and `active: true`.
2. Create a project.
3. Create a task using that user's ID as `assigneeId`.
4. Observe `BAD_REQUEST: assigneeId must reference an active user`.

## Expected behavior

Assignment validation should only require that the user exists and is active. Display name content should not affect assignment eligibility.

## Acceptance criteria

- [ ] Active users can be assigned regardless of whether `displayName` is empty.
- [ ] Missing and inactive users remain invalid assignees.
- [ ] The same rule applies to task creation and updates through the shared validation path.
- [ ] A regression test fails against the old behavior and passes with the fix.
- [ ] No task or user payload shape changes.
