import express, { type Express } from 'express';
import { TASK_PRIORITIES, TASK_STATUSES } from './domain/models.js';
import { basicAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { openApiDocument } from './openapi.js';
import { createRepositories, type Repositories } from './repositories/repositories.js';
import { projectsRouter } from './routes/projects.js';
import { tasksRouter } from './routes/tasks.js';
import { usersRouter } from './routes/users.js';
import { createServices } from './services/services.js';

export interface AppOptions {
  repositories?: Repositories;
}

export const createApp = (options: AppOptions = {}): Express => {
  const app = express();
  const repositories = options.repositories ?? createRepositories();
  const services = createServices(repositories);

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/openapi.json', (_request, response) => response.json(openApiDocument));
  app.get('/docs', (_request, response) => response.type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TaskFlow API Docs</title></head>
<body><main><h1>TaskFlow API v1.0.0</h1><p>The machine-readable OpenAPI 3.1 specification is available at <a href="/openapi.json">/openapi.json</a>.</p><p>See <code>docs/api.md</code> for examples and endpoint details.</p></main></body></html>`));

  const api = express.Router();
  api.use(basicAuth);
  api.get('/statuses', (_request, response) => response.json(TASK_STATUSES));
  api.get('/priorities', (_request, response) => response.json(TASK_PRIORITIES));
  api.use('/users', usersRouter(services.users));
  api.use('/projects', projectsRouter(services.projects));
  api.use('/tasks', tasksRouter(services.tasks, services.comments));
  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
