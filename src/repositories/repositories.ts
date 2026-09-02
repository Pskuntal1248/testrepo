import type { Comment, Project, User } from '../domain/models.js';
import { InMemoryRepository } from './in-memory-repository.js';
import { TaskRepository } from './task-repository.js';

export interface Repositories {
  users: InMemoryRepository<User>;
  projects: InMemoryRepository<Project>;
  tasks: TaskRepository;
  comments: InMemoryRepository<Comment>;
}

export const createRepositories = (): Repositories => ({
  users: new InMemoryRepository<User>(),
  projects: new InMemoryRepository<Project>(),
  tasks: new TaskRepository(),
  comments: new InMemoryRepository<Comment>(),
});
