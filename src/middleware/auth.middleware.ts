import { Response, NextFunction } from "express";

import { User } from "../models";
import { AuthRequest } from "../types";
import { jwtService, logger, ResponseHandler } from "../utils";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return ResponseHandler.unauthorized(res, "NO_TOKEN");
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return ResponseHandler.unauthorized(res, "INVALID_TOKEN_FORMAT");
    }

    // Verify token using JWT service
    const decoded = jwtService.verifyToken(token);

    // Find user and exclude password
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return ResponseHandler.unauthorized(res, "USER_NOT_FOUND");
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.warn("Authentication failed:", error.message);

    if (error.message === "Token has expired") {
      ResponseHandler.unauthorized(res, "TOKEN_EXPIRED");
    }

    if (error.message === "Invalid token") {
      ResponseHandler.unauthorized(res, "INVALID_TOKEN");
    }

    ResponseHandler.unauthorized(res);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "NOT_AUTHENTICATED");
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Access denied for user ${req.user.email}. Required roles: ${roles.join(
          ", "
        )}`
      );
      
      return ResponseHandler.forbidden(res, "INSUFFICIENT_PERMISSIONS");
    }

    next();
  };
};
