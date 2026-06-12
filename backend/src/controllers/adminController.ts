import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { adminUsers, seats, errorLogs, usageRecords } from '../data/mockData';
import type { StatPoint } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { username, password, otp } = req.body as { username: string; password: string; otp: string };

  const admin = adminUsers.find((a) => a.username === username);
  if (!admin) { res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }); return; }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    res.status(423).json({ message: '계정이 잠금되었습니다. 30분 후 다시 시도하세요.' }); return;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    admin.failCount++;
    if (admin.failCount >= 5) {
      admin.lockedUntil = new Date(Date.now() + 30 * 60_000);
    }
    res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }); return;
  }

  // TOTP: only '000000' accepted in demo mode (replace with real TOTP verification in production)
  const isOtpValid = otp === '000000';
  if (!isOtpValid) {
    admin.failCount++;
    res.status(401).json({ message: 'OTP 코드가 올바르지 않습니다.' }); return;
  }

  admin.failCount = 0;
  admin.lockedUntil = undefined;

  const token = jwt.sign(
    { adminId: admin.adminId, role: admin.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, admin: { adminId: admin.adminId, username: admin.username, role: admin.role } });
};

export const getKpi = (_req: Request, res: Response): void => {
  res.json({
    totalSeats: seats.length,
    availableSeats: seats.filter((s) => s.status === 'available').length,
    occupiedSeats: seats.filter((s) => s.status === 'occupied').length,
    todayRevenue: usageRecords.reduce((sum, r) => sum + r.totalAmount, 0),
  });
};

export const getRecords = (_req: Request, res: Response): void => {
  res.json(usageRecords);
};

export const getStats = (req: Request, res: Response): void => {
  const period = req.query['period'] as string ?? 'daily';
  const stats: StatPoint[] = [];

  if (period === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      stats.push({ label, count: Math.floor(Math.random() * 20 + 5), revenue: Math.floor(Math.random() * 80000 + 20000) });
    }
  } else if (period === 'weekly') {
    for (let i = 3; i >= 0; i--) {
      stats.push({ label: `${i + 1}주 전`, count: Math.floor(Math.random() * 100 + 30), revenue: Math.floor(Math.random() * 500000 + 100000) });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      stats.push({ label: `${d.getMonth() + 1}월`, count: Math.floor(Math.random() * 400 + 100), revenue: Math.floor(Math.random() * 2000000 + 500000) });
    }
  }

  res.json(stats);
};

export const getLogs = (req: Request, res: Response): void => {
  const severity = req.query['severity'] as string | undefined;
  const filtered = severity ? errorLogs.filter((l) => l.severity === severity) : errorLogs;
  res.json(filtered);
};

export const resetSeat = (req: Request, res: Response): void => {
  const { id } = req.params;
  const seat = seats.find((s) => s.seatId === id);
  if (!seat) { res.status(404).json({ message: '좌석을 찾을 수 없습니다.' }); return; }
  seat.status = 'available';
  res.json(seat);
};
