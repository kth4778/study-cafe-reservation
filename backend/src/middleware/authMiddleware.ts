import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export interface AuthRequest extends Request {
  adminId?: string;
  role?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { adminId: string; role: string };
    req.adminId = payload.adminId;
    req.role = payload.role;
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export const superadminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.role !== 'ROLE_SUPERADMIN') {
    res.status(403).json({ message: 'SUPERADMIN 권한이 필요합니다.' });
    return;
  }
  next();
};
