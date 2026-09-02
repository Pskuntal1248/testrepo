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
| GET, POST | `/tasks` | List or create tasks |
| GET, PATCH, DELETE | `/tasks/:id` | Read, update, or delete a task |
| GET, POST | `/tasks/:taskId/comments` | List or create comments |
| GET, PATCH, DELETE | `/tasks/:taskId/comments/:commentId` | Read, update, or delete a comment |
| GET | `/statuses` | List `todo`, `in_progress`, and `done` |
| GET | `/priorities` | List `low`, `medium`, `high`, and `urgent` |

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
  -d '{"projectId":"PROJECT_UUID","name":"Publish release notes","priority":"high","assigneeId":"USER_UUID"}'
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

## Relationship rules

- A task must reference an existing project.
- An assignee must be an active user.
- A comment author must be an active user.
- Projects with tasks cannot be deleted.
- Users assigned to tasks or referenced by comments cannot be deleted.
- Deleting a task also deletes its comments.

See `/openapi.json` for complete request and response schemas.
