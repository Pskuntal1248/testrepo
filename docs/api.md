# TaskFlow API reference

## Conventions

The v1 base path is `/api/v1`. Send `Content-Type: application/json` for request bodies and HTTP Basic credentials on every API request. `/docs` and `/openapi.json` are public.

Successful collection reads return plain arrays, except for `/tasks` which returns a paginated envelope (`{ data, pagination }`). Errors use a stable envelope:

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

---

## 1. Authentication Examples

TaskFlow API uses HTTP Basic Authentication. All endpoints under `/api/v1` require authentication.

### Successful Request with Basic Auth
```bash
curl -i -u admin:taskflow http://localhost:3000/api/v1/users
```
Response `200 OK`:
```json
[
  {
    "id": "11111111-1111-4111-8111-111111111111",
    "email": "admin@example.com",
    "displayName": "Administrator",
    "active": true,
    "createdAt": "2026-09-03T12:00:00.000Z",
    "updatedAt": "2026-09-03T12:00:00.000Z"
  }
]
```

### Authentication Failure
Requests with missing or invalid credentials receive a `401 Unauthorized` response:
```bash
curl -i http://localhost:3000/api/v1/users
```
Response `401 Unauthorized`:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

---

## 2. Projects Examples

### Create a Project
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -u admin:taskflow \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App Launch",
    "description": "Cross-platform mobile application development"
  }'
```
Response `201 Created`:
```json
{
  "id": "p1010000-0000-4000-8000-000000000001",
  "name": "Mobile App Launch",
  "description": "Cross-platform mobile application development",
  "createdAt": "2026-09-03T12:00:00.000Z",
  "updatedAt": "2026-09-03T12:00:00.000Z"
}
```

### List Projects
```bash
curl -u admin:taskflow http://localhost:3000/api/v1/projects
```
Response `200 OK`:
```json
[
  {
    "id": "p1010000-0000-4000-8000-000000000001",
    "name": "Mobile App Launch",
    "description": "Cross-platform mobile application development",
    "createdAt": "2026-09-03T12:00:00.000Z",
    "updatedAt": "2026-09-03T12:00:00.000Z"
  }
]
```

### Update a Project
```bash
curl -X PATCH http://localhost:3000/api/v1/projects/p1010000-0000-4000-8000-000000000001 \
  -u admin:taskflow \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated project description for mobile roadmap"
  }'
```
Response `200 OK`:
```json
{
  "id": "p1010000-0000-4000-8000-000000000001",
  "name": "Mobile App Launch",
  "description": "Updated project description for mobile roadmap",
  "createdAt": "2026-09-03T12:00:00.000Z",
  "updatedAt": "2026-09-03T12:05:00.000Z"
}
```

### Delete a Project
```bash
curl -X DELETE http://localhost:3000/api/v1/projects/p1010000-0000-4000-8000-000000000001 \
  -u admin:taskflow
```
Response `204 No Content`. Note: Projects containing tasks cannot be deleted until all tasks are deleted.

---

## 3. Tasks Examples

### Create a Task
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -u admin:taskflow \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "p1010000-0000-4000-8000-000000000001",
    "name": "Implement authentication flow",
    "description": "OAuth2 and Basic authentication integration",
    "priority": "high",
    "status": "todo",
    "assigneeId": "11111111-1111-4111-8111-111111111111",
    "labels": ["backend", "security"]
  }'
```
Response `201 Created`:
```json
{
  "id": "t2020000-0000-4000-8000-000000000001",
  "projectId": "p1010000-0000-4000-8000-000000000001",
  "name": "Implement authentication flow",
  "description": "OAuth2 and Basic authentication integration",
  "status": "todo",
  "priority": "high",
  "assigneeId": "11111111-1111-4111-8111-111111111111",
  "labels": ["backend", "security"],
  "createdAt": "2026-09-03T12:00:00.000Z",
  "updatedAt": "2026-09-03T12:00:00.000Z"
}
```

### Search, Filter, and Paginate Tasks
`GET /tasks` supports optional filtering and pagination:

```bash
curl -u admin:taskflow 'http://localhost:3000/api/v1/tasks?search=authentication&status=todo&priority=high&page=1&size=20'
```
Response `200 OK`:
```json
{
  "data": [
    {
      "id": "t2020000-0000-4000-8000-000000000001",
      "projectId": "p1010000-0000-4000-8000-000000000001",
      "name": "Implement authentication flow",
      "description": "OAuth2 and Basic authentication integration",
      "status": "todo",
      "priority": "high",
      "assigneeId": "11111111-1111-4111-8111-111111111111",
      "labels": ["backend", "security"],
      "createdAt": "2026-09-03T12:00:00.000Z",
      "updatedAt": "2026-09-03T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Update a Task
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/t2020000-0000-4000-8000-000000000001 \
  -u admin:taskflow \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "labels": ["backend", "security", "in-review"]
  }'
```
Response `200 OK`:
```json
{
  "id": "t2020000-0000-4000-8000-000000000001",
  "projectId": "p1010000-0000-4000-8000-000000000001",
  "name": "Implement authentication flow",
  "description": "OAuth2 and Basic authentication integration",
  "status": "in_progress",
  "priority": "high",
  "assigneeId": "11111111-1111-4111-8111-111111111111",
  "labels": ["backend", "security", "in-review"],
  "createdAt": "2026-09-03T12:00:00.000Z",
  "updatedAt": "2026-09-03T12:10:00.000Z"
}
```

### Delete a Task
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/t2020000-0000-4000-8000-000000000001 \
  -u admin:taskflow
```
Response `204 No Content`. Deleting a task automatically cascades to delete all its comments.

---

## 4. Comments Examples

### Add a Comment to a Task
```bash
curl -X POST http://localhost:3000/api/v1/tasks/t2020000-0000-4000-8000-000000000001/comments \
  -u admin:taskflow \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "11111111-1111-4111-8111-111111111111",
    "body": "Authentication middleware is completed, waiting for PR review."
  }'
```
Response `201 Created`:
```json
{
  "id": "c3030000-0000-4000-8000-000000000001",
  "taskId": "t2020000-0000-4000-8000-000000000001",
  "authorId": "11111111-1111-4111-8111-111111111111",
  "body": "Authentication middleware is completed, waiting for PR review.",
  "createdAt": "2026-09-03T12:15:00.000Z",
  "updatedAt": "2026-09-03T12:15:00.000Z"
}
```

### List Comments for a Task
```bash
curl -u admin:taskflow http://localhost:3000/api/v1/tasks/t2020000-0000-4000-8000-000000000001/comments
```
Response `200 OK`:
```json
[
  {
    "id": "c3030000-0000-4000-8000-000000000001",
    "taskId": "t2020000-0000-4000-8000-000000000001",
    "authorId": "11111111-1111-4111-8111-111111111111",
    "body": "Authentication middleware is completed, waiting for PR review.",
    "createdAt": "2026-09-03T12:15:00.000Z",
    "updatedAt": "2026-09-03T12:15:00.000Z"
  }
]
```

### Update a Comment
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/t2020000-0000-4000-8000-000000000001/comments/c3030000-0000-4000-8000-000000000001 \
  -u admin:taskflow \
  -H "Content-Type: application/json" \
  -d '{
    "body": "PR approved and merged."
  }'
```
Response `200 OK`:
```json
{
  "id": "c3030000-0000-4000-8000-000000000001",
  "taskId": "t2020000-0000-4000-8000-000000000001",
  "authorId": "11111111-1111-4111-8111-111111111111",
  "body": "PR approved and merged.",
  "createdAt": "2026-09-03T12:15:00.000Z",
  "updatedAt": "2026-09-03T12:20:00.000Z"
}
```

### Delete a Comment
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/t2020000-0000-4000-8000-000000000001/comments/c3030000-0000-4000-8000-000000000001 \
  -u admin:taskflow
```
Response `204 No Content`.

---

## Relationship rules

- A task must reference an existing project.
- An assignee must be an active user.
- A comment author must be an active user.
- Projects with tasks cannot be deleted.
- Users assigned to tasks or referenced by comments cannot be deleted.
- Deleting a task also deletes its comments.

See `/openapi.json` for complete request and response schemas.
