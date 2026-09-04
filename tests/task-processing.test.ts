import { describe, expect, it } from 'vitest';
import { TaskProcessingPipeline, type TaskPipelinePayload } from '../src/lib/task-processor.js';

describe('TaskProcessingPipeline', () => {
  it('dispatches task lifecycle payloads across configured middleware stages', async () => {
    const pipeline = new TaskProcessingPipeline();
    const sequence: string[] = [];

    pipeline.use(async (payload, next) => {
      sequence.push(`stage1:start:${payload.eventType}`);
      await next();
      sequence.push(`stage1:end:${payload.eventType}`);
    });

    pipeline.use(async (payload, next) => {
      sequence.push(`stage2:${payload.taskId}`);
      await next();
    });

    const payload: TaskPipelinePayload = {
      taskId: 'test-task-123',
      eventType: 'task:created',
      timestamp: new Date().toISOString(),
    };

    await pipeline.dispatch(payload);

    expect(sequence).toEqual([
      'stage1:start:task:created',
      'stage2:test-task-123',
      'stage1:end:task:created',
    ]);
  });
});
