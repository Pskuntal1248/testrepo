import { Router } from 'express';
import { createProjectSchema, idParamsSchema, updateProjectSchema } from '../domain/schemas.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import type { ProjectService } from '../services/project-service.js';

export const projectsRouter = (service: ProjectService): Router => {
  const router = Router();

  router.get('/', (_request, response) => response.json(service.list()));
  router.post('/', validateBody(createProjectSchema), (request, response) => response.status(201).json(service.create(request.body)));
  router.get<{ id: string }>('/:id', validateParams(idParamsSchema), (request, response) => response.json(service.get(request.params.id)));
  router.patch<{ id: string }>('/:id', validateParams(idParamsSchema), validateBody(updateProjectSchema), (request, response) => response.json(service.update(request.params.id, request.body)));
  router.delete<{ id: string }>('/:id', validateParams(idParamsSchema), (request, response) => {
    service.delete(request.params.id);
    response.status(204).send();
  });

  return router;
};
