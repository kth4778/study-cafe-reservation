export type ReservationStatus = 'pending' | 'completed' | 'cancelled' | 'expired';

export interface Reservation {
  reservationId: string;
  seatId: string;
  seatNumber: number;
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  status: ReservationStatus;
  totalAmount: number;
  durationHours?: number;
}
