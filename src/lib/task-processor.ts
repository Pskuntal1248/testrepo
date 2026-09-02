export type TaskEventType = 'task:created' | 'task:updated' | 'task:deleted';

export interface TaskPipelinePayload {
  taskId: string;
  eventType: TaskEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type TaskPipelineMiddleware = (
  payload: TaskPipelinePayload,
  next: () => Promise<void> | void,
) => Promise<void> | void;

export class TaskProcessingPipeline {
  private stages: TaskPipelineMiddleware[] = [];

  use(middleware: TaskPipelineMiddleware): this {
    this.stages.push(middleware);
    return this;
  }

  async dispatch(payload: TaskPipelinePayload): Promise<void> {
    let index = 0;
    const run = async (): Promise<void> => {
      if (index >= this.stages.length) return;
      const stage = this.stages[index++];
      if (!stage) return;
      await stage(payload, run);
    };
    await run();
  }
}

export const defaultTaskPipeline = new TaskProcessingPipeline();
