import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from './models.js';

export const idParamsSchema = z.object({ id: z.string().uuid() });
export const taskIdParamsSchema = z.object({ taskId: z.string().uuid() });
export const taskCommentParamsSchema = z.object({
  taskId: z.string().uuid(),
  commentId: z.string().uuid(),
});

export const createUserSchema = z.object({
  email: z.string().email().max(254),
  displayName: z.string().max(100),
  active: z.boolean().default(true),
}).strict();

export const updateUserSchema = createUserSchema.partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(2000).default(''),
}).strict();

export const updateProjectSchema = createProjectSchema.partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

const taskLabelSchema = z.string()
  .trim()
  .min(1)
  .max(30)
  .transform((value) => value.toLowerCase())
  .pipe(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Labels must contain lowercase letters, numbers, and single hyphens'));

const taskLabelsSchema = z.array(taskLabelSchema)
  .max(10)
  .refine((labels) => new Set(labels).size === labels.length, 'Labels must be unique');

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(5000).default(''),
  status: z.enum(TASK_STATUSES).default('todo'),
  priority: z.enum(TASK_PRIORITIES).default('medium'),
  assigneeId: z.string().uuid().nullable().default(null),
  labels: taskLabelsSchema.default([]),
}).strict();

export const updateTaskSchema = createTaskSchema.partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field is required',
);

export const taskListQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignee: z.string().uuid().optional(),
}).strict();

export const createCommentSchema = z.object({
  authorId: z.string().uuid(),
  body: z.string().trim().min(1).max(5000),
}).strict();

export const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
}).strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = Partial<CreateUserInput>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = Partial<CreateTaskInput>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
