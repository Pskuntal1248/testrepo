---
number: 4
title: "feat: add pagination to task listing"
labels:
  - feature
closes: "#104"
base: main
head: feature/104-task-pagination
status: ready-for-review
breaking: true
---

## Overview

Introduces validated `page` and `size` controls for task listing and replaces the previous array response with a structured page containing `data` and aggregate pagination metadata.

## Behavior

The service first applies text search, status, priority, and assignee constraints. It then calculates `total` and `totalPages` from that matched collection before taking the requested slice. Defaults are page 1 and 20 records, with a hard maximum size of 100.

## Compatibility note

This intentionally changes the JSON shape returned by `GET /api/v1/tasks`. Consumers must read tasks from `data` rather than treating the response body as an array. Other collection endpoints are unchanged.

## Testing performed

The integration suite now verifies default metadata, custom page boundaries, filtered totals, maximum size acceptance, invalid page/size rejection, empty searches, and all earlier search/filter behavior through the envelope. TypeScript compilation and the production build are included in `npm run check`.

## Documentation

Updated OpenAPI with reusable page parameters and a `TaskPage` schema. README, API examples, and changelog call out the response migration and composition order.

## Related issue

Closes #104.
