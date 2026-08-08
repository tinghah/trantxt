import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JWTPayload } from '../types/index';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      ipAddress?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    req.ipAddress = req.ip || '';
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Admin access required',
    });
  }
  next();
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      req.user = decoded;
    }
    req.ipAddress = req.ip || '';
    next();
  } catch (error) {
    req.ipAddress = req.ip || '';
    next();
  }
};
