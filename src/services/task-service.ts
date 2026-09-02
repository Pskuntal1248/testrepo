import type { Task, TaskListResult } from '../domain/models.js';
import type { CreateTaskInput, TaskListQuery, UpdateTaskInput } from '../domain/schemas.js';
import { badRequest, notFound } from '../lib/errors.js';
import { createId, now } from '../lib/id.js';
import type { Repositories } from '../repositories/repositories.js';

export class TaskService {
  constructor(private readonly repositories: Repositories) {}

  list(query: TaskListQuery): TaskListResult {
    const term = query.search?.toLowerCase();
    const matchingTasks = this.repositories.tasks.findAll().filter((task) =>
      (term === undefined || task.name.toLowerCase().includes(term) || task.description.toLowerCase().includes(term))
      && (query.status === undefined || task.status === query.status)
      && (query.priority === undefined || task.priority === query.priority)
      && (query.assignee === undefined || task.assigneeId === query.assignee),
    );
    const total = matchingTasks.length;
    const offset = (query.page - 1) * query.size;

    return {
      data: matchingTasks.slice(offset, offset + query.size),
      pagination: {
        page: query.page,
        size: query.size,
        total,
        totalPages: Math.ceil(total / query.size),
      },
    };
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
