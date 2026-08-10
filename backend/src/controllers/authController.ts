import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userService } from '../services/userService';
import { auditService } from '../services/auditService';
import { CONSTANTS } from '../config/constants';
import { JWTPayload } from '../types/index';
import { ValidationService } from '../services/validationService';

export class AuthController {
  /**
   * Sign up
   */
  async signup(req: Request, res: Response) {
    try {
      const { email, name, password, confirmPassword } = req.body;

      // Validate input
      if (!email || !name || !password) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Email, name, and password are required',
        });
      }

      if (!ValidationService.isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Invalid email format',
        });
      }

      if (!ValidationService.isValidPassword(password)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Passwords do not match',
        });
      }

      const user = await userService.createUser(email, name, password);

      await auditService.logAction(
        user.id,
        CONSTANTS.AUDIT_ACTIONS.LOGIN,
        CONSTANTS.RESOURCE_TYPES.USER,
        user.id,
        { action: 'signup' },
        req.ip || '',
        'success'
      );

      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE } as any);
      const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRE,
      } as any);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'User created successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            isApproved: user.isApproved,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      res.status(400).json({
        success: false,
        statusCode: 400,
        message,
      });
    }
  }

  /**
   * Login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Email and password are required',
        });
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Invalid email or password',
        });
      }

      const isPasswordValid = await userService.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Invalid email or password',
        });
      }

      if (!user.isApproved) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'User account is pending approval',
        });
      }

      await userService.updateLastLogin(user.id);

      await auditService.logAction(
        user.id,
        CONSTANTS.AUDIT_ACTIONS.LOGIN,
        CONSTANTS.RESOURCE_TYPES.USER,
        user.id,
        { action: 'login' },
        req.ip || '',
        'success'
      );

      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE } as any);
      const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRE,
      } as any);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            isApproved: user.isApproved,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Refresh token not provided',
        });
      }

      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JWTPayload;
      const user = await userService.getUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'User not found',
        });
      }

      const payload: JWTPayload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const newToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE } as any);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Token refreshed',
        data: { token: newToken },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid refresh token',
      });
    }
  }

  /**
   * Logout
   */
  async logout(req: Request, res: Response) {
    try {
      if (req.user) {
        await auditService.logAction(
          req.user.id,
          CONSTANTS.AUDIT_ACTIONS.LOGOUT,
          CONSTANTS.RESOURCE_TYPES.USER,
          req.user.id,
          { action: 'logout' },
          req.ip || '',
          'success'
        );
      }

      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Logged out successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Logout failed',
      });
    }
  }
}

export const authController = new AuthController();
