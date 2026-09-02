---
number: 6
title: "fix: resolve task assignment validation issue"
labels:
  - bug
closes: "#11"
base: main
head: fix/106-task-assignment
status: ready-for-review
---

## What was wrong

`TaskService.validateAssignee()` combined three checks: user existence, active status, and a non-empty display name. The last condition was unrelated to assignment eligibility and caused active users with incomplete profiles to be rejected with a misleading active-user error.

## Fix

Removed the display-name condition from assignment validation. A non-null assignee is now accepted exactly when the referenced user exists and `active` is true. The existing behavior for null, unknown, and inactive assignees is unchanged.

## Regression coverage

Added an API integration test that creates an active user with `displayName: ""` and successfully assigns that user while creating a task. Existing relationship tests continue to verify that inactive users are rejected.

## API impact

This is a corrective behavior change only. Request/response schemas, authentication, task query behavior, and error formats are unchanged. The published relationship rule already describes the corrected behavior, so no API documentation migration is required.

## Validation

Run `npm run check` to execute typechecking, repository and API tests, and the production TypeScript build.

## Related issue

Closes #11.
