// src/utils/jwt.ts - JWT utility module
import jwt from 'jsonwebtoken';
import { logger } from './logger';

interface JwtPayload {
  userId: string;
  role?: string;
}

interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
}

class JwtService {
  private readonly secret: string;
  private readonly defaultExpiry: string;

  constructor() {
    this.secret = process.env.JWT_SECRET!;
    this.defaultExpiry = process.env.JWT_EXPIRE as any || "1h";

    if (!this.secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }

    // Validate expiry format
    this.validateExpiryFormat(this.defaultExpiry);
  }

  private validateExpiryFormat(expiry: string): void {
    const validPattern = /^(\d+[smhdw]|\d+)$/;
    if (!validPattern.test(expiry)) {
      throw new Error(
        `Invalid JWT expiry format: ${expiry}. Use formats like: 60s, 5m, 2h, 7d, 1w`
      );
    }
  }

  public generateToken(payload: JwtPayload, options?: TokenOptions): string {
    try {
      const tokenOptions: jwt.SignOptions = {
        expiresIn: options?.expiresIn as any || this.defaultExpiry,
        issuer: options?.issuer || "task-management-api",
        audience: options?.audience || "task-management-users",
      };

      return jwt.sign(payload, this.secret, tokenOptions);
    } catch (error) {
      logger.error("Token generation failed:", error);
      throw new Error("Failed to generate authentication token");
    }
  }

  public verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      logger.error("Token verification failed:", error);
      throw new Error("Token verification failed");
    }
  }

  public generateRefreshToken(userId: string): string {
    return this.generateToken(
      { userId },
      { expiresIn: "30d", audience: "refresh-token" }
    );
  }
}

export const jwtService = new JwtService();

