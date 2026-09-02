---
number: 102
title: Add text search to task listing
state: open
labels:
  - feature
  - api
priority: medium
---

## User need

As project task counts grow, clients have to download the full task list and implement their own matching just to find work related to a phrase such as “payment” or “migration”. This creates inconsistent behavior between clients and unnecessary client-side code.

## Requested API

Allow an optional `search` query parameter on `GET /api/v1/tasks`. The server should perform a case-insensitive substring match against both the task name and description.

Examples:

- `?search=payment` finds “Payment retry logic”.
- `?search=PAYMENT` also finds descriptions mentioning “payment provider”.
- Omitting the parameter preserves the existing complete task list.

## Acceptance criteria

- [ ] Search covers task name and description.
- [ ] Matching is case-insensitive and uses substring semantics.
- [ ] Empty, malformed, or unsupported query input receives a validation error.
- [ ] Results use the existing plain-array response shape.
- [ ] OpenAPI and API documentation include the query parameter.
- [ ] Tests cover matches in both fields and no-match behavior.

## Not included

Ranking, fuzzy matching, label/status filters, pagination, and full-text indexing are separate future work.
