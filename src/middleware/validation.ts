import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          data: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};

