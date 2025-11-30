import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse';

interface JwtPayload {
  userId: string;
  role: 'manager' | 'employee';
  timestamp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = {
  requireAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new ApiResponse(null, 'Authorization token required', 401).send(res);
      }

      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'your-secret-key';

      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = decoded;
      
      next();
    } catch (error) {
      return new ApiResponse(null, 'Invalid or expired token', 401).send(res);
    }
  },

  requireManager: (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'manager') {
      return new ApiResponse(null, 'Manager access required', 403).send(res);
    }
    next();
  },

  requireEmployee: (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'employee') {
      return new ApiResponse(null, 'Employee access required', 403).send(res);
    }
    next();
  }
};
