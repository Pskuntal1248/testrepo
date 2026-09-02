export interface Entity {
  id: string;
}

export class InMemoryRepository<T extends Entity> {
  private readonly records = new Map<string, T>();

  findAll(): T[] {
    return [...this.records.values()];
  }

  findById(id: string): T | undefined {
    return this.records.get(id);
  }

  create(entity: T): T {
    this.records.set(entity.id, entity);
    return entity;
  }

  update(id: string, entity: T): T | undefined {
    if (!this.records.has(id)) return undefined;
    this.records.set(id, entity);
    return entity;
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  clear(): void {
    this.records.clear();
  }
}
