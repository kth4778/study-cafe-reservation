import { v4 as uuidv4 } from 'uuid';
import type { Seat, AdminUser, ErrorLog, UsageRecord, Reservation, SeatStatus } from '../types';

const OCCUPIED = new Set([3,7,8,13,15,18,22,24,25,31,35,39,42,45,47,51,52,58,60,67,72,73,78,82,88,93,96,6,19]);
const RESERVED = new Set([14,27,68,83,97]);
const MAINTENANCE = new Set([5,33,77]);

function getStatus(n: number): SeatStatus {
  if (MAINTENANCE.has(n)) return 'maintenance';
  if (RESERVED.has(n)) return 'reserved';
  if (OCCUPIED.has(n)) return 'occupied';
  return 'available';
}

export const seats: Seat[] = [
  ...Array.from({ length: 60 }, (_, i) => ({
    seatId: uuidv4(), seatNumber: i + 1, type: 'general' as const,
    status: getStatus(i + 1), floor: 1, pricePerHour: 2000,
  })),
  ...Array.from({ length: 30 }, (_, i) => ({
    seatId: uuidv4(), seatNumber: i + 61, type: 'premium' as const,
    status: getStatus(i + 61), floor: 1, pricePerHour: 3000,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    seatId: uuidv4(), seatNumber: i + 91, type: 'private' as const,
    status: getStatus(i + 91), floor: 2, pricePerHour: 4000,
  })),
];

export const reservations: Reservation[] = [];

export const adminUsers: AdminUser[] = [
  {
    adminId: uuidv4(),
    username: 'admin',
    passwordHash: '$2b$12$7VpoRmjoPKDj.fz9.4K6D.jDIEKYpZ4y5a5yV7Mds2yoIMlicLR/u', // admin1234
    role: 'ROLE_ADMIN',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    failCount: 0,
  },
  {
    adminId: uuidv4(),
    username: 'superadmin',
    passwordHash: '$2b$12$7VpoRmjoPKDj.fz9.4K6D.jDIEKYpZ4y5a5yV7Mds2yoIMlicLR/u',
    role: 'ROLE_SUPERADMIN',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    failCount: 0,
  },
];

export const errorLogs: ErrorLog[] = [
  {
    logId: uuidv4(), errorType: 'PaymentError', errorCode: 'E004',
    severity: 'ERROR', module: 'PaymentService',
    message: '결제 처리 중 네트워크 오류 발생 (3회 재시도 후 실패)',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    logId: uuidv4(), errorType: 'WebSocketError', errorCode: 'WS001',
    severity: 'WARN', module: 'WebSocketService',
    message: '클라이언트 연결 끊김 감지 — 자동 재연결 시도',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    logId: uuidv4(), errorType: 'DBError', errorCode: 'DB001',
    severity: 'CRITICAL', module: 'ReservationService',
    message: 'DB 트랜잭션 실패 — 롤백 처리 완료',
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

export const usageRecords: UsageRecord[] = [
  {
    recordId: uuidv4(), reservationId: uuidv4(), seatNumber: 3,
    contact: '010-****-1234', usageDuration: 120, totalAmount: 4000,
    createdAt: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    recordId: uuidv4(), reservationId: uuidv4(), seatNumber: 7,
    contact: '010-****-5678', usageDuration: 60, totalAmount: 2000,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    recordId: uuidv4(), reservationId: uuidv4(), seatNumber: 45,
    contact: '010-****-9012', usageDuration: 180, totalAmount: 9000,
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
];
