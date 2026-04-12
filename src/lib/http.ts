import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiSuccessResponse, ApiErrorResponse } from "../types/api.js";
import { AppError, isSqliteConstraintError } from "./errors.js";

function getRequestId(res: Response): string | undefined {
  return typeof res.locals.requestId === "string"
    ? res.locals.requestId
    : undefined;
}

export function ok<T>(res: Response, data: T, status = 200): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    requestId: getRequestId(res),
  };

  res.status(status).json(body);
}

export function created<T>(res: Response, data: T, message?: string): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
    requestId: getRequestId(res),
  };

  res.status(201).json(body);
}

export function fail(
  res: Response,
  status: number,
  error: string,
  details?: unknown,
): void {
  const body: ApiErrorResponse = {
    success: false,
    error,
    ...(details !== undefined ? { details } : {}),
    requestId: getRequestId(res),
  };

  res.status(status).json(body);
}

export function jsonSyntaxErrorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof SyntaxError && "body" in error) {
    fail(res, 400, "Malformed JSON body");
    return;
  }

  next(error);
}

export function notFoundHandler(_req: Request, res: Response): void {
  fail(res, 404, "Route not found");
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    fail(res, error.statusCode, error.message, error.details);
    return;
  }

  if (error instanceof ZodError) {
    fail(res, 400, "Validation failed", error.flatten());
    return;
  }

  if (isSqliteConstraintError(error)) {
    fail(res, 409, "Database constraint violation");
    return;
  }

  if (error instanceof Error) {
    fail(res, 500, error.message);
    return;
  }

  fail(res, 500, "Unknown server error");
}
