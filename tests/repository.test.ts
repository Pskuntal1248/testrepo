import { describe, expect, it } from 'vitest';
import { InMemoryRepository } from '../src/repositories/in-memory-repository.js';

describe('InMemoryRepository', () => {
  it('creates, updates, lists, and deletes records', () => {
    const repository = new InMemoryRepository<{ id: string; value: string }>();

    repository.create({ id: '1', value: 'first' });
    expect(repository.findAll()).toEqual([{ id: '1', value: 'first' }]);

    repository.update('1', { id: '1', value: 'updated' });
    expect(repository.findById('1')?.value).toBe('updated');

    expect(repository.delete('1')).toBe(true);
    expect(repository.findAll()).toEqual([]);
  });
});
