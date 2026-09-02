---
number: 1
title: "feat: add labels to tasks"
labels:
  - feature
closes: "#101"
base: main
head: feature/101-task-labels
status: ready-for-review
---

## What changed

- Added `labels: string[]` to task records and API responses.
- Added shared create/update validation for at most 10 unique labels.
- Trimmed and normalized accepted labels to lowercase while restricting them to short alphanumeric, hyphen-separated values.
- Updated OpenAPI, README, API examples, and changelog documentation.
- Added integration coverage for default labels, normalization, replacement updates, duplicates, malformed labels, and count limits.

## Why

TaskFlow users need a lightweight way to attach domain context that does not fit status or priority. Normalizing labels at the boundary keeps stored values predictable and avoids case-only duplicates without introducing a separate label resource.

## Testing

- `npm run check`
- Verified unlabeled tasks return `labels: []`.
- Verified PATCH replaces and normalizes the label array.
- Verified duplicate, invalid, and oversized label collections return validation errors.

## Related issue

Closes #101
