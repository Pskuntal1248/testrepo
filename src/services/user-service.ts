import type { CreateUserInput, UpdateUserInput } from '../domain/schemas.js';
import type { User } from '../domain/models.js';
import { conflict, notFound } from '../lib/errors.js';
import { createId, now } from '../lib/id.js';
import type { Repositories } from '../repositories/repositories.js';

export class UserService {
  constructor(private readonly repositories: Repositories) {}

  list(): User[] {
    return this.repositories.users.findAll();
  }

  get(id: string): User {
    return this.repositories.users.findById(id) ?? (() => { throw notFound('User'); })();
  }

  create(input: CreateUserInput): User {
    this.ensureEmailAvailable(input.email);
    const timestamp = now();
    return this.repositories.users.create({
      id: createId(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(id: string, input: UpdateUserInput): User {
    const existing = this.get(id);
    if (input.email && input.email !== existing.email) this.ensureEmailAvailable(input.email);
    const updated: User = { ...existing, ...input, updatedAt: now() };
    this.repositories.users.update(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.get(id);
    if (this.repositories.tasks.findAll().some((task) => task.assigneeId === id)) {
      throw conflict('Cannot delete a user assigned to a task');
    }
    if (this.repositories.comments.findAll().some((comment) => comment.authorId === id)) {
      throw conflict('Cannot delete a user who authored comments');
    }
    this.repositories.users.delete(id);
  }

  private ensureEmailAvailable(email: string): void {
    if (this.repositories.users.findAll().some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      throw conflict('A user with this email already exists');
    }
  }
}
