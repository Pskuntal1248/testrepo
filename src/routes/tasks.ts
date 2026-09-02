import { Router } from 'express';
import {
  createCommentSchema,
  createTaskSchema,
  idParamsSchema,
  taskCommentParamsSchema,
  taskIdParamsSchema,
  taskListQuerySchema,
  updateCommentSchema,
  updateTaskSchema,
} from '../domain/schemas.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import type { CommentService } from '../services/comment-service.js';
import type { TaskService } from '../services/task-service.js';

export const tasksRouter = (tasks: TaskService, comments: CommentService): Router => {
  const router = Router();

  router.get('/', (request, response) => {
    const query = taskListQuerySchema.parse(request.query);
    response.json(tasks.list(query.search));
  });
  router.post('/', validateBody(createTaskSchema), (request, response) => response.status(201).json(tasks.create(request.body)));
  router.get<{ id: string }>('/:id', validateParams(idParamsSchema), (request, response) => response.json(tasks.get(request.params.id)));
  router.patch<{ id: string }>('/:id', validateParams(idParamsSchema), validateBody(updateTaskSchema), (request, response) => response.json(tasks.update(request.params.id, request.body)));
  router.delete<{ id: string }>('/:id', validateParams(idParamsSchema), (request, response) => {
    tasks.delete(request.params.id);
    response.status(204).send();
  });

  router.get<{ taskId: string }>('/:taskId/comments', validateParams(taskIdParamsSchema), (request, response) => response.json(comments.list(request.params.taskId)));
  router.post<{ taskId: string }>('/:taskId/comments', validateParams(taskIdParamsSchema), validateBody(createCommentSchema), (request, response) => response.status(201).json(comments.create(request.params.taskId, request.body)));
  router.get<{ taskId: string; commentId: string }>('/:taskId/comments/:commentId', validateParams(taskCommentParamsSchema), (request, response) => response.json(comments.get(request.params.taskId, request.params.commentId)));
  router.patch<{ taskId: string; commentId: string }>('/:taskId/comments/:commentId', validateParams(taskCommentParamsSchema), validateBody(updateCommentSchema), (request, response) => response.json(comments.update(request.params.taskId, request.params.commentId, request.body)));
  router.delete<{ taskId: string; commentId: string }>('/:taskId/comments/:commentId', validateParams(taskCommentParamsSchema), (request, response) => {
    comments.delete(request.params.taskId, request.params.commentId);
    response.status(204).send();
  });

  return router;
};
