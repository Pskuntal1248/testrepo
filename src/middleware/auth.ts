import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

const equal = (actual: string, expected: string): boolean => {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
};

export const basicAuth: RequestHandler = (request, response, next) => {
  const header = request.header('authorization');
  const expectedUsername = process.env.BASIC_AUTH_USERNAME ?? 'admin';
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD ?? 'taskflow';

  if (header?.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const separator = decoded.indexOf(':');
      const username = separator >= 0 ? decoded.slice(0, separator) : '';
      const password = separator >= 0 ? decoded.slice(separator + 1) : '';
      if (equal(username, expectedUsername) && equal(password, expectedPassword)) return next();
    } catch {
      // Malformed credentials are handled as an authentication failure.
    }
  }

  response.setHeader('WWW-Authenticate', 'Basic realm="TaskFlow API", charset="UTF-8"');
  response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Valid Basic authentication credentials are required' } });
};
