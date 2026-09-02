import type { Comment } from '../domain/models.js';
import type { CreateCommentInput, UpdateCommentInput } from '../domain/schemas.js';
import { badRequest, notFound } from '../lib/errors.js';
import { createId, now } from '../lib/id.js';
import type { Repositories } from '../repositories/repositories.js';

export class CommentService {
  constructor(private readonly repositories: Repositories) {}

  list(taskId: string): Comment[] {
    this.requireTask(taskId);
    return this.repositories.comments.findAll().filter((comment) => comment.taskId === taskId);
  }

  get(taskId: string, commentId: string): Comment {
    this.requireTask(taskId);
    const comment = this.repositories.comments.findById(commentId);
    if (!comment || comment.taskId !== taskId) throw notFound('Comment');
    return comment;
  }

  create(taskId: string, input: CreateCommentInput): Comment {
    this.requireTask(taskId);
    const author = this.repositories.users.findById(input.authorId);
    if (!author || !author.active) throw badRequest('authorId must reference an active user');
    const timestamp = now();
    return this.repositories.comments.create({
      id: createId(),
      taskId,
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(taskId: string, commentId: string, input: UpdateCommentInput): Comment {
    const updated: Comment = { ...this.get(taskId, commentId), ...input, updatedAt: now() };
    this.repositories.comments.update(commentId, updated);
    return updated;
  }

  delete(taskId: string, commentId: string): void {
    this.get(taskId, commentId);
    this.repositories.comments.delete(commentId);
  }

  private requireTask(taskId: string): void {
    if (!this.repositories.tasks.findById(taskId)) throw notFound('Task');
  }
}
