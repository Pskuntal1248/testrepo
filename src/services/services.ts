import type { Repositories } from '../repositories/repositories.js';
import { CommentService } from './comment-service.js';
import { ProjectService } from './project-service.js';
import { TaskService } from './task-service.js';
import { UserService } from './user-service.js';

export interface Services {
  users: UserService;
  projects: ProjectService;
  tasks: TaskService;
  comments: CommentService;
}

export const createServices = (repositories: Repositories): Services => ({
  users: new UserService(repositories),
  projects: new ProjectService(repositories),
  tasks: new TaskService(repositories),
  comments: new CommentService(repositories),
});
