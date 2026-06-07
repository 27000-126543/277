import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../models/Database';
import type { User, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'credit-risk-secret-key-2024';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, regionCode: user.regionCode },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
}

export function checkRegionPermission(req: AuthRequest, targetRegionCode?: string): boolean {
  if (!req.user) return false;
  
  if (req.user.role === 'headquarters' || req.user.role === 'analyst') {
    return true;
  }
  
  if (req.user.role === 'provincial' && targetRegionCode) {
    return targetRegionCode.startsWith(req.user.regionCode?.substring(0, 2) || '');
  }
  
  if (req.user.role === 'municipal' && targetRegionCode) {
    return targetRegionCode === req.user.regionCode;
  }
  
  return false;
}

export function filterByUserRegion<T extends { provinceCode?: string; cityCode?: string; province?: string }>(
  req: AuthRequest,
  data: T[]
): T[] {
  if (!req.user) return [];
  
  if (req.user.role === 'headquarters' || req.user.role === 'analyst') {
    return data;
  }
  
  if (req.user.role === 'provincial') {
    const prefix = req.user.regionCode?.substring(0, 2) || '';
    return data.filter(item => {
      if (item.provinceCode) {
        return item.provinceCode.startsWith(prefix);
      }
      if (item.province) {
        return item.province.startsWith(prefix);
      }
      return false;
    });
  }
  
  if (req.user.role === 'municipal') {
    const regionCode = req.user.regionCode || '';
    return data.filter(item => {
      if (item.cityCode) {
        return item.cityCode === regionCode || item.provinceCode === regionCode;
      }
      if (item.province) {
        return item.province === regionCode;
      }
      return false;
    });
  }
  
  return [];
}
