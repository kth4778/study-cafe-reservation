const BACKEND_URL = 'https://study-cafe-reservation.onrender.com';

export const API_BASE_URL = import.meta.env.DEV ? '/api' : `${BACKEND_URL}/api`;
export const WS_URL = import.meta.env.DEV ? 'http://localhost:4000' : BACKEND_URL;

export const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3분
export const HEARTBEAT_INTERVAL_MS = 10_000;   // 10초
export const HEARTBEAT_FAIL_LIMIT = 3;
export const PAYMENT_TIMEOUT_SEC = 180;         // 180초
export const MAX_RETRY_COUNT = 3;
export const RETRY_INTERVAL_MS = 5_000;
export const RETRYABLE_CODES = ['E004', 'E005', 'E006'] as const;

export const SESSION_TIMEOUT_ADMIN_MS = 30 * 60 * 1000;
export const SESSION_TIMEOUT_SUPERADMIN_MS = 15 * 60 * 1000;

export const EXPIRE_ALERT_TIMES_MIN = [10, 5] as const;

export const TIME_OPTIONS_HOURS = [1, 2, 3, 4] as const;
export const EXTEND_OPTIONS_HOURS = [1, 2, 3] as const;

export const SEAT_TYPE_LABELS: Record<string, string> = {
  all: '전체',
  general: '일반석',
  premium: '프리미엄',
  private: '1인실',
};
