export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const notFound = (resource: string): ApiError => new ApiError(404, 'NOT_FOUND', `${resource} not found`);
export const conflict = (message: string): ApiError => new ApiError(409, 'CONFLICT', message);
export const badRequest = (message: string): ApiError => new ApiError(400, 'BAD_REQUEST', message);
