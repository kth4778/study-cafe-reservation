export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type SeatType = 'general' | 'premium' | 'private';
export type ReservationStatus = 'pending' | 'completed' | 'cancelled' | 'expired';
export type PaymentMethod = 'card' | 'cash';
export type AdminRole = 'ROLE_ADMIN' | 'ROLE_SUPERADMIN';

export interface Seat {
  seatId: string;
  seatNumber: number;
  type: SeatType;
  status: SeatStatus;
  floor: number;
  pricePerHour: number;
}

export interface Reservation {
  reservationId: string;
  seatId: string;
  seatNumber: number;
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  status: ReservationStatus;
  totalAmount: number;
}

export interface Payment {
  paymentId: string;
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  approvalNumber: string;
  status: 'success' | 'failed';
  pgErrorCode?: string;
}

export interface AdminUser {
  adminId: string;
  username: string;
  passwordHash: string;
  role: AdminRole;
  totpSecret: string;
  failCount: number;
  lockedUntil?: Date;
}

export interface ErrorLog {
  logId: string;
  errorType: string;
  errorCode: string;
  severity: 'CRITICAL' | 'ERROR' | 'WARN';
  module: string;
  message: string;
  createdAt: string;
}

export interface UsageRecord {
  recordId: string;
  reservationId: string;
  seatNumber: number;
  contact: string;
  usageDuration: number;
  totalAmount: number;
  createdAt: string;
}

export interface StatPoint {
  label: string;
  count: number;
  revenue: number;
}
