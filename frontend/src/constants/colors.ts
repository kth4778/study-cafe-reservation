import type { SeatStatus } from '@/types/seat';

export const SEAT_COLORS: Record<SeatStatus, string> = {
  available: '#4CAF50',
  occupied: '#F44336',
  reserved: '#FFC107',
  maintenance: '#9E9E9E',
};

export const SEAT_STATUS_LABELS: Record<SeatStatus, string> = {
  available: '이용가능',
  occupied: '사용중',
  reserved: '예약됨',
  maintenance: '점검중',
};
