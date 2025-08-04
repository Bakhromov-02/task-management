import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

import { TaskPriority, UserRole } from "../types";

export const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn([UserRole.admin, UserRole.user])
    .withMessage("Role must be either user or admin"),
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const validateTask = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("priority")
    .optional()
    .isIn([TaskPriority.high, TaskPriority.medium, TaskPriority.low])
    .withMessage("Priority must be low, medium, or high"),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};
