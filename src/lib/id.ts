import { randomUUID } from 'node:crypto';

export const createId = (): string => randomUUID();
export const now = (): string => new Date().toISOString();
