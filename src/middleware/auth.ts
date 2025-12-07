// Authentication middleware with role-based access control

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      // Check if token exists
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Authorization header missing"
        });
      }

      // Extract token from "Bearer <token>" format
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      // Verify token
      const decoded = jwt.verify(
        token,
        config.jwtSecret as string
      ) as JwtPayload & {
        id: number;
        name: string;
        email: string;
        role: string;
      };

      // Attach user to request
      req.user = decoded;

      // Check role authorization
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action"
        });
      }

      next();
    } catch (err: any) {
      // Handle token verification errors
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token"
        });
      }

      res.status(500).json({
        success: false,
        message: "Authentication error",
        errors: err.message
      });
    }
  };
};

export default auth;
