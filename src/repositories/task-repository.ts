import type { Task, TaskPriority, TaskStatus } from '../domain/models.js';
import { InMemoryRepository } from './in-memory-repository.js';

export interface TaskQuery {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}

export class TaskRepository extends InMemoryRepository<Task> {
  private readonly byProject = new Map<string, Set<string>>();
  private readonly byStatus = new Map<TaskStatus, Set<string>>();
  private readonly byPriority = new Map<TaskPriority, Set<string>>();
  private readonly byAssignee = new Map<string, Set<string>>();
  private readonly insertionOrder = new Map<string, number>();
  private nextOrder = 0;

  override create(task: Task): Task {
    const existing = this.findById(task.id);
    if (existing) this.removeFromIndexes(existing, task.id);

    const created = super.create(task);
    if (!this.insertionOrder.has(task.id)) this.insertionOrder.set(task.id, this.nextOrder++);
    this.addToIndexes(task, task.id);
    return created;
  }

  override update(id: string, task: Task): Task | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    this.removeFromIndexes(existing, id);
    const updated = super.update(id, task);
    this.addToIndexes(task, id);
    return updated;
  }

  override delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    this.removeFromIndexes(existing, id);
    this.insertionOrder.delete(id);
    return super.delete(id);
  }

  override clear(): void {
    super.clear();
    this.byProject.clear();
    this.byStatus.clear();
    this.byPriority.clear();
    this.byAssignee.clear();
    this.insertionOrder.clear();
    this.nextOrder = 0;
  }

  query(query: TaskQuery): Task[] {
    const candidateSets: Set<string>[] = [];

    if (!this.addCandidateSet(candidateSets, this.byProject, query.projectId)) return [];
    if (!this.addCandidateSet(candidateSets, this.byStatus, query.status)) return [];
    if (!this.addCandidateSet(candidateSets, this.byPriority, query.priority)) return [];
    if (!this.addCandidateSet(candidateSets, this.byAssignee, query.assigneeId)) return [];
    if (candidateSets.length === 0) return this.findAll();

    const candidates = candidateSets.reduce((smallest, current) =>
      current.size < smallest.size ? current : smallest,
    );

    return [...candidates]
      .sort((left, right) => (this.insertionOrder.get(left) ?? 0) - (this.insertionOrder.get(right) ?? 0))
      .map((id) => this.findById(id))
      .filter((task): task is Task => task !== undefined && this.matches(task, query));
  }

  private matches(task: Task, query: TaskQuery): boolean {
    return (query.projectId === undefined || task.projectId === query.projectId)
      && (query.status === undefined || task.status === query.status)
      && (query.priority === undefined || task.priority === query.priority)
      && (query.assigneeId === undefined || task.assigneeId === query.assigneeId);
  }

  private addCandidateSet<K>(sets: Set<string>[], index: Map<K, Set<string>>, key: K | undefined): boolean {
    if (key === undefined) return true;
    const candidates = index.get(key);
    if (!candidates) return false;
    sets.push(candidates);
    return true;
  }

  private addToIndexes(task: Task, id: string): void {
    this.addToIndex(this.byProject, task.projectId, id);
    this.addToIndex(this.byStatus, task.status, id);
    this.addToIndex(this.byPriority, task.priority, id);
    if (task.assigneeId !== null) this.addToIndex(this.byAssignee, task.assigneeId, id);
  }

  private removeFromIndexes(task: Task, id: string): void {
    this.removeFromIndex(this.byProject, task.projectId, id);
    this.removeFromIndex(this.byStatus, task.status, id);
    this.removeFromIndex(this.byPriority, task.priority, id);
    if (task.assigneeId !== null) this.removeFromIndex(this.byAssignee, task.assigneeId, id);
  }

  private addToIndex<K>(index: Map<K, Set<string>>, key: K, id: string): void {
    const ids = index.get(key) ?? new Set<string>();
    ids.add(id);
    index.set(key, ids);
  }

  private removeFromIndex<K>(index: Map<K, Set<string>>, key: K, id: string): void {
    const ids = index.get(key);
    if (!ids) return;
    ids.delete(id);
    if (ids.size === 0) index.delete(key);
  }
}
