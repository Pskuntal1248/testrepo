import type { Task } from '../domain/models.js';
import type { CreateTaskInput, UpdateTaskInput } from '../domain/schemas.js';
import { badRequest, notFound } from '../lib/errors.js';
import { createId, now } from '../lib/id.js';
import type { Repositories } from '../repositories/repositories.js';

export class TaskService {
  constructor(private readonly repositories: Repositories) {}

  list(): Task[] {
    return this.repositories.tasks.findAll();
  }

  get(id: string): Task {
    return this.repositories.tasks.findById(id) ?? (() => { throw notFound('Task'); })();
  }

  create(input: CreateTaskInput): Task {
    this.validateProject(input.projectId);
    this.validateAssignee(input.assigneeId);
    const timestamp = now();
    return this.repositories.tasks.create({
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(id: string, input: UpdateTaskInput): Task {
    const existing = this.get(id);
    if (input.projectId !== undefined) this.validateProject(input.projectId);
    if (input.assigneeId !== undefined) this.validateAssignee(input.assigneeId);
    const updated: Task = { ...existing, ...input, updatedAt: now() };
    this.repositories.tasks.update(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.get(id);
    for (const comment of this.repositories.comments.findAll()) {
      if (comment.taskId === id) this.repositories.comments.delete(comment.id);
    }
    this.repositories.tasks.delete(id);
  }

  private validateProject(projectId: string): void {
    if (!this.repositories.projects.findById(projectId)) throw badRequest('projectId must reference an existing project');
  }

  private validateAssignee(assigneeId: string | null): void {
    if (assigneeId === null) return;
    const user = this.repositories.users.findById(assigneeId);
    if (!user || !user.active || user.displayName.trim().length === 0) {
      throw badRequest('assigneeId must reference an active user');
    }
  }
}
