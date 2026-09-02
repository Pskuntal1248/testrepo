# TaskFlow API reference

## Conventions

The v1 base path is `/api/v1`. Send `Content-Type: application/json` for request bodies and HTTP Basic credentials on every API request. `/docs` and `/openapi.json` are public.

Successful collection reads return plain arrays. Errors use a stable envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "path": "email", "message": "Invalid email" }]
  }
}
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET, POST | `/users` | List or create users |
| GET, PATCH, DELETE | `/users/:id` | Read, update, or delete a user |
| GET, POST | `/projects` | List or create projects |
| GET, PATCH, DELETE | `/projects/:id` | Read, update, or delete a project |
| GET, POST | `/tasks` | Paginated task listing or task creation |
| GET, PATCH, DELETE | `/tasks/:id` | Read, update, or delete a task |
| GET, POST | `/tasks/:taskId/comments` | List or create comments |
| GET, PATCH, DELETE | `/tasks/:taskId/comments/:commentId` | Read, update, or delete a comment |
| GET | `/statuses` | List `todo`, `in_progress`, and `done` |
| GET | `/priorities` | List `low`, `medium`, `high`, and `urgent` |

## Task search and filtering

`GET /tasks` supports these optional query parameters:

| Parameter | Validation | Behavior |
| --- | --- | --- |
| `search` | 1–200 characters after trimming | Case-insensitive substring match against `name` or `description` |
| `status` | `todo`, `in_progress`, or `done` | Exact status match |
| `priority` | `low`, `medium`, `high`, or `urgent` | Exact priority match |
| `assignee` | UUID | Exact match against the task's `assigneeId` |
| `page` | Integer ≥ 1; default `1` | One-based page number |
| `size` | Integer from 1–100; default `20` | Tasks per page |

Search and filters are combined with AND semantics before pagination, and matching tasks retain repository order. For example:

```bash
curl -u admin:taskflow 'http://localhost:3000/api/v1/tasks?search=payment&status=done&priority=high&assignee=USER_UUID&page=1&size=20'
```

Task listing returns a pagination envelope:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

`total` and `totalPages` describe the complete filtered set, not only the current page. A page beyond the final page returns empty `data` while preserving those totals. Invalid enums, malformed UUIDs, non-positive pages, sizes above 100, and unsupported query parameters return a validation error.

## Example workflow

Create a user:

```bash
curl -u admin:taskflow -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"alex@example.com","displayName":"Alex Rivera"}'
```

Create a project:

```bash
curl -u admin:taskflow -X POST http://localhost:3000/api/v1/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Website launch","description":"Coordinate release"}'
```

Create a task using the returned project and user IDs:

```bash
curl -u admin:taskflow -X POST http://localhost:3000/api/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{"projectId":"PROJECT_UUID","name":"Publish release notes","priority":"high","assigneeId":"USER_UUID","labels":["Release","API-Docs"]}'
```

A v1 task response includes `name`:

```json
{
  "id": "TASK_UUID",
  "projectId": "PROJECT_UUID",
  "name": "Publish release notes",
  "description": "",
  "status": "todo",
  "priority": "high",
  "assigneeId": "USER_UUID",
  "labels": ["release", "api-docs"],
  "createdAt": "2026-09-03T12:00:00.000Z",
  "updatedAt": "2026-09-03T12:00:00.000Z"
}
```

Create a comment:

```bash
curl -u admin:taskflow -X POST http://localhost:3000/api/v1/tasks/TASK_UUID/comments \
  -H 'Content-Type: application/json' \
  -d '{"authorId":"USER_UUID","body":"Ready for review."}'
```

## Task labels

Tasks default to an empty `labels` array. Create and update requests may supply up to 10 labels. Each label is trimmed, normalized to lowercase, and must be 1–30 characters using alphanumeric segments separated by single hyphens, such as `api`, `priority-1`, or `ready-for-review`. Labels must be unique after normalization; sending both `Backend` and `backend` is invalid. Updating `labels` replaces the complete array, and sending `[]` removes all labels.

## Relationship rules

- A task must reference an existing project.
- An assignee must be an active user.
- A comment author must be an active user.
- Projects with tasks cannot be deleted.
- Users assigned to tasks or referenced by comments cannot be deleted.
- Deleting a task also deletes its comments.

See `/openapi.json` for complete request and response schemas.
