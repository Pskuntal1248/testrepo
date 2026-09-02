export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'REST API for users, projects, tasks, and comments.',
  },
  servers: [{ url: '/api/v1' }],
  security: [{ basicAuth: [] }],
  tags: [
    { name: 'Users' },
    { name: 'Projects' },
    { name: 'Tasks' },
    { name: 'Comments' },
    { name: 'Metadata' },
  ],
  paths: {
    '/users': collectionPaths('Users', 'User'),
    '/users/{id}': itemPaths('Users', 'User'),
    '/projects': collectionPaths('Projects', 'Project'),
    '/projects/{id}': itemPaths('Projects', 'Project'),
    '/tasks': taskCollectionPaths([
      { $ref: '#/components/parameters/TaskSearch' },
      { $ref: '#/components/parameters/TaskStatusFilter' },
      { $ref: '#/components/parameters/TaskPriorityFilter' },
      { $ref: '#/components/parameters/TaskAssigneeFilter' },
      { $ref: '#/components/parameters/Page' },
      { $ref: '#/components/parameters/PageSize' },
    ]),
    '/tasks/{id}': itemPaths('Tasks', 'Task'),
    '/tasks/{taskId}/comments': {
      get: operation('Comments', 'List task comments', 'CommentList', true, [{ $ref: '#/components/parameters/TaskId' }]),
      post: operation('Comments', 'Create a task comment', 'Comment', false, [{ $ref: '#/components/parameters/TaskId' }], 'CreateComment', 201),
    },
    '/tasks/{taskId}/comments/{commentId}': {
      get: operation('Comments', 'Get a comment', 'Comment', false, commentParameters()),
      patch: operation('Comments', 'Update a comment', 'Comment', false, commentParameters(), 'UpdateComment'),
      delete: deleteOperation('Comments', 'Delete a comment', commentParameters()),
    },
    '/statuses': { get: stringListOperation('List task statuses', ['todo', 'in_progress', 'done']) },
    '/priorities': { get: stringListOperation('List task priorities', ['low', 'medium', 'high', 'urgent']) },
  },
  components: {
    securitySchemes: { basicAuth: { type: 'http', scheme: 'basic' } },
    parameters: {
      Id: { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      TaskId: { name: 'taskId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      CommentId: { name: 'commentId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      TaskSearch: {
        name: 'search',
        in: 'query',
        required: false,
        description: 'Case-insensitive substring matched against task title and description.',
        schema: { type: 'string', minLength: 1, maxLength: 200 },
      },
      TaskStatusFilter: {
        name: 'status',
        in: 'query',
        required: false,
        description: 'Return tasks with this status.',
        schema: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
      },
      TaskPriorityFilter: {
        name: 'priority',
        in: 'query',
        required: false,
        description: 'Return tasks with this priority.',
        schema: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      },
      TaskAssigneeFilter: {
        name: 'assignee',
        in: 'query',
        required: false,
        description: 'Return tasks assigned to this user ID.',
        schema: { type: 'string', format: 'uuid' },
      },
      Page: {
        name: 'page',
        in: 'query',
        required: false,
        description: 'One-based result page.',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      PageSize: {
        name: 'size',
        in: 'query',
        required: false,
        description: 'Number of tasks per page.',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
    },
    schemas: {
      User: entitySchema({ email: { type: 'string', format: 'email' }, displayName: { type: 'string' }, active: { type: 'boolean' } }, ['email', 'displayName', 'active']),
      CreateUser: objectSchema({ email: { type: 'string', format: 'email' }, displayName: { type: 'string' }, active: { type: 'boolean', default: true } }, ['email', 'displayName']),
      UpdateUser: objectSchema({ email: { type: 'string', format: 'email' }, displayName: { type: 'string' }, active: { type: 'boolean' } }),
      Project: entitySchema({ name: { type: 'string' }, description: { type: 'string' } }, ['name', 'description']),
      CreateProject: objectSchema({ name: { type: 'string' }, description: { type: 'string', default: '' } }, ['name']),
      UpdateProject: objectSchema({ name: { type: 'string' }, description: { type: 'string' } }),
      Task: entitySchema(taskProperties(), ['projectId', 'title', 'description', 'status', 'priority', 'assigneeId', 'labels']),
      TaskPage: objectSchema({
        data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
        pagination: objectSchema({
          page: { type: 'integer', minimum: 1 },
          size: { type: 'integer', minimum: 1, maximum: 100 },
          total: { type: 'integer', minimum: 0 },
          totalPages: { type: 'integer', minimum: 0 },
        }, ['page', 'size', 'total', 'totalPages']),
      }, ['data', 'pagination']),
      CreateTask: objectSchema(taskProperties(true), ['projectId', 'title']),
      UpdateTask: objectSchema(taskProperties()),
      Comment: entitySchema({ taskId: { type: 'string', format: 'uuid' }, authorId: { type: 'string', format: 'uuid' }, body: { type: 'string' } }, ['taskId', 'authorId', 'body']),
      CreateComment: objectSchema({ authorId: { type: 'string', format: 'uuid' }, body: { type: 'string' } }, ['authorId', 'body']),
      UpdateComment: objectSchema({ body: { type: 'string' } }, ['body']),
      Error: objectSchema({ error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' }, details: {} } } }, ['error']),
    },
  },
} as const;

function objectSchema(properties: Record<string, unknown>, required: string[] = []) {
  return { type: 'object', additionalProperties: false, properties, ...(required.length ? { required } : {}) };
}

function entitySchema(properties: Record<string, unknown>, required: string[]) {
  return objectSchema({ id: { type: 'string', format: 'uuid' }, ...properties, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' } }, ['id', ...required, 'createdAt', 'updatedAt']);
}

function taskProperties(withDefaults = false) {
  return {
    projectId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string', ...(withDefaults ? { default: '' } : {}) },
    status: { type: 'string', enum: ['todo', 'in_progress', 'done'], ...(withDefaults ? { default: 'todo' } : {}) },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], ...(withDefaults ? { default: 'medium' } : {}) },
    assigneeId: { type: ['string', 'null'], format: 'uuid', ...(withDefaults ? { default: null } : {}) },
    labels: {
      type: 'array',
      maxItems: 10,
      uniqueItems: true,
      items: { type: 'string', minLength: 1, maxLength: 30, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
      ...(withDefaults ? { default: [] } : {}),
    },
  };
}

function response(schema: string, array = false) {
  const value = array ? { type: 'array', items: { $ref: `#/components/schemas/${schema}` } } : { $ref: `#/components/schemas/${schema}` };
  return { description: 'Success', content: { 'application/json': { schema: value } } };
}

function operation(tag: string, summary: string, schema: string, array = false, parameters?: unknown[], bodySchema?: string, status = 200) {
  return {
    tags: [tag], summary, ...(parameters ? { parameters } : {}),
    ...(bodySchema ? { requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${bodySchema}` } } } } } : {}),
    responses: { [status]: response(schema, array), 400: { description: 'Invalid request' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } },
  };
}

function deleteOperation(tag: string, summary: string, parameters: unknown[]) {
  return { tags: [tag], summary, parameters, responses: { 204: { description: 'Deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Not found' } } };
}

function collectionPaths(tag: string, schema: string, parameters?: unknown[]) {
  return {
    get: operation(tag, `List ${tag.toLowerCase()}`, schema, true, parameters),
    post: operation(tag, `Create ${schema.toLowerCase()}`, schema, false, undefined, `Create${schema}`, 201),
  };
}

function taskCollectionPaths(parameters: unknown[]) {
  return {
    get: operation('Tasks', 'List tasks', 'TaskPage', false, parameters),
    post: operation('Tasks', 'Create task', 'Task', false, undefined, 'CreateTask', 201),
  };
}

function itemPaths(tag: string, schema: string) {
  const parameters = [{ $ref: '#/components/parameters/Id' }];
  return {
    get: operation(tag, `Get ${schema.toLowerCase()}`, schema, false, parameters),
    patch: operation(tag, `Update ${schema.toLowerCase()}`, schema, false, parameters, `Update${schema}`),
    delete: deleteOperation(tag, `Delete ${schema.toLowerCase()}`, parameters),
  };
}

function commentParameters() {
  return [{ $ref: '#/components/parameters/TaskId' }, { $ref: '#/components/parameters/CommentId' }];
}

function stringListOperation(summary: string, values: string[]) {
  return { tags: ['Metadata'], summary, responses: { 200: { description: 'Success', content: { 'application/json': { schema: { type: 'array', items: { type: 'string', enum: values } } } } }, 401: { description: 'Unauthorized' } } };
}
