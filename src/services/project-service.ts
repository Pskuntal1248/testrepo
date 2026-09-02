import type { Project } from '../domain/models.js';
import type { CreateProjectInput, UpdateProjectInput } from '../domain/schemas.js';
import { conflict, notFound } from '../lib/errors.js';
import { createId, now } from '../lib/id.js';
import type { Repositories } from '../repositories/repositories.js';

export class ProjectService {
  constructor(private readonly repositories: Repositories) {}

  list(): Project[] {
    return this.repositories.projects.findAll();
  }

  get(id: string): Project {
    return this.repositories.projects.findById(id) ?? (() => { throw notFound('Project'); })();
  }

  create(input: CreateProjectInput): Project {
    const timestamp = now();
    return this.repositories.projects.create({
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(id: string, input: UpdateProjectInput): Project {
    const updated: Project = { ...this.get(id), ...input, updatedAt: now() };
    this.repositories.projects.update(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.get(id);
    if (this.repositories.tasks.findAll().some((task) => task.projectId === id)) {
      throw conflict('Cannot delete a project containing tasks');
    }
    this.repositories.projects.delete(id);
  }
}
