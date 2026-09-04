import type { Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const auth = `Basic ${Buffer.from('admin:taskflow').toString('base64')}`;
const api = (app: Express) => request(app);

async function createUser(app: Express, overrides: Record<string, unknown> = {}) {
  return api(app).post('/api/v1/users').set('Authorization', auth).send({
    email: 'alex@example.com',
    displayName: 'Alex Rivera',
    ...overrides,
  });
}

async function createProject(app: Express) {
  return api(app).post('/api/v1/projects').set('Authorization', auth).send({
    name: 'Website launch',
    description: 'Coordinate the public release',
  });
}

describe('TaskFlow API v1', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  it('requires Basic authentication for API endpoints', async () => {
    const response = await api(app).get('/api/v1/users');

    expect(response.status).toBe(401);
    expect(response.headers['www-authenticate']).toContain('Basic');
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('publishes public static and machine-readable API documentation', async () => {
    const docs = await api(app).get('/docs');
    const specification = await api(app).get('/openapi.json');

    expect(docs.status).toBe(200);
    expect(docs.text).toContain('TaskFlow API v1.0.0');
    expect(specification.status).toBe(200);
    expect(specification.body.info.version).toBe('1.0.0');
    expect(specification.body.paths['/tasks/{id}']).toBeDefined();
  });

  it('exposes a public health endpoint returning service health status', async () => {
    const response = await api(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.version).toBe('1.0.0');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('supports a complete user, project, task, and comment workflow', async () => {
    const user = await createUser(app);
    const project = await createProject(app);
    const task = await api(app).post('/api/v1/tasks').set('Authorization', auth).send({
      projectId: project.body.id,
      title: 'Publish release notes',
      priority: 'high',
      assigneeId: user.body.id,
      labels: ['Release', 'API-Docs'],
    });

    expect(user.status).toBe(201);
    expect(project.status).toBe(201);
    expect(task.status).toBe(201);
    expect(task.body).toMatchObject({
      projectId: project.body.id,
      title: 'Publish release notes',
      status: 'todo',
      priority: 'high',
      assigneeId: user.body.id,
      labels: ['release', 'api-docs'],
    });
    expect(task.body).toHaveProperty('title');
    expect(task.body).not.toHaveProperty('name');

    const fetched = await api(app).get(`/api/v1/tasks/${task.body.id}`).set('Authorization', auth);
    const listed = await api(app).get('/api/v1/tasks').set('Authorization', auth);
    expect(fetched.body.title).toBe('Publish release notes');
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.pagination).toEqual({ page: 1, size: 20, total: 1, totalPages: 1 });

    const comment = await api(app).post(`/api/v1/tasks/${task.body.id}/comments`).set('Authorization', auth).send({
      authorId: user.body.id,
      body: 'Ready for review.',
    });
    expect(comment.status).toBe(201);

    const updated = await api(app).patch(`/api/v1/tasks/${task.body.id}`).set('Authorization', auth).send({
      status: 'done',
      labels: ['Documentation'],
    });
    const comments = await api(app).get(`/api/v1/tasks/${task.body.id}/comments`).set('Authorization', auth);
    expect(updated.body.status).toBe('done');
    expect(updated.body.labels).toEqual(['documentation']);
    expect(comments.body).toEqual([expect.objectContaining({ body: 'Ready for review.' })]);
  });

  it('defaults labels and validates normalized label uniqueness, syntax, and count', async () => {
    const project = await createProject(app);
    const endpoint = '/api/v1/tasks';
    const baseTask = { projectId: project.body.id, title: 'Label validation' };

    const withoutLabels = await api(app).post(endpoint).set('Authorization', auth).send(baseTask);
    const duplicateLabels = await api(app).post(endpoint).set('Authorization', auth).send({
      ...baseTask,
      labels: ['Backend', 'backend'],
    });
    const invalidLabel = await api(app).post(endpoint).set('Authorization', auth).send({
      ...baseTask,
      labels: ['not allowed!'],
    });
    const tooManyLabels = await api(app).post(endpoint).set('Authorization', auth).send({
      ...baseTask,
      labels: Array.from({ length: 11 }, (_, index) => `label-${index}`),
    });

    expect(withoutLabels.status).toBe(201);
    expect(withoutLabels.body.labels).toEqual([]);
    expect(duplicateLabels.status).toBe(400);
    expect(invalidLabel.status).toBe(400);
    expect(tooManyLabels.status).toBe(400);
  });

  it('searches task titles and descriptions with a validated case-insensitive substring', async () => {
    const project = await createProject(app);
    const endpoint = '/api/v1/tasks';
    const createTask = (title: string, description: string) =>
      api(app).post(endpoint).set('Authorization', auth).send({ projectId: project.body.id, title, description });

    await createTask('Payment retry logic', 'Handle transient failures');
    await createTask('Audit webhooks', 'Investigate PAYMENT provider callbacks');
    await createTask('Refresh profile', 'Update the avatar editor');

    const matches = await api(app)
      .get(endpoint)
      .set('Authorization', auth)
      .query({ search: '  PaYmEnT  ' });
    const noMatches = await api(app).get(endpoint).set('Authorization', auth).query({ search: 'invoice' });
    const emptySearch = await api(app).get(endpoint).set('Authorization', auth).query({ search: '   ' });
    const unknownQuery = await api(app).get(endpoint).set('Authorization', auth).query({ sort: 'name' });

    expect(matches.status).toBe(200);
    expect(matches.body.data.map((task: { title: string }) => task.title)).toEqual([
      'Payment retry logic',
      'Audit webhooks',
    ]);
    expect(matches.body.pagination.total).toBe(2);
    expect(noMatches.body).toEqual({
      data: [],
      pagination: { page: 1, size: 20, total: 0, totalPages: 0 },
    });
    expect(emptySearch.status).toBe(400);
    expect(unknownQuery.status).toBe(400);
  });

  it('filters tasks by status, priority, and assignee and combines filters with search', async () => {
    const project = await createProject(app);
    const alex = await createUser(app);
    const blair = await createUser(app, { email: 'blair@example.com', displayName: 'Blair Chen' });
    const endpoint = '/api/v1/tasks';
    const createTask = (task: Record<string, unknown>) =>
      api(app).post(endpoint).set('Authorization', auth).send({ projectId: project.body.id, ...task });

    await createTask({ title: 'Payment capture', status: 'todo', priority: 'high', assigneeId: alex.body.id });
    await createTask({ title: 'Payment settlement', status: 'done', priority: 'high', assigneeId: alex.body.id });
    await createTask({ title: 'Invoice copy', description: 'Update payment guidance', status: 'done', priority: 'low', assigneeId: blair.body.id });

    const byStatus = await api(app).get(endpoint).set('Authorization', auth).query({ status: 'done' });
    const byPriority = await api(app).get(endpoint).set('Authorization', auth).query({ priority: 'high' });
    const byAssignee = await api(app).get(endpoint).set('Authorization', auth).query({ assignee: alex.body.id });
    const combined = await api(app).get(endpoint).set('Authorization', auth).query({
      search: 'payment',
      status: 'done',
      priority: 'high',
      assignee: alex.body.id,
    });

    expect(byStatus.body.data.map((task: { title: string }) => task.title)).toEqual(['Payment settlement', 'Invoice copy']);
    expect(byPriority.body.data.map((task: { title: string }) => task.title)).toEqual(['Payment capture', 'Payment settlement']);
    expect(byAssignee.body.data.map((task: { title: string }) => task.title)).toEqual(['Payment capture', 'Payment settlement']);
    expect(combined.body.data.map((task: { title: string }) => task.title)).toEqual(['Payment settlement']);
    expect(combined.body.pagination.total).toBe(1);

    const invalidStatus = await api(app).get(endpoint).set('Authorization', auth).query({ status: 'blocked' });
    const invalidPriority = await api(app).get(endpoint).set('Authorization', auth).query({ priority: 'critical' });
    const invalidAssignee = await api(app).get(endpoint).set('Authorization', auth).query({ assignee: 'not-a-uuid' });
    expect(invalidStatus.status).toBe(400);
    expect(invalidPriority.status).toBe(400);
    expect(invalidAssignee.status).toBe(400);
  });

  it('paginates after search and filters with validated defaults and limits', async () => {
    const project = await createProject(app);
    const endpoint = '/api/v1/tasks';
    const createTask = (title: string) =>
      api(app).post(endpoint).set('Authorization', auth).send({ projectId: project.body.id, title });

    await createTask('Payment task 1');
    await createTask('Other task 1');
    await createTask('Payment task 2');
    await createTask('Other task 2');
    await createTask('Payment task 3');

    const defaults = await api(app).get(endpoint).set('Authorization', auth);
    const secondFilteredPage = await api(app).get(endpoint).set('Authorization', auth).query({
      search: 'payment',
      page: 2,
      size: 2,
    });
    const maximumSize = await api(app).get(endpoint).set('Authorization', auth).query({ size: 100 });
    const invalidPage = await api(app).get(endpoint).set('Authorization', auth).query({ page: 0 });
    const excessiveSize = await api(app).get(endpoint).set('Authorization', auth).query({ size: 101 });

    expect(defaults.body.pagination).toEqual({ page: 1, size: 20, total: 5, totalPages: 1 });
    expect(defaults.body.data).toHaveLength(5);
    expect(secondFilteredPage.body.data.map((task: { title: string }) => task.title)).toEqual(['Payment task 3']);
    expect(secondFilteredPage.body.pagination).toEqual({ page: 2, size: 2, total: 3, totalPages: 2 });
    expect(maximumSize.body.pagination.size).toBe(100);
    expect(invalidPage.status).toBe(400);
    expect(excessiveSize.status).toBe(400);
  });

  it('validates request bodies and rejects unknown fields', async () => {
    const invalidEmail = await createUser(app, { email: 'not-an-email' });
    const unknownField = await api(app).post('/api/v1/projects').set('Authorization', auth).send({ name: 'A', labels: [] });
    const malformedJson = await api(app)
      .post('/api/v1/projects')
      .set('Authorization', auth)
      .set('Content-Type', 'application/json')
      .send('{');

    expect(invalidEmail.status).toBe(400);
    expect(invalidEmail.body.error.code).toBe('VALIDATION_ERROR');
    expect(unknownField.status).toBe(400);
    expect(malformedJson.status).toBe(400);
    expect(malformedJson.body.error.code).toBe('INVALID_JSON');
  });

  it('validates task project and active-user assignment relationships', async () => {
    const project = await createProject(app);
    const inactiveUser = await createUser(app, { active: false });
    const missingProject = 'a25d6d4c-82a2-46ef-9573-d4a6ad592da6';

    const badProject = await api(app).post('/api/v1/tasks').set('Authorization', auth).send({
      projectId: missingProject,
      title: 'Invalid project',
    });
    const badAssignee = await api(app).post('/api/v1/tasks').set('Authorization', auth).send({
      projectId: project.body.id,
      title: 'Invalid assignment',
      assigneeId: inactiveUser.body.id,
    });

    expect(badProject.status).toBe(400);
    expect(badProject.body.error.message).toContain('projectId');
    expect(badAssignee.status).toBe(400);
    expect(badAssignee.body.error.message).toContain('active user');
  });

  it('allows assigning an active user with an empty display name', async () => {
    const project = await createProject(app);
    const activeUser = await createUser(app, { displayName: '' });

    const task = await api(app).post('/api/v1/tasks').set('Authorization', auth).send({
      projectId: project.body.id,
      name: 'Assignment without display name',
      assigneeId: activeUser.body.id,
    });

    expect(activeUser.status).toBe(201);
    expect(task.status).toBe(201);
    expect(task.body.assigneeId).toBe(activeUser.body.id);
  });

  it('prevents duplicate emails and deletion of referenced records', async () => {
    const user = await createUser(app);
    const duplicate = await createUser(app, { displayName: 'Someone Else' });
    const project = await createProject(app);
    await api(app).post('/api/v1/tasks').set('Authorization', auth).send({
      projectId: project.body.id,
      title: 'Referenced task',
      assigneeId: user.body.id,
    });

    const deleteUser = await api(app).delete(`/api/v1/users/${user.body.id}`).set('Authorization', auth);
    const deleteProject = await api(app).delete(`/api/v1/projects/${project.body.id}`).set('Authorization', auth);

    expect(duplicate.status).toBe(409);
    expect(deleteUser.status).toBe(409);
    expect(deleteProject.status).toBe(409);
  });

  it('returns the supported statuses and priorities as plain arrays', async () => {
    const statuses = await api(app).get('/api/v1/statuses').set('Authorization', auth);
    const priorities = await api(app).get('/api/v1/priorities').set('Authorization', auth);

    expect(statuses.body).toEqual(['todo', 'in_progress', 'done']);
    expect(priorities.body).toEqual(['low', 'medium', 'high', 'urgent']);
  });
});
