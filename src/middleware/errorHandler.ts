// Centralized error handling middleware

import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: "Resource already exists",
      errors: err.detail || "Duplicate entry"
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: "Referenced resource not found",
      errors: err.detail || "Foreign key constraint failed"
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: "Invalid data",
      errors: err.detail || "Data validation failed"
    });
  }

  // PostgreSQL restrict violation (ON DELETE RESTRICT)
  if (err.code === '23001') {
    return res.status(400).json({
      success: false,
      message: "Cannot delete resource",
      errors: "Resource has dependent records"
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: err.message
  });
};
