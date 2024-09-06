import { z } from 'zod';

export const headers = {
  'content-type': 'application/json',
};

export class HttpError extends Error {
  constructor(
    // eslint-disable-next-line no-unused-vars
    public statusCode: number,
    body: Record<string, unknown> = {}
  ) {
    super(JSON.stringify(body));
  }
}

export function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    const errMessages = error.issues.map(issue => ({
      field: issue.path[0],
      message: issue.message,
    }));
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        errors: errMessages,
      }),
    };
  }

  //TODO: Add more error handling

  if (error instanceof SyntaxError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Invalid request body format : "${error.message}"` }),
    };
  }

  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      headers,
      body: error.message,
    };
  }

  throw error;
}
