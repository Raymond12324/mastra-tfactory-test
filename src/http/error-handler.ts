import type { ErrorRequestHandler, RequestHandler } from 'express';

import { HttpError } from './errors.js';

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  void next;

  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body contains invalid JSON' },
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
};
