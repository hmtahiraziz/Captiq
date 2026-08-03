import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Locals {
      validatedBody?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ');
      next(new ValidationError(message));
      return;
    }

    res.locals.validatedBody = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ');
      next(new ValidationError(message));
      return;
    }

    res.locals.validatedQuery = result.data;
    next();
  };
}
