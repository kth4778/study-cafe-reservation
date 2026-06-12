import { apiClient } from './client';
import type { AdminUser, KpiData, ErrorLog, UsageRecord, StatPoint, Notice } from '@/types/admin';

interface LoginBody { username: string; password: string; otp: string; }
interface LoginResponse { token: string; admin: AdminUser; }

// ── Mock data (백엔드 미연결 시 fallback) ──────────────────────────

const MOCK_KPI: KpiData = {
  totalSeats: 100,
  availableSeats: 37,
  occupiedSeats: 58,
  todayRevenue: 234000,
};

const MOCK_RECORDS: UsageRecord[] = [
  { recordId: 'r01', seatNumber: 12, contact: '010-1234-5678', usageDuration: 180, totalAmount: 6000, createdAt: new Date(Date.now() - 1*3600000).toISOString() },
  { recordId: 'r02', seatNumber: 34, contact: '010-2345-6789', usageDuration: 120, totalAmount: 4000, createdAt: new Date(Date.now() - 2*3600000).toISOString() },
  { recordId: 'r03', seatNumber: 7,  contact: '010-3456-7890', usageDuration: 240, totalAmount: 9600, createdAt: new Date(Date.now() - 3*3600000).toISOString() },
  { recordId: 'r04', seatNumber: 55, contact: '010-4567-8901', usageDuration: 60,  totalAmount: 2000, createdAt: new Date(Date.now() - 4*3600000).toISOString() },
  { recordId: 'r05', seatNumber: 21, contact: '010-5678-9012', usageDuration: 300, totalAmount: 12000, createdAt: new Date(Date.now() - 5*3600000).toISOString() },
  { recordId: 'r06', seatNumber: 88, contact: '010-6789-0123', usageDuration: 180, totalAmount: 7200, createdAt: new Date(Date.now() - 6*3600000).toISOString() },
  { recordId: 'r07', seatNumber: 3,  contact: '010-7890-1234', usageDuration: 120, totalAmount: 4000, createdAt: new Date(Date.now() - 7*3600000).toISOString() },
  { recordId: 'r08', seatNumber: 67, contact: '010-8901-2345', usageDuration: 60,  totalAmount: 2000, createdAt: new Date(Date.now() - 8*3600000).toISOString() },
  { recordId: 'r09', seatNumber: 42, contact: '010-9012-3456', usageDuration: 240, totalAmount: 8000, createdAt: new Date(Date.now() - 9*3600000).toISOString() },
  { recordId: 'r10', seatNumber: 91, contact: '010-0123-4567', usageDuration: 180, totalAmount: 7200, createdAt: new Date(Date.now() - 24*3600000).toISOString() },
  { recordId: 'r11', seatNumber: 15, contact: '010-1111-2222', usageDuration: 120, totalAmount: 4000, createdAt: new Date(Date.now() - 25*3600000).toISOString() },
  { recordId: 'r12', seatNumber: 73, contact: '010-2222-3333', usageDuration: 300, totalAmount: 12000, createdAt: new Date(Date.now() - 26*3600000).toISOString() },
];

const MOCK_DAILY: StatPoint[] = [
  { label: '6일 전', count: 42, revenue: 168000 },
  { label: '5일 전', count: 58, revenue: 232000 },
  { label: '4일 전', count: 37, revenue: 148000 },
  { label: '3일 전', count: 61, revenue: 244000 },
  { label: '2일 전', count: 49, revenue: 196000 },
  { label: '어제',   count: 73, revenue: 292000 },
  { label: '오늘',   count: 38, revenue: 152000 },
];

const MOCK_WEEKLY: StatPoint[] = [
  { label: '5주 전', count: 210, revenue: 840000 },
  { label: '4주 전', count: 285, revenue: 1140000 },
  { label: '3주 전', count: 260, revenue: 1040000 },
  { label: '2주 전', count: 310, revenue: 1240000 },
  { label: '이번 주', count: 195, revenue: 780000 },
];

const MOCK_MONTHLY: StatPoint[] = [
  { label: '1월', count: 820, revenue: 3280000 },
  { label: '2월', count: 760, revenue: 3040000 },
  { label: '3월', count: 940, revenue: 3760000 },
  { label: '4월', count: 1050, revenue: 4200000 },
  { label: '5월', count: 980, revenue: 3920000 },
  { label: '6월', count: 430, revenue: 1720000 },
];

const MOCK_LOGS: ErrorLog[] = [
  { logId: 'l01', errorType: 'PaymentTimeout', errorCode: 'PAY-001', severity: 'CRITICAL', module: 'PaymentService', message: '결제 처리 중 타임아웃 발생 (좌석 #23)', createdAt: new Date(Date.now() - 10*60000).toISOString() },
  { logId: 'l02', errorType: 'SeatSyncFail',   errorCode: 'SEAT-003', severity: 'ERROR',    module: 'SeatManager',    message: '좌석 상태 동기화 실패 — WebSocket 연결 끊김', createdAt: new Date(Date.now() - 30*60000).toISOString() },
  { logId: 'l03', errorType: 'DBConnWarn',     errorCode: 'DB-007',   severity: 'WARN',     module: 'Database',       message: 'DB 연결 풀 사용률 85% 도달', createdAt: new Date(Date.now() - 1*3600000).toISOString() },
  { logId: 'l04', errorType: 'AuthFail',       errorCode: 'AUTH-002', severity: 'ERROR',    module: 'AuthService',    message: '관리자 로그인 5회 실패 — IP 192.168.1.45 잠금', createdAt: new Date(Date.now() - 2*3600000).toISOString() },
  { logId: 'l05', errorType: 'PrinterOffline', errorCode: 'PRT-001',  severity: 'WARN',     module: 'ReceiptPrinter', message: '영수증 프린터 연결 끊김 — 재시도 중', createdAt: new Date(Date.now() - 3*3600000).toISOString() },
  { logId: 'l06', errorType: 'CashOverflow',   errorCode: 'CASH-004', severity: 'CRITICAL', module: 'CashHandler',    message: '현금함 용량 초과 경고 (94% 차있음)', createdAt: new Date(Date.now() - 5*3600000).toISOString() },
  { logId: 'l07', errorType: 'NetLatency',     errorCode: 'NET-002',  severity: 'WARN',     module: 'NetworkMonitor', message: '네트워크 지연 증가 감지 (avg 320ms)', createdAt: new Date(Date.now() - 8*3600000).toISOString() },
];

/** 공지사항 로컬 스토어 (백엔드 없이 CRUD 가능) */
let localNotices: Notice[] = [
  {
    noticeId: 'n01',
    title: '5월 연장 운영 안내',
    content: '5월 가정의달을 맞아 토·일요일 운영 시간을 오전 7시로 앞당겨 운영합니다. 많은 이용 바랍니다.',
    isImportant: true,
    isVisible: true,
    createdAt: new Date(Date.now() - 2*86400000).toISOString(),
  },
  {
    noticeId: 'n02',
    title: '냉난방 점검 예고 (6/10 화요일)',
    content: '6월 10일(화) 오전 10시~12시 냉난방 정기 점검이 예정되어 있습니다. 해당 시간에 실내 온도 변화가 있을 수 있습니다.',
    isImportant: false,
    isVisible: true,
    createdAt: new Date(Date.now() - 5*86400000).toISOString(),
  },
  {
    noticeId: 'n03',
    title: '음식물 반입 금지 안내',
    content: '다른 이용객의 쾌적한 환경을 위해 강한 냄새가 나는 음식물 반입을 자제해 주시기 바랍니다. 음료(뚜껑 있는 컵)는 허용됩니다.',
    isImportant: false,
    isVisible: true,
    createdAt: new Date(Date.now() - 10*86400000).toISOString(),
  },
  {
    noticeId: 'n04',
    title: '[숨김] 시스템 점검 예정',
    content: '내부 테스트용. 공개 전.',
    isImportant: false,
    isVisible: false,
    createdAt: new Date(Date.now() - 1*86400000).toISOString(),
  },
];

// ── API 함수 ──────────────────────────────────────────────────────

export const adminLogin = async (body: LoginBody): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post<LoginResponse>('/auth/admin/login', body);
    return data;
  } catch {
    // 백엔드 없을 때 demo 계정으로 fallback
    if (body.username === 'admin' && body.password === 'admin1234') {
      return {
        token: 'demo-token-' + Date.now(),
        admin: { adminId: 'demo-admin', username: 'admin', role: 'ROLE_SUPERADMIN' },
      };
    }
    throw new Error('로그인 실패');
  }
};

export const fetchAdminKpi = async (): Promise<KpiData> => {
  try {
    const { data } = await apiClient.get<KpiData>('/admin/kpi');
    return data;
  } catch {
    return MOCK_KPI;
  }
};

export const fetchAdminRecords = async (): Promise<UsageRecord[]> => {
  try {
    const { data } = await apiClient.get<UsageRecord[]>('/admin/records');
    return data;
  } catch {
    return MOCK_RECORDS;
  }
};

export const fetchAdminStats = async (period: 'daily' | 'weekly' | 'monthly'): Promise<StatPoint[]> => {
  try {
    const { data } = await apiClient.get<StatPoint[]>(`/admin/stats?period=${period}`);
    return data;
  } catch {
    return period === 'daily' ? MOCK_DAILY : period === 'weekly' ? MOCK_WEEKLY : MOCK_MONTHLY;
  }
};

export const fetchAdminLogs = async (severity?: string): Promise<ErrorLog[]> => {
  try {
    const params = severity ? `?severity=${severity}` : '';
    const { data } = await apiClient.get<ErrorLog[]>(`/admin/logs${params}`);
    return data;
  } catch {
    if (!severity) return MOCK_LOGS;
    return MOCK_LOGS.filter((l) => l.severity === severity);
  }
};

export const resetSeat = async (seatId: string): Promise<void> => {
  try {
    await apiClient.post(`/admin/seats/${seatId}/reset`);
  } catch { /* demo: no-op */ }
};

// ── 공지사항 CRUD ─────────────────────────────────────────────────

export const fetchNotices = async (): Promise<Notice[]> => {
  try {
    const { data } = await apiClient.get<Notice[]>('/admin/notices');
    return data;
  } catch {
    return [...localNotices];
  }
};

export const createNotice = async (payload: Omit<Notice, 'noticeId' | 'createdAt'>): Promise<Notice> => {
  try {
    const { data } = await apiClient.post<Notice>('/admin/notices', payload);
    return data;
  } catch {
    const n: Notice = { ...payload, noticeId: `n-${Date.now()}`, createdAt: new Date().toISOString() };
    localNotices = [n, ...localNotices];
    return n;
  }
};

export const updateNotice = async (id: string, payload: Partial<Omit<Notice, 'noticeId' | 'createdAt'>>): Promise<Notice> => {
  try {
    const { data } = await apiClient.put<Notice>(`/admin/notices/${id}`, payload);
    return data;
  } catch {
    localNotices = localNotices.map((n) => n.noticeId === id ? { ...n, ...payload } : n);
    return localNotices.find((n) => n.noticeId === id)!;
  }
};

export const deleteNotice = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/notices/${id}`);
  } catch { /* demo */ }
  localNotices = localNotices.filter((n) => n.noticeId !== id);
};
