import { describe, expect, it, vi } from 'vitest';
import type { Task, TaskPriority, TaskStatus } from '../src/domain/models.js';
import { TaskRepository } from '../src/repositories/task-repository.js';

const makeTask = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  projectId: 'project-1',
  name: `Task ${id}`,
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
  labels: [],
  createdAt: '2026-09-03T00:00:00.000Z',
  updatedAt: '2026-09-03T00:00:00.000Z',
  ...overrides,
});

describe('TaskRepository indexes', () => {
  it('intersects indexed fields over a larger dataset without scanning findAll', () => {
    const repository = new TaskRepository();
    const source: Task[] = [];

    for (let index = 0; index < 600; index += 1) {
      const status: TaskStatus = index % 3 === 0 ? 'todo' : index % 3 === 1 ? 'in_progress' : 'done';
      const priority: TaskPriority = index % 4 === 0 ? 'low' : index % 4 === 1 ? 'medium' : index % 4 === 2 ? 'high' : 'urgent';
      const task = makeTask(String(index), {
        projectId: `project-${index % 6}`,
        status,
        priority,
        assigneeId: `user-${index % 10}`,
      });
      source.push(task);
      repository.create(task);
    }

    const query = { projectId: 'project-5', status: 'done' as const, priority: 'urgent' as const, assigneeId: 'user-5' };
    const expectedIds = source
      .filter((task) => task.projectId === query.projectId
        && task.status === query.status
        && task.priority === query.priority
        && task.assigneeId === query.assigneeId)
      .map((task) => task.id);
    const findAll = vi.spyOn(repository, 'findAll');

    expect(repository.query(query).map((task) => task.id)).toEqual(expectedIds);
    expect(findAll).not.toHaveBeenCalled();
  });

  it('keeps indexes and original ordering correct across updates, deletes, and clears', () => {
    const repository = new TaskRepository();
    const first = makeTask('first', { assigneeId: 'user-1' });
    const second = makeTask('second', { assigneeId: 'user-1' });
    repository.create(first);
    repository.create(second);

    repository.update('first', {
      ...first,
      projectId: 'project-2',
      status: 'done',
      priority: 'urgent',
      assigneeId: 'user-2',
    });

    expect(repository.query({ projectId: 'project-1' }).map((task) => task.id)).toEqual(['second']);
    expect(repository.query({ projectId: 'project-2', status: 'done', priority: 'urgent', assigneeId: 'user-2' }).map((task) => task.id)).toEqual(['first']);

    repository.update('first', { ...first, status: 'done' });
    expect(repository.query({ assigneeId: 'user-1' }).map((task) => task.id)).toEqual(['first', 'second']);

    repository.delete('first');
    expect(repository.query({ status: 'done' })).toEqual([]);
    expect(repository.query({ assigneeId: 'user-1' }).map((task) => task.id)).toEqual(['second']);

    repository.clear();
    expect(repository.query({ projectId: 'project-1' })).toEqual([]);
    expect(repository.findAll()).toEqual([]);
  });
});
