import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(err.message, err);

  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { name: "CastError", message, statusCode: 404 } as ApiError;
  }

  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const message = "Duplicate field value entered";
    error = { name: "MongoServerError", message, statusCode: 400 } as ApiError;
  }

  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(", ");
    error = { name: "ValidationError", message, statusCode: 400 } as ApiError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  next(error);
};