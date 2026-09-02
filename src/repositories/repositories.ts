import type { Comment, Project, Task, User } from '../domain/models.js';
import { InMemoryRepository } from './in-memory-repository.js';

export interface Repositories {
  users: InMemoryRepository<User>;
  projects: InMemoryRepository<Project>;
  tasks: InMemoryRepository<Task>;
  comments: InMemoryRepository<Comment>;
}

export const createRepositories = (): Repositories => ({
  users: new InMemoryRepository<User>(),
  projects: new InMemoryRepository<Project>(),
  tasks: new InMemoryRepository<Task>(),
  comments: new InMemoryRepository<Comment>(),
});
