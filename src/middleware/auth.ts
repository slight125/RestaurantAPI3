import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { ApiResponse } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse = {
      success: false,
      error: 'Access token is required'
    };
    return res.status(401).json(response);
  }

  try {
    const decoded = AuthUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid or expired token'
    };
    return res.status(403).json(response);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: 'Insufficient permissions'
      };
      return res.status(403).json(response);
    }

    next();
  };
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = AuthUtils.verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without authentication
      req.user = undefined;
    }
  }

  next();
};

