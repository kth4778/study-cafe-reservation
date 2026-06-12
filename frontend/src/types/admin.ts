export type AdminRole = 'ROLE_ADMIN' | 'ROLE_SUPERADMIN';

export interface AdminUser {
  adminId: string;
  username: string;
  role: AdminRole;
}

export interface KpiData {
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  todayRevenue: number;
}

export type LogSeverity = 'CRITICAL' | 'ERROR' | 'WARN';

export interface ErrorLog {
  logId: string;
  errorType: string;
  errorCode: string;
  severity: LogSeverity;
  module: string;
  message: string;
  createdAt: string;
}

export interface UsageRecord {
  recordId: string;
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

export interface Notice {
  noticeId: string;
  title: string;
  content: string;
  isImportant: boolean;
  isVisible: boolean;
  createdAt: string;
}
