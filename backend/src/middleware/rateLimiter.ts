import { Request, Response, NextFunction } from 'express';
import { CONSTANTS } from '../config/constants';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number = 60 * 1000; // 1 minute

  private getKey(identifier: string): string {
    return identifier;
  }

  private cleanExpired(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  isLimited(identifier: string, limit: number): boolean {
    this.cleanExpired();
    const key = this.getKey(identifier);
    const now = Date.now();

    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    this.store[key].count += 1;
    return this.store[key].count > limit;
  }

  getRemaining(identifier: string, limit: number): number {
    const key = this.getKey(identifier);
    if (!this.store[key]) {
      return limit;
    }
    return Math.max(0, limit - this.store[key].count);
  }
}

const globalLimiter = new RateLimiter();
const userLimiters: { [userId: string]: RateLimiter } = {};

export const globalRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';

  if (globalLimiter.isLimited(ip, CONSTANTS.GLOBAL_RATE_LIMIT)) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    });
  }

  next();
};

export const userRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next();
  }

  const userId = req.user.id;

  if (!userLimiters[userId]) {
    userLimiters[userId] = new RateLimiter();
  }

  if (userLimiters[userId].isLimited(userId, CONSTANTS.PER_USER_RATE_LIMIT)) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Rate limit exceeded. Please try again later.',
    });
  }

  next();
};

export const uploadRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required',
    });
  }

  const userId = req.user.id;

  if (!userLimiters[userId]) {
    userLimiters[userId] = new RateLimiter();
  }

  if (userLimiters[userId].isLimited(`${userId}:upload`, CONSTANTS.UPLOAD_RATE_LIMIT)) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: 'Upload rate limit exceeded',
    });
  }

  next();
};
